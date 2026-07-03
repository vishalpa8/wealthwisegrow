#!/bin/sh
set -e
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null || echo ".git")
if [ ! -d "$GIT_DIR" ]; then
  echo "No .git directory found. Run this from the repository root." >&2
  exit 1
fi

if [ -f ".githooks/pre-commit" ]; then
  cp .githooks/pre-commit "$GIT_DIR/hooks/pre-commit"
  chmod +x "$GIT_DIR/hooks/pre-commit"
  echo "Installed pre-commit hook to $GIT_DIR/hooks/pre-commit"
else
  echo "No .githooks/pre-commit found." >&2
  exit 1
fi
