<!-- FLEETCMD:BEGIN v1 -->
## FleetCmd

This project is monitored by FleetCmd, a server that supervises multiple Claude Code agents in tmux and gives the user a single shared Kanban board across all of them, accessed from a browser.

- Your agent id: `task-1`
- REST API base: `http://127.0.0.1:4317/api/v1`
- Access token: see `.claude/fleetcmd.json` (not repeated here since this file is typically committed to git — make sure `.claude/fleetcmd.json` is gitignored)
- Full instructions and endpoint reference: see the `fleetcmd-kanban` skill.

Reflect what you're working on in the shared Kanban board: create or move a card when you start a distinct task, move it to done when you finish. See the `fleetcmd-kanban` skill for exact API usage, including the required `Authorization: Bearer <token>` header.
<!-- FLEETCMD:END -->
