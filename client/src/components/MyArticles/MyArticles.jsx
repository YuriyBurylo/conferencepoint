import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyArticles, deleteArticle, downloadArticle } from '../../../http/articlesAPI';
import styles from './MyArticles.module.css';

const STATUS_MAP = {
    'pending': { label: 'Очікує розгляду', className: 'statusPending' },
    'under_review': { label: 'На рецензії', className: 'statusReview' },
    'accepted': { label: 'Прийнято', className: 'statusAccepted' },
    'rejected': { label: 'Відхилено', className: 'statusRejected' },
    'revision_needed': { label: 'Потрібна доопрацювання', className: 'statusRevision' },
};

function MyArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadArticles = async () => {
        try {
            const data = await getMyArticles();
            setArticles(data);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю статтю?')) return;
        try {
            await deleteArticle(id);
            setArticles(articles.filter(a => a.article_id !== id));
        } catch (error) {
            alert('Помилка при видаленні статті');
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            await downloadArticle(id, fileName);
        } catch (error) {
            alert('Помилка при завантаженні файлу');
        }
    };

    if (loading) {
        return (
            <div className={styles.articlesPage}>
                <div className={styles.loading}>Завантаження...</div>
            </div>
        );
    }

    return (
        <div className={styles.articlesPage}>
            <div className={styles.header}>
                <h2>Мої статті</h2>
                <Link to="/submit-article" className={styles.submitLink}>+ Подати статтю</Link>
            </div>

            {articles.length === 0 ? (
                <div className={styles.empty}>
                    <h3>У вас ще немає поданих статей</h3>
                    <p>Подайте свою першу статтю на одну з актуальних конференцій</p>
                    <Link to="/submit-article" className={styles.submitBtn}>Подати статтю</Link>
                </div>
            ) : (
                <div className={styles.articlesList}>
                    {articles.map(article => {
                        const statusInfo = STATUS_MAP[article.status] || STATUS_MAP['pending'];
                        return (
                            <div key={article.article_id} className={styles.articleCard}>
                                <div className={styles.articleTop}>
                                    <span className={`${styles.statusBadge} ${styles[statusInfo.className]}`}>
                                        {statusInfo.label}
                                    </span>
                                    <span className={styles.date}>
                                        {new Date(article.submitted_at).toLocaleDateString('uk-UA')}
                                    </span>
                                </div>
                                <h3 className={styles.articleTitle}>{article.title}</h3>
                                {article.conference_title && (
                                    <p className={styles.conference}>{article.conference_title}</p>
                                )}
                                {article.section && (
                                    <p className={styles.section}>{article.section}</p>
                                )}
                                {article.admin_comment && (
                                    <div className={styles.adminComment}>
                                        <strong>Коментар рецензента:</strong>
                                        <p>{article.admin_comment}</p>
                                    </div>
                                )}
                                <div className={styles.articleActions}>
                                    <button
                                        className={styles.downloadBtn}
                                        onClick={() => handleDownload(article.article_id, article.file_name)}
                                    >
                                        Завантажити
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(article.article_id)}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyArticles;
