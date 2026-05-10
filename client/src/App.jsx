import React from 'react'; 
import {RouterProvider, createBrowserRouter, createRoutesFromElements, Route} from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
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
import Profile from './components/Profile/Profile';
import SubmitArticle from './components/SubmitArticle/SubmitArticle';
import MyArticles from './components/MyArticles/MyArticles';
import AdminDashboard from './components/Admin/AdminDashboard';
import ManageConferences from './components/Admin/ManageConferences';
import ManageArticles from './components/Admin/ManageArticles';
import ManageUsers from './components/Admin/ManageUsers';
import ProtectedRoute from './components/shared/ProtectedRoute';


  const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route index element={<Home />}/>
      <Route path="newconferences" element={<NewConferences />}/>
      <Route path="newconferences/:id" element={<NewConferenceDetails />}/>
      <Route path="pastconferences" element={<ArchiveConferences />}/>
      <Route path="pastconferences/:id" element={<ArchiveConferenceDetails />}/>
      <Route path="requirements" element={<Requirements />}/>
      <Route path="fees" element={<Fees />}/>
      <Route path="login" element={<Login />}/>
      <Route path="register" element={<Register />}/>
      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
      <Route path="submit-article" element={<ProtectedRoute><SubmitArticle /></ProtectedRoute>}/>
      <Route path="my-articles" element={<ProtectedRoute><MyArticles /></ProtectedRoute>}/>
      <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}/>
      <Route path="admin/conferences" element={<ProtectedRoute adminOnly><ManageConferences /></ProtectedRoute>}/>
      <Route path="admin/articles" element={<ProtectedRoute adminOnly><ManageArticles /></ProtectedRoute>}/>
      <Route path="admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>}/>
    </Route>
  ));

function App() {

  return (
    <AuthProvider>
      <RouterProvider router={appRouter}/>
    </AuthProvider>
  )
}

export default App;
