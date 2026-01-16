import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { ObrisiPoKljucu } from "../../helpers/local_storage";
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
    const {isAuthenticated, user, isLoading, logout} = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        ObrisiPoKljucu("authToken");
        logout();
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
                <div>
                    <h2>You do not have authorization</h2>
                    <p>
                        You need to be {" "}
                        <span>{requiredRole}</span> to access this page. Your role is {parsedRole}
                    </p>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </main>
        );
    }

    return <>{children}</>
}