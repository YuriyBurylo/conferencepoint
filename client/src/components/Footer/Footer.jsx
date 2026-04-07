import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
    const socials = [
        {platform: 'Facebook', href: 'https://www.facebook.com'},
        {platform: 'X', href: 'https://x.com'},
        {platform: 'Telegram', href: 'https://web.telegram.org'},
        {platform: 'Whatsapp', href: 'https://web.whatsapp.com'},
        {platform: 'LinkedIn', href: 'https://www.linkedin.com'},
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.socials}>
                <ul>
                    {
                        socials.map((item, index) => <li key={index}><Link to={item.href}>{item.platform}</Link></li>)
                    }
                </ul>
            </div>
            <div className={styles.contacts}>
                <p>Phone: +380974240067</p>
                <p>Email: burylojunior@gmail.com</p>
                <h5>© 2025 All rights reserved</h5>
            </div>
        </footer>
    )
}

export default Footer;