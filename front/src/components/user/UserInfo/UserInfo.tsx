import { jwtDecode } from "jwt-decode";
import { ObrisiPoKljucu, ProcitajPoKljucu } from "../../../helpers/local_storage";
import { useAuth } from "../../../hooks/useAuthHook";
import type { JwtTokenClaims } from "../../../types/Auth/JwtTokenClaims";
import { parseGender } from "../../../helpers/parseGender";
import { parseRole } from "../../../helpers/parseRole";
import { useNavigate } from "react-router-dom";

export function UserInfo(){
    const token = ProcitajPoKljucu("authToken");
    const { logout } = useAuth();
    const navigate = useNavigate();

    if(!token) return null;

    const {sub, firstName, lastName, email, birthDate, gender, country, street, streetNumber, role} = jwtDecode<JwtTokenClaims>(token);
    const picture = "/src/assets/default_icon.jpg";

    const handleLogout = () => {
        ObrisiPoKljucu("authToken");
        logout();
    }

    const handelSwitchPage = () => {
        navigate("/admin");
    }

    const handleEdit = () => {
        navigate("/profile/edit")
    }
    const handleChangeImage = () => {
        navigate("/profile/picture")
    }

    return(        
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-extrabold text-center text-indigo-900 mb-6">
                    Dobro Dosli {firstName}
                </h1>
                <div className="flex item-center justify-left">
                    <img src={picture}
                        alt="Profile Picture"
                        onError={(e) => (e.currentTarget.src = "/home/polylute/Documents/The Vault/Fax/DRS/DRS_Projekat/front/src/assets/default_icon.jpg")}
                        style={{width: "160px", height: "160px"}}
                    />
                    <div className="px-10 py-15">
                        <button onClick={handleChangeImage} className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500">
                            Edit Picture
                        </button>
                    </div>
                </div>
                <div className="space-y-3 text-lg text-indigo-300">
                    <p><strong>ID:</strong> {sub}</p>
                    <p><strong>Name:</strong> {firstName}</p>
                    <p><strong>Last Name:</strong> {lastName}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Gender:</strong> {parseGender(gender)}</p>
                    <p><strong>Country:</strong> {country}</p>
                    <p><strong>Birtday:</strong> {birthDate}</p>
                    <p><strong>Street:</strong> {street}</p>
                    <p><strong>House Number:</strong> {streetNumber}</p>
                    <p><strong>Role:</strong> {parseRole(role)}</p>
                </div>
                <div className="flex flec-wrap -mx-4 mb-6 item-center justify-between">
                    <button className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleLogout}> Logout </button>
                    <button className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleEdit}> Edit </button>
                    {parseRole(role) == "ADMINISTRATOR" ? (
                        <button onClick={handelSwitchPage} className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500" >User List</button>
                    ) : (
                        <div></div>
                    )

                    }
                </div>
            </div>
       </div>
    );
}