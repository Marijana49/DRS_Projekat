import { useEffect, useState, type ChangeEvent } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate, useParams } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import { useSocket } from "../../hooks/useSocketHook";

interface QuizAcceptProps{
    quizAPI: IQuizAPIService
}


export default function QuizAccept({quizAPI} : QuizAcceptProps){
    const { quizId } = useParams();
    const {removeQuiz} = useSocket();
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const {token} = useAuth();
    const [quiz, setQuiz] = useState<QuizDTO | null>(null);
    const navigate = useNavigate();

    if(!token)return;
    if(!quizId)return;
    useEffect(()=>{
        (async () => {
            const data = await quizAPI.getPendingQuiz(token, parseInt(quizId, 10));
            for(let i=0; i < data.answers.length; i++){
                data.answers[i].push(data.correctAnswers[i]);
                data.answers[i].sort();
            }
    
            setQuiz(data);
        })();
    }, [token, quizAPI]);

    const handleAccept = async (id: number) => {
        const answer = await quizAPI.approveQuiz(token, id);
        if(!answer.success){
            setError(answer.message);
            return;
        }
        removeQuiz(id);
        alert(answer.message);
        navigate(-1);
    };

    const handleReject = async (id: number) => {
        if(message == ""){
            setError("Reject reason cannot be empty")
            return;
        }
        const answer = await quizAPI.rejectQuiz(token, id, message);
        if(!answer.success){
            setError(answer.message);
            return;
        }
        removeQuiz(id);
        alert(answer.message);
        navigate(-1);
    };
    if(!quiz)return;
    const handleChange = (e:ChangeEvent<HTMLInputElement>) =>{
        setMessage(e.target.value);
    }
    
    return(
        <div className="flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <h2 className="text-indigo-800 font-bold text-3xl text-shadow-2xs text-shadow-inc-900">
                            Quiz waiting for approval
                        </h2> 
                    </div>
                    <div>
                        {error && <p className="text-2xl font-bold text-purple-600">{error}</p>}
                        
                        <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">
                        {quiz.quizName}
                    </h2>
                </div>

                <div className="grid grid-cols-1">
                    <div className="px-2 py-2 mt-2 mb-2 border-2 rounded bg-white">
                        {quiz.questions.length > 0 ? (
                            quiz.questions.map((question, index) => (
                                <div key={index}>
                                    <h1 className="text-center mt-2 text-2xl font-bold text-blue-600">
                                        {question}
                                    </h1>

                                    <div className="grid grid-cols-2 text-left py-4">
                                        {quiz.answers[index].map((answer) => (
                                            <div
                                                key={answer}
                                                className="py-2 border-2 mb-2 ml-2 mr-2 mt-2 rounded shadow bg-indigo-600 
                                                has-checked:bg-purple-500 has-checked:border-2 has-checked:border-zinc-700 
                                                hover:shadow-2xl shadow-zinc-900 focus:outline-2 transition duration-300 has-checked:shadow"
                                            >
                                                <label 
                                                    htmlFor={question + answer}
                                                    className="select-none w-full py-4 text-sm font-medium px-2"
                                                >
                                                    {answer}
                                                </label>

                                                
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-2xl font-extrabold text-center">
                                Quiz has no questions?
                            </div>
                        )}
                            
                        </div>
                        
                    </div>
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
                    onClick={() => handleAccept(quiz.id)} >Accept</button>
                    <button
                    className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500 ml-2 mt-4" 
                    onClick={() => handleReject(quiz.id)} >Reject</button>
                </div>
                
        </div>
    )
}