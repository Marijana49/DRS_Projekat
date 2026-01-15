import type { AuthResponse } from "../../types/Auth/AuthResponse";

export interface IAuthAPIService {
    login( email: string, password: string): Promise<AuthResponse>;
    register( firstName: string, lastName: string, email: string, password: string, birthDate: Date, gender:string, country: string, street: string, streetNumber: number, role:string): Promise<AuthResponse>;
}