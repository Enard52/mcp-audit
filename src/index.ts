#!/usr/bin/env node

import { discoverConfigs } from "./scanner.js";
import { runChecks } from "./checks/index.js";
import { printReport } from "./reporter.js";
import { printMarkdown } from "./markdown.js";
import { computeGrade, computeServerScores } from "./scoring.js";
import type { AuditResult, CliOptions, Severity } from "./types.js";

const VERSION = "0.3.0";
const VALID_SEVERITIES = new Set<Severity>(["critical", "high", "medium", "low", "info"]);

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {
    json: false,
    help: false,
    verbose: false,
    markdown: false,
    severity: "info",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--verbose" || arg === "-v") opts.verbose = true;
    else if (arg === "--markdown" || arg === "--md") opts.markdown = true;
    else if (arg === "--severity" || arg === "-s") {
      const val = args[++i] as Severity;
      if (val && VALID_SEVERITIES.has(val)) opts.severity = val;
    }
  }

  return opts;
}

function main(): void {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
  ${"\x1b[1m\x1b[36m"}mcp-audit${"\x1b[0m"} v${VERSION} — security scanner for MCP servers

  Usage:
    npx mcp-audit                  Scan and audit all MCP server configs
    npx mcp-audit --json           Output results as JSON (with scores and metadata)
    npx mcp-audit --markdown       Output as Markdown (for PRs, CI comments, docs)
    npx mcp-audit --verbose        Show config paths, recommendations, file locations
    npx mcp-audit --severity high  Only show findings at this level or above
    npx mcp-audit --help           Full help

  Clients scanned:
    Claude Desktop, Claude Code, Cursor, Windsurf, Zed,
    Cline, Roo Code, Amazon Q, GitHub Copilot, VS Code (Continue)

  Check categories:
    Permissions     Shell access, filesystem scope, dangerous flags, command injection
    Secrets         Hardcoded API keys (25+ patterns), credentials in args
    Supply Chain    Unverified packages, unpinned versions, Docker misconfig
    Transport       HTTP vs HTTPS, embedded credentials, remote servers
    Environment     LD_PRELOAD, NODE_OPTIONS, proxy injection, PATH hijack
    Config Hygiene  Duplicate servers, file permissions, excess env vars

  Security grade:
    A (90-100)  B (75-89)  C (50-74)  D (25-49)  F (0-24)

  Exit codes:
    0  All clear (or only low/info findings)
    1  High-severity findings
    2  Critical-severity findings
`);
    process.exit(0);
  }

  const { servers, scannedPaths } = discoverConfigs();
  const findings = runChecks(servers, scannedPaths, opts.severity);
  const { grade, score } = computeGrade(findings);
  const serverScores = computeServerScores(servers, findings);

  const result: AuditResult = {
    version: VERSION,
    servers,
    findings,
    scannedPaths,
    timestamp: new Date().toISOString(),
    grade,
    score,
    serverScores,
  };

  if (opts.json) {
    const safeResult = {
      ...result,
      servers: result.servers.map((s) => ({
        ...s,
        env: Object.fromEntries(
          Object.entries(s.env).map(([k]) => [k, "***"])
        ),
      })),
    };
    console.log(JSON.stringify(safeResult, null, 2));
  } else if (opts.markdown) {
    printMarkdown(result);
  } else {
    printReport(result, opts.verbose);
  }

  if (findings.some((f) => f.severity === "critical")) process.exit(2);
  if (findings.some((f) => f.severity === "high")) process.exit(1);
}

main();
