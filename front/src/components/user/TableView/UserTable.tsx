import { useEffect, useState } from "react";
import type{ UserDTO } from "../../../models/users/UserDTO";
import { useAuth } from "../../../hooks/useAuthHook";
import type { IUserAPIService } from "../../../api/user/IUserAPIService";
import { parseRole } from "../../../helpers/parseRole";
import { useNavigate } from "react-router-dom";

interface UserTableProps {
 userApi: IUserAPIService
}

export function UserTable({userApi}: UserTableProps){
    const [users, setUsers] =  useState<UserDTO[]>([]);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/profile");
    }
    if(!token)return null;


    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        const result = await userApi.deleteUser(token, id);

        setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
        alert(result.message);
    };

    const handleChangeRole = async (id: number, role: string) => {
        var newRole: string = "";
        if(parseRole(role) == "PLAYER"){
            newRole = "MODERATOR";
        }else if(parseRole(role) == "MODERATOR"){
            newRole = "PLAYER";
        }
        if(newRole == "")return;
        const confirmed = window.confirm("Are you sure you want to change this users role?");
        if (!confirmed) return;
        await userApi.changeUserRole(token, id, newRole);

        const data = await userApi.getAllUsers(token);
        setUsers(data);
    };

    useEffect(()=> {
        (async ()=> {
            const data = await userApi.getAllUsers(token);
            setUsers(data);
        })();
    }, [token, userApi]);

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Users</h2>
                </div>
            <table className="w-full table-auto">
                <thead>
                    <tr className="mb-6 text-indigo-900">
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Last Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (users.map((user) => (

                        <tr className="hover:bg-blue-100/70 transition duration-500">
                            <td className="px-4 py-2">{user.id}</td>
                            <td className="px-4 py-2">{user.lastName}</td>
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{parseRole(user.role)}</td>
                            <td className="px-4 py-2">{parseRole(user.role) != "ADMINISTRATOR" ? (
                                <button onClick={() => handleChangeRole(user.id, user.role)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500">
                                    Change Role
                                </button>) : ( <td></td> ) }
                            </td>
                            <td className="px-4 py-2">
                                <button onClick={() => handleDelete(user.id)} className="inline-block bg-rose-700 text-white px-6 py-2 rounded hover:bg-rose-900 transition duration-500">
                                    Delete
                                </button>
                            </td>
                        </tr>
                        ))
                    ):(
                        <tr>
                            <td colSpan={4} className="text-center text-gray-700 py-4">
                                No users
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            </div>
            <div className="flex flex-wrap -mx-4 mb-6 item-center px-10 justify-left">

                <button onClick={handleBack} className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500">
                    Back
                </button>
            </div>
        </div>
    );
}