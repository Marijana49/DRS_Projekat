import { useNavigate } from "react-router-dom";
import type { IUserAPIService } from "../../api/user/IUserAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { ProcitajPoKljucu } from "../../helpers/local_storage";
import { UserTable } from "../../components/user/TableView/UserTable";

interface AdminDashboardProps {
    userAPI: IUserAPIService;
}

export default function AdminDashboard({userAPI}: AdminDashboardProps) {
    const { isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = ProcitajPoKljucu("useAuth");

        if(!isAuthenticated || !token){
            logout();
            navigate("/login");
        }
    }, [isAuthenticated, logout, navigate]);

    return (
        <main className="flex item-center justify-center">
            <UserTable userApi={userAPI}/>
        </main>
    )
}