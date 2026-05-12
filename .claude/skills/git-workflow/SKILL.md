---
name: git-workflow
description: Guides the full Git development workflow: branch from main, commit during development, and open a pull request when done. Use when starting work on a new issue or feature, making commits, or creating a PR at the end of a development session.
---

# Git Workflow

## 1. Start — branch from main

Always branch from an up-to-date main:

```bash
git checkout main
git pull origin main
git checkout -b <branch-name>
```

**Branch naming convention:** `<type>/<short-description>`
- `feat/accounts-crud`
- `fix/withdrawal-limit-check`
- `chore/swagger-docs`

Push the branch immediately so it exists on the remote:

```bash
git push -u origin <branch-name>
```

## 2. During development — commit often

Stage and commit as you finish each logical unit of work. Prefer specific files over `git add .`:

```bash
git add src/accounts/accounts.service.ts src/accounts/accounts.controller.ts
git commit -m "feat: add create and get account endpoints"
```

**Commit message format:** `<type>: <short description>` (imperative mood)
- `feat:` new feature
- `fix:` bug fix
- `chore:` tooling, config, deps
- `test:` adding or updating tests
- `docs:` README, comments

Keep commits small and focused — one logical change per commit.

## 3. Done — open a pull request

Before opening the PR, make sure the branch is up to date with main:

```bash
git fetch origin
git rebase origin/main
git push
```

Then open the PR targeting `main`:

```bash
gh pr create \
  --base main \
  --title "<short title>" \
  --body "$(cat <<'EOF'
## Summary
- Bullet points describing what changed

## How to test
- Step-by-step instructions

## Related issues
Closes #<issue-number>
EOF
)"
```

After creating, share the PR URL with the user.

## Checklist before merging

- [ ] Branch is rebased on latest main
- [ ] All unit tests pass (`npm run test`)
- [ ] No leftover debug code or console.logs
- [ ] PR description references the relevant issue (`Closes #N`)
