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

COPY . .
RUN pnpm run build

# Pre-build the qmd codex collections (codex-grails + codex-core-lore) in the
# image. Without this step, search_codex returns "qmd_unavailable" at runtime
# even though the binary is on PATH — the qmd index is what makes search work.
#
# qmd splits state across THREE locations (verified via local install + qmd source
# inspection 2026-05-02 post #70 deploy failure):
#   - ~/.config/qmd/index.yml      collection registry (XDG-config)
#   - ~/.cache/qmd/index.sqlite    content + embeddings (XDG-cache)
#   - ~/.cache/qmd/models/         embedding model files (HARDCODED homedir/.cache,
#                                    NOT XDG-respecting per dist/llm.js:64)
#
# Earlier #70 attempted XDG_CACHE_HOME=/opt/qmd-cache for non-root portability,
# but that surfaced two bugs: (1) only redirects ~/.cache, not the registry at
# ~/.config; (2) doesn't redirect the model cache path. Net: runtime returned
# "qmd collection codex-grails not found" because the registry yaml was missing.
#
# Pragmatic fix: don't rebase qmd's paths. Let it write defaults (~/.config +
# ~/.cache) in builder, then COPY both directories verbatim to runtime. The
# bridgebuilder #70 F4 non-root portability concern was theoretical — Railway
# runs as root by default; if non-root deploy is ever needed, address then.
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
# bridgebuilder #70 F1) + copy BOTH state directories at the default paths.
# searchCodex (src/lookups/search.ts:120) spawnSync's `qmd` from PATH at runtime;
# the .node addon dlopens libstdc++/libgomp installed above.
#
# qmd state split (see builder comment above):
#   /root/.config/qmd/   collection registry — REQUIRED, missed in #70
#   /root/.cache/qmd/    content + embeddings + models — REQUIRED for query
#
# Image-size cost: ~/.cache/qmd holds embedding model (~50-150MB depending on model).
# That's the trade for working search_codex without runtime model download.
COPY --from=builder /usr/local/lib/node_modules/@tobilu /usr/local/lib/node_modules/@tobilu
RUN ln -s /usr/local/lib/node_modules/@tobilu/qmd/bin/qmd /usr/local/bin/qmd
COPY --from=builder /root/.config/qmd /root/.config/qmd
COPY --from=builder /root/.cache/qmd /root/.cache/qmd

# Smoke-test qmd binary + assert BOTH expected collections register at build time
# (bridgebuilder #70 F5 + #71 F2 tighter assertion). Catches:
# - bin symlink resolution failure
# - missing libstdc++/libgomp dependencies
# - registry/cache mismatch (exact failure mode #70 hit on first deploy)
# - either codex collection failing to register
# Asserts on collection NAMES not just `qmd status` exit code — the bug we
# shipped in #70 had qmd status returning 0 but search_codex still erroring
# because the registry was empty.
RUN qmd --version \
  && qmd status \
  && qmd status | grep -q "codex-grails" \
  && qmd status | grep -q "codex-core-lore"

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
