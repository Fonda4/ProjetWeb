// src/mappers/games.mapper.ts
import { EGameStatus } from '../models/games.model';
export class GamesMapper {
    // DBO -> DTO complet
    static toDTO(dbo) {
        return {
            id: dbo.id,
            status: dbo.status,
            name: dbo.name,
            fieldId: dbo.field_id,
            refereeId: dbo.referee_id,
            homeTeamId: dbo.home_team_id,
            awayTeamId: dbo.away_team_id,
            homeScore: dbo.home_score,
            awayScore: dbo.away_score,
            scheduledDate: dbo.scheduled_date,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }
    // DBO -> DTO court (pour les listes)
    static toShortDTO(dbo) {
        return {
            id: dbo.id,
            status: dbo.status,
            name: dbo.name,
            fieldId: dbo.field_id,
            homeTeamId: dbo.home_team_id,
            awayTeamId: dbo.away_team_id,
            scheduledDate: dbo.scheduled_date
        };
    }
    // NewDTO -> DBO (Lors de la création)
    static toDBO(dto, newId, autoRefereeId) {
        const now = new Date();
        // Règle du swagger : si fieldId et scheduledDate sont présents, le statut est 'scheduled', sinon 'created'
        let initialStatus = EGameStatus.CREATED;
        if (dto.fieldId && dto.scheduledDate) {
            initialStatus = EGameStatus.SCHEDULED;
        }
        return {
            id: newId,
            status: initialStatus,
            name: dto.name,
            field_id: dto.fieldId || null,
            referee_id: dto.refereeId || autoRefereeId, // Si l'arbitre n'est pas fourni, on met celui qui crée
            home_team_id: dto.homeTeamId,
            away_team_id: dto.awayTeamId,
            home_score: null,
            away_score: null,
            scheduled_date: dto.scheduledDate || null,
            created_at: now,
            updated_at: now
        };
    }
}
