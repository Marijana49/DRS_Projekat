import type { IUserAPIService } from "./IUserAPIService";
import type { UserDTO } from "../../models/users/UserDTO";
import type { UserResponse } from "../../types/User/UserResponse";
import axios from "axios";
const API_URL: string = import.meta.env.VITE_API_URL;

console.log(API_URL);
export const userAPI: IUserAPIService = {
    async getAllUsers(token: string): Promise<UserDTO[]> {
        try {
            const answer = await axios.get<UserDTO[]>(`${API_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return answer.data;
        } catch {
            return [];
        }
    },

    async deleteUser(token: string, id: number): Promise<UserResponse> {
        try {
            const answer = await axios.delete<UserResponse>(`${API_URL}/admin/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return answer.data;
        } catch {
            return {
                success: false,
                message: "Error",
                data: undefined
            };
        }
    },

   async changeUserRole(token: string, id: number, newRole: string): Promise<UserResponse> {
    try {
        const answer = await axios.put<UserResponse>(
            `${API_URL}/admin/role/${id}`,
            { role: newRole },
            { headers: { Authorization: `Bearer ${token}` } } 
        );
        return answer.data;
    } catch {
        return { success: false, message: "Error", data: undefined };
    }
    },

    async changeUserInformation(token: string,
        firstName: string,
        lastName: string,
        country: string,
        street: string,
        streetNumber: number): Promise<UserResponse> {
        try {
            const answer = await axios.put<UserResponse>(`${API_URL}/profil`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }, first_name: firstName, last_name: lastName, country: country, street: street, street_number: streetNumber
            });
            return answer.data;
        } catch {
            return {
                success: false,
                message: "Error",
                data: undefined
            };
        }
    },
    uploadPicture: function (token: string): Promise<UserResponse> {
        throw new Error("Function not implemented.");
    }
};