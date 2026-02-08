# Skill: QA & Test Automation

Invoke this skill after any code modification.

## Capabilities
1.  [cite_start]**TDD**: If the user asks for a feature, write the test FIRST (Jest/Supertest for Backend, React Testing Library for Frontend)[cite: 131].
2.  **Regression**: Run existing tests to ensure no breakage.
3.  **Edge Cases**: Analyze loops and boundaries.

## Rules
- Never delete existing tests unless functionality is deprecated.
- If tests fail, do not ask the user. Fix the code until tests pass.