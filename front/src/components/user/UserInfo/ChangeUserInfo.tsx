import { useState } from "react";
import type { IUserAPIService } from "../../../api/user/IUserAPIService";
import { jwtDecode } from "jwt-decode";
import type { JwtTokenClaims } from "../../../types/Auth/JwtTokenClaims";
import { useAuth } from "../../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";


interface UserInfoProps {
    userApi: IUserAPIService
}

export function ChangeUserInfo({ userApi }: UserInfoProps) {
    const [firstNameNew, setFirstName] = useState("");
    const [lastNameNew, setLastName] = useState("");
    const [countryNew, setCountry] = useState("");
    const [streetNew, setStreet] = useState("");
    const [streetNumberNew, setStNumber] = useState("");
    const [error, setError] = useState("");
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/profile");
    }
    if(!token) return null;

    const {firstName, lastName, country, street, streetNumber} = jwtDecode<JwtTokenClaims>(token);

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();



        const answer = await userApi.changeUserInformation(token, firstNameNew ? firstNameNew : firstName,lastNameNew ? lastNameNew: lastName,countryNew ? countryNew : country, streetNew ? streetNew :  street,streetNumberNew ? parseInt(streetNumberNew, 10) : streetNumber);

        if(!answer.success){
            setError(answer.message);
        }
    };

    return(
        <div className="container px-4 mx-auto">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Update Information</h2>
                </div>
            <form onSubmit={submitForm}>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">First Name</label>
                    <input
                        type="text"
                        placeholder={firstName}
                        value={firstNameNew}
                        onChange={(e)=> setFirstName(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Last Name</label>
                    <input
                        type="text"
                        placeholder={lastName}
                        value={lastNameNew}
                        onChange={(e)=> setLastName(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Country</label>
                    <input
                        type="text"
                        placeholder={country}
                        value={countryNew}
                        onChange={(e)=> setCountry(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Street</label>
                    <input
                        type="text"
                        placeholder={street}
                        value={streetNew}
                        onChange={(e)=> setStreet(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Street Number</label>
                    <input
                        type="text"
                        placeholder={streetNumber.toString()}
                        value={streetNumberNew}
                        onChange={(e)=> setStNumber(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="flex flex-wrap -mx-4 mb-6 items-center justify-between">
                    <div className="w-full lg:w-auto px-4 mb-4 lg:mb-0">
                        {error && <p className="font-extrabold text-rose-700">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="inline-block w-full py-4 px-6 mb-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-3 border-indigo-900 shadow rounded transition duration-500">
                        Save
                    </button>
                </div>
            </form>
                <div>
                    <button className="inline-block w-smalltext-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleBack}> Back </button>
                </div>
            </div>
        </div>
    );
}