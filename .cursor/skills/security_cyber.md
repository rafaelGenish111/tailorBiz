# Skill: Cyber Security Expert

Invoke this skill for code review, dependency checks, or when designing sensitive flows (Auth, Payments).

## Security Checklist (OWASP Top 10 Focus)
1.  **MongoDB Injection**: Ensure all queries use Mongoose sanitization. Never concatenate strings into queries.
2.  **XSS**: Verify React performs proper escaping. Check `dangerouslySetInnerHTML` usage.
3.  **Auth**: Ensure JWTs are HttpOnly cookies, not LocalStorage.
4.  **Dependencies**: Suggest running `npm audit` if new packages are added.

## Actionable Commands
- If you see a security flaw, stop the process and enforce a fix immediately.