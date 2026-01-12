import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegistrationForm } from "../../components/auth/RegistrationForm";
import type { IAuthAPIService } from "../../api/auth/IAuthAPIService";
import { useAuth } from "../../hooks/useAuthHook";

interface RegisterPageProps {
    authAPI: IAuthAPIService;
}

export default function RegisterPage({ authAPI }: RegisterPageProps) {
    const { isAuthenticated, user} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(isAuthenticated && user)
            navigate(`/${user.role}-dashboard`);
        },[isAuthenticated, navigate, user]);

    return(
        <main className="">
            <RegistrationForm authAPI={authAPI}/>
        </main>
    
    );

}