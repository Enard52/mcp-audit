# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-10-14

### Added

- Initial release
- Scan Claude Desktop, Claude Code, Cursor, Windsurf, and VS Code (Continue) configs
- Detect shell access, hardcoded secrets, filesystem access, dangerous flags
- Detect unverified packages, unpinned versions, privileged containers
- JSON output mode (`--json`) for CI integration
- Exit codes: 0 (clean), 1 (high), 2 (critical)
