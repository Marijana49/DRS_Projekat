import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import { ProcitajPoKljucu } from "../../helpers/local_storage";

interface QuizProps{
    quizAPI : IQuizAPIService;
}

export default function Quiz({quizAPI}: QuizProps){
    const {token} = useAuth();
    const [quiz, setQuiz] = useState<QuizDTO | null>(null);

    useEffect(() => {
        const quizId = ProcitajPoKljucu("quizId");
        (async () => {
            const data = await quizAPI.startQuiz(token ?? "", parseInt(quizId ?? "", 10));
            setQuiz(data);
        })();
    }, [token, quizAPI]);

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">{quiz?.quizName}Naslov</h2>
                </div>
                <div>

                {quiz?.questions.length ?? 0 > 0 ? 
                (quiz?.questions.map(question => (
                    <div>{question}</div>
                    
                ))):(
                    <div>Pitanje</div>
                )}
                <div className="grid grid-cols-2">
                    {quiz?.answers.length ?? 0 > 0 ?(
                        quiz?.answers.map(answers => (answers.length > 0 ?
                    answers.map(answer => (
                    <p>{answer}</p>
                )):(
                    <p></p>
                )))):(
                    <div className="grid grid-cols-2">
                        <p>odgovor1</p>
                        <p>odgovor2</p>
                    </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    )
}