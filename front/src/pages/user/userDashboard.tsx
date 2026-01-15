import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { ProcitajPoKljucu } from "../../helpers/local_storage";
import { UserInfo } from "../../components/user/UserInfo/UserInfo";

export default function UserDashboard() {
    const {isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = ProcitajPoKljucu("authToken");
        
        if(!isAuthenticated || !token){
            logout();
            navigate("/login");
        }
    }, [isAuthenticated, logout, navigate]);

    return(
        <main className="flex item-center justify-center">
            <UserInfo />
            
        </main>
    );
}