import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import FloatingShare from '../FloatingShare/FloatingShare';
import ScienceChumsPromo from '../ScienceChumsPromo/ScienceChumsPromo';
import styles from './Root.module.css';

function Root() {
    return (
        <div className={styles.container}>
            <Header/>
            <main className={styles.main}>
                <Outlet/>
            </main>
            <ScienceChumsPromo/>
            <FloatingShare/>
            <Footer/>
        </div>
    )
}

export default Root;
