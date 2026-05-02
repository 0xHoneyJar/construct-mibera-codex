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
# installed above.
RUN npm install -g @tobilu/qmd@^2.1.0

COPY . .
RUN pnpm run build

# Pre-build the qmd codex collections (codex-grails + codex-core-lore) in the
# image. Without this step, search_codex returns "qmd_unavailable" at runtime
# even though the binary is on PATH — the qmd index is what makes search work.
# Lands at /root/.cache/qmd/index.sqlite (qmd's default cache location).
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
# + the bin script + the prebuilt codex index. searchCodex (src/lookups/search.ts:120)
# spawnSync's `qmd` from PATH at runtime; the .node addon dlopens
# libstdc++/libgomp installed above. Without these COPY+chmod, search_codex
# returns "qmd_unavailable" at first call — the silent-runtime-failure pattern
# from PR #69 reaching one layer deeper.
COPY --from=builder /usr/local/lib/node_modules/@tobilu /usr/local/lib/node_modules/@tobilu
COPY --from=builder /usr/local/lib/node_modules/@tobilu/qmd/bin/qmd /usr/local/bin/qmd
RUN chmod +x /usr/local/bin/qmd
COPY --from=builder /root/.cache/qmd /root/.cache/qmd

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
