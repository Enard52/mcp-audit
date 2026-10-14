import type { McpServer, Finding } from "../types.js";

const SECRET_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /auth/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
];

const HARDCODED_VALUE_PATTERNS = [
  /^sk-[a-zA-Z0-9]{20,}$/,        // OpenAI-style
  /^ghp_[a-zA-Z0-9]{36}$/,        // GitHub PAT
  /^gho_[a-zA-Z0-9]{36}$/,        // GitHub OAuth
  /^xoxb-/,                         // Slack bot token
  /^xoxp-/,                         // Slack user token
  /^AKIA[0-9A-Z]{16}$/,            // AWS access key
  /^AIza[0-9A-Za-z_-]{35}$/,       // Google API key
  /^sk-ant-[a-zA-Z0-9-]{20,}$/,   // Anthropic API key
];

export function checkSecrets(server: McpServer): Finding[] {
  const findings: Finding[] = [];

  for (const [key, value] of Object.entries(server.env)) {
    if (SECRET_PATTERNS.some((p) => p.test(key))) {
      const isHardcoded = HARDCODED_VALUE_PATTERNS.some((p) => p.test(value));
      const isEnvRef = value.startsWith("${") || value.startsWith("$");

      if (isHardcoded) {
        findings.push({
          severity: "critical",
          title: "Hardcoded secret in config",
          detail: `Server "${server.name}" has a hardcoded secret in env var "${key}". This value is stored in plaintext on disk. Use environment variable references instead.`,
          server: server.name,
          source: server.source,
        });
      } else if (!isEnvRef && value.length > 10) {
        findings.push({
          severity: "high",
          title: "Possible hardcoded credential",
          detail: `Server "${server.name}" has env var "${key}" with a suspicious inline value. Consider using an environment variable reference.`,
          server: server.name,
          source: server.source,
        });
      } else {
        findings.push({
          severity: "info",
          title: "Secret passed via environment",
          detail: `Server "${server.name}" receives secret "${key}" via env. Ensure the source variable is not logged or leaked.`,
          server: server.name,
          source: server.source,
        });
      }
    }
  }

  for (const arg of server.args) {
    if (HARDCODED_VALUE_PATTERNS.some((p) => p.test(arg))) {
      findings.push({
        severity: "critical",
        title: "Secret exposed in command args",
        detail: `Server "${server.name}" has what appears to be an API key passed as a command argument. This is visible in process listings.`,
        server: server.name,
        source: server.source,
      });
    }
  }

  return findings;
}
