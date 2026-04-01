import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basic.model";


// description: Successful login response containing the auth token and user role
export enum EROLES {
  ADMIN = 'admin',
  PLAYER ='player',
  REFEREE = 'referee',
  TRAINER = 'trainer'
}

export enum EUserStatus{
    ACTIVE = 'active',
    INACTIVE = 'INACTIVE'
    
}

export interface User{
id : number;
firstName : string;
lastName : string;
email :  string;
username : string;
role : EROLES;
status : EUserStatus;
}


//description: Minimal user representation. Returned by GET /users and GET /users/:id for non-admin callers.
export interface UserShortDTO{
id : number;
firstName : string;
lastName : string;
}

//description: Full user profile with timestamps.
//  Not currently used by any endpoint in the reverted code, but kept for documentation purposes.
export interface UserFullDTO extends BasicModelDTO{
id : number;
firstName : string;
lastName : string;
email :  string;
username : string;
role : EROLES;
status : EUserStatus;
}

//description:Outbound user representation — never contains a password in responses. 
// Returned by: GET /users (admin callers), POST /users, PUT /users/:id,
//  GET /users/username/:username, GET /users/email/:email, PATCH /users/:id/role/:role.
export interface UserDTO extends BasicModelDTO{
id : number;
firstName : string;
lastName : string;
email :  string;
username : string;
password ?: string;
role : EROLES;
status : EUserStatus;
}

// description: Payload for creating a user (POST /users). Role is always forced to player.
export interface NewUserDTO {
firstName : string;
lastName :string    
email : string ;
role : EROLES;
username : string;
password : string;
}


//description: Database object — shape stored in data/users.json (snake_case). Used internally; never returned directly by the API.
export interface UserDBO extends BasicModelDBO {
id : number;
email : string;
first_name : string;
last_name : string;
username : string;
password : string;
role : EROLES;
status : EUserStatus;

}