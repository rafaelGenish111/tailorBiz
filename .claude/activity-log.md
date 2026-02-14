# Agent Activity Log

> Shared coordination log for all sub-agents. Managed by the Orchestrator.
> DO NOT edit manually unless resolving a conflict.

## Format
```
## [TIMESTAMP] Agent: [NAME] | Status: ACTIVE/DONE/FAILED
- **Task**: description
- **Model**: opus/sonnet/haiku
- **Files LOCKED (writing)**:
  - path/to/file
- **Files READ (no lock)**:
  - path/to/file
- **Result**: pending / success - summary / failed - reason
```

## Active File Locks
<!-- Orchestrator updates this section for quick conflict checks -->
| File Path | Locked By | Since | Status |
|-----------|-----------|-------|--------|
| - | - | - | No active locks |

---

## Log Entries

<!-- New entries are added at the top -->
