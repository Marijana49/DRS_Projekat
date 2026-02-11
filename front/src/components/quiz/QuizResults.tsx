import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import type { QuizResultDTO } from "../../models/quizes/QuizResultDTO";
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { parseRole } from "../../helpers/parseRole";

interface QuizResultProps {
    quizAPI: IQuizAPIService;
}

export default function QuizResult({ quizAPI }: QuizResultProps) {
    const [quizResults, setQuizResults] = useState<QuizResultDTO[]>([]);
    const [quiz, setQuiz] = useState<QuizDTO | null>(null);
    const [loadingResults, setLoadingResults] = useState(true);
    const [loadingQuiz, setLoadingQuiz] = useState(true);

    const { token, user } = useAuth();
    const { quizId } = useParams();
    const navigate = useNavigate();

    if (!token || !quizId) return null;

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoadingQuiz(true);
                const data = await quizAPI.startQuiz(token, parseInt(quizId, 10));
                setQuiz(data);
            } catch (e) {
                toast.error("Can't load quiz questions.");
            } finally {
                setLoadingQuiz(false);
            }
        };
        fetchQuiz();
    }, [token, quizAPI, quizId]);

    useEffect(() => {
        let retries = 0;
        const fetchResults = async () => {
            try {
                setLoadingResults(true);
                const results = await quizAPI.getResults(token, parseInt(quizId, 10));

                if (results.length === 0 && retries < 5) {
                    retries++;
                    setTimeout(fetchResults, 1000);
                } else {
                    setQuizResults(results || []);
                }
            } catch (e) {
                toast.error("Can't load quiz results.");
            } finally {
                setLoadingResults(false);
            }
        };
        fetchResults();
    }, [token, quizAPI, quizId]);

    const handleGeneratePDF = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/admin/quiz/${quizId}/results/pdf`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "PDF generation failed");
                return;
            }

            toast("PDF generated and sent to your email");
        } catch (e) {
            toast.error("Server error while generating PDF");
        }
    };

    const handleBack = () => navigate(-1);

    return (
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700">Quiz Overview</h2>
                </div>

                {loadingQuiz ? (
                    <div className="text-center py-10 text-xl text-gray-600">Loading quiz...</div>
                ) : quiz ? (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4">{quiz.quizName}</h3>
                        {quiz.questions.map((q, idx) => (
                            <div key={idx} className="mb-4 p-4 border rounded shadow-sm">
                                <div className="font-semibold">Q{idx + 1}: {q}</div>
                                <ul className="list-disc list-inside mt-2">
                                    {quiz.answers[idx].map((a, aIdx) => (
                                        <li key={aIdx}>{a}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-xl text-red-600">Quiz not available</div>
                )}

                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700">Leaderboard</h2>
                </div>

                {parseRole(user?.role) === "ADMINISTRATOR" && (
                    <div className="flex mt-6 mb-4">
                        <button
                            onClick={handleGeneratePDF}
                            className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-emerald-700 text-white px-6 py-2 shadow rounded hover:bg-emerald-900 transition duration-500"
                        >
                            Generate PDF & Send to Email
                        </button>
                        <ToastContainer/>
                    </div>
                )}

                {loadingResults ? (
                    <div className="text-center py-10 text-xl text-gray-600">Loading results...</div>
                ) : quizResults.length > 0 ? (
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-indigo-100 text-indigo-900">
                                <th className="px-4 py-3 border-b">Player</th>
                                <th className="px-4 py-3 border-b">Time Spent (sec)</th>
                                <th className="px-4 py-3 border-b">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizResults.map((result, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-blue-100/70 transition duration-500 text-center border-b"
                                >
                                    <td className="px-4 py-3">{result.playerId || "Anonymous"}</td>
                                    <td className="px-4 py-3">{result.spentTime}</td>
                                    <td className="px-4 py-3 font-bold">{result.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-10 text-xl text-gray-700 font-medium">
                        No Results for this quiz
                    </div>
                )}

                <div className="flex flex-wrap -mx-4 mb-6 items-center px-10 justify-start mt-8">
                    <button
                        onClick={handleBack}
                        className="inline-block w-small text-center text-lg leading-6 font-extrabold bg-indigo-700 text-white px-6 py-2 shadow rounded hover:bg-indigo-900 transition duration-500"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}