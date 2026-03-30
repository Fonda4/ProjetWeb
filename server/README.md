# Games Manager Boilerplate

## Commands

```bash
# Install dependencies
npm install

# Seed demo data
npm run demo:seed

# Reset the data
npm run demo:reset

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start

# Seed demo data
npm run demo:seed

# Reset demo data
npm run demo:reset

# Clear all data
npm run clear
```

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
