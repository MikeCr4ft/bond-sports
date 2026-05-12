---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets). Publishes directly to GitHub via the `mcp__github__issue_write` tool.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference (issue number, URL, or path) as an argument, fetch it from the issue tracker and read its full body and comments.

Resolve the GitHub repo from the git remote (`git remote get-url origin`) — extract `owner` and `repo` from the URL.

**Resolve the PRD issue number.** Check (in order):
1. Did the user pass a PRD issue number or URL as an argument?
2. Is there an open GitHub issue labelled `prd` or whose title starts with `PRD:`? Use `mcp__github__list_issues` (state: `open`) and scan for it.
3. If no PRD issue is found, note this and skip the PRD reference in issue bodies — do not block progress.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Publish issues to GitHub

Use `mcp__github__issue_write` (method: `create`) to publish each approved slice as a GitHub issue.

**Publish in dependency order** (blockers first) so you can reference real GitHub issue numbers (e.g. `#1`) in the "Blocked by" field of dependent issues.

Apply labels where relevant:
- `hitl` for slices requiring human interaction
- `afk` for fully automated slices
- `blocked` for issues that cannot start yet

After creating each issue, note its GitHub issue number for use in subsequent issues' "Blocked by" fields.

Also write a corresponding markdown file to the `issues/` folder (create it if absent) as a local reference. Name files `NNN-slug.md` where NNN is zero-padded to 3 digits.

<issue-template>
## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- #N — Issue title (if any blockers)

Or "None — can start immediately" if no blockers.

## PRD

- #N — PRD title (link to the PRD issue; omit this section if no PRD issue was found)

## Type

HITL / AFK
</issue-template>

Do NOT close or modify any parent issue.
