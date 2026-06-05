import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { localizePath, stripLanguageFromPath } from '../../i18n/languageDetection';
import { isPublicRoutePath } from '../../utils/seo';
import styles from './Header.module.css';

function Header() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const { language, languages, setLanguage, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024 && open) {
                setOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open]);

    const menu = [
        { section: t('nav.home'), href: '/' },
        { section: t('nav.newConferences'), href: '/newconferences' },
        { section: t('nav.archive'), href: '/pastconferences' },
        { section: t('nav.requirements'), href: '/requirements' },
        { section: t('nav.fees'), href: '/fees' },
    ];

    if (isAuthenticated) {
        menu.push({ section: t('nav.myArticles'), href: '/my-articles' });
    }

    if (isAdmin) {
        menu.push({ section: t('nav.admin'), href: '/admin' });
    }

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate('/');
    };

    const publicHref = (href) => localizePath(href, language);

    const handleLanguageChange = (event) => {
        const nextLanguage = event.target.value;
        setLanguage(nextLanguage);

        const basePath = stripLanguageFromPath(location.pathname);
        if (isPublicRoutePath(basePath)) {
            navigate(`${localizePath(basePath, nextLanguage)}${location.search}${location.hash}`);
        }
    };

    return (
        <header className={`${styles.header} ${styles.glassmorphic}`}>
            <div className={styles.headerContainer}>
                <NavLink to="/" className={styles.logoLink}>
                    <span className={styles.logoText}>CONFERENCE <span className={styles.logoAccent}>POINT</span></span>
                </NavLink>
                <nav className={open ? styles.menu_vertical : styles.menu}>
                    <ul className={open ? styles.menu_items_vertical : styles.menu_items}>
                        {menu.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={publicHref(item.href)}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) => isActive ? styles.activeLink : ''}
                                >
                                    {item.section}
                                </NavLink>
                            </li>
                        ))}
                        <li className={styles.languageSection}>
                            <label className={styles.languageLabel} htmlFor="language-select">{t('common.language')}</label>
                            <select
                                id="language-select"
                                className={styles.languageSelect}
                                value={language}
                                onChange={handleLanguageChange}
                            >
                                {languages.map(item => (
                                    <option key={item.code} value={item.code}>{item.shortLabel}</option>
                                ))}
                            </select>
                        </li>
                        <li className={styles.authSection}>
                            {isAuthenticated ? (
                                <div className={styles.userMenu}>
                                    <NavLink
                                        to="/profile"
                                        className={styles.profileLink}
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className={styles.userAvatar}>{user?.full_name?.charAt(0)?.toUpperCase()}</span>
                                    </NavLink>
                                    <button className={styles.logoutBtn} onClick={handleLogout}>{t('nav.logout')}</button>
                                </div>
                            ) : (
                                <div className={styles.authLinks}>
                                    <NavLink to="/login" className={styles.loginLink} onClick={() => setOpen(false)}>{t('nav.login')}</NavLink>
                                    <NavLink to="/register" className={styles.registerLink} onClick={() => setOpen(false)}>{t('nav.register')}</NavLink>
                                </div>
                            )}
                        </li>
                    </ul>
                </nav>
                <button className={styles.btn} onClick={() => setOpen(!open)} aria-label="Menu">
                    {open ?
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor"><g><path d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"></path></g></svg>
                        :
                        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g><rect width="48" height="48" fill="none"></rect><path d="M42,12a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path><path d="M42,24a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path><path d="M42,36a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path></g></svg>
                    }
                </button>
            </div>
        </header>
    );
}

export default Header;
