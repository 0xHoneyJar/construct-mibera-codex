FROM node:20-slim AS builder
WORKDIR /app

# node-llama-cpp postinstall needs git/make/python3/g++ to clone+build llama.cpp
# when no prebuilt binary matches the target. Alpine fails this entirely (no glibc,
# no git/make in default image, prebuilt binaries cannot load). Debian slim has glibc;
# we add the build toolchain only in the builder stage. The runtime stage stays slim.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git make python3 g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-slim
WORKDIR /app

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
