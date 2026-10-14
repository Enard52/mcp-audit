# Contributing to mcp-audit

Thanks for helping make MCP safer for everyone.

## Setup

```bash
git clone https://github.com/gitswagata1/mcp-audit
cd mcp-audit
npm install
npm run dev        # runs src/index.ts directly via tsx
npm run build      # compiles to dist/
```

## Adding a new check

1. Create a file in `src/checks/` that exports a function: `(server: McpServer) => Finding[]`
2. Import and call it in `src/checks/index.ts`
3. Add a row to the README's "What It Checks" table

## Adding a new config source

1. Add an entry to `CONFIG_LOCATIONS` in `src/config/locations.ts`
2. Add a row to the README's "What It Scans" table

## Guidelines

- Zero runtime dependencies — keep it that way
- Every finding needs a clear, actionable `detail` message
- Test on macOS, Linux, and Windows paths before submitting
- One feature per PR
