import React from 'react'; 
import {RouterProvider, createBrowserRouter, createRoutesFromElements, Route} from 'react-router-dom';
import './App.css';
import Root from './components/Root/Root';
import Home from './components/Home/Home';
import NewConferences from './components/NewConferences/NewConferences';
import ArchiveConferences from './components/ArchiveConferences/ArchiveConferences';
import NewConferenceDetails from './components/NewConferenceDetails/NewConferenceDetails';
import ArchiveConferenceDetails from './components/ArchiveConferenceDetails/ArchiveConferenceDetails';
import Requirements from './components/Requirements/Requirements';
import Fees from './components/Fees/Fees';


  const appRouter = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route index element={<Home />}/>
      <Route path="newconferences" element={<NewConferences />}/>
      <Route path="newconferences/:id" element={<NewConferenceDetails />}/>
      <Route path="pastconferences" element={<ArchiveConferences />}/>
      <Route path="pastconferences/:id" element={<ArchiveConferenceDetails />}/>
      <Route path="requirements" element={<Requirements />}/>
      <Route path="fees" element={<Fees /> }/>
    </Route>
  ));

function App() {

  return (
    <>
      <RouterProvider router={appRouter}/>
    </>
  )
}

export default App;
