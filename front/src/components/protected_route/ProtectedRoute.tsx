import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { parseRole } from "../../helpers/parseRole";

type ProtectedRouteProps = {
    children: React.ReactNode;
    requiredRole: string;
    redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
    redirectTo = "/login",
}) => {
    const {isAuthenticated, user, isLoading} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate(-1);
    };

    if(isLoading) {
        return <h1>Loading...</h1>
    }

    if(!isAuthenticated) {
        return <Navigate to={redirectTo} state={{from: location}} replace />;
    }
    
    const parsedRole = parseRole(user?.role);
    if(requiredRole && parsedRole !== requiredRole) {
        return (
            <main>
                <div className="text-center py-5">
                    <h2 className="font-extrabold text-4xl text-indigo-700">You don't have premisson</h2>
                    <p className="text-lg mt-2 mb-2">
                        You need to be a{" "}
                        <span className="font-bold text-blue-500">{requiredRole}</span> to access this page.   
                    </p>
                    <p>
                        Your role is <span className="font-bold text-rose-700">{parsedRole}</span>
                    </p>
                    <button 
                    className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500 mt-4"
                    onClick={handleLogout}>
                        Back
                    </button>
                </div>
            </main>
        );
    }

    return <>{children}</>
}