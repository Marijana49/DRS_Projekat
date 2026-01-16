import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { ProcitajPoKljucu } from "../../helpers/local_storage";
import { ChangeProfilePicture } from "../../components/user/UserInfo/UploadProfilePicture";
import { userAPI } from "../../api/user/UserAPIService";

export default function UploadProfilePicture() {
    const {isAuthenticated, logout} = useAuth();
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
            <ChangeProfilePicture userApi={userAPI}/>
        </main>
    )
}