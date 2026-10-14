import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseJsonc } from "../src/jsonc.js";

describe("parseJsonc", () => {
  it("parses standard JSON", () => {
    const result = parseJsonc('{"key": "value"}');
    assert.deepEqual(result, { key: "value" });
  });

  it("strips single-line comments", () => {
    const result = parseJsonc(`{
      // this is a comment
      "key": "value"
    }`);
    assert.deepEqual(result, { key: "value" });
  });

  it("strips block comments", () => {
    const result = parseJsonc(`{
      /* block comment */
      "key": "value"
    }`);
    assert.deepEqual(result, { key: "value" });
  });

  it("strips multi-line block comments", () => {
    const result = parseJsonc(`{
      /**
       * multi-line
       * comment
       */
      "key": "value"
    }`);
    assert.deepEqual(result, { key: "value" });
  });

  it("handles trailing commas in objects", () => {
    const result = parseJsonc(`{
      "a": 1,
      "b": 2,
    }`);
    assert.deepEqual(result, { a: 1, b: 2 });
  });

  it("handles trailing commas in arrays", () => {
    const result = parseJsonc(`{
      "items": [1, 2, 3,]
    }`);
    assert.deepEqual(result, { items: [1, 2, 3] });
  });

  it("preserves // inside strings", () => {
    const result = parseJsonc(`{
      "url": "http://example.com"
    }`);
    assert.deepEqual(result, { url: "http://example.com" });
  });

  it("handles a realistic MCP config with comments", () => {
    const result = parseJsonc(`{
      // MCP server configuration
      "mcpServers": {
        "filesystem": {
          "command": "npx",
          "args": [
            "@modelcontextprotocol/server-filesystem",
            "/home/user/projects", // project directory
          ],
          "env": {} /* no secrets needed */
        },
      }
    }`);
    const parsed = result as { mcpServers: { filesystem: { command: string } } };
    assert.equal(parsed.mcpServers.filesystem.command, "npx");
  });
});
