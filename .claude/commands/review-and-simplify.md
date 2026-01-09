---
allowed-tools: Task, Bash(git diff:*), Bash(git status:*), Read, Edit, Write
argument-hint: [files]
description: Review and simplify unstaged changes before staging
---

## Context

- Changed files: !`git diff --name-only`
- Git status: !`git status --short`

## Target

$ARGUMENTS

If no target specified, use all unstaged changes shown above.

## Workflow

### Step 1: Code Review

Invoke the **code-reviewer** subagent to review the target files for bugs, security issues, and CLAUDE.md compliance. Only issues with confidence >= 80 should be reported.

Wait for completion and note any critical issues (confidence 90+).

### Step 2: Code Simplification

If critical issues were found, skip this step and proceed to summary.

Otherwise, invoke the **code-simplifier** subagent to simplify the same files for clarity and maintainability while preserving functionality.

### Step 3: Summary

Provide:
- Files processed
- Issues found (Critical: 90+, Important: 80-89)
- Simplifications applied
- Recommendation: ready to stage, or needs manual fixes
