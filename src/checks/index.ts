import type { McpServer, Finding } from "../types.js";
import { checkPermissions } from "./permissions.js";
import { checkSecrets } from "./secrets.js";
import { checkSupplyChain } from "./supply-chain.js";

export function runChecks(servers: McpServer[]): Finding[] {
  const findings: Finding[] = [];

  for (const server of servers) {
    findings.push(
      ...checkPermissions(server),
      ...checkSecrets(server),
      ...checkSupplyChain(server),
    );
  }

  return findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function severityRank(s: Finding["severity"]): number {
  const ranks = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return ranks[s];
}
