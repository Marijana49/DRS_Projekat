import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import type { QuizResultDTO } from "../../models/quizes/QuizResultDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate, useParams } from "react-router-dom";

interface QuizResultProps{
    quizAPI: IQuizAPIService;
}

export default function QuizResult({quizAPI}: QuizResultProps){
    const [quizResults, setQuizResults] = useState<QuizResultDTO[]>([]);
    const {token} = useAuth();
    const {quizId} = useParams();
    const navigate = useNavigate();
    if(!token)return;
    if(!quizId)return;

    useEffect(()=>{
        (async ()=>{
            const answer = await quizAPI.getResults(token, parseInt(quizId, 10));
            setQuizResults(answer);
        })();
    }, [token, quizAPI, quizId]);

    const handleBack = ()=>{
        navigate(-1);
    }

    return(
            <div className="container px-4 mx-auto min-h-screen min-w-screen">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700">Leaderboard</h2>
                    </div>
                <table className="w-full table-auto">
                    <thead>
                        <tr className="mb-6 text-indigo-900">
                            <th className="px-4 py-2">Player</th>
                            <th className="px-4 py-2">Time Spent</th>
                            <th className="px-4 py-2">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizResults.length > 0 ? (quizResults.map((quizResult) => (
    
                            <tr className="hover:bg-blue-100/70 transition duration-500 text-center">
                                <td className="px-4 py-2">{quizResult.playerId}</td>
                                <td className="px-4 py-2">{quizResult.spentTime}</td>
                                <td className="px-4 py-2">{quizResult.points}</td>
                            </tr>
                            ))
                        ):(
                            <tr>
                                <td colSpan={4} className="text-center text-gray-700 py-4">
                                    No Results for this quiz
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