import { useEffect, useState, type ChangeEvent } from "react";
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
    const [time, setTime] = useState(0);
    const [userAnswers, setUserAnswers] = useState([{answer : ''}]);
    

    useEffect(() => {
        const quizId = parseInt(ProcitajPoKljucu("quizId") ?? "", 10);

        (async () => {
            const data = await quizAPI.startQuiz(token ?? "", quizId);
            setQuiz(data);
        })();
        if(quiz == null){
            return;
        }
        let data = [...userAnswers];
        let newAnswer = {answer: ''};
        for(let i=0; i < quiz?.questions.length; i++){
            data = [...data, newAnswer];
        }
        setUserAnswers(data);
        setTime(Date.now());
    }, [token, quizAPI]);

    if(quiz == null){
        return;
    }

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) =>{
        let data = [...userAnswers];
        if(e.target.checked){
            data[index]["answer"] = e.target.value;
            console.log(e.target.value);
        }else{
            data[index]["answer"] = ""
            console.log("");
        }
        setTime(Date.now());
        // setUserAnswers(data);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        let answersToSend: string[] = [];
        userAnswers.forEach(element => {
            answersToSend.push(element.answer);
        });
        let endTime = Date.now();
        endTime = time - endTime;
        console.log(endTime/1000) 
        console.log(answersToSend);

        (async () =>{
            await quizAPI.submitQuiz(token ?? "", quiz?.id, answersToSend, endTime/1000);
        })();
    }

    

    return(
        <div className="container bg-zinc-800 px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">{quiz?.quizName}</h2>
                </div>
                <div className="grid grid-cols-1">
                    <div className="px-2 py-2 mt-2 mb-2 border-2 rounded bg-white">
                        {quiz.questions.length > 0 ? (
                            quiz.questions.map((question, index) => (
                                <div>
                                    <h1 className="text-center mt-2 text-2xl font-bold text-blue-600">
                                        {question}
                                    </h1>
                                    <div className="grid grid-cols-2 text-left py-4">
                                        {quiz.answers[index].map((answer) => (
                                            <div className="py-2 border-2 mb-2 ml-2 mr-2 mt-2 rounded shadow bg-indigo-600 has-checked:bg-purple-500 has-checked:border-2 has-checked:border-zinc-700 hover:shadow-2xl shadow-zinc-900 focus:outline-2 transition duration-300 has-checked:shadow">
                                                <label htmlFor={question + answer}
                                                className=" select-none w-full py-4 text-sm font-medium px-2">
                                                {answer}
                                                </label>
                                                <input id={question + answer} type="radio" 
                                                name={question}
                                                value={answer}
                                                defaultChecked = {userAnswers[index].answer === answer}
                                                className="hidden"
                                                onChange={e=>handleChange(index, e)}/>

                                            </div>
                                        ))}
                                        
                                    </div>
                                </div>
                        ))):(
                            <div className="text-2xl font-extrabold text-center">
                                Quiz has no questions?
                            </div>
                        )}
                        <div className="text-left ml-5 mt-4">
                            <button 
                            type="submit"
                            className="bg-indigo-600 rounded-2xl hover:bg-blue-900 transition duration-300 px-2 py-1 border shadow shadow-zinc-900"
                            onClick={handleSubmit}>
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>    
    )
}