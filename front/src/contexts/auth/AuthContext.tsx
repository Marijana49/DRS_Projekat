import React, {createContext, useState, useEffect, type ReactNode} from "react";
import { jwtDecode } from "jwt-decode";
import type { AuthContextType } from "../../types/Auth/AuthContext";
import type { AuthUser } from "../../types/Auth/AuthUser";
import { ObrisiPoKljucu, ProcitajPoKljucu, SacuvajPoKljucu } from "../../helpers/local_storage";
import type { JwtTokenClaims }from '../../types/Auth/JwtTokenClaims'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string): JwtTokenClaims | null => {
    try {
        const decoded = jwtDecode<JwtTokenClaims>(token);

        if(decoded.sub && decoded.email && decoded.role){
            return{
                sub: decoded.sub,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                email: decoded.email,
                gender: decoded.gender,
                birthDate: decoded.birthDate,
                country: decoded.country,
                street: decoded.street,
                streetNumber: decoded.streetNumber,
                role: decoded.role,
                picture: decoded.picture
            };
        }
        return null;
    }catch (error){
        console.error(error);
        return null;
    }
};

const isTokenExpired = (token: string): boolean => {
    try{
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        return decoded.exp ? decoded.exp < currentTime: false;
    }catch{
        return false;
    }
}

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=> {
        const savedToken = ProcitajPoKljucu("authToken");

        if(savedToken) {
            if (isTokenExpired(savedToken)){
                ObrisiPoKljucu("authToken");
                setIsLoading(false);
                return;
            }

            const claims = decodeJWT(savedToken);
            if (claims){
                setToken(savedToken);
                setUser({
                    id: claims.sub,
                    email: claims.email,
                    role: claims.role
                });
            }else{
                ObrisiPoKljucu("authToken");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string) => {
        const claims = decodeJWT(newToken);

        if(claims && !isTokenExpired(newToken)){
            setToken(newToken);
            setUser({
                id: claims.sub,
                email: claims.email,
                role: claims.role
            });
            SacuvajPoKljucu("authToken", newToken);
        }else{
            console.error("Token expired or inadequate.");
        }
    };

    const logout = () => {
        // const answer = axios.post(`${API_URL}/logout`, {token});
        setToken(null);
        setUser(null);
        ObrisiPoKljucu("authToken");
    };

    const isAuthenticated = !!user && !!token;

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;