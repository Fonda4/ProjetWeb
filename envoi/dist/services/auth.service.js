import { UsersService } from "./users.service";
export class AuthService {
    /**
     * Encodes a string in Base64 (as required by our simple token system)
     */
    static encodeBase64(data) {
        return Buffer.from(data).toString('base64');
    }
    /**
     * Decodes a Base64 string to plain text
     */
    static decodeBase64(data) {
        return Buffer.from(data, 'base64').toString('utf8');
    }
    /**
     * Login logic (Called by the POST /auth/login controller)
     */
    static login(loginData) {
        // 1. Ask UsersService to verify the credentials
        const validUser = UsersService.checkCredentials(loginData);
        if (!validUser) {
            return null; // Authentication failed
        }
        // 2. Create the token by encoding the username in base64
        const token = this.encodeBase64(validUser.username);
        // 3. Return the object expected by the Swagger contract
        return {
            username: validUser.username,
            token: token,
            role: validUser.role
        };
    }
    /**
     * MIDDLEWARE: Protects routes
     * Checks that the client has a valid token before letting them proceed.
     */
    static authorize(req, res, next) {
        // 1. Get the "Authorization" header
        const token = req.get("Authorization");
        if (!token) {
            return res.status(401).send("Unauthorized: Missing token");
        }
        try {
            // 2. Decode the token to find the username
            const username = AuthService.decodeBase64(token);
            // 3. Check if this username corresponds to an active user in the database
            const existingUser = UsersService.getByUsername(username);
            // Guard: Happy Path is interrupted if the user is not found
            if (!existingUser) {
                return res.status(401).send("Unauthorized: Invalid token or inactive user");
            }
            // 4. Attach the user to the request so the next controller can use it
            req.user = existingUser;
            // 5. Happy Path: Allow the request to continue to the controller
            return next();
        }
        catch (error) {
            // If the base64 is malformed
            return res.status(401).send("Unauthorized: Malformed token");
        }
    }
}
