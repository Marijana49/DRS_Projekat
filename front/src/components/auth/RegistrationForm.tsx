import { useState } from "react";
import { Link } from "react-router-dom";
import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { useAuth } from "../../hooks/useAuthHook";
import { validateAuthData } from "../../api/validators/auth/AuthValidator";

export function RegistrationForm({ authAPI }: AuthFormProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setDate] = useState("");
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [street, setStreet] = useState("");
    const [streetNumber, setStNumber] = useState("");
    const [role, setRole] = useState("User");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        
        const validate = validateAuthData(email, password);
        if(!validate.success){
            setError(validate.message ?? "Wrong data");
            return;
        }
        setRole("User");
        const answer = await authAPI.register(firstName, lastName, email,new Date(birthDate), gender, country, street, Number.parseInt(streetNumber), role);

        if(answer.success && answer.data) {
            login(answer.data);
        } else {
            setError(answer.message);
            setEmail("");
            setPassword("");
        }
    };

    return(
        <div className="container px-4 mx-auto">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Create an account</h2>
                </div>
            <form onSubmit={submitForm}>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">First Name</label>
                    <input
                        type="text"
                        placeholder="Joe"
                        value={firstName}
                        onChange={(e)=> setFirstName(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Last Name</label>
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e)=> setLastName(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Email</label>
                    <input
                        type="text"
                        placeholder="yourmail@example.com"
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Password</label>
                    <input
                        type="password"
                        placeholder="your password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Date of birth</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e)=> setDate(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Gender</label>
                    <select
                    value={gender}
                    onChange={(e)=> setGender(e.target.value)}
                    className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded">
                        <option value="Other">Other</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Country</label>
                    <input
                        type="text"
                        placeholder="Country"
                        value={country}
                        onChange={(e)=> setCountry(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Street</label>
                    <input
                        type="text"
                        placeholder="Street"
                        value={street}
                        onChange={(e)=> setStreet(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">House Number</label>
                    <input
                        type="text"
                        placeholder="Number"
                        value={streetNumber}
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
                        Register
                    </button>
                </div>
            </form>
            <p className="text-center font-extrabold">
                Already registerd? {" "}
                <Link to="/login" className="text-rose-600 hover:underline">
                    Login
                </Link>
            </p>
            </div>
        </div>
    );
}