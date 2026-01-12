import type { UserDTO } from "../../models/users/UserDTO";
import type { UserResponse } from "../../types/User/UserResponse";

export interface IUserAPIService {
    getAllUsers(token: string): Promise<UserDTO[]>;
    deleteUser(token: string, id:number): Promise<UserResponse>;
    changeUserRole(token: string, id:number): Promise<UserResponse>;
}