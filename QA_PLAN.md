# Stress-Test QA Plan — Senior Design Marketplace

## Context

The site is feature-complete and you want to stress-test every flow before launch — for both `student` and `course coordinator` roles. This document is a structured QA checklist covering every feature, plus a separate section calling out **suspected bugs / weak spots** discovered while reading the code so you can prioritize them.

Use it like a punch list: work top-to-bottom, check things off, file issues for anything that fails.

How to test: run backend (`cd backend && npm run dev`), frontend (`cd frontend && npm run dev`), seed test data (`cd backend && npm run seed`), and use **two separate browsers** (or a normal + incognito window) so you can run a coordinator and a student session in parallel. Use `EMAIL_PROVIDER=console` and tail `/tmp/dev-emails.log` to verify emails fire.

---

## Section 1 — Authentication & Account Lifecycle

### 1.1 Registration ([Signup.tsx](frontend/src/pages/Signup.tsx), [auth.controller.ts:15](backend/src/controllers/auth.controller.ts#L15))

- [ ] Register a new student with valid Stevens email → lands on `/verify-email`
- [ ] Register with **non-Stevens email** (e.g. `foo@gmail.com`) → blocked by [user.validation.ts](backend/src/validation/user.validation.ts)
- [ ] Register with **duplicate email** → 400 "User already exists"
- [ ] Try each password failure: < 8 chars, no uppercase, no digit, no special char → each blocked, with the live checklist in the UI ticking correctly
- [ ] Submit name with digits or special chars (`John123`, `John@`) → blocked
- [ ] Submit name > 100 chars → blocked
- [ ] Try registering with `role: "course coordinator"` in the request body via curl → backend forces `role=student` regardless ([auth.controller.ts](backend/src/controllers/auth.controller.ts))
- [ ] Click "Create Account" twice rapidly → no duplicate accounts (button should disable)

### 1.2 Email verification ([VerifyEmail.tsx](frontend/src/pages/VerifyEmail.tsx))

- [ ] Enter wrong 6-digit code → "Invalid or expired" toast
- [ ] Enter correct code → `verificationNeeded=false`, redirect to `/dashboard`
- [ ] Try non-numeric input → filtered out by `/\D/g`
- [ ] Click "Resend code" → new email arrives, old code is invalidated (upsert)
- [ ] Hit resend 6 times in 15 min → 6th blocked by `verificationLimiter` (5/15min)
- [ ] Manually expire a code (set `expiresAt` to past in DB) → verify returns "Invalid or expired"
- [ ] Use code twice → 2nd attempt fails (record deleted on first success)
- [ ] Already-verified user calls resend → 400 "Email is already verified"
- [ ] Already-verified user tries to access `/verify-email` directly → behaviour? (verify it's not a soft-lock)

### 1.3 Login / Logout ([Login.tsx](frontend/src/pages/Login.tsx), [LogoutScreen.tsx](frontend/src/pages/LogoutScreen.tsx))

- [ ] Correct credentials → redirect to `/dashboard`, JWT cookie set
- [ ] Wrong password → 401, no token issued
- [ ] Non-existent email → 401 (same message — no enumeration leak)
- [ ] Email case insensitivity: register `foo@stevens.edu`, log in as `FOO@stevens.edu`
- [ ] Hit login 11 times rapidly → 11th blocked by `authLimiter` (10/15min)
- [ ] Login → wait past `JWT_EXPIRE` → request fails with 401
- [ ] Logout → cookie cleared, hitting protected route redirects to `/login`
- [ ] Logout, then click browser back button → should NOT restore session
- [ ] Login in tab A, logout in tab B, refresh tab A → tab A should detect deauth (next API call 401s)

### 1.4 Password reset ([ForgotPassword.tsx](frontend/src/pages/ForgotPassword.tsx), [ResetPassword.tsx](frontend/src/pages/ResetPassword.tsx))

- [ ] Forgot password for **existing** email → 200, email arrives
- [ ] Forgot password for **non-existent** email → still 200 (no enumeration)
- [ ] Click reset link → land on `/reset-password/:token`
- [ ] Submit new password meeting all rules → success toast, redirect to `/login`
- [ ] Try to reuse the same reset link → second use fails (token deleted)
- [ ] Wait past `PASSWORD_RESET_TOKEN_EXPIRES_MINUTES` → "invalid or expired"
- [ ] Tamper with token in URL → "invalid or expired"
- [ ] After reset, login with **old** password → fails

### 1.5 Profile & password change ([Profile.tsx](frontend/src/pages/Profile.tsx))

- [ ] Edit first/last name → saves, navbar updates
- [ ] Try invalid name chars → blocked
- [ ] Email field is read-only → confirm
- [ ] Change password with wrong current password → 401
- [ ] Change password with all rules met → success, can re-login with new password
- [ ] Submit new password = current password → currently allowed (note in bugs section)

---

## Section 2 — Course Coordinator Flows

### 2.1 Create / manage projects ([CreateProject.tsx](frontend/src/pages/CreateProject.tsx), [MyProjects.tsx](frontend/src/pages/MyProjects.tsx), [project.controller.ts](backend/src/controllers/project.controller.ts))

- [ ] Create project with all fields → appears in marketplace
- [ ] Create project with no advisors / no contacts / no majors → defaults to empty arrays
- [ ] Add advisor with malformed email (`foo`, `foo@`, `foo@bar`) → blocked
- [ ] Add 5+ advisors / contacts → all saved
- [ ] Add same major twice → frontend should prevent (verify in [CreateProject.tsx](frontend/src/pages/CreateProject.tsx))
- [ ] Internal vs External flag → check what shows in marketplace for students (see bug section)
- [ ] Upload files of each allowed type (.pdf, .docx, .xlsx, .pptx, .txt, .png, .jpg, .zip) → all succeed
- [ ] Upload .exe / .mp3 / .mov → blocked at multer
- [ ] Upload exactly 10 MB → succeeds; 10.1 MB → 400
- [ ] Upload 0-byte file → currently succeeds (decide if intended)
- [ ] Upload file with weird characters (`"my file (1)*?.pdf"`) → sanitized filename on disk
- [ ] Stage files but project creation fails → confirm partial-state behavior
- [ ] Edit project as **creator** → allowed
- [ ] Edit project as a **different** coordinator → 403
- [ ] Delete project → removed from all groups' `interestedProjects`, group's `assignedProject` cleared if it was assigned
- [ ] Delete project that has uploaded files → file records remain orphaned (note in bugs)
- [ ] Search "My Projects" by sponsor name and project name → matches case-insensitive
- [ ] Filter "My Projects" by Open / Closed / Assigned → counts match

### 2.2 Assign / unassign groups to projects ([ProjectDetail.tsx](frontend/src/pages/ProjectDetail.tsx))

- [ ] Open a project → "Interested Groups" list shows every group with the project in `interestedProjects`
- [ ] Expand interested group → see all members, names, majors, mailto-links work
- [ ] Click "Assign" on an interested group → email sent to all members ([sendGroupAssignedEmail](backend/src/services/email.service.ts)), project flips to closed, group flips to closed, group's `interestedProjects` is cleared, project removed from **other** groups' interest lists
- [ ] Try to assign a 2nd group → 400 "Project is already assigned to a group"
- [ ] Try to assign a group already assigned elsewhere → 400 "Group is already assigned"
- [ ] Use the "select any group" dropdown to assign a group that wasn't on the interested list → still works
- [ ] Unassign → both project and group reopen, members get unassigned email
- [ ] Unassign, then re-assign → works without errors

---

## Section 3 — Student Flows

### 3.1 Create / join groups ([Dashboard.tsx](frontend/src/pages/Dashboard.tsx), [BrowseGroups.tsx](frontend/src/pages/BrowseGroups.tsx), [Group.tsx](frontend/src/pages/Group.tsx))

- [ ] Create public group with custom name → success, you become leader
- [ ] Create public group with no name → auto-named `Group N` where N is course's next number
- [ ] Try to create with duplicate name (case-insensitive) → 409
- [ ] Try to create with name > 50 chars → blocked
- [ ] Create private group → others must request to join
- [ ] Public group join via code → directly added
- [ ] Private group join via code → status 202 "request pending"
- [ ] Private group: send 2nd request before first is resolved → blocked "already have a pending request"
- [ ] Try to join with bad code (length ≠ 10) → blocked
- [ ] Try to join while already in another group → flow? (see bug section — this currently overwrites your `groupId` if you create a new group)
- [ ] Try to join a closed group → 400 "Group is no longer open"
- [ ] Browse Groups page: filter All / Open / Closed → counts correct
- [ ] Browse Groups page: search by name and group number → matches
- [ ] Browse Groups Info popup → members list populates with name, email, major

### 3.2 Group leader actions ([Group.tsx](frontend/src/pages/Group.tsx))

- [ ] Edit group name (pencil icon) → uniqueness check, save with Enter, cancel with Escape
- [ ] Toggle visibility (public ↔ private) → works
- [ ] Toggle status (open ↔ closed) → works
- [ ] Approve a join request → applicant receives email, applicant added to group
- [ ] Reject a join request → applicant receives email, NOT added
- [ ] Approve request after closing group → 400 "Group is no longer open"
- [ ] Promote a member to leader → leader badge moves
- [ ] Try to promote yourself → 400
- [ ] Try to promote a non-member → 404
- [ ] Remove a member → member's `groupId` clears, they go back to dashboard empty state
- [ ] Try to remove yourself via the remove endpoint → 400 (must use leave)
- [ ] As non-leader, try to call any leader-only endpoint via curl → 403
- [ ] Copy group code button → clipboard contains code, toast appears

### 3.3 Group member actions

- [ ] Toggle status as **non-leader** member → currently succeeds (see bugs — likely intentional but worth confirming)
- [ ] Add a project to interested list (1, 2, 3, 4) → all succeed, coordinator gets email each time
- [ ] Add a 5th project → 400 "interest limit of 4 reached"
- [ ] Add the same project twice → 400 "already in interested list"
- [ ] Remove an interested project → succeeds
- [ ] Remove a project that isn't in the list → 400
- [ ] Add interested project after group is assigned → 400
- [ ] Leave group → if you were leader and others remain, next member becomes leader; toast says so
- [ ] Last member leaves → group is deleted; verify via `/api/groups/course/:courseId`

### 3.4 Project marketplace & detail ([Marketplace.tsx](frontend/src/pages/Marketplace.tsx), [ProjectDetail.tsx](frontend/src/pages/ProjectDetail.tsx))

- [ ] Search by name, description, sponsor → matches case-insensitive
- [ ] Search with regex special chars (`.*+?^$`) → does NOT cause crash (escaped on backend)
- [ ] Filter by School → majors checklist updates
- [ ] Filter by multiple majors → OR semantics
- [ ] Filter by Status (Open / Closed / Assigned) → counts match
- [ ] Filter by Internal / External → counts match
- [ ] Filter by Year → counts match
- [ ] Combine 4 filters → still works
- [ ] Clear All button → resets all filters
- [ ] Pagination across 25+ projects → next/prev works, "Showing X-Y of Z" correct
- [ ] Add new filter → page resets to 1
- [ ] Open a project as student → "Express Interest" button visible
- [ ] If group has 4 interests already → button disabled with reason
- [ ] If group is already assigned → button disabled with reason
- [ ] If already interested → button reads "Interest Registered" and is disabled
- [ ] Mailto links for advisors/contacts → only valid emails get a clickable link

---

## Section 4 — Cross-Cutting & Security

### 4.1 Authorization bypass attempts (use curl/Postman)

- [ ] Student calls `POST /api/projects` → 403
- [ ] Student calls `GET /api/courses/:id/export` → 403
- [ ] Coordinator calls `POST /api/groups` → 403
- [ ] Coordinator calls `PATCH /api/groups/join` → 403
- [ ] Unauth user calls every protected route → 401
- [ ] Forge cookie with valid signature but unknown userId → 401 (user lookup fails)

### 4.2 Validation surface

- [ ] Submit ObjectId-shaped params with 23 / 25 chars → 400
- [ ] Submit body with extra unknown fields → ignored, not stored
- [ ] Submit nested objects with prototype pollution payloads (`__proto__`, `constructor`) → no impact
- [ ] Submit XSS payloads (`<script>alert(1)</script>`) in name/description/sponsor → stored as text, escaped in emails ([email.service.ts](backend/src/services/email.service.ts) HTML-escapes); confirm UI also doesn't render as HTML
- [ ] Submit very long strings (1 MB description) → server handles gracefully

### 4.3 Rate limiting

- [ ] authLimiter on register/login/forgot/reset → 11th request in 15min → 429
- [ ] verificationLimiter on verify/resend → 6th in 15min → 429
- [ ] After window expires → counter resets
- [ ] Restart server → in-memory counter resets (this is fine; just confirm)

### 4.4 File upload permission gaps (likely bugs — see Section 5)

- [ ] Student NOT in any group uploads file to a project → currently succeeds
- [ ] Student in Group A uploads file to a project that Group B is interested in → currently succeeds
- [ ] Student downloads any file via direct URL → currently succeeds (no membership check)

### 4.5 Concurrency

- [ ] Two students join the same public group simultaneously (use two terminals with curl) → both end up in `groupMembers`
- [ ] Two students rapidly create groups → check `groupNumber` increments cleanly (this is the racy spot — see bugs)
- [ ] Two leaders approve the same join request (impossible state but test anyway) → 2nd one gets 404

### 4.6 Frontend resilience

- [ ] Disconnect network mid-request → graceful error toast, not infinite loading
- [ ] 500 from server → Sonner toast shows the error (api interceptor unwraps `error.response.data.message`)
- [ ] Spam-click "Create Group" / "Join" / "Express Interest" → only one mutation lands (verify button disables on submit)
- [ ] Refresh `/group` page after leaving group → falls back to "you're not in a group" empty state
- [ ] Hard refresh on every page → AuthContext restores session if cookie still valid
- [ ] Browser back button after logout → does not restore session
- [ ] Open same modal twice (e.g. "Create Group") → no double-open glitches
- [ ] Resize browser to mobile width → Navbar collapses, hamburger menu works

### 4.7 Email side-effects (tail `/tmp/dev-emails.log`)

- [ ] Register → verification email
- [ ] Forgot password → reset email
- [ ] Group expresses interest in project → project coordinator email (one per `addInterestedProject` call)
- [ ] Coordinator assigns group → email to **every** member
- [ ] Coordinator unassigns group → email to every member
- [ ] Private group join request → email to leader
- [ ] Leader approves/rejects join request → email to applicant
- [ ] Verify subject lines match expected text and that group numbers / project names render correctly in HTML

---

## Section 5 — Suspected Bugs / Weak Spots Found While Reading the Code

These are things the QA pass should specifically poke at — they're not failing tests yet, but the code paths look suspicious. Treat each as a hypothesis to confirm or disprove.

### High priority

1. **File upload has no group/membership check** — [upload.controller.ts:28](backend/src/controllers/upload.controller.ts#L28). Any authenticated user can upload to or download from any project. Reproduce with two student accounts.

2. **File download has no permission check** — same file. Direct GET to `/api/uploads/:projectId/:fileId` works for anyone authenticated. Internal projects' attachments are exposed.

3. **Group counter race condition** — [group.controller.ts:15](backend/src/controllers/group.controller.ts#L15). `lastGroupNumber` increments are not atomic (no `$inc` with `findOneAndUpdate`); concurrent group creates can produce duplicate `groupNumber` values. Hard to hit manually, but try two `curl` calls back-to-back via `&` in a shell.

4. **Student can orphan their old group by creating a new one** — `POST /api/groups` overwrites `user.groupId` without checking if they're already in a group. Result: the old group still has their `_id` in `groupMembers`, but `user.groupId` points elsewhere. Confirm by: create group → create another group → look up the first group's members.

5. **Course coordinator role restriction is implicit, not enforced in schema** — [auth.controller.ts](backend/src/controllers/auth.controller.ts) hard-codes `role="student"` on register, but the User model `enum` includes `course coordinator`. Confirm there's no other write-path (e.g. profile update accepting `role`) — there isn't right now, but worth verifying with curl on `PATCH /api/users` body `{ role: "course coordinator" }`.

### Medium priority

6. **Internal projects visible in marketplace to all students** — `GET /api/projects` returns everything regardless of `internal=true`. Confirm: marketplace shows internal projects to students. (Frontend filter is opt-in via Sponsor Type, so users will see them by default.)

7. **`getProjectById` has no access control** — anyone authenticated with the URL can view any project, including its uploaded files list. Internal projects' details are accessible to any logged-in student.

8. **Project deletion does not delete uploaded files** — disk files and `UploadedFile` records remain. Storage leak.

9. **`toggleStatus` allowed by any group member, `toggleVisibility` only by leader** — intentional asymmetry? Worth confirming with the product owner.

10. **`isOpen=false` on a group does not actually block joins from going through `joinGroup` for a public-direct path** — wait, it does (line 119 checks `isOpen`). But a stale frontend may send the join → confirm error UX is clean.

11. **Group `joinRequests` array can grow unboundedly** — no rate-limit on join attempts to private groups beyond the global limiter. A user can spam different groups indefinitely.

12. **Password reset: changing your password does not invalidate existing JWT tokens** — sessions on other devices stay valid until JWT expiry. Acceptable in many apps, but worth knowing.

### Low priority / polish

13. **0-byte file uploads succeed** — probably fine, but consider a min-size check.
14. **Verification code TTL silently extends on resend** — upserting bumps `expiresAt`. Intentional, but confirm wording in email (says "expires in 10 minutes" each time).
15. **`Profile` page does not allow editing email** — but backend supports it via [user.controller.ts](backend/src/controllers/user.controller.ts). Decide if the gap is intentional.
16. **Major dropdown in Signup has Stevens email check commented out** — [Signup.tsx:94](frontend/src/pages/Signup.tsx#L94). Frontend allows non-Stevens emails through; backend catches them. Mismatch — UI shows the error from backend after submit instead of inline.
17. **Marketplace search input is not debounced beyond URL sync** — fine functionally, just noting.
18. **No "delete group" button** — group only deletes when last member leaves. Confirm intentional.

---

## Section 6 — Smoke / End-to-End Walkthrough (do this last, after fixing critical bugs)

This is a single linear scenario that exercises most of the system. Run it as a final sanity check.

1. Register a coordinator (via seed or `User.create` in a script).
2. Coordinator logs in → creates 3 projects: 2 external, 1 internal. One project has 2 advisors and 2 contacts and a PDF attachment.
3. Register Student A. Verify email with the 6-digit code from `/tmp/dev-emails.log`.
4. Student A creates a public group named "Alpha".
5. Register Students B and C.
6. Student B joins group "Alpha" via code → directly added.
7. Student C joins "Alpha" → group has 3 members.
8. Student A (leader of Alpha) toggles visibility to private.
9. Student C is removed by Student A (leader).
10. Student C tries to rejoin → request is pending → Student A approves → C is back in.
11. Group Alpha expresses interest in 4 projects. 5th attempt fails.
12. Coordinator logs in → opens project #1 → sees Alpha as interested → assigns it.
13. All 3 members get assignment email.
14. Student A goes to `/group` → sees Alpha's status flipped to closed, project shown as assigned.
15. Coordinator unassigns → emails go out, both reopen.
16. Student A changes their password. Logs out. Logs in with the new password. Old password fails.
17. Student A clicks "Forgot password" → resets it again via the email link.
18. Student A leaves Alpha → leadership transfers to next member. Verify toast.
19. All members leave → Alpha is deleted.

---

## How to verify

- Backend tests: `cd backend && npm test` — should pass before and after fixes.
- Manual: open two browsers (Chrome regular + incognito), log in as coordinator and student, run through the relevant sections in parallel.
- File system: `ls backend/uploads/` to confirm files land + are deleted as expected.
- Email log: `tail -f /tmp/dev-emails.log` while clicking through, confirm every email side-effect fires.
- Database spot-checks: `mongosh senior_d` and inspect `users`, `groups`, `projects`, `verificationcodes`, `passwordresettokens` after key actions.

## Critical files (for filing bugs)

- Auth: [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts), [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts)
- Groups: [backend/src/controllers/group.controller.ts](backend/src/controllers/group.controller.ts), [backend/src/models/Group.model.ts](backend/src/models/Group.model.ts)
- Projects: [backend/src/controllers/project.controller.ts](backend/src/controllers/project.controller.ts)
- Uploads (highest-risk): [backend/src/controllers/upload.controller.ts](backend/src/controllers/upload.controller.ts), [backend/src/middleware/upload.middleware.ts](backend/src/middleware/upload.middleware.ts)
- Frontend auth: [frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx), [frontend/src/components/routing/](frontend/src/components/routing/)
