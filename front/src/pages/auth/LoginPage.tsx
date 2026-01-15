import { useNavigate } from "react-router-dom";
import type { IAuthAPIService } from "../../api/auth/IAuthAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { LoginForm } from "../../components/auth/LoginForm";

interface LoginPageProps {
    authApi: IAuthAPIService;
}

export default function LoginPage({ authApi }: LoginPageProps){
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(()=> {
        if(isAuthenticated && user)
            navigate(`/profile`);
    }, [isAuthenticated, navigate, user]);

    return (
        <main className="">
            <LoginForm authAPI={authApi} />
        </main>
    )
}