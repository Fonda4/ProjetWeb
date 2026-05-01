// src/models/fields.model.ts
import { BasicModelDBO, BasicModelDTO } from "./basic.model";

// Payload required to create a new field (POST)
export interface NewFieldDTO {
  name: string;
  location: string;
}

// Full representation of a field returned to the client
export interface FieldDTO extends BasicModelDTO {
  id: number;
  name: string;
  location: string;
}

// Database representation stored in the JSON file (snake_case)
export interface FieldDBO extends BasicModelDBO {
  id: number;
  name: string;
  location: string;
}