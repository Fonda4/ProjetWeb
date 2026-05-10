export class UsersMapper {
    /**
     * Tansforms the data from the DB (DBO) to the format we want to send to the client (DTO)
     */
    static toDTO(dbo) {
        return {
            id: dbo.id,
            firstName: dbo.first_name, // transformation snake_case -> camelCase
            lastName: dbo.last_name,
            email: dbo.email,
            username: dbo.username,
            role: dbo.role,
            status: dbo.status,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }
    /**
     * Tansforms the data from the DB (DBO) to the reduced client format (ShortDTO)
     */
    static toShortDTO(dbo) {
        return {
            id: dbo.id,
            firstName: dbo.first_name,
            lastName: dbo.last_name
        };
    }
    /**
     * Tansforms the data from the client (NewUserDTO) to the database format (DBO)
     * The server decides the creation date and ID.
     */
    static toDBO(dto, newId, role, status) {
        const now = new Date();
        return {
            id: newId,
            first_name: dto.firstName,
            last_name: dto.lastName,
            email: dto.email,
            username: dto.username,
            password: dto.password,
            role: role,
            status: status,
            created_at: now,
            updated_at: now
        };
    }
    /*
    * Tansforms the data from the DB (DBO) to the full format we want to send to the client (FullDTO)
    */
    static toFullDTO(dbo) {
        return {
            id: dbo.id,
            firstName: dbo.first_name, // transformation snake_case -> camelCase
            lastName: dbo.last_name,
            email: dbo.email,
            username: dbo.username,
            role: dbo.role,
            status: dbo.status,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }
}
