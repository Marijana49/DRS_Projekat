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
            const answer = await axios.put<UserResponse>(`${API_URL}/profile`, 
                {first_name:firstName, last_name:lastName, country, street, street_number:streetNumber},
                {headers: {
                    Authorization: `Bearer ${token}`,
                },}
            );
            return answer.data;
        } catch {
            return {
                success: false,
                message: "Error",
                data: undefined
            };
        }
    },
    async uploadPicture(token: string, imageFile:FormData): Promise<UserResponse> {
        try{
            const answer = await axios.post<UserResponse>(`${API_URL}/profile/image`, imageFile, 
                {headers : {Authorization : `Bearer ${token}`}
            });
            return answer.data;
        }catch{
            return {
                success: false,
                message: "Error",
                data: undefined
            };
        }
    },

    async getUser(token) : Promise<UserDTO>{
        try{
            const answer = await axios.get<UserDTO>(`${API_URL}/profile`, 
                {headers : {Authorization : `Bearer ${token}`}
            });
            return answer.data;
        }catch{
            return{
                id: 0,
                firstName: "", 
                lastName: "" ,
                email: "",
                birthDate: new Date,
                gender: "",
                country: "", 
                street: "",
                streetNumber: 0,
                role: "",
                picture: ""
            }
        }
    },
};