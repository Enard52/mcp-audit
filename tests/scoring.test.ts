import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeGrade, computeServerScores } from "../src/scoring.js";
import type { Finding, McpServer } from "../src/types.js";

function finding(overrides: Partial<Finding> = {}): Finding {
  return {
    severity: "medium", category: "permissions", title: "Test", detail: "", recommendation: "", server: "test", source: "Test",
    ...overrides,
  };
}

function server(overrides: Partial<McpServer> = {}): McpServer {
  return { name: "test", command: "npx", args: [], env: {}, url: "", source: "Test", sourcePath: "/tmp/test.json", ...overrides };
}

describe("computeGrade", () => {
  it("returns A for no findings", () => {
    const { grade, score } = computeGrade([]);
    assert.equal(grade, "A");
    assert.equal(score, 100);
  });

  it("returns A for info-only findings", () => {
    const { grade } = computeGrade([finding({ severity: "info" }), finding({ severity: "info" })]);
    assert.equal(grade, "A");
  });

  it("returns F for multiple critical findings", () => {
    const { grade, score } = computeGrade([
      finding({ severity: "critical" }),
      finding({ severity: "critical" }),
      finding({ severity: "critical" }),
      finding({ severity: "critical" }),
      finding({ severity: "critical" }),
    ]);
    assert.equal(grade, "F");
    assert.equal(score, 0);
  });

  it("returns B for a single high finding", () => {
    const { grade, score } = computeGrade([finding({ severity: "high" })]);
    assert.equal(grade, "A");
    assert.equal(score, 90);
  });

  it("returns C for mixed findings", () => {
    const { grade } = computeGrade([
      finding({ severity: "high" }),
      finding({ severity: "high" }),
      finding({ severity: "medium" }),
      finding({ severity: "medium" }),
    ]);
    assert.equal(grade, "C");
  });
});

describe("computeServerScores", () => {
  it("scores each server independently", () => {
    const servers = [
      server({ name: "clean" }),
      server({ name: "dirty" }),
    ];
    const findings = [
      finding({ server: "dirty", source: "Test", severity: "critical" }),
    ];
    const scores = computeServerScores(servers, findings);
    const clean = scores.find(s => s.server === "clean")!;
    const dirty = scores.find(s => s.server === "dirty")!;
    assert.equal(clean.grade, "A");
    assert.equal(clean.findingCount, 0);
    assert.equal(dirty.findingCount, 1);
    assert.equal(dirty.worstSeverity, "critical");
  });
});
