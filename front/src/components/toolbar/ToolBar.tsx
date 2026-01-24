import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuthHook";

export default function ToolBar(){
    const navigate = useNavigate();
    const {user} = useAuth();

    const handleHome = () => {
        navigate("/quizes");
    }
    const handleQuizCreate = () => {
        if(user?.role == "PLAYER"){
            window.alert("To create a quiz you have to be a moderator.")
        }else{
            navigate("/quiz/create");
        }

    }
    const handleProfile = () => {
        navigate("/profile");
    }
    
    
    return(
        <div className="px-4 py-2 bg-zinc-600 max-h-10">
            <div className="grid grid-cols-3">
                <button 
                type="button"
                onClick={handleProfile}className="bg-indigo-500 rounded shadow shadow-zinc-800 hover:bg-indigo-700 hover:shadow-2xs transition duration-300 ml-4 mr-4 ">Profile</button>
                <button 
                type="button"
                onClick={handleHome}className="bg-indigo-500 rounded shadow shadow-zinc-800 hover:bg-indigo-700 hover:shadow-2xs transition duration-300 ml-4 mr-4 ">Quizes</button>
                <button 
                type="button"
                onClick={handleQuizCreate}
                className="bg-indigo-500 rounded shadow shadow-zinc-800 hover:bg-indigo-700 hover:shadow-2xs transition duration-300 ml-4 mr-4 ">Create Quiz</button>
            </div>
        </div>
    )
}