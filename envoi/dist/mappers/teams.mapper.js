export class TeamsMapper {
    /**
     * DBO -> DTO : From the database format to the format we want to send to the client
     */
    static toDTO(dbo) {
        return {
            id: dbo.id,
            name: dbo.name,
            description: dbo.description,
            sportType: dbo.sport_type, // Conversion snake_case -> camelCase
            players: dbo.players,
            trainerId: dbo.trainer_id !== null ? dbo.trainer_id : undefined,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }
    /**
     * DBO -> ShortDTO : From the database format to the reduced format we want to send to the client (for lists)
     */
    static toShortDTO(dbo) {
        return {
            id: dbo.id,
            name: dbo.name,
            sportType: dbo.sport_type
        };
    }
    /**
     * NewDTO -> DBO : From the client to the database format (when creating a new team)
     * The server decides the ID, date, and initializes the players.
     */
    static toDBO(dto, newId, trainerId) {
        const now = new Date();
        return {
            id: newId,
            name: dto.name,
            description: dto.description || "", // If description is not provided, we initialize it with an empty string
            sport_type: dto.sportType,
            players: [], // Rule : when creating a team, we initialize with un tableau vide
            trainer_id: trainerId,
            created_at: now,
            updated_at: now
        };
    }
}
