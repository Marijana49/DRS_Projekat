import type { IAuthAPIService } from "./IAuthAPIService";
import axios from "axios";
import type { AuthResponse } from "../../types/Auth/AuthResponse";

const API_URL: string = import.meta.env.VITE_API_URL;

console.log("API_URL:", API_URL);

export const authApi: IAuthAPIService = {
    async login(
        email: string, 
        password: string
    ): Promise<AuthResponse> {
        try {
            const answer = await axios.post<AuthResponse>(`${API_URL}/login`, {email, password});
            return answer.data;
        }catch (error) {
            let message = "Login error";

            if(axios.isAxiosError(error)){
                message = error.response?.data?.message || message;
            }
            return{
                success: false,
                message,
                data: undefined,
            }
        }
    },

     async register(
        firstName: string,
        lastName: string, 
        email: string,
        password: string, 
        birthDate: Date, 
        gender: string, 
        country: string, 
        street: string, 
        streetNumber: number,
        role: string,
    ): Promise<AuthResponse> {
        try {
            const answer = await axios.post<AuthResponse>(`${API_URL}/register`, {
                first_name: firstName, 
                last_name: lastName,
                email,
                password,  
                birth_date: birthDate.toISOString().split("T")[0], 
                gender, 
                country, 
                street, 
                street_number: streetNumber,
                role
            });
            return answer.data;
        }catch(error){
            let message = "Registration error";
            if(axios.isAxiosError(error)){
                message = error.response?.data?.message || message;
            }
            return{
                success: false,
                message,
                data: undefined
            };
        }     
    },   
};