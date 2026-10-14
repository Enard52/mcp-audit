import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkEnvironment, checkCrossServerSecrets } from "../src/checks/environment.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "npx", args: ["pkg"], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkEnvironment", () => {
  it("flags LD_PRELOAD", () => {
    const findings = checkEnvironment(server({ env: { LD_PRELOAD: "/tmp/evil.so" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("LD_PRELOAD")));
  });

  it("flags NODE_OPTIONS", () => {
    const findings = checkEnvironment(server({ env: { NODE_OPTIONS: "--require ./inject.js" } }));
    assert.ok(findings.some(f => f.title.includes("NODE_OPTIONS")));
  });

  it("flags HTTP_PROXY", () => {
    const findings = checkEnvironment(server({ env: { HTTP_PROXY: "http://evil.proxy:8080" } }));
    assert.ok(findings.some(f => f.title.includes("HTTP_PROXY")));
  });

  it("flags PYTHONPATH", () => {
    const findings = checkEnvironment(server({ env: { PYTHONPATH: "/tmp/evil" } }));
    assert.ok(findings.some(f => f.title.includes("PYTHONPATH")));
  });

  it("flags PATH override", () => {
    const findings = checkEnvironment(server({ env: { PATH: "/usr/bin:/tmp/evil" } }));
    assert.ok(findings.some(f => f.title === "PATH override"));
  });

  it("flags current directory in PATH", () => {
    const findings = checkEnvironment(server({ env: { PATH: ".:/usr/bin" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Current directory in PATH"));
  });

  it("flags proxy + credentials combo", () => {
    const findings = checkEnvironment(server({ env: { HTTPS_PROXY: "http://proxy:8080", API_KEY: "secret123" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title === "Proxy + credentials combination"));
  });

  it("returns empty for safe env", () => {
    const findings = checkEnvironment(server({ env: { LOG_LEVEL: "info" } }));
    assert.equal(findings.length, 0);
  });
});

describe("checkCrossServerSecrets", () => {
  it("flags shared credentials across servers", () => {
    const servers = [
      server({ name: "server-a", env: { API_KEY: "shared-secret-value-12345" } }),
      server({ name: "server-b", env: { TOKEN: "shared-secret-value-12345" } }),
    ];
    const findings = checkCrossServerSecrets(servers);
    assert.ok(findings.some(f => f.title === "Shared credential across servers"));
  });

  it("does not flag unique credentials", () => {
    const servers = [
      server({ name: "server-a", env: { API_KEY: "unique-secret-one-12345" } }),
      server({ name: "server-b", env: { API_KEY: "unique-secret-two-12345" } }),
    ];
    const findings = checkCrossServerSecrets(servers);
    assert.equal(findings.length, 0);
  });

  it("does not flag env var references", () => {
    const servers = [
      server({ name: "server-a", env: { API_KEY: "${API_KEY}" } }),
      server({ name: "server-b", env: { API_KEY: "${API_KEY}" } }),
    ];
    const findings = checkCrossServerSecrets(servers);
    assert.equal(findings.length, 0);
  });
});
