import { Routes, Route, Navigate } from "react-router-dom"
import { authApi } from "./api/auth/AuthAPIService";
import RegisterPage from "./pages/auth/registracijaStraica";
import NotFoundStranica from "./pages/notFound/notFound";
import LoginPage from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { userAPI } from "./api/user/UserAPIService";
import UserDashboard from "./pages/user/userDashboard";
import AdminDashboard from "./pages/user/adminDashboard";
import ChangeUserDashboard from "./pages/user/changeUserDashboard";
import UploadProfilePicture from "./pages/user/uploadProfilePicture";
import QuizListPage from "./pages/quiz/quizListPage";
import { QuizAPI } from "./api/quiz/QuizAPIService";
import QuizPage from "./pages/quiz/quizPage";
import CreateQuizPage from "./pages/quiz/createQuizPage";
import QuizApprovalPage from "./pages/quiz/quizApprovalPage";
import EditQuizPage from "./pages/quiz/editQuizPage";
import QuizResultPage from "./pages/quiz/quizResultsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage authApi={authApi} />} />
      <Route path="/register" element={<RegisterPage authAPI={authApi}/>} />
      <Route path="/404" element={<NotFoundStranica />} />

      <Route path="/profile" element ={
          <UserDashboard />
      } />
      <Route path="/profile/edit" element={
        <ChangeUserDashboard />
      }/>
      <Route path="profile/picture" element={
        <UploadProfilePicture />
      }/>
      <Route path="/quizes" element={
        <QuizListPage quizAPI={QuizAPI}/>
      }/>
      <Route path="/quiz/play/:quizId" element={
        <QuizPage quizAPI={QuizAPI}/>
      }/>
      <Route path="/quiz/create" element={
        <ProtectedRoute requiredRole={"MODERATOR"}>
          <CreateQuizPage quizAPI={QuizAPI}/>
        </ProtectedRoute>
      }/>
      <Route path="/quiz/edit/:quizId" element={
        <ProtectedRoute requiredRole={"MODERATOR"}>
          <EditQuizPage quizAPI={QuizAPI}/>
        </ProtectedRoute>
      }/>
      <Route path="/quiz/results/:quizId" element={
        <QuizResultPage quizAPI={QuizAPI}/>
      }/>
      <Route path="/admin" element = {
          <ProtectedRoute requiredRole="ADMINISTRATOR">
            <AdminDashboard userAPI={userAPI} />
          </ProtectedRoute>
        } />
      <Route path="/admin/quiz/:quizId" element={
        <ProtectedRoute requiredRole="ADMINISTRATOR">
          <QuizApprovalPage quizAPI={QuizAPI}/>
        </ProtectedRoute>
      }/>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;