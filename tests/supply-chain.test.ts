import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkSupplyChain } from "../src/checks/supply-chain.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "npx", args: [], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkSupplyChain", () => {
  it("flags unverified package", () => {
    const findings = checkSupplyChain(server({ args: ["some-random-pkg"] }));
    assert.ok(findings.some(f => f.title === "Unverified package"));
  });

  it("does not flag verified publisher (@modelcontextprotocol)", () => {
    const findings = checkSupplyChain(server({ args: ["@modelcontextprotocol/server-fs@1.0.0"] }));
    assert.ok(!findings.some(f => f.title === "Unverified package"));
  });

  it("does not flag verified publisher (@cloudflare)", () => {
    const findings = checkSupplyChain(server({ args: ["@cloudflare/mcp-server@2.0.0"] }));
    assert.ok(!findings.some(f => f.title === "Unverified package"));
  });

  it("flags unpinned package version", () => {
    const findings = checkSupplyChain(server({ args: ["some-pkg"] }));
    assert.ok(findings.some(f => f.title === "Unpinned package version"));
  });

  it("flags @latest as unpinned", () => {
    const findings = checkSupplyChain(server({ args: ["some-pkg@latest"] }));
    assert.ok(findings.some(f => f.title === "Unpinned package version"));
  });

  it("does not flag pinned version", () => {
    const findings = checkSupplyChain(server({ args: ["some-pkg@1.2.3"] }));
    assert.ok(!findings.some(f => f.title === "Unpinned package version"));
  });

  it("flags --yes auto-confirm", () => {
    const findings = checkSupplyChain(server({ args: ["some-pkg", "--yes"] }));
    assert.ok(findings.some(f => f.title === "Auto-confirm flag on package runner"));
  });

  it("flags privileged Docker container", () => {
    const findings = checkSupplyChain(server({ command: "docker", args: ["run", "--privileged", "img"] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Privileged container"));
  });

  it("flags host network mode", () => {
    const findings = checkSupplyChain(server({ command: "docker", args: ["run", "--network=host", "img"] }));
    assert.ok(findings.some(f => f.title === "Host network mode"));
  });

  it("flags host PID namespace", () => {
    const findings = checkSupplyChain(server({ command: "docker", args: ["run", "--pid=host", "img"] }));
    assert.ok(findings.some(f => f.title === "Host PID namespace"));
  });

  it("finds package after known flags like -y", () => {
    const findings = checkSupplyChain(server({ args: ["-y", "some-pkg@1.0.0"] }));
    assert.ok(!findings.some(f => f.title === "Package runner with no clear package"));
  });

  it("flags runner with only flags and no package", () => {
    const findings = checkSupplyChain(server({ args: ["--unknown-flag"] }));
    assert.ok(findings.some(f => f.title === "Package runner with no clear package"));
  });

  it("returns empty for non-runner command", () => {
    const findings = checkSupplyChain(server({ command: "node", args: ["server.js"] }));
    assert.equal(findings.length, 0);
  });
});
