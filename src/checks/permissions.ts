import type { McpServer, Finding } from "../types.js";

const SHELL_COMMANDS = new Set(["bash", "sh", "zsh", "cmd", "cmd.exe", "powershell", "powershell.exe", "pwsh"]);

const FILESYSTEM_PATTERNS = [
  /\bfilesystem\b/i,
  /\bfs[-_]?server\b/i,
  /\bfile[-_]?access\b/i,
  /\/|\\/, // path-like args
];

const NETWORK_PATTERNS = [
  /\bfetch\b/i,
  /\bhttp\b/i,
  /\bpuppeteer\b/i,
  /\bplaywright\b/i,
  /\bbrowser\b/i,
  /\bscrape\b/i,
];

const DANGEROUS_ARGS = [
  { pattern: /--allow-write/i, label: "write access" },
  { pattern: /--allow-run/i, label: "command execution" },
  { pattern: /--allow-net/i, label: "network access" },
  { pattern: /--no-sandbox/i, label: "sandbox disabled" },
  { pattern: /--privileged/i, label: "privileged mode" },
  { pattern: /sudo/i, label: "elevated privileges" },
];

export function checkPermissions(server: McpServer): Finding[] {
  const findings: Finding[] = [];
  const fullCmd = [server.command, ...server.args].join(" ");

  if (SHELL_COMMANDS.has(server.command)) {
    findings.push({
      severity: "critical",
      title: "Direct shell access",
      detail: `Server "${server.name}" spawns a shell (${server.command}). This grants unrestricted command execution on your machine.`,
      server: server.name,
      source: server.source,
    });
  }

  if (FILESYSTEM_PATTERNS.some((p) => p.test(server.name) || server.args.some((a) => p.test(a)))) {
    const pathArgs = server.args.filter((a) => a.startsWith("/") || a.startsWith("~") || /^[A-Z]:\\/i.test(a));
    const scope = pathArgs.length ? pathArgs.join(", ") : "unknown scope";
    findings.push({
      severity: "high",
      title: "Filesystem access",
      detail: `Server "${server.name}" has filesystem access (${scope}). It can read and potentially modify files.`,
      server: server.name,
      source: server.source,
    });
  }

  if (NETWORK_PATTERNS.some((p) => p.test(fullCmd) || p.test(server.name))) {
    findings.push({
      severity: "medium",
      title: "Network access",
      detail: `Server "${server.name}" appears to have network/browser capabilities. It may exfiltrate data or access external services.`,
      server: server.name,
      source: server.source,
    });
  }

  for (const { pattern, label } of DANGEROUS_ARGS) {
    if (server.args.some((a) => pattern.test(a))) {
      findings.push({
        severity: "high",
        title: `Dangerous flag: ${label}`,
        detail: `Server "${server.name}" uses a flag granting ${label}.`,
        server: server.name,
        source: server.source,
      });
    }
  }

  return findings;
}
