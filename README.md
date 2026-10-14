<div align="center">

# mcp-audit

### Know what your AI tools can access. In 5 seconds.

Security scanner for [Model Context Protocol](https://modelcontextprotocol.io) servers.<br/>
Finds dangerous permissions, hardcoded secrets, and supply chain risks across all your MCP configs.

**One command. Zero config. Zero dependencies.**

```
npx mcp-audit
```

<br/>

<img src="https://img.shields.io/npm/v/mcp-audit?style=flat-square&color=blue" alt="npm" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT" />
<img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square" alt="node" />
<img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="zero deps" />

</div>

---

## The Problem

MCP servers are the new plugins. Every AI IDE supports them — Claude, Cursor, Windsurf, VS Code. Developers install them freely.

But each MCP server can:
- **Execute shell commands** on your machine
- **Read and write files** anywhere on disk
- **Access your API keys** passed via environment variables
- **Make network requests** to any endpoint
- **Run unpinned packages** from npm/PyPI with zero verification

There's no `npm audit` for MCP. **Until now.**

---

## What It Scans

| Source | Config Location |
|--------|----------------|
| Claude Desktop | `~/Library/Application Support/Claude/`, `%APPDATA%/Claude/`, `~/.config/claude/` |
| Claude Code | `.claude/settings.json`, `.mcp.json` |
| Cursor | `~/.cursor/mcp.json`, `.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |
| VS Code (Continue) | `~/.continue/config.json` |

## What It Checks

| Check | Severity | What it catches |
|-------|----------|-----------------|
| **Shell access** | Critical | Servers spawning bash/sh/cmd — unrestricted command execution |
| **Hardcoded secrets** | Critical | API keys (OpenAI, Anthropic, AWS, GitHub) stored in plaintext config |
| **Secret in args** | Critical | API keys passed as command arguments — visible in process listings |
| **Privileged containers** | Critical | Docker `--privileged` mode — near-host-level access |
| **Filesystem access** | High | Servers with read/write access to your filesystem |
| **Dangerous flags** | High | `--allow-write`, `--no-sandbox`, `sudo`, etc. |
| **Unverified packages** | Medium | Packages not from known publishers (Anthropic, Cloudflare, etc.) |
| **Unpinned versions** | Medium | `npx some-package` without `@version` — supply chain risk |
| **Network access** | Medium | Servers with fetch/browser/scraping capabilities |
| **Env secret passing** | Info | Secrets passed via env (correctly, but flagged for awareness) |

---

## Example Output

```
  mcp-audit — security scanner for MCP servers
  ──────────────────────────────────────────────────

  Servers discovered: 4

  filesystem  (Claude Desktop)
    cmd: npx -y @modelcontextprotocol/server-filesystem /Users/me/Documents
    env: (none)

  github  (Claude Desktop)
    cmd: npx -y @modelcontextprotocol/server-github
    env: GITHUB_TOKEN

  my-custom-server  (Cursor)
    cmd: npx some-random-mcp-server
    env: API_KEY, DB_PASSWORD

  shell-tool  (Claude Code (project))
    cmd: bash -c
    env: (none)

  Findings: 6

  CRITICAL  Direct shell access
    Server "shell-tool" spawns a shell (bash). This grants unrestricted
    command execution on your machine.
    server: shell-tool · source: Claude Code (project)

  CRITICAL  Hardcoded secret in config
    Server "my-custom-server" has a hardcoded secret in env var "API_KEY".
    This value is stored in plaintext on disk.
    server: my-custom-server · source: Cursor

  HIGH  Filesystem access
    Server "filesystem" has filesystem access (/Users/me/Documents).
    It can read and potentially modify files.
    server: filesystem · source: Claude Desktop

  MEDIUM  Unverified package
    Server "my-custom-server" runs "some-random-mcp-server" via npx.
    This package is not from a known verified publisher.
    server: my-custom-server · source: Cursor

  MEDIUM  Unpinned package version
    Server "my-custom-server" runs "some-random-mcp-server" without a
    pinned version. A compromised future release could execute malicious code.
    server: my-custom-server · source: Cursor

  INFO  Secret passed via environment
    Server "github" receives secret "GITHUB_TOKEN" via env.
    server: github · source: Claude Desktop

  ──────────────────────────────────────────────────

  ACTION REQUIRED
  4 servers · 6 findings (2 critical, 1 high, 2 medium, 1 info)
  5 config paths scanned · 2026-10-14T12:00:00.000Z
```

---

## CI / Automation

Use `--json` for machine-readable output. Exits with code `2` on critical findings, `1` on high.

```bash
npx mcp-audit --json
```

Add to your CI pipeline:

```yaml
- name: Audit MCP servers
  run: npx mcp-audit
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No critical or high findings |
| `1` | High-severity findings detected |
| `2` | Critical-severity findings detected |

---

## Roadmap

- [ ] SARIF output for GitHub Security tab integration
- [ ] Auto-fix suggestions (pin versions, move secrets to env)
- [ ] Community-maintained vulnerability database for MCP packages
- [ ] Policy file (`.mcp-audit.yml`) for custom rules and allowlists
- [ ] VS Code / Cursor extension

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
git clone https://github.com/gitswagata1/mcp-audit
cd mcp-audit
npm install
npm run dev
```

---

## License

[MIT](LICENSE) — Swagata Banerjee
