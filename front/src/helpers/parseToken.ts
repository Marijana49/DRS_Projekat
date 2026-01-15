import type { AuthResponse } from "../types/Auth/AuthResponse";

export function parseToken(token: AuthResponse) : string {
    const answer = JSON.stringify(token).split(':')[1].slice(1, -2);
    return answer;
}