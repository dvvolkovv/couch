# Scenario 3: Messaging & Notifications -- Live API Test Results

**Date:** 2026-03-06
**Tester:** QA Engineer (automated via curl/Python)
**Environment:** Live server at http://138.124.61.221:3200/v1
**Frontend:** http://138.124.61.221:8080

---

## Test Accounts

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| Client | test@example.com | TestPass123! | cmmbec28e0002utqct46pycoh |
| Specialist | cityfarmer@yandex.ru | Hearty2026! | cmmcxk7nm0000qgw3bjxy01c4 |

**Note:** The originally provided client credentials (user@test.com / TestPass123!) are invalid. The correct seeded client email is test@example.com.

---

## Step-by-step Results

| Step | Action | Status | HTTP Code | Notes |
|------|--------|--------|-----------|-------|
| 1 | Client Login (test@example.com) | PASS | 200 | Returns accessToken, user object with id/email/role/firstName. Token expiry is 900s (15 min). |
| 2 | Specialist Login (cityfarmer@yandex.ru) | PASS | 200 | Returns accessToken, user object. Same 15-min token. |
| 3 | Get client user info (GET /users/me) | PASS | 200 | Returns full profile: id, email, role=CLIENT, firstName, lastName, city, timezone, subscription info. |
| 4 | Get specialist user info (GET /users/me) | PASS | 200 | Returns full profile: id, email, role=SPECIALIST, firstName, lastName, age, gender, city, hasValueProfile=true. |
| 5 | Client gets message threads | PASS | 200 | Returns empty array `[]` (no prior threads). Correct initial state. |
| 6 | Specialist gets message threads | PASS | 200 | Returns empty array `[]`. Correct initial state. |
| 7 | Client creates thread to specialist | PASS | 201 | Used `recipientId` field. Returns `{threadId, isNew: true}`. First attempt with `participantId` correctly rejected (400 VALIDATION_ERROR). |
| 8 | Client sends message in thread | PASS | 201 | POST /messages/threads/{threadId}. Returns full message object with id, threadId, content, senderId, senderName, readAt=null, createdAt. |
| 9 | Specialist checks threads | PASS | 200 | Thread visible. Shows unreadCount=1, lastMessage with content, participant info. |
| 10 | Specialist reads thread messages | PASS | 200 | Returns messages array with pagination. Client's message visible with readAt=null. |
| 11 | Specialist replies | PASS | 201 | Reply created successfully. Returns full message object. |
| 12 | Specialist marks messages as read | PASS | 200 | PATCH /messages/threads/{threadId}/read. Returns `{updated: 1}`. |
| 13 | Client checks unread count | PASS | 200 | GET /messages/unread-count returns `{unreadCount: 1}` (specialist's reply). |
| 14 | Client reads thread messages | PASS | 200 | Both messages visible. Client's message has readAt set (by specialist in step 12). Specialist's reply has readAt=null. Pagination shows total=2. |
| 15 | Client marks messages as read | PASS | 200 | Returns `{updated: 1}`. Specialist's reply now marked read. |
| 16 | Check notifications for client | PASS | 200 | Returns empty data array. **No notification was created for new message.** |
| 17 | Check notifications for specialist | PASS | 200 | Returns empty data array. **No notification was created for new message.** |
| 18a | Client unread notification count | PASS | 200 | Returns `{unreadCount: 0}`. |
| 18b | Specialist unread notification count | PASS | 200 | Returns `{unreadCount: 0}`. |
| 19 | Mark all notifications as read (client) | PASS | 200 | PATCH /notifications/read-all returns `{updated: 0}`. Works but nothing to update. |
| 20a | Frontend /dashboard/messages | PASS | 200 | Page loads (20487 bytes). |
| 20b | Frontend /specialist/messages | PASS | 200 | Page loads (20491 bytes). |
| 20c | Frontend /notifications | PASS | 200 | Page loads (19796 bytes). |

---

## Edge Case & Security Test Results

| Test | Status | HTTP Code | Notes |
|------|--------|-----------|-------|
| Empty message content | BUG | 201 | Server accepts empty string as message content. No validation. |
| Send message without auth | PASS | 401 | Correctly returns UNAUTHORIZED error. |
| Access non-existent thread | PASS | 404 | Correctly returns "Thread not found". |
| Create thread to self | BUG | 201 | User can create a thread with themselves. No self-messaging guard. |
| Duplicate thread to same user | PASS | 201 | Returns existing thread with `isNew: false`. Idempotent behavior -- correct. |
| Very long message (5000 chars) | PASS | 201 | Accepted without error. No max-length validation (may or may not be desired). |
| Thread with non-existent user | PASS | 404 | Correctly returns "Recipient not found". |
| XSS payload in message | BUG | 201 | Raw HTML/script tags stored and returned verbatim. No sanitization. |
| SQL injection in message | PASS | 201 | Prisma ORM prevents SQL injection. Content stored as literal string. |
| Get notifications without auth | PASS | 401 | Correctly returns UNAUTHORIZED. |
| Get threads without auth | PASS | 401 | Correctly returns UNAUTHORIZED. |
| Mark read on non-existent thread | PASS | 404 | Correctly returns "Thread not found". |

---

## What WORKS

- **Authentication:** Login endpoint correctly returns JWT tokens for both CLIENT and SPECIALIST roles.
- **User profile:** GET /users/me returns complete user data with subscription info.
- **Thread creation:** POST /messages/threads with `recipientId` creates a new thread; returns existing thread if duplicate (idempotent).
- **Message sending:** POST /messages/threads/{id} creates messages with full metadata (senderId, senderName, timestamps).
- **Thread listing:** GET /messages/threads returns threads with participant info, last message, unreadCount, and lastMessageAt.
- **Thread reading:** GET /messages/threads/{id} returns paginated messages with read receipts.
- **Read receipts:** PATCH /messages/threads/{id}/read marks unread messages from other party as read; returns count of updated messages.
- **Unread count:** GET /messages/unread-count returns accurate total unread count across all threads.
- **Authorization guards:** All messaging/notification endpoints reject unauthenticated requests with 401.
- **Error handling:** 404 for non-existent threads, 400 for validation errors, proper error response format.
- **Duplicate thread prevention:** Creating a thread to the same specialist returns the existing thread with `isNew: false`.
- **Rate limiting:** Aggressive rate limiting on login endpoint (triggered after ~5 rapid attempts). Protects against brute force.
- **Frontend pages:** All three messaging/notification frontend routes (/dashboard/messages, /specialist/messages, /notifications) return HTTP 200.
- **SQL injection protection:** Prisma ORM correctly parameterizes queries, preventing injection.

---

## What DOES NOT WORK (Bugs)

### BUG-S3-001: No notifications generated for new messages
- **Severity:** HIGH
- **Endpoint:** Implicit (messaging -> notifications integration)
- **Description:** When a message is sent (steps 8 and 11), no notifications are created for the recipient. Steps 16 and 17 show empty notification arrays for both users. The `MessagesService.sendMessage()` method does not call `NotificationsService.create()`.
- **Expected:** A new in-app notification should be created for the recipient when a message is received (e.g., type: "new_message", title: "New message from [name]").
- **Impact:** Users have no way of knowing they received a message unless they manually check their threads. Push/email notifications also cannot trigger since the notification record is never created.

### BUG-S3-002: Empty messages accepted
- **Severity:** MEDIUM
- **Endpoint:** POST /messages/threads/{threadId}
- **Description:** The `SendMessageDto` validates that `content` is a string (@IsString) but does not enforce non-empty content. Sending `{"content":""}` results in a 201 response with an empty message stored in the database.
- **Expected:** Server should reject empty messages with a 400 validation error. Add `@IsNotEmpty()` or `@MinLength(1)` to the DTO.
- **Impact:** Users can spam empty messages, cluttering the thread.

### BUG-S3-003: Users can create message threads with themselves
- **Severity:** MEDIUM
- **Endpoint:** POST /messages/threads
- **Description:** Creating a thread with `recipientId` equal to the current user's own ID succeeds (HTTP 201). The `createThread()` method does not check if `recipientId === userId`.
- **Expected:** Server should return 400 error when a user tries to message themselves.
- **Impact:** Creates orphan threads that serve no purpose and could confuse the user.

### BUG-S3-004: XSS-vulnerable message content (no sanitization)
- **Severity:** HIGH
- **Endpoint:** POST /messages/threads/{threadId} and GET /messages/threads/{threadId}
- **Description:** HTML content including `<script>` tags and event handlers (e.g., `onerror=alert(1)`) is stored and returned verbatim in the API response. If the frontend renders this without escaping, it becomes a stored XSS vulnerability.
- **Expected:** Either sanitize HTML on input (server-side) or ensure the frontend escapes all message content before rendering. Ideally, both.
- **Impact:** Attackers could inject malicious scripts that execute in other users' browsers, potentially stealing tokens or performing actions on their behalf.

### BUG-S3-005: No message length limit
- **Severity:** LOW
- **Endpoint:** POST /messages/threads/{threadId}
- **Description:** A 5000-character message was accepted without any limit. The DTO has no `@MaxLength()` constraint.
- **Expected:** A reasonable maximum length (e.g., 5000 or 10000 characters) should be enforced to prevent abuse and storage bloat.
- **Impact:** Low risk but could lead to denial-of-service via extremely large messages.

### BUG-S3-006: Incorrect test credentials in documentation
- **Severity:** LOW
- **Endpoint:** N/A (documentation issue)
- **Description:** The provided client credentials (user@test.com / TestPass123!) do not match any seeded account. The correct seeded client email is test@example.com with password TestPass123!.
- **Expected:** Test documentation should reference the actual seeded accounts.
- **Impact:** QA and developer productivity loss.

---

## What is MISSING for Production

### Missing Features

1. **Message notifications integration** -- MessagesService does not create notifications when messages are sent. Must inject NotificationsService and call `.create()` on every new message.

2. **Real-time messaging (WebSocket/SSE)** -- No WebSocket or Server-Sent Events gateway exists for real-time message delivery. Users must manually refresh to see new messages. This is critical for a chat experience.

3. **Typing indicators** -- No endpoint for "user is typing" events.

4. **Message editing and deletion** -- No PATCH or DELETE endpoints for individual messages. Users cannot correct or remove sent messages.

5. **File upload for messages** -- The DTO supports `fileUrl` and `fileName` fields, but there is no file upload endpoint in the messages module. Files would need to be uploaded separately, and the flow is not documented.

6. **Thread archiving/blocking** -- No endpoint to archive, mute, or block a thread/user. The `isActive` field exists on threads but no API to toggle it.

7. **Message search** -- No search functionality across messages.

8. **Pagination on thread list** -- GET /messages/threads has no pagination parameters; returns all threads. Will become a performance issue as threads grow.

9. **Push notifications** -- The notification service only creates `in_app` channel notifications. No push notification (Firebase/APNs) or email notification integration for messages.

10. **Message delivery status** -- Only "read" status exists. No "delivered" status for offline users.

11. **Input sanitization** -- No HTML/script sanitization on message content before storage.

12. **Role-based thread creation guards** -- A CLIENT can create a thread with another CLIENT (both become clientId and specialistId incorrectly). Should enforce client-to-specialist only.

---

## Critical Issues Summary

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| 1 | **CRITICAL** | No notifications generated for new messages (BUG-S3-001) | Users miss messages entirely; core UX broken |
| 2 | **HIGH** | XSS-vulnerable message content (BUG-S3-004) | Stored XSS attack vector in production |
| 3 | **HIGH** | No real-time messaging (WebSocket) | Chat requires manual refresh; unusable for real conversations |
| 4 | **MEDIUM** | Empty messages accepted (BUG-S3-002) | Spam/noise in threads |
| 5 | **MEDIUM** | Self-messaging possible (BUG-S3-003) | Orphan threads, confusing UX |
| 6 | **MEDIUM** | No role-based guard on thread creation | CLIENT-to-CLIENT threads possible (data model assumes client+specialist) |
| 7 | **LOW** | No message length limit (BUG-S3-005) | Potential storage abuse |
| 8 | **LOW** | Aggressive rate limiting on login (60s+ cooldown) | May block legitimate retries |

---

## API Endpoint Reference (Verified)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login/email | No | Login with email/password |
| GET | /users/me | Yes | Get current user profile |
| GET | /messages/threads | Yes | List all message threads |
| GET | /messages/threads/:threadId | Yes | Get thread with paginated messages |
| POST | /messages/threads | Yes | Create thread (body: `{recipientId}`) |
| POST | /messages/threads/:threadId | Yes | Send message (body: `{content, fileUrl?, fileName?}`) |
| PATCH | /messages/threads/:threadId/read | Yes | Mark thread messages as read |
| GET | /messages/unread-count | Yes | Get total unread message count |
| GET | /notifications | Yes | List notifications (paginated) |
| GET | /notifications/unread-count | Yes | Get unread notification count |
| PATCH | /notifications/read-all | Yes | Mark all notifications as read |
