import { readFileSync, existsSync } from "fs";
import { CONFIG_LOCATIONS } from "./config/locations.js";
import type { McpServer, McpConfig, RawServerEntry } from "./types.js";

export function discoverConfigs(): { servers: McpServer[]; scannedPaths: string[] } {
  const servers: McpServer[] = [];
  const scannedPaths: string[] = [];

  for (const location of CONFIG_LOCATIONS) {
    for (const configPath of location.paths) {
      if (!existsSync(configPath)) continue;
      scannedPaths.push(configPath);

      try {
        const raw = readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw) as McpConfig;
        const mcpServers = parsed.mcpServers ?? (parsed as Record<string, unknown>);

        if (typeof mcpServers !== "object" || mcpServers === null) continue;

        for (const [name, entry] of Object.entries(mcpServers)) {
          if (!isServerEntry(entry)) continue;

          servers.push({
            name,
            command: entry.command ?? "",
            args: entry.args ?? [],
            env: entry.env ?? {},
            source: location.name,
            sourcePath: configPath,
          });
        }
      } catch {
        // malformed config — skip
      }
    }
  }

  return { servers, scannedPaths };
}

function isServerEntry(v: unknown): v is RawServerEntry {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return typeof obj.command === "string" || typeof obj.url === "string";
}
