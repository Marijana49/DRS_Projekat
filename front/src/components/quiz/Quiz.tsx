import { useEffect, useState, type ChangeEvent } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify"; 

interface QuizProps{
    quizAPI : IQuizAPIService;
}

export default function Quiz({quizAPI}: QuizProps){
    const {token} = useAuth();
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState<QuizDTO | null>(null);
    const [time, setTime] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{answer: string}[]>([]);
    const navigate = useNavigate();
    const [remainingTime, setRemainingTime] = useState<number>(0);

    if (!quizId) return;

    useEffect(() => {
        (async () => {
            const data = await quizAPI.startQuiz(token ?? "", parseInt(quizId, 10));
            for(let i=0; i < data.answers.length; i++){
                data.answers[i].push(data.correctAnswers[i]);
                data.answers[i].sort();
            }
    
            setQuiz(data);

            const initAnswers = data.questions.map(() => ({ answer: "" }));
            setUserAnswers(initAnswers);

            setTime(Date.now());

           
            setRemainingTime(data.duration * 60);
        })();
    }, [token, quizAPI]);

   
    useEffect(() => {
        if (!quiz || remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    toast.warn("Vreme je isteklo! Kviz se automatski predaje.");
                    handleSubmit({} as React.MouseEvent<HTMLButtonElement>);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [quiz, remainingTime]);

    if(quiz == null){
        return null;
    }

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) =>{
        let data = [...userAnswers];

        if(e.target.checked){
            data[index].answer = e.target.value;
        }else{
            data[index].answer = "";
        }

        setUserAnswers(data);
    }
    
    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const answersToSend: string[] = userAnswers.map(a => a.answer);

        const endTime = (Date.now() - time) / 1000;

        (async () =>{
            await quizAPI.submitQuiz(token ?? "", quiz.id, answersToSend, endTime);
        })();
        navigate("/profile");
    }

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">
                        {quiz.quizName}
                    </h2>

                    
                    <div className="text-center text-xl font-bold mt-2">
                        Preostalo vreme: 
                        <span className={remainingTime < 60 ? "text-red-600" : "text-green-600"}>
                            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
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
                                               
                                                className={`py-2 border-2 mb-2 ml-2 mr-2 mt-2 rounded shadow cursor-pointer transition duration-300
                                                    ${userAnswers[index]?.answer === answer 
                                                        ? "bg-purple-700 border-zinc-300 shadow-xl" 
                                                        : "bg-indigo-600 hover:bg-indigo-700"}`}
                                            >
                                                <label 
                                                    htmlFor={question + answer}
                                                    className="select-none w-full py-4 text-sm font-medium px-2 block"
                                                >
                                                    {answer}
                                                </label>

                                                <input 
                                                    id={question + answer} 
                                                    type="radio" 
                                                    name={question}
                                                    value={answer}
                                                    checked={userAnswers[index]?.answer === answer}
                                                    className="hidden"
                                                    onChange={e => handleChange(index, e)}
                                                />
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

                        <div className="text-left ml-5 mt-4">
                            <button 
                                type="submit"
                                className="bg-indigo-600 rounded-2xl hover:bg-blue-900 transition duration-300 px-2 py-1 border shadow shadow-zinc-900"
                                onClick={handleSubmit}
                            >
                                Finish
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>    
    )
}