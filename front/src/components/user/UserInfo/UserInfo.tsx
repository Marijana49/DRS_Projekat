import { ObrisiPoKljucu } from "../../../helpers/local_storage";
import { useAuth } from "../../../hooks/useAuthHook";
import { parseGender } from "../../../helpers/parseGender";
import { parseRole } from "../../../helpers/parseRole";
import { useNavigate } from "react-router-dom";
import type { IUserAPIService } from "../../../api/user/IUserAPIService";
import { useEffect, useState } from "react";
import type { UserDTO } from "../../../models/users/UserDTO";
import { parseDate } from "../../../helpers/parseDate";

const API_URL = import.meta.env.VITE_API_URL;

interface UserInfoProps{
    userAPI : IUserAPIService
}

export function UserInfo({userAPI} : UserInfoProps){
    const { token, logout } = useAuth();
    const [user, setUser] = useState<UserDTO | null>(null)
    const navigate = useNavigate();
    
    useEffect(()=> {
            (async ()=> {
                const data = await userAPI.getUser(token ?? "");
                setUser(data);
            })();
        }, [token, userAPI]);
    

    const handleLogout = () => {
        ObrisiPoKljucu("authToken");
        logout();
    }

    const handelSwitchPage = () => {
        navigate("/admin");
    }

    const handleEdit = () => {
        navigate("/profile/edit");
    }
    const handleChangeImage = () => {
        navigate("/profile/picture");
    }

    return(        
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            {user != null ? (

            
            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-extrabold text-center text-indigo-900 mb-6">
                    Welcome {user.firstName}
                </h1>
                <div className="flex item-center justify-left">
                    <img src={user.picture ? `${API_URL}/`+ user.picture : "src/assets/default_icon.jpg"}
                        alt="Profile Picture"
                        onError={(e) => (e.currentTarget.src = "/src/assets/default_icon.jpg")}
                        style={{width: "160px", height: "160px"}}
                    />
                    <div className="px-10 py-15">
                        <button onClick={handleChangeImage} className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500">
                            Edit Picture
                        </button>
                    </div>
                </div>
                <div className="space-y-3 text-lg text-indigo-300">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Name:</strong> {user.firstName}</p>
                    <p><strong>Last Name:</strong> {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Gender:</strong> {parseGender(user.gender)}</p>
                    <p><strong>Country:</strong> {user.country}</p>
                    <p><strong>Birtday:</strong> {parseDate(user.birthDate)}</p>
                    <p><strong>Street:</strong> {user.street}</p>
                    <p><strong>House Number:</strong> {user.streetNumber}</p>
                    <p><strong>Role:</strong> {parseRole(user.role)}</p>
                </div>
                <div className="flex flec-wrap -mx-4 mb-6 item-center justify-between mt-2">
                    <button className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleLogout}> Logout </button>
                    <button className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleEdit}> Edit </button>
                    {parseRole(user.role) == "ADMINISTRATOR" ? (
                    <div>
                        <button onClick={handelSwitchPage} className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500 mr-2" >User List</button>
                    </div>
                    ) : (
                        <div></div>
                    )

                    }
                </div>
            </div>):( <div>No users</div> )}
       </div>
    );
}