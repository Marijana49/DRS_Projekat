import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { ProcitajPoKljucu } from "../../helpers/local_storage";
import { UserInfo } from "../../components/user/UserInfo/UserInfo";
import { userAPI } from "../../api/user/UserAPIService";
import ToolBar from "../../components/toolbar/ToolBar";
import { ToastContainer } from "react-toastify";
import { parseRole } from "../../helpers/parseRole";

export default function UserDashboard() {
    const {isAuthenticated, logout, user} = useAuth();
    const navigate = useNavigate();
    const isAdmin = parseRole(user?.role) === "ADMINISTRATOR";
    
    useEffect(() => {
        const token = ProcitajPoKljucu("authToken");
        
        if(!isAuthenticated || !token){
            logout();
            navigate("/login");
        }
    }, [isAuthenticated, logout, navigate]);

    return(
        <main className="">
            <div className="max-h-10">
                <ToolBar/>
            </div>
            {isAdmin && <ToastContainer/>}
            <UserInfo userAPI={userAPI}/>
            
        </main>
    );
}