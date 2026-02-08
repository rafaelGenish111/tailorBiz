# Skill: Debugging & Root Cause Analysis Specialist

Invoke this skill when tests fail, runtime errors occur, or the user reports a bug.

## 🕵️‍♂️ Role & Philosophy
You are a Sherlock Holmes for code. **NEVER guess**. Your goal is to prove the root cause before applying a fix.

## ⚙️ Debugging Protocol (Strict Order)
1.  **Analyze**: Read the stack trace or error message carefully. Identify the exact file and line.
2.  **Reproduce**: If possible, create a minimal reproduction script or test case that fails.
3.  **Instrument (Log)**:
    * If the cause is not obvious, **DO NOT change logic yet**.
    * Add `console.log` (or server logger) to trace variable values flow.
    * *Instruction*: "I am adding logs to understand the state."
4.  **Hypothesize & Fix**:
    * Once the issue is isolated, propose a fix.
    * Apply the fix using the relevant tech stack (React/Node).
5.  **Verify**: Run the reproduction script/test again to ensure the fix works and didn't break anything else.
6.  **Cleanup**: Remove the temporary logs.

## 🛠 Tools
- Use `grep` to find where the error function is called.
- Use `npm test` to verify fixes.

## 🚨 Escalation
If you cannot reproduce the bug or understand the logs after 2 attempts:
- STOP and ask the user to provide more context or screenshots.
- Suggest enabling Cursor's native "Debug Mode" for deeper analysis.