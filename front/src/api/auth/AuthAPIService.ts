import type { IAuthAPIService } from "./IAuthAPIService";
import axios from "axios";
import type { AuthResponse } from "../../types/Auth/AuthResponse";

const API_URL: string = import.meta.env.VITE_API_URL + "auth";

export const authApi: IAuthAPIService = {
    async login(
        mail: string, 
        password: string
    ): Promise<AuthResponse> {
        try {
            const answer = await axios.post<AuthResponse>(`${API_URL}/login`, {mail, password});
            return answer.data;
        }catch (error) {
            let message = "Greska prilikom prijave";

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
        birthDate: Date, 
        gender: string, 
        country: string, 
        street: string, 
        streetNumber: number,
        role: string,
    ): Promise<AuthResponse> {
        try {
            const answer = await axios.post<AuthResponse>(`${API_URL}/register`, {
                email, 
                firstName, 
                lastName, 
                birthDate, 
                gender, 
                country, 
                street, 
                streetNumber,
                role
            });
            return answer.data;
        }catch(error){
            let message = "Greska prilikom registracije";
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