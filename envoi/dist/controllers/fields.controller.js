import { Router } from "express";
import { FieldsService } from "../services/fields.service";
import { AuthService } from "../services/auth.service";
import { EROLES } from "../models/user.model";
import { LoggerService } from "../services/logger.service";
import { isNumber, isNewFieldDTO, isFieldDTO } from "../utils/guards";
export const fieldsController = Router();
LoggerService.debug("OK FIELDS CONTROLLER LOADED");
/**
 * GET /fields
 * Retrieves the list of all fields
 */ fieldsController.get("/", (req, res) => {
    LoggerService.info("[FieldsController] GET /fields called");
    const fields = FieldsService.getAll();
    res.status(200).json(fields);
});
/**
 * GET /fields/:id
 * Retrieves a specific field by its ID
 */ fieldsController.get("/:id", (req, res) => {
    LoggerService.info("[GET] /fields/:id");
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error("Bad request: invalid id");
        res.status(400).send("Invalid ID");
        return;
    }
    const field = FieldsService.getById(id);
    if (field === undefined) {
        LoggerService.error("Field not found");
        res.status(404).send("Field not found");
        return;
    }
    res.status(200).json(field);
    return;
});
/**
 * POST /fields
 * Creates a new field (Admin only)
 */
fieldsController.post("/", AuthService.authorize, // Step 1: Middleware checks the token
(req, res) => {
    // Log the incoming request
    LoggerService.info("[FieldsController] POST /fields called");
    const loggedInUser = req.user;
    // Step 2: Guard - Check if the user is properly authenticated (safety check for TypeScript)
    if (!loggedInUser) {
        LoggerService.error("Unauthorized: Unauthenticated user");
        res.status(401).send("Unauthenticated user");
        return; // Interrupt the Happy Path
    }
    // Step 3: Guard - Check permissions (Admin only)
    if (loggedInUser.role !== EROLES.ADMIN) {
        LoggerService.error(`Forbidden: User ${loggedInUser.username} is not an admin`);
        res.status(403).send("Forbidden: Admin role required");
        return; // Interrupt the Happy Path
    }
    // Extract data from the request body
    const fieldData = req.body;
    // Step 4: Guard - Validate the request body structure
    if (!isNewFieldDTO(fieldData)) {
        LoggerService.error("Bad Request: Invalid or missing fields for new field");
        res.status(400).send("Bad Request: Invalid or missing fields");
        return; // Interrupt the Happy Path
    }
    // Step 5: Call the service to create the resource
    // The service handles ID generation and timestamps internally
    const newField = FieldsService.create(fieldData);
    // Happy Path: Send the created resource with 201 Created status
    LoggerService.info(`Field successfully created by ${loggedInUser.username}`);
    res.status(201).json(newField);
    return;
});
/**
 * PUT /fields/:id
 * Updates a specific field (Admin only)
 */
fieldsController.put("/:id", AuthService.authorize, (req, res) => {
    LoggerService.info(`[FieldsController] PUT /fields/${req.params.id} called`);
    const loggedInUser = req.user;
    if (!loggedInUser)
        return res.status(401).send("Unauthenticated");
    // Verify admin role
    if (loggedInUser.role !== EROLES.ADMIN) {
        LoggerService.error(`[FieldsController] Access denied. User ${loggedInUser.username} is not an admin.`);
        return res.status(403).send("Forbidden: Admin role required");
    }
    const id = Number(req.params.id);
    const fieldData = req.body;
    if (!isNumber(id))
        return res.status(400).send("Invalid ID");
    // Validate request body shape
    if (!isFieldDTO(fieldData)) {
        LoggerService.error("[FieldsController] Invalid request body for field update");
        return res.status(400).send("Invalid payload");
    }
    // Body ID and Path ID must match
    if (id !== fieldData.id) {
        LoggerService.error("[FieldsController] ID mismatch between path and body");
        return res.status(400).send("Path ID and Body ID mismatch");
    }
    const updatedField = FieldsService.update(id, fieldData);
    if (!updatedField) {
        LoggerService.error(`[FieldsController] Field with ID ${id} not found`);
        res.status(404).send("Field not found");
    }
    res.status(200).json(updatedField);
});
