import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkSecrets } from "../src/checks/secrets.js";
import type { McpServer } from "../src/types.js";

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "npx", args: ["pkg"], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("checkSecrets", () => {
  it("flags hardcoded OpenAI key", () => {
    const findings = checkSecrets(server({ env: { API_KEY: "sk-" + "a1b2c3d4e5".repeat(3) } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("OpenAI")));
  });

  it("flags hardcoded Anthropic key", () => {
    const findings = checkSecrets(server({ env: { API_KEY: "sk-ant-" + "abcdef123456-ghijkl789012-mnopqr" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("Anthropic")));
  });

  it("flags hardcoded GitHub PAT", () => {
    const findings = checkSecrets(server({ env: { TOKEN: "ghp_" + "a".repeat(36) } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("GitHub PAT")));
  });

  it("flags hardcoded AWS access key", () => {
    const findings = checkSecrets(server({ env: { ACCESS_KEY: "AKIA" + "IOSFODNN7EXAMPL" + "E" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("AWS")));
  });

  it("flags hardcoded Stripe live key", () => {
    const findings = checkSecrets(server({ env: { SECRET: "sk_live_" + "a".repeat(24) } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("Stripe live")));
  });

  it("flags hardcoded Slack bot token", () => {
    const findings = checkSecrets(server({ env: { TOKEN: "xoxb-" + "123456-abcdefgh" } }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("Slack bot")));
  });

  it("flags possible credential (long inline value)", () => {
    const findings = checkSecrets(server({ env: { API_KEY: "some-long-suspicious-value-here" } }));
    assert.ok(findings.some(f => f.severity === "high" && f.title === "Possible hardcoded credential"));
  });

  it("does not flag env var references", () => {
    const findings = checkSecrets(server({ env: { API_KEY: "${API_KEY}" } }));
    assert.ok(!findings.some(f => f.severity === "critical" || f.severity === "high"));
  });

  it("does not flag $VAR references", () => {
    const findings = checkSecrets(server({ env: { TOKEN: "$MY_TOKEN" } }));
    assert.ok(!findings.some(f => f.severity === "critical" || f.severity === "high"));
  });

  it("flags secret in command args", () => {
    const findings = checkSecrets(server({ args: ["--key", "sk-" + "a1b2c3d4e5".repeat(3)] }));
    assert.ok(findings.some(f => f.severity === "critical" && f.title.includes("command args")));
  });

  it("flags key in non-standard env var name", () => {
    const findings = checkSecrets(server({ env: { MY_CONFIG_VALUE: "ghp_" + "a".repeat(36) } }));
    assert.ok(findings.some(f => f.title.includes("non-standard env var")));
  });

  it("returns empty for clean env", () => {
    const findings = checkSecrets(server({ env: { LOG_LEVEL: "debug", PORT: "3000" } }));
    assert.equal(findings.length, 0);
  });
});
