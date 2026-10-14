import { homedir } from "os";
import { join } from "path";

export interface ConfigLocation {
  name: string;
  paths: string[];
}

const home = homedir();
const cwd = process.cwd();

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
      join(cwd, ".claude", "settings.json"),
      join(cwd, ".claude", "settings.local.json"),
      join(cwd, ".mcp.json"),
    ],
  },
  {
    name: "Cursor",
    paths: [
      join(home, ".cursor", "mcp.json"),
      join(cwd, ".cursor", "mcp.json"),
    ],
  },
  {
    name: "Windsurf",
    paths: [
      join(home, ".codeium", "windsurf", "mcp_config.json"),
      join(cwd, ".windsurf", "mcp_config.json"),
    ],
  },
  {
    name: "VS Code (Continue)",
    paths: [
      join(home, ".continue", "config.json"),
    ],
  },
  {
    name: "Zed",
    paths: [
      join(home, ".config", "zed", "settings.json"),
      join(home, "Library", "Application Support", "Zed", "settings.json"),
      join(home, "AppData", "Roaming", "Zed", "settings.json"),
    ],
  },
  {
    name: "Cline (VS Code)",
    paths: [
      join(cwd, ".cline", "mcp_settings.json"),
      join(home, ".cline", "mcp_settings.json"),
    ],
  },
  {
    name: "Roo Code (VS Code)",
    paths: [
      join(cwd, ".roo", "mcp.json"),
      join(home, ".roo", "mcp.json"),
    ],
  },
  {
    name: "Amazon Q",
    paths: [
      join(home, ".aws", "amazonq", "mcp.json"),
    ],
  },
  {
    name: "GitHub Copilot",
    paths: [
      join(cwd, ".github", "copilot-mcp.json"),
    ],
  },
  {
    name: "Project root",
    paths: [
      join(cwd, "mcp.json"),
    ],
  },
];
