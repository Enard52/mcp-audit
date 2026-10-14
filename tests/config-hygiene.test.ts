import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkConfigHygiene } from "../src/checks/config-hygiene.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "npx", args: ["pkg"], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkConfigHygiene", () => {
  it("flags shadow server (same name, different command)", () => {
    const servers = [
      server({ name: "my-server", command: "npx", source: "Claude Desktop" }),
      server({ name: "my-server", command: "node", source: "Cursor" }),
    ];
    const findings = checkConfigHygiene(servers);
    assert.ok(findings.some(f => f.severity === "high" && f.title.includes("Shadow server")));
  });

  it("flags duplicate server (same name, same command)", () => {
    const servers = [
      server({ name: "my-server", command: "npx", source: "Claude Desktop" }),
      server({ name: "my-server", command: "npx", source: "Cursor" }),
    ];
    const findings = checkConfigHygiene(servers);
    assert.ok(findings.some(f => f.title.includes("Duplicate server")));
  });

  it("flags server with no command or URL", () => {
    const findings = checkConfigHygiene([server({ command: "", url: "" })]);
    assert.ok(findings.some(f => f.title === "Server with no command or URL"));
  });

  it("flags excessive env vars", () => {
    const env: Record<string, string> = {};
    for (let i = 0; i < 8; i++) env[`VAR_${i}`] = `val_${i}`;
    const findings = checkConfigHygiene([server({ env })]);
    assert.ok(findings.some(f => f.title === "Excessive environment variables"));
  });

  it("returns empty for single clean server", () => {
    const findings = checkConfigHygiene([server({ command: "npx", args: ["@test/pkg@1.0.0"] })]);
    assert.equal(findings.length, 0);
  });
});
