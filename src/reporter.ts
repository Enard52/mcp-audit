import type { AuditResult, Finding, McpServer, Severity } from "./types.js";

const SEVERITY_CONFIG: Record<Severity, { icon: string; color: string; label: string }> = {
  critical: { icon: "\u{1F6D1}", color: "\x1b[91m", label: "CRITICAL" },
  high:     { icon: "\u{1F7E0}", color: "\x1b[33m", label: "HIGH" },
  medium:   { icon: "\u{1F7E1}", color: "\x1b[93m", label: "MEDIUM" },
  low:      { icon: "\u{1F535}", color: "\x1b[94m", label: "LOW" },
  info:     { icon: "\u{2139}\u{FE0F}",  color: "\x1b[90m", label: "INFO" },
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[91m";
const WHITE = "\x1b[97m";

export function printReport(result: AuditResult): void {
  console.log();
  console.log(`${BOLD}${CYAN}  mcp-audit${RESET}${DIM} — security scanner for MCP servers${RESET}`);
  console.log(`${DIM}  ${"─".repeat(50)}${RESET}`);
  console.log();

  printServers(result.servers);
  printFindings(result.findings);
  printSummary(result);
}

function printServers(servers: McpServer[]): void {
  if (servers.length === 0) {
    console.log(`  ${DIM}No MCP servers found.${RESET}`);
    console.log();
    return;
  }

  console.log(`  ${BOLD}${WHITE}Servers discovered: ${servers.length}${RESET}`);
  console.log();

  for (const s of servers) {
    console.log(`  ${BOLD}${s.name}${RESET}  ${DIM}(${s.source})${RESET}`);
    console.log(`  ${DIM}  cmd: ${s.command} ${s.args.join(" ")}${RESET}`);
    const envKeys = Object.keys(s.env);
    if (envKeys.length > 0) {
      console.log(`  ${DIM}  env: ${envKeys.join(", ")}${RESET}`);
    }
    console.log();
  }
}

function printFindings(findings: Finding[]): void {
  if (findings.length === 0) {
    console.log(`  ${GREEN}${BOLD}No security issues found.${RESET}`);
    console.log();
    return;
  }

  console.log(`  ${BOLD}${WHITE}Findings: ${findings.length}${RESET}`);
  console.log();

  for (const f of findings) {
    const cfg = SEVERITY_CONFIG[f.severity];
    console.log(`  ${cfg.icon} ${cfg.color}${BOLD}${cfg.label}${RESET} ${BOLD}${f.title}${RESET}`);
    console.log(`  ${DIM}  ${f.detail}${RESET}`);
    console.log(`  ${DIM}  server: ${f.server} · source: ${f.source}${RESET}`);
    console.log();
  }
}

function printSummary(result: AuditResult): void {
  console.log(`  ${DIM}${"─".repeat(50)}${RESET}`);

  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const f of result.findings) counts[f.severity]++;

  const parts: string[] = [];
  for (const [sev, count] of Object.entries(counts)) {
    if (count === 0) continue;
    const cfg = SEVERITY_CONFIG[sev as Severity];
    parts.push(`${cfg.color}${count} ${cfg.label.toLowerCase()}${RESET}`);
  }

  const hasIssues = counts.critical > 0 || counts.high > 0;
  const statusIcon = hasIssues ? RED : GREEN;
  const statusText = hasIssues ? "ACTION REQUIRED" : result.findings.length > 0 ? "REVIEW RECOMMENDED" : "ALL CLEAR";

  console.log();
  console.log(`  ${statusIcon}${BOLD}${statusText}${RESET}`);
  console.log(`  ${result.servers.length} servers · ${result.findings.length} findings${parts.length ? " (" + parts.join(", ") + ")" : ""}`);
  console.log(`  ${DIM}${result.scannedPaths.length} config paths scanned · ${result.timestamp}${RESET}`);
  console.log();
}
