FROM node:20-slim AS builder
WORKDIR /app

# node-llama-cpp postinstall needs git/make/python3/g++ to clone+build llama.cpp
# when no prebuilt binary matches the target. Alpine fails this entirely (no glibc,
# no git/make in default image, prebuilt binaries cannot load). Debian slim has glibc;
# we add the build toolchain only in the builder stage. The runtime stage stays slim.
# Image-size cost: ~50MB (alpine) → ~180MB (slim) base; +~40MB for builder toolchain
# (builder layers are not in the final image — see runtime stage below for runtime libs).
RUN apt-get update && apt-get install -y --no-install-recommends \
    git make python3 g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# qmd: installed globally so the binary is on PATH for build-micodex-index.sh
# (next step) and copyable to the runtime stage. peerDependency per
# construct-surface-decision-tree.md §6.3 — searchCodex (intent layer) shells
# out to `qmd query ...` via spawnSync at runtime. Postinstall (which clones
# llama.cpp to build node-llama-cpp from source) reuses the build toolchain
# installed above. Pinned exact version (bridgebuilder #70 F2 reproducibility)
# instead of ^2.1.0 caret range — bump intentionally.
RUN npm install -g @tobilu/qmd@2.1.0

# UID-portable qmd cache location (bridgebuilder #70 F4 root-cache-path).
# Default ~/.cache/qmd assumes runtime user has $HOME=/root; setting
# XDG_CACHE_HOME makes the index location explicit and survives non-root
# `USER` directives, Kubernetes runAsNonRoot, or `docker run -u <uid>`.
ENV XDG_CACHE_HOME=/opt/qmd-cache

COPY . .
RUN pnpm run build

# Pre-build the qmd codex collections (codex-grails + codex-core-lore) in the
# image. Without this step, search_codex returns "qmd_unavailable" at runtime
# even though the binary is on PATH — the qmd index is what makes search work.
# Lands at /opt/qmd-cache/qmd/ (XDG_CACHE_HOME set above) so it's UID-portable.
RUN bash scripts/build-micodex-index.sh

FROM node:20-slim
WORKDIR /app

# Runtime libs for the compiled node-llama-cpp .node addon. The addon is built
# in the builder stage against libstdc++ (C++ stdlib) and libgomp (OpenMP) and
# dlopens them lazily on first require. node:20-slim ships glibc but NOT
# libstdc++6 or libgomp1 — without these, the container boots fine and crashes
# on first inference call (the silent-runtime-failure pattern bridgebuilder F1
# 2026-05-02 named). ca-certificates kept for any HTTPS client behavior.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 libgomp1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# qmd: copy the global package (where the JS + node-llama-cpp .node binary live)
# + symlink the bin (preserves __dirname-relative require resolution per
# bridgebuilder #70 F1) + copy the prebuilt index. searchCodex
# (src/lookups/search.ts:120) spawnSync's `qmd` from PATH at runtime;
# the .node addon dlopens libstdc++/libgomp installed above. XDG_CACHE_HOME
# duplicated here so qmd at runtime finds the index at the same explicit path.
COPY --from=builder /usr/local/lib/node_modules/@tobilu /usr/local/lib/node_modules/@tobilu
RUN ln -s /usr/local/lib/node_modules/@tobilu/qmd/bin/qmd /usr/local/bin/qmd
ENV XDG_CACHE_HOME=/opt/qmd-cache
COPY --from=builder /opt/qmd-cache /opt/qmd-cache
RUN chmod -R a+r /opt/qmd-cache

# Smoke-test the qmd binary at build time (bridgebuilder #70 F5). Catches:
# - bin symlink resolution failure
# - missing libstdc++/libgomp dependencies
# - corrupted/missing index from XDG_CACHE_HOME mismatch
# Build fails loudly here instead of search_codex returning errors at first call.
RUN qmd --version && qmd status | head -5

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/construct.yaml ./
COPY --from=builder /app/core-lore ./core-lore
COPY --from=builder /app/_codex ./_codex
COPY --from=builder /app/app ./app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/bin/http.js"]
