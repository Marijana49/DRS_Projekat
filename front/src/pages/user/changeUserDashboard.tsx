import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { ProcitajPoKljucu } from "../../helpers/local_storage";
import { ChangeUserInfo } from "../../components/user/UserInfo/ChangeUserInfo";
import { userAPI } from "../../api/user/UserAPIService";

export default function ChabgeUserDashboard() {
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
            <ChangeUserInfo userApi={userAPI}/>
        </main>
    );
}