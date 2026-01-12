import type { AuthResponse } from "../../types/Auth/AuthResponse";

export interface IAuthAPIService {
    login( mail: string, password: string): Promise<AuthResponse>;
    register( firstName: string, lastName: string, email: string, birthDate: Date, gender:string, country: string, street: string, streetNumber: number, role:string): Promise<AuthResponse>;
}