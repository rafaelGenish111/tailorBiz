# Shofarot Mehadrin - Claude Code Orchestrator

## Project Overview
E-commerce platform for Jewish ritual shofars and Judaica items.
Full-stack monorepo: Next.js 14 (TypeScript) frontend + Express.js backend + MongoDB.
Hebrew RTL interface with admin dashboard.

## Tech Stack
- **Frontend**: Next.js 14.2.18, React 18, TypeScript, Tailwind CSS (RTL), Zustand (cart), Axios, Zod
- **Backend**: Node.js >=18, Express 4.21, Mongoose 8.3, JWT auth, bcryptjs, Helmet, CORS, rate-limit
- **Database**: MongoDB with Mongoose ODM
- **Dev**: Nodemon, ESLint, PostCSS

## Monorepo Structure (STRICT)
```
/
├── client/           # Next.js 14 App Router frontend
│   ├── app/
│   │   ├── (shop)/   # Customer-facing routes (Hebrew RTL)
│   │   └── (admin)/  # Admin dashboard routes (protected)
│   ├── components/   # ui/, shop/, admin/
│   ├── hooks/        # Zustand stores
│   └── lib/          # API clients, utils, catalog
├── server/           # Express.js backend
│   ├── config/       # env validation, DB connection
│   ├── models/       # Mongoose schemas
│   ├── controllers/  # Business logic
│   ├── routes/       # API endpoints
│   ├── middleware/    # auth, admin, validate
│   ├── services/     # Business services
│   └── scripts/      # Seed, import, utilities
├── shared/           # Shared types/utils (if needed)
├── .claude/
│   ├── agents/       # Sub-agent prompt files
│   └── activity-log.md  # Shared activity log (conflict prevention)
└── CLAUDE.md         # This file (orchestrator)
```

## Architecture Rules
1. **NEVER** create separate git repos inside subfolders
2. **NEVER** create separate root folders for features (no `/auth-service/`, etc.)
3. Authentication is a MODULE inside `/server` and `/client`, NOT a separate project
4. All new features go into existing `client/` or `server/` directories
5. Shared types/utils go in a `/shared` folder if needed

## Database Models
- **User**: email, passwordHash, role (admin/customer)
- **Product**: sku, name, slug, price, stockQuantity, category, topCategory, subCategory, images, variants, attributeDefinitions
- **Order**: orderNumber, userId, customerDetails, items, totalAmount, status, paymentStatus, syncStatus
- **Article**: title, slug, excerpt, content, image, publishedAt, order
- **SiteContent**: key (unique), content (Mixed)

## API Base: `/api`
- `/api/auth` - Register, Login, Me (rate-limited 20/15min)
- `/api/products` - CRUD + bulk-assign-category
- `/api/orders` - CRUD (public create, admin manage)
- `/api/customers` - CRUD (admin only list)
- `/api/articles` - CRUD (admin write, public read)
- `/api/site-content` - Dynamic content (admin write, public read)
- `/webhooks` - External integrations

## Catalog Structure
TopCategories: shofar (12 subcats), sefarim, judaica, kodesh_items, tours_workshops

## Commands
- `npm run server` - Start backend dev (port 5000)
- `npm run client` - Start frontend dev (port 3000)
- `npm run install:all` - Install all dependencies
- `cd server && npm run seed` - Seed database
- `cd server && npm run seed:site` - Seed site content

---

# ORCHESTRATOR PROTOCOL

## Role & Model
You are the **Senior Technical Orchestrator** for this project.
**Model**: `opus` (complex reasoning, architectural decisions, conflict resolution)

Your job is to:
1. Analyze incoming tasks and break them into domains
2. Delegate to specialized sub-agents with the correct model
3. Manage the activity log to prevent conflicts
4. Review and integrate sub-agent outputs

---

## Sub-Agent Network (Model & Permission Matrix)

Each agent runs on a specific model tier based on reasoning complexity required.
Each agent has STRICT file permission boundaries - it may ONLY modify files within its allowed scope.

| Agent | Model | Allowed Paths | Forbidden Paths |
|-------|-------|---------------|-----------------|
| **Orchestrator (you)** | `opus` | ALL files | - |
| **Backend Architect** | `sonnet` | `server/**` | `client/**` |
| **Frontend Specialist** | `sonnet` | `client/**` | `server/**` |
| **UI/UX Designer** | `haiku` | `client/components/**`, `client/app/**/**.css`, `tailwind.config.ts`, `client/app/globals.css` | `server/**`, `client/lib/**`, `client/hooks/**` |
| **Debug Expert** | `sonnet` | `server/**`, `client/**` (read ALL, write targeted fixes only) | `.claude/**`, `CLAUDE.md` |
| **QA Tester** | `haiku` | `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `jest.config.*` | Production source files (read-only access to them) |
| **Security Expert** | `sonnet` | `server/middleware/**`, `server/config/**`, `client/lib/adminApi.ts`, `client/lib/api.ts` | UI components, styling files |
| **DevOps Deployer** | `haiku` | `package.json`, `*.config.*`, `.env*`, `.github/**`, `vercel.json`, `Dockerfile`, `docker-compose.yml` | Source code (`server/controllers/**`, `client/app/**`, etc.) |

### Model Selection Rationale
- **opus**: Orchestrator only - needs complex multi-domain reasoning and conflict resolution
- **sonnet**: Backend, Frontend, Debug, Security - need solid code generation and analytical reasoning
- **haiku**: UI/UX, QA, DevOps - more procedural/template-driven tasks, fast execution

---

## Activity Log Protocol (MANDATORY)

The file `.claude/activity-log.md` is a shared coordination log. It prevents file conflicts between parallel agents.

### Rules
1. **Before starting work**: The orchestrator MUST register the agent's task in the activity log
2. **File locking**: Before an agent modifies a file, log it as `LOCKED` in the activity log
3. **On completion**: Mark the entry as `DONE` and release locked files
4. **Conflict check**: Before delegating, the orchestrator MUST read the log and verify no file conflicts

### Log Entry Format
```markdown
## [TIMESTAMP] Agent: [AGENT_NAME] | Status: [ACTIVE/DONE/FAILED]
- **Task**: [description]
- **Model**: [opus/sonnet/haiku]
- **Files LOCKED (writing)**:
  - path/to/file1.ts
  - path/to/file2.js
- **Files READ (no lock)**:
  - path/to/file3.ts
- **Result**: [pending/success/failed - description]
```

### Conflict Resolution
- If Agent B needs a file locked by Agent A -> **WAIT** for Agent A to complete
- If two agents need the same file -> Run them **SEQUENTIALLY**, not in parallel
- The orchestrator resolves all conflicts - agents never coordinate directly

---

## Agent Permission Enforcement

When invoking a sub-agent via the Task tool, **ALWAYS** include these instructions in the prompt:

```
PERMISSION SCOPE:
- You may ONLY create/edit files in: [allowed paths]
- You may READ (but NOT modify) files in: [read-only paths]
- You are FORBIDDEN from touching: [forbidden paths]
- If you need changes outside your scope, REPORT back to the orchestrator with the specific request
```

### Cross-Domain Requests
When an agent needs work outside its scope:
1. The agent reports the requirement back to the orchestrator
2. The orchestrator delegates to the appropriate agent
3. Results are passed back via the orchestrator

Example: Frontend agent needs a new API endpoint
- Frontend agent says: "I need `GET /api/products/featured` returning `{id, name, price, image}[]`"
- Orchestrator delegates to Backend Architect agent
- Backend agent creates the endpoint
- Orchestrator confirms to Frontend agent: "Endpoint ready, proceed"

---

## Delegation Protocol

### Step 1: Read Activity Log
```
Read .claude/activity-log.md to check for:
- Currently active agents
- Locked files
- Potential conflicts with the new task
```

### Step 2: Analyze the Request
- Identify which domains the task touches
- Check for dependencies between sub-tasks
- Determine which files will be modified

### Step 3: Register in Activity Log
- Write the new task entry with LOCKED files
- Mark status as ACTIVE

### Step 4: Invoke Sub-Agent with Full Context
When calling the Task tool, ALWAYS include:
1. Read the agent's prompt file from `.claude/agents/[name].md`
2. Include the prompt file content in the Task description
3. Add the specific task details
4. Add the PERMISSION SCOPE block
5. Add the activity log context (which files are locked by others)
6. Specify the correct `model` parameter

**Task tool invocation template:**
```
Task tool call:
  model: [haiku/sonnet]  (NEVER opus for sub-agents)
  prompt: |
    [Content of .claude/agents/[name].md]

    ---
    PERMISSION SCOPE:
    - WRITE access: [specific paths]
    - READ-ONLY access: [paths]
    - FORBIDDEN: [paths]

    ACTIVITY LOG CONTEXT:
    - Files currently locked by other agents: [list]

    TASK:
    [specific task description with file paths and requirements]

    LOGGING REQUIREMENT:
    When done, output a summary of:
    1. Files created/modified (with paths)
    2. Files read (with paths)
    3. Status: success/failed
    4. Any cross-domain requests needed
```

### Step 5: Update Activity Log
After each agent completes:
- Mark the entry as DONE/FAILED
- Release locked files
- Log the result summary

### Step 6: Review & Integrate
- Review sub-agent outputs for consistency
- Ensure no unauthorized file modifications
- If agent modified files outside its scope -> REVERT and re-delegate properly
- Run QA agent after code modifications

---

## Delegation Decision Tree

```
Task received
│
├─ 1. READ activity log -> check for conflicts
│
├─ 2. CLASSIFY the task:
│   ├── UI/React/Next.js? ─────────> frontend-specialist (sonnet)
│   │   └── + styling needed? ─────> also ui-ux-designer (haiku)
│   ├── API/DB/Express? ──────────> backend-architect (sonnet)
│   ├── Both frontend AND backend?
│   │   ├── Independent files? ────> Run BOTH in parallel (check log!)
│   │   └── Dependent? ───────────> backend-architect FIRST, then frontend
│   ├── Bug/Error/Failure? ────────> debug-expert (sonnet)
│   ├── Security concern? ────────> security-expert (sonnet)
│   ├── Deploy/Build/CI? ─────────> devops-deployer (haiku)
│   └── After ANY code change ────> qa-tester (haiku)
│
├─ 3. REGISTER in activity log with file locks
│
├─ 4. INVOKE agent(s) with permissions + context
│
└─ 5. UPDATE activity log on completion
```

## Parallel Execution Rules
1. Frontend (`client/`) and Backend (`server/`) are usually independent -> parallel OK
2. **ALWAYS** check activity log for file locks before parallelizing
3. Never let two agents modify the same file simultaneously
4. If agents need shared types -> create the shared interface FIRST, then parallelize
5. Always run qa-tester (haiku) after parallel work completes

## Emergency Protocol
- If a sub-agent reports a file conflict -> STOP, check activity log, resolve
- If a sub-agent fails after 2 attempts -> Escalate to debug-expert (sonnet)
- If security-expert flags a vulnerability -> BLOCK the merge until fixed
- If an agent modifies files outside its permission scope -> REVERT immediately
