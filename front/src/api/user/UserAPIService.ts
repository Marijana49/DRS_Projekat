import type { IUserAPIService } from "./IUserAPIService";
import type { UserDTO } from "../../models/users/UserDTO";
import type { UserResponse } from "../../types/User/UserResponse";
import axios, { isAxiosError } from "axios";
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
        }catch{
            return [];
        }
    },

    async deleteUser(token: string, id: number): Promise<UserResponse> {
        try {
            const answer = await axios.delete<UserResponse>(`${API_URL}/admin/role/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
            const answer = await axios.put<UserResponse>(`${API_URL}/admin/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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

    async changeUserInformation(token: string, 
        firstName: string,
        lastName: string,
        country: string, 
        street: string, 
        streetNumber: number,) : Promise<UserResponse> {
        try{
            const answer = await axios.put<UserResponse>(`${API_URL}/profile`, {
                first_name: firstName, 
                last_name: lastName, 
                country: country, 
                street: street, 
                street_number: streetNumber, 
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return answer.data;
        }catch(error){
            var message = "Error";
            if(isAxiosError(error)){
                message = error.message 
            }
            return{
                success: false,
                message: message,
                data: undefined
            }
        }
    },

    async uploadPicture(token: string) : Promise<UserResponse>{
        try{
            const answer = await axios.post<UserResponse>(`${API_URL}/profile/image`, { headers : {Authorization: `Bearer ${token}`},
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
};