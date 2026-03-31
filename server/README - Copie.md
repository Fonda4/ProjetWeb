# Auth Authentication and session management



<details>



<summary><strong>POST</strong> <code>/auth/login</code> Log in and obtain an auth token (no auth required)    </summary> 



No authentication required. Validates `username` and `password` against stored users. Returns a `token` (base64-encoded username) to use as the `Authorization` header on subsequent requests, along with the user's `role`.

---

### Parameters

* No parameters

---

### Request body `required`

**Media type:** `application/json`

**Example Value** | Schema

```json
{
  "username": "admin",
  "password": "AdminPass123!"
}
```

Responses

    200 - Login successful

        Media type: application/json

        Controls Accept header.

    Example Value | Schema
    JSON

    {
      "username": "admin",
      "token": "YWRtaW4="
    }

    400 - Missing or empty username / password

    401 - Invalid credentials

</details>

# Users User accounts and profiles

<details open>
<summary><strong>GET</strong> <code>/users</code> List all users (any authenticated user) 🔒</summary>

Any authenticated user. Admins receive UserDTO[], others receive UserShortDTO[]. Inactive users excluded.
Parameters

    No parameters

Responses

    200 - List of users (shape depends on caller role — see description)

        Media type: application/json

        Controls Accept header.

    Example Value | Schema
    JSON

    [
      {
        "id": 1,
        "firstName": "Admin",
        "lastName": "User"
      },
      {
        "id": 2,
        "firstName": "John",
        "lastName": "Doe"
      }
    ]

    401 - Missing or invalid token

</details>

<details>
<summary><strong>POST</strong> <code>/users</code> Create a new user (no auth required)</summary>

</details>

<details>
<summary><strong>GET</strong> <code>/users/username/{username}</code> Find a user by username (admin or referee only) 🔒</summary>

</details>

<details>
<summary><strong>GET</strong> <code>/users/email/{email}</code> Find a user by email (admin or referee only) 🔒</summary>

</details>

<details>
<summary><strong>GET</strong> <code>/users/{id}</code> Get a user by ID (any authenticated user) 🔒</summary>

</details>

<details>
<summary><strong>PUT</strong> <code>/users/{id}</code> Update a user (any authenticated user) 🔒</summary>

</details>

<details>
<summary><strong>DELETE</strong> <code>/users/{id}</code> Soft-delete a user (admin or self) 🔒</summary>

</details>

<details>
<summary><strong>PATCH</strong> <code>/users/{id}/role/{role}</code> Change a user's role (admin only) 🔒</summary>

</details>

<details>
<summary><strong>PATCH</strong> <code>/users/{id}/reactivate</code> Reactivate an inactive user (admin only) 🔒</summary>

</details>

- [ ] POST/auth/login Log in and obtain an auth token (no auth required)
- [ ] GET/users List all users (any authenticated user)
- [ ] POST/users Create a new user (no auth required)
- [ ] GET/users/username/{username} Find a user by username (admin or referee only)
- [ ] GET/users/email/{email} Find a user by email (admin or referee only)
- [ ] GET/users/{id} Get a user by ID (any authenticated user)
- [ ] PUT/users/{id} Update a user (any authenticated user)
- [ ] DELETE/users/{id} Soft-delete a user (admin or self)
- [ ] PATCH/users/{id}/role/{role} Change a user's role (admin only)
- [ ] PATCH/users/{id}/reactivate Reactivate an inactive user (admin only)

- [ ] ErrorResponse
- [X] UserLoginDTO
- [X] AuthenticatedUserDTO
- [X] EUserStatus
- [X] ERole
- [X] UserShortDTO
- [X] UserFullDTO
- [X] UserDTO
- [X] NewUserDTO
- [X] UserDBO
- [ ] ESportType
