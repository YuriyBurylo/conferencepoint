import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './Root.module.css';

function Root() {
    return (
        <div className="container">
            <Header/>
            <Outlet/>
            <Footer/>
        </div>
    )
}

export default Root;