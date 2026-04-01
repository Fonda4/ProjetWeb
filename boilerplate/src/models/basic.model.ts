export interface BasicModel {
id : number;
createdAt : Date;
updatedAt : Date; 
}

export interface BasicModelDBO {
id : number;
created_at : Date |undefined ;
updated_at : Date | undefined ; 
}

export interface BasicModelDTO {
id : number;
createdAt : Date | undefined ;
updatedAt : Date | undefined ; 
}