---
name: fleetcmd-kanban
description: Read and update the shared FleetCmd Kanban board for this agent via its REST API. Use when tracking task status, logging progress, or coordinating with other agents monitored by FleetCmd.
---

# FleetCmd Kanban

This project is monitored by FleetCmd, a server that supervises multiple Claude Code agents running in tmux and gives the user a single shared Kanban board across all of them, accessed from a browser.

This file is managed by FleetCmd and gets overwritten on re-injection — don't hand-edit it.

## Your agent id, API base URL, and access token

Read `.claude/fleetcmd.json` in this project's root:

```json
{ "agentId": "<your agent id>", "apiBase": "http://127.0.0.1:4317/api/v1", "token": "<access token>" }
```

Every request below needs the `apiBase` value **and** an `Authorization: Bearer <token>` header — the API rejects unauthenticated requests. `.claude/fleetcmd.json` contains a real secret; make sure it's gitignored in this project (add `.claude/fleetcmd.json` to `.gitignore` if it isn't already) so the token never ends up committed.

## The task workflow

Cards move through: **Backlog → Open → Planning → Planned → Coding → Ready for Review → Done**.

Every task belongs to a **project** (`projectId` on the card) — one project per git repo. `GET {apiBase}/projects` lists them.

FleetCmd's server-side task orchestrator watches each project's "Open" column and, once a card's dependencies (`dependsOn`) are all "Done", automatically spawns a fresh interactive Claude Code session for it in its own dedicated git worktree/branch, moves the card to "Planning", and types a kickoff instruction into that session — that's when you (running inside that worktree) pick up the sections below. If you're instead an agent working the board manually (not spawned per-task), the "General manual usage" section covers you.

### If your agent id is `task-<cardId>` — you were spawned for one specific card

You're running in a dedicated worktree/branch for exactly one card. Your job is to drive it stage by stage:

**Planning stage** (card is in "Planning"):
1. `GET {apiBase}/cards/<cardId>` to read the title/description.
2. Write a plan for the work.
3. `PATCH {apiBase}/cards/<cardId>` with `{"planText": "<your plan>"}`.
4. `POST {apiBase}/cards/<cardId}/move` to "Planned", then stop and wait — a human reviews the plan from here. Don't start implementing yet.

**Waiting in "Planned"**: a human either clicks **Start Code** (you'll receive an instruction telling you the plan is approved — proceed to the Coding stage below) or **Replan** (you'll receive their feedback and the card moves back to "Planning" for you to revise the plan and repeat the step above).

**Coding stage** (after Start Code, card is in "Coding"):
1. Implement the plan.
2. Run the repo's unit tests, integration tests, and end-to-end tests.
3. Spawn a code-review subagent (your own `Task`/`Agent` tool) to review the diff.
4. If the review has no critical/high/medium findings and all tests pass: commit, push your branch, open a pull request, `PATCH {apiBase}/cards/<cardId>` with `{"prUrl": "<pr url>"}`, then move the card to "Ready for Review".
5. If not: `PATCH {apiBase}/cards/<cardId>` with `{"reviewNotes": "<findings>"}`, fix them, and repeat from step 2 — stay in "Coding" until it's clean.

A human then reviews "Ready for Review" and either approves (moves to "Done") or leaves feedback — if they send you back to "Coding" or "Planning" via **Replan**, treat their feedback the same way as an initial Replan.

When your task is fully done (or abandoned), your session and worktree are typically killed from the UI to free resources — there's nothing you need to do to trigger that yourself.

### General manual usage (long-lived agent working the board directly)

- When you start a distinct task the user asked for, create a card (or move an existing one) into "Coding", tagged with your agent id.
- When you finish, move the card to "Ready for Review" or "Done" depending on the user's workflow.
- If you get blocked, leave the card where it is and add a note to its description explaining why.
- Don't create a card for every trivial sub-step — one card per user-facing task is usually right.
- Before starting a card, run `/clear` first so you're not carrying unrelated context into it, then plan and implement.

## Endpoints

All of these require the `Authorization: Bearer <token>` header.

- `GET {apiBase}/board` — full snapshot: board, columns, and cards. Use this first to find column ids.
- `GET {apiBase}/projects` — list projects (id, name, repoPath).
- `GET {apiBase}/cards?agentId=<your agent id>` — list only your own cards. Also supports `?projectId=` and `?columnId=`.
- `POST {apiBase}/cards` — create a card.
  Body: `{"columnId": <id>, "projectId": <id>, "title": "...", "description"?: "...", "agentId"?: "<your agent id>", "tags"?: ["..."], "dependsOn"?: [<cardId>, ...]}`
- `PATCH {apiBase}/cards/:id` — update fields on a card (title, description, tags, agentId, priority, planText, reviewNotes).
- `POST {apiBase}/cards/:id/move` — move a card to another column and/or reorder it.
  Body: `{"columnId": <id>, "position": <number>}`. Position is a plain number used for ordering — pick something between the two cards you're inserting between (e.g. their average), or `+1`/`-1` past either end. You never need to renumber other cards.
- `DELETE {apiBase}/cards/:id` — remove a card.

## Example

```bash
API_BASE=$(node -e "console.log(require('./.claude/fleetcmd.json').apiBase)")
AGENT_ID=$(node -e "console.log(require('./.claude/fleetcmd.json').agentId)")
TOKEN=$(node -e "console.log(require('./.claude/fleetcmd.json').token)")
AUTH_HEADER="Authorization: Bearer $TOKEN"

# Find the "Planned" column's id from the board snapshot first:
curl -s -H "$AUTH_HEADER" "$API_BASE/board"

# Attach a plan to your card and move it to "Planned":
curl -s -X PATCH "$API_BASE/cards/$AGENT_ID_CARD_ID" \
  -H "$AUTH_HEADER" \
  -H 'content-type: application/json' \
  -d '{"planText": "1. Add the endpoint\n2. Add tests"}'

curl -s -X POST "$API_BASE/cards/$AGENT_ID_CARD_ID/move" \
  -H "$AUTH_HEADER" \
  -H 'content-type: application/json' \
  -d '{"columnId": 3, "position": 1}'
```
