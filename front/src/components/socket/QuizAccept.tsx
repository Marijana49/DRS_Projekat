import { useEffect, useState, type ChangeEvent } from "react";
import { useSocket } from "../../hooks/useSocketHook";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import type { QuizToAccept } from "../../types/Quiz/QuizApproval";
import 'react-toastify/dist/ReactToastify.css';

interface QuizAcceptProps{
    quizAPI: IQuizAPIService
}


export default function QuizAccept({quizAPI} : QuizAcceptProps){
    const {socket, quizes, removeQuiz} = useSocket();
    const [newQuizes, setQuizes] = useState<QuizToAccept[]>(quizes);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const {token} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        setQuizes(quizes);
    }, [quizes]);

    useEffect(()=>{
        const load = async () => {
            if(!token) return;
            const pending = await quizAPI.getPendingQuizes(token);
            setQuizes(pending);
        };
        load();
    }, []);

    if(!token)return;

    const handleAccept = async (id: number) => {
        const answer = await quizAPI.approveQuiz(token, id);
        setError(answer.message);
        removeQuiz(id);
        setQuizes(prev => prev.filter(quiz => quiz.quizId !== id));
    };

    const handleReject = async (id: number) => {
        if(message == ""){
            setError("Reject reason cannot be empty")
            return;
        }
        const answer = await quizAPI.rejectQuiz(token, id, message);
        
        setError(answer.message);
        setQuizes(prev => prev.filter(quiz => quiz.quizId !== id));
    };

    const handleChange = (e:ChangeEvent<HTMLInputElement>) =>{
        setMessage(e.target.value);
    }
    const handleBack = () => {
        navigate("/profile");
    }
    
    return(
        <div className="flex items-center justify-center py-5 min-h-screen">
                <div className="text-center">
                    <div className="mb-4">
                        <h2 className="text-indigo-800 font-bold text-3xl text-shadow-2xs text-shadow-inc-900">
                            Quizes for Approval
                        </h2> 
                    </div>
                    <div>
                        {error && <p className="text-2xl font-bold text-purple-600">{error}</p>}
                        {newQuizes.length > 0 ? (newQuizes.map((quiz) =>(
                        <div key={quiz.quizId.toString()} className="text-center border-2 border-purple-800 rounded px-12 py-7 shadow-lg shadow-zinc-900 mt-2 mb-2">
                            <h1 className="mb-2 text-xl font-bold text-blue-400">{quiz.quizName}</h1>
                            <p className="text-left">ID: {quiz.quizId}</p>
                            <p className="text-left">Author: {quiz.quizAuthor}</p>
                            <p className="text-left">Duration: {quiz.quizDuration}</p>
                            <div className="mb-6">
                                <label className="block text-zinc-600 text-left">Reject Reason</label>
                                <input 
                                    type="text"
                                    value={message}
                                    className="border-2 rounded border-zinc-500"
                                    onChange={e => handleChange(e)}
                                />
                            </div>
                            <button 
                            className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500 mr-2 mt-4"
                            onClick={() => handleAccept(quiz.quizId)} >Accept</button>
                            <button
                            className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500 ml-2 mt-4" 
                            onClick={() => handleReject(quiz.quizId)} >Reject</button>
                        </div>
                        ))
                        ):(
                        <div className="font-extrabold text-3xl py-4 text-zinc-600">No quizes</div>
                        )}
                    </div>
                    <button className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={handleBack}> Back </button>
                </div>
        </div>
    )
}