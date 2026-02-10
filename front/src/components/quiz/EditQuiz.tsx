import { useEffect, useState, type ChangeEvent } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useParams } from "react-router-dom";
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import { useSocket } from "../../hooks/useSocketHook";

interface EditQuizProps {
  quizAPI: IQuizAPIService;
}

export function EditQuiz({ quizAPI }: EditQuizProps) {
  const { token } = useAuth();
  const { quizId } = useParams();

  const [quizName, setQuizName] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", answers: [{ answer: "" }], correctAnswer: "", points: 0 },
  ]);
  const [error, setError] = useState("");
  const {socket} = useSocket();

  useEffect(() => {
    if (!quizId) return;

    (async () => {
      const data: QuizDTO = await quizAPI.getQuizForEdit(token ?? "", parseInt(quizId, 10));
      setQuizName(data.quizName);
      setDuration(data.duration.toString());

      const formattedQuestions = data.questions.map((q, i) => ({
        question: q,
        answers: data.answers[i].map(a => ({ answer: a })),
        correctAnswer: data.correctAnswers[i],
        points: data.points[i],
      }));

      setQuestions(formattedQuestions);
      setError("Wait on this page for approval");
    })();
  }, [quizId, quizAPI, token]);

  const handleQuestionChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...questions];
    const element = event.target.name;
    if (element === "points") {
      data[index][element] = parseInt(event.target.value) || 0;
    } else if(element === "question" || element === "correctAnswer"){
      data[index][element] = event.target.value;
    }
    setQuestions(data);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, event: ChangeEvent<HTMLInputElement>) => {
    const data = [...questions];
    data[qIndex].answers[aIndex].answer = event.target.value;
    setQuestions(data);
  };

  const addQuestion = () => setQuestions([...questions, { question: "", answers: [{ answer: "" }], correctAnswer: "", points: 0 }]);
  const addAnswer = (index: number) => {
    const data = [...questions];
    data[index].answers.push({ answer: "" });
    setQuestions(data);
  };
  const removeQuestion = (index: number) => questions.length > 1 && setQuestions([...questions.slice(0, index), ...questions.slice(index + 1)]);
  const removeAnswer = (qIndex: number, aIndex: number) => {
    const data = [...questions];
    data[qIndex].answers.splice(aIndex, 1);
    setQuestions(data);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionsToSend = questions.map(q => q.question);
    const answersToSend = questions.map(q => q.answers.map(a => a.answer));
    const correctAnswersToSend = questions.map(q => q.correctAnswer);
    const pointsToSend = questions.map(q => q.points);

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      setError("Duration must be a positive number");
      return;
    }

    const answer =  await quizAPI.updateQuiz(token ?? "", parseInt(quizId!, 10), {
        id: parseInt(quizId!, 10),
        quizName,
        questions: questionsToSend,
        answers: answersToSend,
        correctAnswers: correctAnswersToSend,
        points: pointsToSend,
        duration: parsedDuration,
        author: "",
      });
    setError(answer.message);
    
  };
  if(!socket)return;
    
    function handleMessage(data: {message: string}){
        setError(data.message);
    }
    
    useEffect(()=>{
        socket?.on("reject", handleMessage);
        socket?.on("accept", handleMessage);
    }, [socket]);
    


  return (
    <div className="container px-4 py-20 mx-auto max-w-screen min-h-screen bg-zinc-700">
      <div className="rounded-2xl shadow-2xl shadow-zinc-900 max-w-xl mx-auto bg-zinc-100 py-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-800">Edit Quiz</h2>
          </div>
          <form onSubmit={submitForm}>
            <div className="mb-6">
              <label className="block mb-2 font-extrabold">Quiz Name</label>
              <input type="text" value={quizName} onChange={e => setQuizName(e.target.value)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-extrabold">Duration (min)</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="border-2 rounded border-indigo-800 px-2 mb-2">
                <div className="mb-4">
                  <label className="block mb-2 font-extrabold">Question {qIndex + 1}</label>
                  <input name="question" type="text" value={q.question} onChange={e => handleQuestionChange(qIndex, e)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-extrabold">Points</label>
                  <input name="points" type="text" value={q.points} onChange={e => handleQuestionChange(qIndex, e)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-extrabold">Correct Answer</label>
                  <input name="correctAnswer" type="text" value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, e)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
                </div>

                {q.answers.map((a, aIndex) => (
                  <div key={aIndex} className="mb-2">
                    <label className="block mb-2 font-extrabold">Answer {aIndex + 1}</label>
                    <input type="text" value={a.answer} onChange={e => handleAnswerChange(qIndex, aIndex, e)} className="inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-indigo-100/70 shadow border-2 border-indigo-900 rounded" />
                    {q.answers.length > 1 && <button type="button" className="mt-2 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-800" onClick={() => removeAnswer(qIndex, aIndex)}>Remove Answer</button>}
                  </div>
                ))}

                <button type="button" className="mt-2 mb-2 py-2 px-4 bg-indigo-700 text-white rounded hover:bg-indigo-900" onClick={() => addAnswer(qIndex)}>Add Answer</button>

                {questions.length > 1 && <button type="button" className="mt-2 mb-4 py-2 px-4 bg-red-700 text-white rounded hover:bg-red-900" onClick={() => removeQuestion(qIndex)}>Remove Question</button>}
              </div>
            ))}

            <button type="button" className="mt-2 mb-4 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-800" onClick={addQuestion}>Add Question</button>
            {error && <p className="text-red-700 font-bold">{error}</p>}
            <button type="submit" className="w-full py-4 px-6 mt-4 bg-indigo-800 text-white rounded hover:bg-indigo-900 font-extrabold">Update Quiz</button>
          </form>
        </div>
      </div>
    </div>
  );
}
