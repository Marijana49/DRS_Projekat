import type { IUserAPIService } from "./IUserAPIService";
import type { UserDTO } from "../../models/users/UserDTO";
import type { UserResponse } from "../../types/User/UserResponse";
import axios from "axios";
const API_URL: string = import.meta.env.VITE_API_URL + "user";

export const userAPI: IUserAPIService = {
    async getAllUsers(token: string): Promise<UserDTO[]> {
        try {
            const answer = await axios.get<UserDTO[]>(`${API_URL}s`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return answer.data;
        }catch{
            return [];
        }
    },

    async deleteUser(token: string, id: number): Promise<UserResponse> {
        try {
            const answer = await axios.delete<UserResponse>(`${API_URL}s/${id}`, {
                headers: {
                    Authorization: `Bearers ${token}`,
                },
            });
            return answer.data;
        }catch{
            return{
                success: false,
                message: "Error",
                data: undefined
            }
        }
    },

    async changeUserRole(token: string, id:number): Promise<UserResponse>{
        try {
            const answer = await axios.post<UserResponse>(`${API_URL}s/${id}`, {
                headers: {
                    Authorization: `Bearers ${token}`,
                },
            });
            return answer.data;
        }catch{
            return{
                success: false,
                message: "Error",
                data: undefined
            }
        }
    }
};