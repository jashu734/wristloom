# API Conventions & Standards: Wristloom
**Layer 5: APIs & Backend Logic (15-Layer SaaS Playbook, p. 12-13)**

## 1. REST Endpoint URL Conventions
- All API routes reside under `/api/` in kebab-case naming format.
- Resource collections use plural nouns (e.g. `/api/orders`, `/api/bookings`, `/api/products`).
- Single-resource mutations use parameter routes (e.g. `/api/orders/[id]`, `/api/vault/[id]`).

---

## 2. Standardized Response Format

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### List Response with Pagination
```json
{
  "orders": [ ... ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "hasMore": true
}
```

### Error Response (HTTP 4xx / 5xx)
```json
{
  "error": "Descriptive message explaining why the operation was rejected",
  "code": "VALIDATION_FAILED | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | RATE_LIMITED | INTERNAL_ERROR",
  "retryAfterSeconds": 60
}
```

---

## 3. Standard HTTP Status Codes

| Code | Usage |
|---|---|
| **200 OK** | Successful read or idempotent update |
| **201 Created** | New order, booking, vault item, or account registered |
| **400 Bad Request** | Malformed JSON or invalid business condition |
| **401 Unauthorized** | Missing or expired authentication session |
| **403 Forbidden** | Authenticated user lacks permission to perform the action |
| **404 Not Found** | Resource does not exist OR caller is not the owner (IDOR protection) |
| **422 Unprocessable**| Zod input boundary validation failed |
| **429 Too Many Requests** | Rate limit exceeded (includes `Retry-After` header) |
| **500 Internal Error** | Unexpected server crash (detailed stack trace logged to structured logger, friendly message returned) |

---

## 4. Input Boundary Validation
All state-changing endpoints (`POST`, `PATCH`, `PUT`) parse request bodies using strict Zod schemas before database queries or business operations are executed.
