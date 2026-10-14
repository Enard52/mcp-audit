# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] - 2026-10-14

### Added

- **Security grade (A–F)** — overall score and per-server grades based on findings
- **Markdown output** (`--markdown` / `--md`) — for CI comments, PRs, and documentation
- **Environment injection checks** — detects 19 dangerous env vars:
  - `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES` (library injection)
  - `NODE_OPTIONS`, `PYTHONPATH`, `PYTHONSTARTUP`, `RUBYOPT`, `PERL5OPT`, `JAVA_TOOL_OPTIONS` (runtime hijack)
  - `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY` (traffic interception)
  - `GIT_SSH_COMMAND`, `CURL_CA_BUNDLE`, `SSL_CERT_FILE` (MITM vectors)
  - `PATH`, `LD_LIBRARY_PATH`, `SHELL`, `EDITOR` (execution hijack)
- **Proxy + credentials combo detection** — flags when proxy env vars coexist with secrets
- **PATH hijack detection** — flags `.` or empty entries in PATH
- **Cross-server credential reuse detection** — flags shared secrets across servers
- **Config file permission checks** — world-readable/writable configs on Unix
- **Per-server risk indicators** in the server list (grade + issue count)
- **Server stats** in summary — "X of Y servers have issues"
- **Rich JSON output** — includes version, grade, score, per-server scores
- New check category: **Environment** (6th category)

### Changed

- JSON output now includes `version`, `grade`, `score`, and `serverScores` fields
- `runChecks` now accepts `scannedPaths` for file permission analysis
- Version bump to 0.3.0

## [0.2.0] - 2026-10-14

### Added

- **6 new MCP clients**: Zed, Cline, Roo Code, Amazon Q, GitHub Copilot, project root `mcp.json`
- **Transport security checks**: HTTP vs HTTPS, credentials in URLs, malformed endpoints, remote server awareness
- **Config hygiene checks**: shadow/duplicate servers, missing commands, excess env vars
- **25+ secret patterns**: Stripe, Twilio, SendGrid, Supabase, npm, PyPI, Hugging Face, Replicate, JWT, Neon, Vercel, Databricks, DigitalOcean, and more
- **Hidden secret detection**: catches API keys in non-standard env var names
- **Overly broad filesystem scope**: flags `/`, `~`, `C:\`, `/etc`, `/home` access as critical
- **Remote code execution detection**: scripts fetched from URLs via node/python
- **Shell metacharacter detection**: command injection via `|`, `;`, `` ` ``, `$()` in args
- **Docker deep checks**: volume mounts, host network, host PID namespace
- **Typosquat detection**: flags packages matching common typosquatting patterns
- **Auto-confirm flag detection**: warns on `--yes`/`-y` with package runners
- **20+ known publishers**: Stripe, Prisma, Neon, GitHub, Azure, Google, AWS, Linear, Notion, Slack, Grafana, Datadog, Playwright, Docker
- `--verbose` flag: shows scanned paths, file locations, and recommendations for all findings
- `--severity` filter: only show findings at a threshold or above
- **Category labels**: every finding tagged with its check category
- **Recommendations**: actionable fix suggestions for every finding (shown for critical/high by default, all with `--verbose`)
- **Category breakdown** in summary: see finding counts per category

### Changed

- Findings now include `category` and `recommendation` fields
- JSON output includes the new fields
- Summary shows severity breakdown by category
- Version bump to 0.2.0

## [0.1.0] - 2026-10-14

### Added

- Initial release
- Scan Claude Desktop, Claude Code, Cursor, Windsurf, and VS Code (Continue) configs
- Detect shell access, hardcoded secrets, filesystem access, dangerous flags
- Detect unverified packages, unpinned versions, privileged containers
- JSON output mode (`--json`) for CI integration
- Exit codes: 0 (clean), 1 (high), 2 (critical)
