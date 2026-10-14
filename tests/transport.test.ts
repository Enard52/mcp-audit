import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkTransport } from "../src/checks/transport.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "", args: [], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkTransport", () => {
  it("flags plain HTTP remote server", () => {
    const findings = checkTransport(server({ url: "http://evil.com/mcp" }));
    assert.ok(findings.some(f => f.title === "Unencrypted HTTP transport"));
  });

  it("downgrades localhost HTTP to low", () => {
    const findings = checkTransport(server({ url: "http://localhost:3000/mcp" }));
    const f = findings.find(f => f.title === "Unencrypted HTTP transport");
    assert.ok(f);
    assert.equal(f.severity, "low");
  });

  it("flags credentials embedded in URL", () => {
    const findings = checkTransport(server({ url: "https://admin:secret@api.example.com/mcp" }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Credentials embedded in URL"));
  });

  it("info for HTTPS remote server", () => {
    const findings = checkTransport(server({ url: "https://api.example.com/mcp" }));
    assert.ok(findings.some(f => f.severity === "info" && f.title.includes("Remote MCP server")));
  });

  it("flags malformed URL", () => {
    const findings = checkTransport(server({ url: "not-a-url" }));
    assert.ok(findings.some(f => f.title === "Malformed server URL"));
  });

  it("returns empty for stdio server (no URL)", () => {
    const findings = checkTransport(server({ command: "npx", args: ["pkg"] }));
    assert.equal(findings.length, 0);
  });
});
