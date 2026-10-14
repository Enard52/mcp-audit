export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface McpServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  source: string;
  sourcePath: string;
}

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
  server: string;
  source: string;
}

export interface AuditResult {
  servers: McpServer[];
  findings: Finding[];
  scannedPaths: string[];
  timestamp: string;
}

export interface McpConfig {
  mcpServers?: Record<string, RawServerEntry>;
}

export interface RawServerEntry {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}
