# 📘 API Documentation

---

## 🔐 Auth — Authentication and session management

<details open>
<summary><strong>POST</strong> <code>/auth/login</code> — Log in and obtain an auth token <em>(no auth required)</em></summary>

<br>

No authentication required. Validates `username` and `password` against stored users. Returns a `token` (base64-encoded username) to use as the `Authorization` header on subsequent requests, along with the user's `role`.

---

### Parameters

*No parameters*

---

### Request body `required`

**Media type:** `application/json`

```json
{
  "username": "admin",
  "password": "AdminPass123!"
}
```

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **Login successful** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "username": "admin", "token": "YWRtaW4=" }</code></pre> | No links |
| `400` | Missing or empty username / password | No links |
| `401` | Invalid credentials | No links |

</details>

---

## 👤 Users — User accounts and profiles

<details>
<summary><strong>GET</strong> <code>/users</code> — List all users 🔒 <em>(any authenticated user)</em></summary>

<br>

Any authenticated user. Admins receive `UserDTO[]`, others receive `UserShortDTO[]`. Inactive users are excluded.

---

### Parameters

*No parameters*

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **List of users** (shape depends on caller role — see description) <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>[ { "id": 1, "firstName": "Admin", "lastName": "User" }, { "id": 2, "firstName": "John", "lastName": "Doe" } ]</code></pre> | No links |
| `401` | Missing or invalid token | No links |

</details>

---

<details>
<summary><strong>POST</strong> <code>/users</code> — Create a new user <em>(no auth required)</em></summary>

<br>

No authentication required. Creates a new user account. The `role` field in the request body is ignored — the role is always set to `player` server-side. The password is hashed with bcrypt before storage.

---

### Parameters

*No parameters*

---

### Request body `required`

**Media type:** `application/json`

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `201` | **User created** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "player", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `400` | Invalid or missing fields | No links |

</details>

---

<details>
<summary><strong>GET</strong> <code>/users/username/{username}</code> — Find a user by username 🔒 <em>(admin or referee only)</em></summary>

<br>

Requires authentication. Only accessible by users with the `admin` or `referee` role. Returns the full `UserDTO` of the matching user.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `username` * **required** | Username of the user to find | `string` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **User found** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "admin", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `401` | Missing or invalid token, or caller is not admin/referee | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>GET</strong> <code>/users/email/{email}</code> — Find a user by email 🔒 <em>(admin or referee only)</em></summary>

<br>

Requires authentication. Only accessible by users with the `admin` or `referee` role. Returns the full `UserDTO` of the matching user.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `email` * **required** | Email address of the user to find | `string` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **User found** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "admin", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `401` | Missing or invalid token, or caller is not admin/referee | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>GET</strong> <code>/users/{id}</code> — Get a user by ID 🔒 <em>(any authenticated user)</em></summary>

<br>

Any authenticated user can call this endpoint.

- **Admin**: receives `UserDTO`
- **Own profile (non-admin)**: receives `UserShortDTO`
- **Other user (non-admin)**: returns `403 Forbidden`

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `id` * **required** | Numeric resource ID — *Example: `1`* | `integer` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **User profile.** Admins receive `UserDTO` ; own profile receives `UserShortDTO` <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "admin", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `400` | ID is not a valid number | No links |
| `401` | Missing or invalid token | No links |
| `403` | Non-admin caller tried to view another user's profile | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>PUT</strong> <code>/users/{id}</code> — Update a user 🔒 <em>(any authenticated user)</em></summary>

<br>

Any authenticated user can call this endpoint. An admin may update any user. A non-admin user may only update their own profile — the token's user ID must match the `{id}` path parameter; attempting to update another user returns `403`. Body must include `id` matching the URL parameter; if body `id` and path `{id}` differ, the endpoint returns `400`. Fields `password`, `role`, and `status` in the body are accepted but `role` and `status` are preserved from the stored record server-side; only `firstName`, `lastName`, `email`, `username` are updated.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `id` * **required** | Numeric resource ID — *Example: `1`* | `integer` | path |

---

### Request body `required`

**Media type:** `application/json`

```json
{
  "id": 2,
  "firstName": "Jonathan",
  "lastName": "Doe",
  "email": "jonathan@example.com",
  "username": "johndoe",
  "role": "player",
  "status": "active"
}
```

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **Updated user** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "admin", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `400` | Invalid payload (including body/path ID mismatch) | No links |
| `401` | Missing or invalid token | No links |
| `403` | Authenticated user is not an admin and tries to update another user | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>DELETE</strong> <code>/users/{id}</code> — Soft-delete a user 🔒 <em>(admin or self)</em></summary>

<br>

Requires authentication. An `admin` may soft-delete any user; a non-admin may soft-delete only their own account. Attempts to delete another user as non-admin return `403`. Sets the user's status to `inactive`. The user remains in the data store but is excluded from listings and cannot log in. Admin accounts cannot be deleted.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `id` * **required** | Numeric resource ID — *Example: `1`* | `integer` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | User deleted | No links |
| `400` | Invalid ID or attempt to delete an admin account | No links |
| `401` | Missing or invalid token | No links |
| `403` | Authenticated user is not an admin | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>PATCH</strong> <code>/users/{id}/role/{role}</code> — Change a user's role 🔒 <em>(admin only)</em></summary>

<br>

Requires `admin` role. Changes the role of the user identified by `{id}`. Only users currently holding the `player` role can be promoted — attempting to change the role of an `admin`, `referee`, or `trainer` returns `400`. Valid target roles are `player`, `referee`, `trainer`, and `admin`.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `id` * **required** | Numeric resource ID — *Example: `1`* | `integer` | path |
| `role` * **required** | Available values: `admin`, `player`, `referee`, `trainer` | `string` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | **Updated user with new role** <br><br> Media type: `application/json` <br><br> <pre lang="json"><code>{ "id": 2, "firstName": "John", "lastName": "Doe", "email": "john@example.com", "username": "johndoe", "password": "string", "role": "admin", "status": "active", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T00:00:00.000Z" }</code></pre> | No links |
| `400` | Invalid ID, invalid role value, or user is not a player | No links |
| `401` | Missing or invalid token | No links |
| `403` | Authenticated user is not an admin | No links |
| `404` | User not found | No links |

</details>

---

<details>
<summary><strong>PATCH</strong> <code>/users/{id}/reactivate</code> — Reactivate an inactive user 🔒 <em>(admin only)</em></summary>

<br>

Requires `admin` role. Sets the user's status back to `active`, reversing a soft-delete.

---

### Parameters

| Name | Description | Type | In |
|------|-------------|------|----|
| `id` * **required** | Numeric resource ID — *Example: `1`* | `integer` | path |

---

### Responses

| Code | Description | Links |
|------|-------------|-------|
| `200` | User reactivated (no body) | No links |
| `401` | Missing or invalid token | No links |
| `403` | Authenticated user is not an admin | No links |
| `404` | User not found | No links |

</details>

## 🗂️ Schemas

---

<details open>
<summary><strong>ErrorResponse</strong></summary>

<br>

Canonical JSON error shape.

> **Note:** current implementation is mixed and may also return plain text or an empty body on some routes/statuses.

| Field | Required | Type |
|-------|----------|------|
| `error` | ✅ | `string` |

</details>

---

<details>
<summary><strong>UserLoginDTO</strong></summary>

<br>

Credentials used to authenticate a user.

| Field | Required | Type |
|-------|----------|------|
| `username` | ✅ | `string` |
| `password` | ✅ | `string` |

</details>

---

<details>
<summary><strong>AuthenticatedUserDTO</strong></summary>

<br>

Successful login response containing the auth token and user role.

| Field | Required | Type |
|-------|----------|------|
| `username` | ✅ | `string` |
| `token` | ✅ | `string` |
| `role` | ✅ | `ERole` |

</details>

---

<details>
<summary><strong>EUserStatus</strong> — <code>string</code></summary>

<br>

User account status:

- `active` — account is active *(default)*
- `inactive` — account has been soft-deleted

**Enum values:** `active`, `inactive`

</details>

---

<details>
<summary><strong>ERole</strong> — <code>string</code></summary>

<br>

User role:

- `admin` — full administrative access
- `player` — default role for regular users
- `referee` — assigned to officiate games
- `trainer` — assigned to coach a team

**Enum values:** `admin`, `player`, `referee`, `trainer`

</details>

---

<details>
<summary><strong>UserShortDTO</strong></summary>

<br>

Minimal user representation. Returned by `GET /users` and `GET /users/:id` for non-admin callers.

| Field | Required | Type |
|-------|----------|------|
| `id` | ✅ | `integer` |
| `firstName` | ✅ | `string` |
| `lastName` | ✅ | `string` |

</details>

---

<details>
<summary><strong>UserFullDTO</strong></summary>

<br>

Full user profile with timestamps.

> **Note:** Not currently used by any endpoint in the reverted code, but kept for documentation purposes.

| Field | Required | Type |
|-------|----------|------|
| `id` | ✅ | `integer` |
| `firstName` | ✅ | `string` |
| `lastName` | ✅ | `string` |
| `email` | ✅ | `string` |
| `username` | ✅ | `string` |
| `role` | ✅ | `ERole` |
| `status` | ✅ | `EUserStatus` |
| `createdAt` | ✅ | `string (date-time)` |
| `updatedAt` | ✅ | `string (date-time)` |

</details>

---

<details>
<summary><strong>UserDTO</strong></summary>

<br>

Outbound user representation — **never contains a password in responses**.

Returned by: `GET /users` *(admin callers)*, `POST /users`, `PUT /users/:id`, `GET /users/username/:username`, `GET /users/email/:email`, `PATCH /users/:id/role/:role`.

| Field | Required | Type |
|-------|----------|------|
| `id` | ✅ | `integer` |
| `firstName` | ✅ | `string` |
| `lastName` | ✅ | `string` |
| `email` | ✅ | `string` |
| `username` | ✅ | `string` |
| `password` | ❌ | `string` |
| `role` | ✅ | `ERole` |
| `status` | ✅ | `EUserStatus` |
| `createdAt` | ❌ | `string (date-time)` |
| `updatedAt` | ❌ | `string (date-time)` |

</details>

---

<details>
<summary><strong>NewUserDTO</strong></summary>

<br>

Payload for creating a user (`POST /users`). Role is always forced to `player`.

| Field | Required | Type |
|-------|----------|------|
| `firstName` | ✅ | `string` |
| `lastName` | ✅ | `string` |
| `email` | ✅ | `string` |
| `username` | ✅ | `string` |
| `password` | ✅ | `string` |

</details>

---

<details>
<summary><strong>UserDBO</strong></summary>

<br>

Database object — shape stored in `data/users.json` *(snake_case)*.

> **Note:** Used internally; never returned directly by the API.

| Field | Required | Type |
|-------|----------|------|
| `id` | ✅ | `integer` |
| `email` | ✅ | `string` |
| `first_name` | ✅ | `string` |
| `last_name` | ✅ | `string` |
| `username` | ✅ | `string` |
| `password` | ✅ | `string` |
| `role` | ✅ | `ERole` |
| `status` | ✅ | `EUserStatus` |
| `created_at` | ❌ | `string (date-time)` |
| `updated_at` | ❌ | `string (date-time)` |

</details>