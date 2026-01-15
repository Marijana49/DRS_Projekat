import React, { useState } from "react";
import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { useAuth } from "../../hooks/useAuthHook";
import { Link } from "react-router-dom";
import { validateAuthData } from "../../api/validators/auth/AuthValidator";
import { parseToken } from "../../helpers/parseToken";


export function LoginForm({ authAPI }: AuthFormProps){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        const validate = validateAuthData(email, password);
        if(!validate.success){
            setError(validate.message ?? "Wrong data");
            return;
        }

        const answer = await authAPI.login(email, password);
        const token = parseToken(answer);
        if(!!token){
            login(token);
        }
        else {
            setError("Invalid Token");
            setEmail("");
            setPassword("");
        }
    };

    return (
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold">Login</h1>
                </div>
            <form onSubmit={submitForm}>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold"> Email</label>
                    <input
                        type="text"
                        placeholder="yourmail@example.com"
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold" > Password </label>
                    <input
                        type="password"
                        placeholder="your password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="flex flex-wrap -mx-4 mb-6 items-center justify-between">
                    <div className="w-full lg:w-auto px-4 mb-4 lg:mb-0">
                        {error && <p className="font-extrabold text-rose-700">{error}</p>}
                    </div>
                    <button type="submit" className="inline-block w-full py-4 px-6 mb-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-3 border-indigo-900 shadow rounded transition duration-500">
                        Login
                    </button>
                </div>
            </form>
            <p className="text-center font-extrabold">
                Not Registerd?{" "}
                <Link to="/register" className="text-rose-600 hover:underline">
                    Register
                </Link>
            </p>
            </div>
        </div>
    );
}