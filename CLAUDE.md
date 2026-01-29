# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

Always run `npm run lint && npm run build` after making changes.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui components

## Team Practices

- **KISS**: Keep it simple. Don't over-engineer.
- **Build only what's required**: No speculative features or premature abstractions.
- **Use shadcn components**: Prefer shadcn/ui for UI components to increase development speed.
- **Path alias**: `@/*` maps to project root.

## Git Workflow

- **Base branch**: Always create feature branches from `staging`
- **PR target**: All PRs should target `staging`, not `main`
- `main` is only updated via staging merges
- **Merging PRs**: Never use `--delete-branch` when merging, especially for staging → main merges

## Git Worktrees

This repo uses git worktrees to enable parallel work on multiple features/subtasks. Each worktree is an independent working directory with its own branch.

```bash
# Create a new worktree for a feature
git worktree add ../bishs-trade-tool-<feature> -b <branch-name>

# List active worktrees
git worktree list

# Remove a worktree when done
git worktree remove ../bishs-trade-tool-<feature>
```

## Before Committing

Always run `/review-and-simplify` before staging and committing code. This runs the code-reviewer and code-simplifier agents to catch issues and clean up code.
