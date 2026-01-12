import type { ValidationResult } from "../../../types/validation/ValidatonResults";
export function validateAuthData(email?: string, password?: string) : ValidationResult {
    if (!email || !password){
        return { success: false, message: 'Email and password are required.'};
    }

    if(!email.includes('@')){
        return {success:false, message: 'Email must be valid.'};
    }

    if(password.length < 6){
        return {success: false, message: 'Password must be 8 characters or longer'}
    }
    return {success: true};
}