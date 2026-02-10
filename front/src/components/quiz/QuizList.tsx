import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import { parseQuizStatus } from "../../helpers/parseQuizStatus";
import { parseRole } from "../../helpers/parseRole";
import { useSocket } from "../../hooks/useSocketHook";
import { toast, ToastContainer } from "react-toastify";

interface QuizListProps {
    quizAPI: IQuizAPIService
}

export function QuizList({quizAPI}: QuizListProps){
    const { quizesToApprove } = useSocket();
    const {token, user} = useAuth();
    const [allQuizes, setQuizes] = useState<QuizPreview[]>([]);
    const navigate = useNavigate();

    if(!token || !user) return null;

    // DODATO: funkcija za pokretanje kviza kod playera
    const handleStartQuiz = (quizId: number) => {
        const role = parseRole(user?.role);
        // Samo ako nije admin ili moderator → igrač može da pokrene
        if (role !== "ADMINISTRATOR" && role !== "MODERATOR") {
            navigate(`/quiz/play/${quizId}`);
        }
    };

    useEffect(() => {
        (async ()=>{
            const data = await quizAPI.getAllQuizes(token);
            setQuizes(data || []);
        })();
    }, [token, quizAPI]);

    useEffect(()=>{
        if (!quizesToApprove?.length) return;

        setQuizes(prev => {
            const map = new Map<number, QuizPreview>();

            prev.forEach(q => map.set(q.quizId, q));
            quizesToApprove.forEach(updated => {
                if (updated?.quizId) {
                    map.set(updated.quizId, updated);
                }
            });

            return Array.from(map.values());
        });
    }, [quizesToApprove]);

    const visibleQuizes = allQuizes.filter(quiz => {
        const role = parseRole(user?.role);

        if (role === "ADMINISTRATOR") {
            return true;                            // admin vidi sve
        }

        if (role === "MODERATOR") {
            return quiz.quizAuthor === user?.email; // moderator vidi samo svoje
        }

        // ostali (igrači)
        return parseQuizStatus(quiz.quizStatus) === "Approved";
    });

    const handleDelete  = async (id: number) => {
        const answer = await quizAPI.deleteQuiz(token, id);
        if(!answer.success){
            return;
        }
        setQuizes(prev => prev.filter(q => q.quizId !== id));
    }

    const handleEdit = (id: number) => {
        navigate(`/quiz/edit/${id}`);
    }
    const handleToApproval = (quizId: number) => {
        navigate(`/admin/quiz/${quizId}`);
    }
    const handleQuizResults = (quizId: number) => {
        navigate(`/quiz/results/${quizId}`);
    }
    const handleQuizApproval = async () => {
        const answer = await quizAPI.getAllResults(token);
        toast(answer.message);  
    }

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">Quizes</h2>
                </div>
                {parseRole(user?.role) == "ADMINISTRATOR" && 
                    <div>
                        <button onClick={handleQuizApproval} className="w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500 ml-2 mb-4" >Results PDF</button>
                        <ToastContainer/>
                    </div>}
                <div className="grid grid-cols-2 gap-5 text-center">
                    {visibleQuizes.length > 0 ? (visibleQuizes.map(quiz => (
                        <div key={quiz.quizId}>
                            {/* DODATO: onClick i cursor-pointer za pokretanje kviza kod playera */}
                            <div 
                                onClick={() => handleStartQuiz(quiz.quizId)}
                                className="p-0.5 bg-blue-900  hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-400 hover:shadow-2xl transition duration-400 shadow shadow-zinc-700 cursor-pointer"
                            >
                                <div className="bg-indigo-200/90">
                                    <h3 className="text-2xl font-bold text-indigo-900/75">{quiz.quizName}</h3>
                                    <div className="inline-block mr-4">
                                        Duration: {quiz.quizDuration} min
                                    </div>
                                    <div className="inline-block">by {quiz.quizAuthor}</div>
                                    {parseRole(user?.role) == "ADMINISTRATOR" && <p>Status: {parseQuizStatus(quiz.quizStatus)}</p>}
                                </div>
                            </div>
                            <div className="mt-2">
                                <button onClick={() => handleQuizResults(quiz.quizId)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500 mr-2">
                                    Results
                                </button>

                                {/* DODATO: Delete dugme se prikazuje SAMO za admina i moderatora */}
                                {(parseRole(user?.role) === "ADMINISTRATOR" || parseRole(user?.role) === "MODERATOR") && (
                                    <button onClick={() => handleDelete(quiz.quizId)} className="inline-block bg-rose-700 text-white px-6 py-2 mr-2 rounded hover:bg-rose-900 transition duration-500">
                                        Delete
                                    </button>
                                )}

                                {(parseRole(user?.role) == "MODERATOR" && quiz.quizAuthor == user?.email) &&
                                <button onClick={() => handleEdit(quiz.quizId)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500">
                                    Edit
                                </button>}
                                {(parseRole(user?.role) === "ADMINISTRATOR" && parseQuizStatus(quiz.quizStatus) === "Pending") && <button onClick={() => handleToApproval(quiz.quizId)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500">
                                    To Approval
                                </button>}
                            </div>
                        </div>
                    )) 
                    ):( 
                    <div className="text-gray-500 font-extrabold justify-center text-2xl text-center col-span-2 py-10">
                        Sorry, no quizes are currently available
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}