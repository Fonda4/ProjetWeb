// src/controllers/fields.controller.ts
import { Request, Response, Router } from 'express';
import { FieldsService } from '../services/fields.service';
import { AuthService } from '../services/auth.service';
import { EROLES } from '../models/user.model';
import { LoggerService } from '../services/logger.service';
import { isNumber, isNewFieldDTO, isFieldDTO } from '../utils/guards';
import { AuthenticatedRequest } from '../models/auth.model';

export const fieldsController = Router();

// GET /fields (No auth required)
fieldsController.get('/', (req: Request, res: Response) => {
    LoggerService.info('[FieldsController] GET /fields called');
    const fields = FieldsService.getAll();
    res.status(200).json(fields);
});

// GET /fields/:id (No auth required)
fieldsController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info(`[FieldsController] GET /fields/${req.params.id} called`);
    
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error(`[FieldsController] Invalid ID provided: ${req.params.id}`);
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const field = FieldsService.getById(id);
    if (!field) return res.status(404).json({ error: 'Field not found' });

    res.status(200).json(field);
});

// POST /fields (Admin only)
fieldsController.post('/', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[FieldsController] POST /fields called');
    
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Unauthenticated' });

    // Verify admin role
    if (loggedInUser.role !== EROLES.ADMIN) {
      LoggerService.error(`[FieldsController] Access denied. User ${loggedInUser.username} is not an admin.`);
      return res.status(403).json({ error: 'Forbidden: Admin role required' });
    }

    const fieldData = req.body;
    
    // Validate request body
    if (!isNewFieldDTO(fieldData)) {
        LoggerService.error('[FieldsController] Invalid request body for new field');
        return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    const newField = FieldsService.create(fieldData);
    res.status(201).json(newField);
});

// PUT /fields/:id (Admin only)
fieldsController.put('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info(`[FieldsController] PUT /fields/${req.params.id} called`);
    
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Unauthenticated' });
    
    // Verify admin role
    if (loggedInUser.role !== EROLES.ADMIN) {
      LoggerService.error(`[FieldsController] Access denied. User ${loggedInUser.username} is not an admin.`);
      return res.status(403).json({ error: 'Forbidden: Admin role required' });
    }

    const id = Number(req.params.id);
    const fieldData = req.body;

    if (!isNumber(id)) return res.status(400).json({ error: 'Invalid ID' });
    
    // Validate request body shape
    if (!isFieldDTO(fieldData)) {
        LoggerService.error('[FieldsController] Invalid request body for field update');
        return res.status(400).json({ error: 'Invalid payload' });
    }
    
    // Body ID and Path ID must match
    if (id !== fieldData.id) {
        LoggerService.error('[FieldsController] ID mismatch between path and body');
        return res.status(400).json({ error: 'Path ID and Body ID mismatch' });
    }

    const updatedField = FieldsService.update(id, fieldData);

    if (!updatedField) return res.status(404).json({ error: 'Field not found' });

    res.status(200).json(updatedField);
});

// Note: DELETE /fields/:id is deliberately omitted as per the Swagger specifications.