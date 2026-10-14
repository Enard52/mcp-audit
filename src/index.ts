#!/usr/bin/env node

import { discoverConfigs } from "./scanner.js";
import { runChecks } from "./checks/index.js";
import { printReport } from "./reporter.js";
import type { AuditResult } from "./types.js";

function main(): void {
  const flag = process.argv[2];

  if (flag === "--help" || flag === "-h") {
    console.log(`
  mcp-audit — security scanner for MCP servers

  Usage:
    npx mcp-audit          Scan and audit all MCP server configs
    npx mcp-audit --json   Output results as JSON
    npx mcp-audit --help   Show this help

  Scans:
    Claude Desktop, Claude Code, Cursor, Windsurf, VS Code (Continue)

  Checks:
    Shell access, filesystem permissions, secret exposure,
    supply chain risks, dangerous flags, unpinned packages
`);
    process.exit(0);
  }

  const { servers, scannedPaths } = discoverConfigs();
  const findings = runChecks(servers);

  const result: AuditResult = {
    servers,
    findings,
    scannedPaths,
    timestamp: new Date().toISOString(),
  };

  if (flag === "--json") {
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
    process.exit(findings.some((f) => f.severity === "critical") ? 2 : 0);
  }

  printReport(result);

  if (findings.some((f) => f.severity === "critical")) process.exit(2);
  if (findings.some((f) => f.severity === "high")) process.exit(1);
}

main();
