export interface BasicModel {
id : number;
createdAt ?: Date;
updatedAt ?: Date; 
delete ?: Date ;
}

export interface BasicModelDBO {
id : number;
createdAt ?: Date |undefined ;
updatedAt ?: Date | undefined ; 
deletedAt ?: Date | undefined ;
}

export interface BasicModelDTO {
id : number;
createdAt ?: Date | undefined ;
updatedAt ?: Date | undefined ; 
}