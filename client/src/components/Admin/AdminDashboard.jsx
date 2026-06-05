import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../../http/authAPI';
import { getAllArticles } from '../../../http/articlesAPI';
import { fetchNewConferences, fetchArchiveConferences } from '../../../http/conferenceAPI';
import { useLanguage } from '../../context/useLanguage';
import styles from './Admin.module.css';

function AdminDashboard() {
    const { t } = useLanguage();
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
        return <div className={styles.adminPage}><div className={styles.loading}>{t('common.loading')}</div></div>;
    }

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>{t('admin.dashboardTitle')}</h2>

            <div className={styles.statsGrid}>
                {[
                    ['users', t('admin.users')],
                    ['newConferences', t('admin.currentConferences')],
                    ['archiveConferences', t('admin.inArchive')],
                    ['totalArticles', t('admin.totalArticles')],
                    ['pendingArticles', t('admin.pendingArticles')],
                    ['acceptedArticles', t('admin.acceptedArticles')]
                ].map(([key, label]) => (
                    <div className={`${styles.statCard} ${key === 'pendingArticles' ? styles.statHighlight : ''}`} key={key}>
                        <div className={styles.statNumber}>{stats[key]}</div>
                        <div className={styles.statLabel}>{label}</div>
                    </div>
                ))}
            </div>

            <div className={styles.adminNav}>
                <Link to="/admin/conferences" className={styles.adminNavCard}>
                    <h3>{t('admin.conferencesTitle')}</h3>
                    <p>{t('admin.conferencesText')}</p>
                </Link>
                <Link to="/admin/articles" className={styles.adminNavCard}>
                    <h3>{t('admin.articlesTitle')}</h3>
                    <p>{t('admin.articlesText')}</p>
                </Link>
                <Link to="/admin/users" className={styles.adminNavCard}>
                    <h3>{t('admin.usersTitle')}</h3>
                    <p>{t('admin.usersText')}</p>
                </Link>
            </div>
        </div>
    );
}

export default AdminDashboard;
