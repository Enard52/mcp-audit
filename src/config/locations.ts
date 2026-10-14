import { homedir } from "os";
import { join } from "path";

export interface ConfigLocation {
  name: string;
  paths: string[];
}

const home = homedir();

export const CONFIG_LOCATIONS: ConfigLocation[] = [
  {
    name: "Claude Desktop",
    paths: [
      join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      join(home, "AppData", "Roaming", "Claude", "claude_desktop_config.json"),
      join(home, ".config", "claude", "claude_desktop_config.json"),
    ],
  },
  {
    name: "Claude Code (global)",
    paths: [
      join(home, ".claude.json"),
      join(home, ".claude", "settings.json"),
    ],
  },
  {
    name: "Claude Code (project)",
    paths: [
      join(process.cwd(), ".claude", "settings.json"),
      join(process.cwd(), ".claude", "settings.local.json"),
      join(process.cwd(), ".mcp.json"),
    ],
  },
  {
    name: "Cursor",
    paths: [
      join(home, ".cursor", "mcp.json"),
      join(process.cwd(), ".cursor", "mcp.json"),
    ],
  },
  {
    name: "Windsurf",
    paths: [
      join(home, ".codeium", "windsurf", "mcp_config.json"),
    ],
  },
  {
    name: "VS Code (Continue)",
    paths: [
      join(home, ".continue", "config.json"),
    ],
  },
];
