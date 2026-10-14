import type { McpServer, Finding, Severity } from "../types.js";
import { checkPermissions } from "./permissions.js";
import { checkSecrets } from "./secrets.js";
import { checkSupplyChain } from "./supply-chain.js";
import { checkTransport } from "./transport.js";
import { checkConfigHygiene } from "./config-hygiene.js";
import { checkEnvironment, checkCrossServerSecrets } from "./environment.js";
import { checkFilePermissions } from "./file-permissions.js";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function runChecks(
  servers: McpServer[],
  scannedPaths: string[],
  minSeverity: Severity = "info",
): Finding[] {
  const findings: Finding[] = [];
  const threshold = SEVERITY_RANK[minSeverity];

  for (const server of servers) {
    findings.push(
      ...checkPermissions(server),
      ...checkSecrets(server),
      ...checkSupplyChain(server),
      ...checkTransport(server),
      ...checkEnvironment(server),
    );
  }

  findings.push(...checkConfigHygiene(servers));
  findings.push(...checkCrossServerSecrets(servers));
  findings.push(...checkFilePermissions(scannedPaths));

  return findings
    .filter(f => SEVERITY_RANK[f.severity] <= threshold)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
