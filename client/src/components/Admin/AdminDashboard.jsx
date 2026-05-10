import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../../http/authAPI';
import { getAllArticles } from '../../../http/articlesAPI';
import { fetchNewConferences, fetchArchiveConferences } from '../../../http/conferenceAPI';
import styles from './Admin.module.css';

function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        newConferences: 0,
        archiveConferences: 0,
        totalArticles: 0,
        pendingArticles: 0,
        acceptedArticles: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [users, articles, newConf, archConf] = await Promise.all([
                    getAllUsers(),
                    getAllArticles(),
                    fetchNewConferences(),
                    fetchArchiveConferences()
                ]);

                setStats({
                    users: users.length,
                    newConferences: newConf.data.length,
                    archiveConferences: archConf.data.length,
                    totalArticles: articles.length,
                    pendingArticles: articles.filter(a => a.status === 'pending').length,
                    acceptedArticles: articles.filter(a => a.status === 'accepted').length
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return <div className={styles.adminPage}><div className={styles.loading}>Завантаження...</div></div>;
    }

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>Панель адміністратора</h2>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{stats.users}</div>
                    <div className={styles.statLabel}>Користувачів</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{stats.newConferences}</div>
                    <div className={styles.statLabel}>Актуальних конференцій</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{stats.archiveConferences}</div>
                    <div className={styles.statLabel}>В архіві</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{stats.totalArticles}</div>
                    <div className={styles.statLabel}>Всього статей</div>
                </div>
                <div className={`${styles.statCard} ${styles.statHighlight}`}>
                    <div className={styles.statNumber}>{stats.pendingArticles}</div>
                    <div className={styles.statLabel}>Очікують розгляду</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{stats.acceptedArticles}</div>
                    <div className={styles.statLabel}>Прийнято</div>
                </div>
            </div>

            <div className={styles.adminNav}>
                <Link to="/admin/conferences" className={styles.adminNavCard}>
                    <h3>Конференції</h3>
                    <p>Створення, редагування та управління конференціями</p>
                </Link>
                <Link to="/admin/articles" className={styles.adminNavCard}>
                    <h3>Статті</h3>
                    <p>Перегляд та рецензування поданих статей</p>
                </Link>
                <Link to="/admin/users" className={styles.adminNavCard}>
                    <h3>Користувачі</h3>
                    <p>Управління користувачами та ролями</p>
                </Link>
            </div>
        </div>
    );
}

export default AdminDashboard;
