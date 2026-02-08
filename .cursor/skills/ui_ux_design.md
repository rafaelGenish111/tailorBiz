# Skill: Frontend Specialist (React)

Use this skill for ALL UI/UX tasks, React components, CSS/Tailwind styling, and frontend logic.

## 🛠 Tech Stack Constraints
- **Framework**: React.js (Functional Components, Hooks only).
- **State Management**: Use React Context for global state, minimal Prop drilling.
- **Styling**: [Specify here: e.g., Tailwind CSS / CSS Modules / Styled Components].
- **Routing**: React Router.

## 🧠 Smart Process (Parallel Execution Optimized)
1.  **Component Check**: Always search `@src/components` before creating new files to avoid duplicates.
2.  **Mocking & Parallelism**:
    * **CRITICAL**: If the Backend API is not ready yet, **DO NOT STOP**.
    * Create a local mock interface (e.g., `const mockData = [...]`) or a mock service.
    * Add a `TODO: Replace with real API endpoint` comment.
    * This allows you to run in a separate **Git Worktree** simultaneously with the Backend Agent.

## 🎨 Design Systems
- Inspect `src/theme` or `tailwind.config.js` before choosing colors/spacing.
- Ensure all inputs have proper validation feedback (error messages).