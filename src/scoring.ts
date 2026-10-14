import type { Finding, Grade, McpServer, ServerScore, Severity } from "./types.js";

const SEVERITY_POINTS: Record<Severity, number> = {
  critical: 25,
  high: 10,
  medium: 4,
  low: 1,
  info: 0,
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function computeGrade(findings: Finding[]): { grade: Grade; score: number } {
  if (findings.length === 0) return { grade: "A", score: 100 };

  let penalty = 0;
  for (const f of findings) {
    penalty += SEVERITY_POINTS[f.severity];
  }

  const score = Math.max(0, 100 - penalty);

  let grade: Grade;
  if (score >= 90) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 50) grade = "C";
  else if (score >= 25) grade = "D";
  else grade = "F";

  return { grade, score };
}

export function computeServerScores(servers: McpServer[], findings: Finding[]): ServerScore[] {
  return servers.map((server) => {
    const serverFindings = findings.filter(f => f.server === server.name && f.source === server.source);
    const { grade, score } = computeGrade(serverFindings);

    let worstSeverity: Severity | null = null;
    for (const f of serverFindings) {
      if (!worstSeverity || SEVERITY_RANK[f.severity] < SEVERITY_RANK[worstSeverity]) {
        worstSeverity = f.severity;
      }
    }

    return {
      server: server.name,
      source: server.source,
      score,
      grade,
      findingCount: serverFindings.length,
      worstSeverity,
    };
  });
}
