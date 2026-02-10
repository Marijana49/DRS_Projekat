import React, { useState, type ChangeEvent } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";

interface CreateQuizProps{
    quizAPI: IQuizAPIService
}

export function CreateQuiz({quizAPI}: CreateQuizProps){
    const {token} = useAuth();
    const [quizName, setQuizName] = useState("");
    const [questions, setQuestions] = useState([{
        question: '',
        answers: [{answer: ''}],
        correctAnswer: '', 
        points: 0
    }]);
    const [duration, setDuration] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleQuestionChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        let data = [...questions]; 
        let element = event.target.name;
        if(element === "points") {
            data[index][element] = parseInt(event.target.value) || 0;
        } else if(element === "question" || element === "correctAnswer") {
            data[index][element] = event.target.value;
        }
        setQuestions(data);
    }

    const handleAnswerChange = (index: number, index2: number, event: ChangeEvent<HTMLInputElement>) => {
        let data = [...questions];
        let data2 = data[index]["answers"];
        data2[index2]["answer"] = event.target.value;
        data[index]["answers"] = data2;
        
        setQuestions(data);
    }
    const addQuestion = () => {
        let newQuestion = {
        question: '',
        answers: [{answer: ''}],
        correctAnswer: '', 
        points: 0};

        setQuestions([...questions, newQuestion]);
    }

    const addAnswers = (index: number) => {
        let newAnswer = {
            answer: ''
        }
        
        let data = [...questions];
        let data2 = [...data[index]["answers"], newAnswer];
        data[index]["answers"] = data2;
        setQuestions(data);

    }

    const removeQuestion = (index: number) => {
        if(questions.length > 1){

            let data = [...questions];
            data.splice(index, 1);
            setQuestions(data);
        }
    }

    const removeAnswer = (index: number, index2: number) => {
        let data = [...questions];
        data[index]["answers"].splice(index2, 1);

        setQuestions(data);
    }

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        // console.log(questions);
        let questionsToSend: string[] = [];
        let answersToSend: string[][] = [];
        let correctAnswersToSend: string[] = [];
        let pointsToSend: number[] = [];

        questions.forEach(question => {
            questionsToSend.push(question.question);
            correctAnswersToSend.push(question.correctAnswer);
            pointsToSend.push(question.points);

            let questionAnswers: string[] = []
            question.answers.forEach(answer => {
                questionAnswers.push(answer.answer);
                
            });
            answersToSend.push(questionAnswers);
        });
        
        const parsedDuration = parseInt(duration, 10);
        if(isNaN(parsedDuration)){
            setError("Duration must be a number");
        }else if(parsedDuration <= 0){
            setError("Duration must be a positive number");
        }

        const answer = await quizAPI.createQuiz(token ?? "", quizName, questionsToSend, answersToSend, pointsToSend, correctAnswersToSend, parsedDuration);
        setError(answer.message + ", don't leave the page to wait for approval");
        if(!answer.success){
            setError(answer.message);
            setQuizName("");
            setDuration("");
            setQuestions([{
                question: '',
                answers: [{answer: ''}],
                correctAnswer: '', 
                points: 0
            }]);
        }
        console.log(answer.data);
        navigate(`/quiz/edit/${answer.data}`);
    };
    

    return(
    <div className="container px-4 py-20 mx-auto max-w-screen min-h-screen bg-zinc-700">
            <div className="rounded-2xl shadow-2xl shadow-zinc-900 max-w-xl mx-auto bg-zinc-100 py-6">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-800">Create a quiz</h2>
                </div>
            <form onSubmit={submitForm}>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Name</label>
                    <input
                        type="text"
                        placeholder="Name your quiz"
                        value={quizName}
                        onChange={(e)=> setQuizName(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-extrabold">Duration</label>
                    <input
                        type="text"
                        placeholder="Number"
                        value={duration}
                        onChange={(e)=> setDuration(e.target.value)}
                        className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                        />
                </div>
                
                {questions.map((input, index) => {return(
                    <div className="border-2 rounded border-indigo-800 max-w-lg px-2 mb-2" key={index}>
                        <div className="mb-6">
                            <label className="block mb-2 font-extrabold">Question {index+1}</label>
                            <input
                                name="question"
                                type="text"
                                placeholder="Question"
                                value={input.question}
                                onChange={(e)=> handleQuestionChange(index, e)}
                                className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                                />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 font-extrabold">Points</label>
                            <input
                                name="points"
                                type="text"
                                placeholder="0"
                                value={input.points}
                                onChange={(e) => handleQuestionChange(index, e)}
                                className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                                />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 font-extrabold">Correct Answer</label>
                            <input
                                name="correctAnswer"
                                type="text"
                                placeholder="Correct.."
                                value={input.correctAnswer}
                                onChange={(e)=> handleQuestionChange(index, e)}
                                className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                                />
                        </div>
                        {input.answers.map((input2, index2) => {return(
                            <div className="" key={index2}>
                                    <label className="block mb-2 font-extrabold">Other Answer {index2 + 1}</label>
                                    <input
                                    name="answer"
                                    type="text"
                                    placeholder="Answer"
                                    value={input2.answer}
                                    onChange={e => handleAnswerChange(index, index2, e)}
                                    className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded"
                                    />
                                    {input.answers.length > 1 ? (

                                        <button type="button" className="inline-block w-small mt-2 py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500 mb-4" onClick={() => removeAnswer(index, index2)}>
                                        Remove
                                    </button>
                                    ):(
                                        <div></div>
                                    )}
                                </div>
        
                        )})}
                        <div className="text-center justify-center items-center">
                            <button type="button" className=" inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500 mb-2 mt-2" onClick={() => addAnswers(index)}> 
                                Add Answer 
                            </button>
                        </div>
                        {questions.length > 1 ? (
                            <button type="button" className="mt-2 inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500 mb-4" onClick={() => removeQuestion(index)}>
                            Remove
                            </button>
                        ):(
                            <div></div>
                        )}
                    </div>
                )})}
                    
                <button type="button" className="inline-block w-small py-2 px-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-700 shadow rounded hover:bg-indigo-900 transition duration-500" onClick={addQuestion}> Add Question </button>
                
                
                <div className="flex flex-wrap -mx-4 mb-6 items-center justify-between">
                    <div className="w-full lg:w-auto px-4 mb-4 lg:mb-0">
                        {error && <p className="font-extrabold text-rose-700">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="inline-block w-full py-4 px-6 mb-6 mt-2 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-3 border-indigo-900 shadow rounded transition duration-500">
                        Save quiz
                    </button>
                </div>
            </form>
            </div>
            </div>
        </div>
    );

}