import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyArticles, deleteArticle, downloadArticle } from '../../../http/articlesAPI';
import { useLanguage } from '../../context/useLanguage';
import styles from './MyArticles.module.css';

const STATUS_CLASSES = {
    pending: 'statusPending',
    under_review: 'statusReview',
    accepted: 'statusAccepted',
    rejected: 'statusRejected',
    revision_needed: 'statusRevision',
};

function MyArticles() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { formatDate, t } = useLanguage();

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
        if (!window.confirm(t('articles.deleteConfirm'))) return;
        try {
            await deleteArticle(id);
            setArticles(articles.filter(a => a.article_id !== id));
        } catch {
            alert(t('articles.deleteError'));
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            await downloadArticle(id, fileName);
        } catch {
            alert(t('articles.downloadError'));
        }
    };

    if (loading) {
        return (
            <div className={styles.articlesPage}>
                <div className={styles.loading}>{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className={styles.articlesPage}>
            <div className={styles.header}>
                <h2>{t('articles.myTitle')}</h2>
                <Link to="/submit-article" className={styles.submitLink}>{t('articles.submitNew')}</Link>
            </div>

            {articles.length === 0 ? (
                <div className={styles.empty}>
                    <h3>{t('articles.emptyTitle')}</h3>
                    <p>{t('articles.emptyText')}</p>
                    <Link to="/submit-article" className={styles.submitBtn}>{t('articles.submitButton')}</Link>
                </div>
            ) : (
                <div className={styles.articlesList}>
                    {articles.map(article => (
                        <div key={article.article_id} className={styles.articleCard}>
                            <div className={styles.articleTop}>
                                <span className={`${styles.statusBadge} ${styles[STATUS_CLASSES[article.status] || STATUS_CLASSES.pending]}`}>
                                    {t(`status.${article.status}`)}
                                </span>
                                <span className={styles.date}>
                                    {formatDate(article.submitted_at)}
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
                                    <strong>{t('articles.reviewerComment')}</strong>
                                    <p>{article.admin_comment}</p>
                                </div>
                            )}
                            <div className={styles.articleActions}>
                                <button
                                    className={styles.downloadBtn}
                                    onClick={() => handleDownload(article.article_id, article.file_name)}
                                >
                                    {t('common.download')}
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(article.article_id)}
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyArticles;
