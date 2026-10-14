import type { McpServer, Finding } from "../types.js";

const KNOWN_PUBLISHERS: Record<string, string> = {
  "@modelcontextprotocol/": "Anthropic (official)",
  "@anthropic/": "Anthropic (official)",
  "@cloudflare/": "Cloudflare",
  "@supabase/": "Supabase",
  "@sentry/": "Sentry",
  "@vercel/": "Vercel",
};

const PACKAGE_RUNNERS = new Set(["npx", "uvx", "bunx", "pnpx"]);

export function checkSupplyChain(server: McpServer): Finding[] {
  const findings: Finding[] = [];

  if (PACKAGE_RUNNERS.has(server.command)) {
    const pkg = server.args[0] ?? "";

    if (pkg.startsWith("-")) {
      findings.push({
        severity: "high",
        title: "Package runner with flags before package name",
        detail: `Server "${server.name}" runs "${server.command}" with flags before the package name. This may be executing an unintended package.`,
        server: server.name,
        source: server.source,
      });
      return findings;
    }

    const isVerified = Object.keys(KNOWN_PUBLISHERS).some((prefix) => pkg.startsWith(prefix));

    if (!isVerified) {
      findings.push({
        severity: "medium",
        title: "Unverified package",
        detail: `Server "${server.name}" runs "${pkg}" via ${server.command}. This package is not from a known verified publisher. Verify the package source before trusting it.`,
        server: server.name,
        source: server.source,
      });
    }

    if (!pkg.includes("@") || pkg.endsWith("@latest")) {
      findings.push({
        severity: "medium",
        title: "Unpinned package version",
        detail: `Server "${server.name}" runs "${pkg}" without a pinned version. A compromised future release could execute malicious code on your machine.`,
        server: server.name,
        source: server.source,
      });
    }
  }

  if (server.command === "docker" || server.command === "podman") {
    const runIdx = server.args.indexOf("run");
    if (runIdx !== -1 && server.args.includes("--privileged")) {
      findings.push({
        severity: "critical",
        title: "Privileged container",
        detail: `Server "${server.name}" runs a Docker container in privileged mode. This grants near-host-level access.`,
        server: server.name,
        source: server.source,
      });
    }
  }

  return findings;
}
