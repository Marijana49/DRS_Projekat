import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import type { ModeratorQuiz } from "../../types/Quiz/ModeratorQuiz";
import { SacuvajPoKljucu } from "../../helpers/local_storage";
import { io, Socket } from "socket.io-client";

interface QuizListProps {
    quizAPI: IQuizAPIService;
}

interface PendingQuiz {
    id: number;
    quizName: string;
    author: string;
    duration: number;
}

let socket: Socket | null = null;

export function QuizList({ quizAPI }: QuizListProps) {
    const { token, user } = useAuth();
    const [quizes, setQuizes] = useState<(QuizPreview | ModeratorQuiz)[]>([]);
    const [pendingQuizes, setPendingQuizes] = useState<PendingQuiz[]>([]);
    const navigate = useNavigate();

    const isAdmin = user?.role === "ADMINISTRATOR";
    const isModerator = user?.role === "MODERATOR";
    const isPlayer = user?.role === "PLAYER";

    const handlePlay = (id: number) => {
        SacuvajPoKljucu("quizId", id.toString());
        navigate("/quizes/play");
    };

    const handleEdit = (id: number) => {
        navigate(`/quizes/edit/${id}`);
    };

    // Učitaj kvizove za moderatora ili playera
    useEffect(() => {
        if (isAdmin) return;
        if (!token) return;

        (async () => {
            if (isPlayer) {
                const data = await quizAPI.getAllQuizes(token);
                setQuizes(data);
            } else if (isModerator) {
                const data = await quizAPI.getModeratorQuizes(token);
                setQuizes(data);
            }
        })();
    }, [token, quizAPI, isAdmin, isPlayer, isModerator]);

    // Admin Socket za pending kvizove
    useEffect(() => {
        if (!isAdmin) return;

        socket = io(import.meta.env.VITE_QUIZ_API_URL, {
            transports: ["websocket"],
            withCredentials: true
        });

        socket.on("connect", () => console.log("Admin Socket.IO connected"));

        socket.on("new_quiz", (data: PendingQuiz) => {
            console.log("New quiz received:", data);
            setPendingQuizes(prev => [...prev, data]);
        });

        socket.on("disconnect", () => console.log("Socket disconnected"));

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [isAdmin]);

    // Player Socket za odobrene kvizove
    useEffect(() => {
        if (!isPlayer) return;

        const playerSocket = io(import.meta.env.VITE_QUIZ_API_URL, {
            transports: ["websocket"],
            withCredentials: true
        });

        playerSocket.on("quiz_approved", (quiz: QuizPreview) => {
            console.log("Approved quiz arrived:", quiz);
            setQuizes(prev => [...prev, quiz]);
        });

        playerSocket.disconnect();
    }, [isPlayer]);

    // Admin funkcije approve/reject
    const approveQuiz = async (id: number) => {
        await fetch(`${import.meta.env.VITE_QUIZ_API_URL}/admin/quiz/${id}/approve`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        setPendingQuizes(prev => prev.filter(q => q.id !== id));
    };

    const rejectQuiz = async (id: number) => {
        await fetch(`${import.meta.env.VITE_QUIZ_API_URL}/admin/quiz/${id}/reject`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reason: "Rejected by admin" }),
            credentials: "include"
        });
        setPendingQuizes(prev => prev.filter(q => q.id !== id));
    };

    return (
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">

                {/* ADMIN PANEL */}
                {isAdmin && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-red-600">
                                Pending quizes for approval
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-10">
                            {pendingQuizes.length > 0 ? pendingQuizes.map(q => (
                                <div key={q.id} className="p-4 border-2 rounded bg-zinc-100 shadow">
                                    <h3 className="text-xl font-bold">{q.quizName}</h3>
                                    <p>Author: {q.author}</p>
                                    <p>Duration: {q.duration} min</p>

                                    <div className="flex gap-4 mt-3">
                                        <button onClick={() => approveQuiz(q.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition">
                                            Approve
                                        </button>
                                        <button onClick={() => rejectQuiz(q.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center font-bold text-zinc-500">
                                    No pending quizes
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* MODERATOR I PLAYER PANEL */}
                {!isAdmin && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-extrabold text-indigo-700/90">Quizes</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-5 text-center">
                            {quizes.length > 0 ? quizes.map(quiz => (
                                <div key={quiz.quizId} className="p-0.5 bg-blue-900 hover:shadow-2xl transition duration-400 shadow shadow-zinc-700">
                                    <div className="bg-indigo-200/90 p-2">
                                        <h3 className="text-2xl font-bold text-indigo-900/75">{quiz.quizName}</h3>
                                        <div className="inline-block mr-4">
                                            Duration: {quiz.quizDuration} min
                                        </div>
                                        <div className="inline-block">by {quiz.quizAuthor}</div>

                                        {isModerator && 'status' in quiz && quiz.status === 3 && (
                                            <button onClick={() => handleEdit(quiz.quizId)}
                                                className="mt-2 ml-2 py-1 px-3 bg-yellow-500 text-white rounded hover:bg-yellow-700 transition">
                                                Edit
                                            </button>
                                        )}

                                        {isPlayer && (
                                            <button onClick={() => handlePlay(quiz.quizId)}
                                                className="mt-2 ml-2 py-1 px-3 bg-green-600 text-white rounded hover:bg-green-800 transition">
                                                Play
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-gray-500 font-extrabold justify-center text-2xl text-center col-span-2 py-10">
                                    Sorry, no quizes are currently available
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}