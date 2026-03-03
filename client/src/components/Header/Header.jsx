import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const menu = [
    {section: 'Головна', href: '/'},
    {section: 'Актуальні конференції', href: 'newconferences'},
    {section: 'Архів конференцій', href: 'pastconferences'},
    {section: 'Вимоги', href: 'requirements'},
    {section: 'Оплата', href: 'fees'}
];

function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.heading}>
                <h1>CONFERENCE <span>POINT</span></h1>
                <h2>наукові конференції</h2>
            </div>
            <div className={styles.navigation}>
                <nav className={open ? styles.menu_vertical : styles.menu}>
                    <ul className={open ? styles.menu_items_vertical : styles.menu_items}>
                        {
                            menu.map((item, index) => <li key={index}><NavLink to={item.href}>{item.section}</NavLink></li>)
                        }
                    </ul>
                </nav>
                <button className={styles.btn} onClick = {() => setOpen(!open)}>
                    {open ? 
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#DBE2EF" stroke="#DBE2EF"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"></path></g></svg>
                        :
                        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#DBE2EF"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>menu-hamburger</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" dataName="icons Q2"> <g> <path d="M42,12a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path> <path d="M42,24a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path> <path d="M42,36a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2H6a2,2,0,0,1,2-2H40a2,2,0,0,1,2,2Z"></path> </g> </g> </g> </g></svg>
                    }
                       
                </button>
            </div>
        </header>
    )
}

export default Header;