import type { McpServer, Finding } from "../types.js";

export function checkConfigHygiene(servers: McpServer[]): Finding[] {
  const findings: Finding[] = [];

  const nameMap = new Map<string, McpServer[]>();
  for (const server of servers) {
    const existing = nameMap.get(server.name) ?? [];
    existing.push(server);
    nameMap.set(server.name, existing);
  }

  for (const [name, dupes] of nameMap) {
    if (dupes.length <= 1) continue;
    const sources = dupes.map(d => d.source).join(", ");
    const commands = [...new Set(dupes.map(d => d.command))];

    if (commands.length > 1) {
      findings.push({
        severity: "high",
        category: "config-hygiene",
        title: "Shadow server (same name, different command)",
        detail: `Server "${name}" is defined in ${dupes.length} configs (${sources}) with different commands: ${commands.join(" vs ")}. One may shadow or override the other.`,
        recommendation: "Use unique server names across configs, or remove the duplicate you don't intend to use.",
        server: name,
        source: sources,
      });
    } else {
      findings.push({
        severity: "low",
        category: "config-hygiene",
        title: "Duplicate server definition",
        detail: `Server "${name}" is defined in ${dupes.length} configs (${sources}). The active one depends on client load order.`,
        recommendation: "Keep the server in only one config file to avoid confusion.",
        server: name,
        source: sources,
      });
    }
  }

  for (const server of servers) {
    if (!server.command && !server.url) {
      findings.push({
        severity: "medium",
        category: "config-hygiene",
        title: "Server with no command or URL",
        detail: `Server "${server.name}" in ${server.source} has neither a command nor a URL. It cannot start or connect.`,
        recommendation: "Add a command (for stdio transport) or url (for SSE/HTTP transport).",
        server: server.name,
        source: server.source,
      });
    }

    const unusedEnvVars = Object.entries(server.env).filter(([key]) => {
      const fullCmd = [server.command, ...server.args].join(" ");
      return !fullCmd.includes(key) && !fullCmd.includes(`$${key}`) && !fullCmd.includes(`\${${key}}`);
    });

    if (unusedEnvVars.length > 5) {
      findings.push({
        severity: "low",
        category: "config-hygiene",
        title: "Excessive environment variables",
        detail: `Server "${server.name}" has ${unusedEnvVars.length} env vars that don't appear in its command. Some may be unnecessary or misconfigured.`,
        recommendation: "Review env vars and remove any that aren't needed by the server process.",
        server: server.name,
        source: server.source,
      });
    }
  }

  return findings;
}
