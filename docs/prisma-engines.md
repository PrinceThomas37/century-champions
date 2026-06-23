# Prisma engines behind a restrictive network

Prisma downloads native "engine" binaries on `npm install` (postinstall). In some sandboxed
or proxied environments that download is reset mid-stream (`ECONNRESET`) even though the
rest of `npm install` succeeds. If that happens, install without scripts and fetch the
engines with `curl`, which streams more reliably.

```bash
# 1. Install packages without running postinstall scripts
npm install --ignore-scripts

# 2. Find the engine version and your platform target
node -e "console.log(require('@prisma/engines-version').enginesVersion)"
# Ubuntu 24.04 + OpenSSL 3.0 -> target is: debian-openssl-3.0.x
# (other common targets: debian-openssl-1.1.x, linux-musl-openssl-3.0.x for Alpine)

# 3. Download the two engines via curl into @prisma/engines
HASH=<engines-version-from-step-2>
TARGET=debian-openssl-3.0.x
BASE="https://binaries.prisma.sh/all_commits/$HASH/$TARGET"
ENG=node_modules/@prisma/engines

curl -fSL "$BASE/libquery_engine.so.node.gz" | gunzip > "$ENG/libquery_engine-$TARGET.so.node"
curl -fSL "$BASE/schema-engine.gz"           | gunzip > "$ENG/schema-engine-$TARGET"
chmod +x "$ENG/schema-engine-$TARGET"

# 4. Point Prisma at the local engines for generate / db push / runtime
export PRISMA_QUERY_ENGINE_LIBRARY="$PWD/$ENG/libquery_engine-$TARGET.so.node"
export PRISMA_SCHEMA_ENGINE_BINARY="$PWD/$ENG/schema-engine-$TARGET"

npx prisma generate
npx prisma db push
```

On a normal developer machine with open network access none of this is needed — plain
`npm install` fetches the engines automatically.
