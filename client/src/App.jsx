import React from 'react'; 
import {Navigate, Outlet, RouterProvider, createBrowserRouter, createRoutesFromElements, Route, useParams} from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Root from './components/Root/Root';
import Home from './components/Home/Home';
import NewConferences from './components/NewConferences/NewConferences';
import ArchiveConferences from './components/ArchiveConferences/ArchiveConferences';
import NewConferenceDetails from './components/NewConferenceDetails/NewConferenceDetails';
import ArchiveConferenceDetails from './components/ArchiveConferenceDetails/ArchiveConferenceDetails';
import Requirements from './components/Requirements/Requirements';
import Fees from './components/Fees/Fees';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Profile from './components/Profile/Profile';
import SubmitArticle from './components/SubmitArticle/SubmitArticle';
import MyArticles from './components/MyArticles/MyArticles';
import AdminDashboard from './components/Admin/AdminDashboard';
import ManageConferences from './components/Admin/ManageConferences';
import ManageArticles from './components/Admin/ManageArticles';
import ManageUsers from './components/Admin/ManageUsers';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { isSupportedLanguage } from './i18n/languageDetection';

function LanguageSegmentGuard() {
  const { lang } = useParams();
  return isSupportedLanguage(lang) ? <Outlet /> : <Navigate to="/" replace />;
}

const publicRoutes = () => (
  <>
    <Route index element={<Home />}/>
    <Route path="newconferences" element={<NewConferences />}/>
    <Route path="newconferences/:id" element={<NewConferenceDetails />}/>
    <Route path="pastconferences" element={<ArchiveConferences />}/>
    <Route path="pastconferences/:id" element={<ArchiveConferenceDetails />}/>
    <Route path="requirements" element={<Requirements />}/>
    <Route path="fees" element={<Fees />}/>
  </>
);

const privateRoutes = () => (
  <>
    <Route path="login" element={<Login />}/>
    <Route path="register" element={<Register />}/>
    <Route path="forgot-password" element={<ForgotPassword />}/>
    <Route path="reset-password" element={<ResetPassword />}/>
    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
    <Route path="submit-article" element={<ProtectedRoute><SubmitArticle /></ProtectedRoute>}/>
    <Route path="my-articles" element={<ProtectedRoute><MyArticles /></ProtectedRoute>}/>
    <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}/>
    <Route path="admin/conferences" element={<ProtectedRoute adminOnly><ManageConferences /></ProtectedRoute>}/>
    <Route path="admin/articles" element={<ProtectedRoute adminOnly><ManageArticles /></ProtectedRoute>}/>
    <Route path="admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>}/>
  </>
);

  const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root />}>
      {publicRoutes()}
      <Route path=":lang" element={<LanguageSegmentGuard />}>
        {publicRoutes()}
        {privateRoutes()}
      </Route>
      {privateRoutes()}
    </Route>
  ));

function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={appRouter}/>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App;
