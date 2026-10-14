#!/bin/bash
# Run this from the mcp-audit repo root to generate demo output.
# Creates a temporary Claude Code config and runs the audit against it.

set -e

DEMO_DIR=$(mktemp -d)
mkdir -p "$DEMO_DIR/.claude"
cp demo/demo-config.json "$DEMO_DIR/.claude/settings.json"

echo ""
echo "  Running mcp-audit demo..."
echo ""

cd "$DEMO_DIR"
node "$(dirname "$0")/../dist/index.js" --verbose || true

echo ""
echo "  Demo complete. Clean up: rm -rf $DEMO_DIR"
