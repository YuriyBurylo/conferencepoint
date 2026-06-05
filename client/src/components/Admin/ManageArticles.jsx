import React, { useState, useEffect, useCallback } from 'react';
import { getAllArticles, reviewArticle, downloadArticle, downloadReceipt, downloadAllArticles } from '../../../http/articlesAPI';
import { useLanguage } from '../../context/useLanguage';
import styles from './Admin.module.css';

const STATUS_VALUES = ['', 'pending', 'under_review', 'accepted', 'rejected', 'revision_needed'];

const STATUS_CLASSES = {
    pending: 'statusPending',
    under_review: 'statusReview',
    accepted: 'statusAccepted',
    rejected: 'statusRejected',
    revision_needed: 'statusRevision',
};

function ManageArticles() {
    const { formatDate, t } = useLanguage();
    const statusOptions = STATUS_VALUES.map(value => ({
        value,
        label: value ? t(`status.${value}`) : t('status.all')
    }));
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [confDateFilter, setConfDateFilter] = useState('');
    const [subDateFilter, setSubDateFilter] = useState('');
    const [receiptFilter, setReceiptFilter] = useState('');
    const [titleFilter, setTitleFilter] = useState('');
    const [reviewModal, setReviewModal] = useState(null);
    const [reviewData, setReviewData] = useState({ status: '', admin_comment: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadArticles = useCallback(async () => {
        try {
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (authorFilter) filters.author = authorFilter;
            if (confDateFilter) filters.conference_date = confDateFilter;
            if (subDateFilter) filters.submission_date = subDateFilter;
            if (receiptFilter) filters.has_receipt = receiptFilter;
            const data = await getAllArticles(filters);
            setArticles(data);
        } catch (err) {
            console.error('Error loading articles:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, authorFilter, confDateFilter, subDateFilter, receiptFilter]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const openReview = (article) => {
        setReviewModal(article);
        setReviewData({ status: article.status, admin_comment: '' });
    };

    const handleReview = async () => {
        setError('');
        try {
            await reviewArticle(reviewModal.article_id, reviewData);
            setSuccess(t('admin.statusUpdated'));
            setReviewModal(null);
            loadArticles();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('admin.statusUpdateError'));
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            await downloadArticle(id, fileName);
        } catch {
            alert(t('admin.downloadError'));
        }
    };

    const handleReceiptDownload = async (id, fileName) => {
        try {
            await downloadReceipt(id, fileName);
        } catch {
            alert(t('admin.receiptDownloadError'));
        }
    };

    const handleDownloadAll = async () => {
        try {
            const filters = {};
            if (statusFilter) filters.status = statusFilter;
            if (authorFilter) filters.author = authorFilter;
            if (confDateFilter) filters.conference_date = confDateFilter;
            if (subDateFilter) filters.submission_date = subDateFilter;
            if (receiptFilter) filters.has_receipt = receiptFilter;
            await downloadAllArticles(filters);
        } catch (err) {
            alert(err.response?.status === 404 ? t('admin.noArticlesToDownload') : t('admin.downloadError'));
        }
    };

    if (loading) {
        return <div className={styles.adminPage}><div className={styles.loading}>{t('common.loading')}</div></div>;
    }

    const filteredArticles = articles.filter(a =>
        !titleFilter || a.title?.toLowerCase().includes(titleFilter.toLowerCase())
    );

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>{t('admin.manageArticles')}</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <div className={styles.filterGroup} style={{ flexWrap: 'wrap' }}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder={t('admin.searchTitle')}
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                        className={styles.searchInput}
                        style={{ minWidth: '200px' }}
                    />

                    <input
                        type="text"
                        placeholder={t('admin.searchAuthor')}
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        className={styles.searchInput}
                        style={{ minWidth: '200px' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#112D4E', whiteSpace: 'nowrap' }}>{t('admin.conferenceDateShort')}</label>
                        <input
                            type="date"
                            value={confDateFilter}
                            onChange={(e) => setConfDateFilter(e.target.value)}
                            className={styles.searchInput}
                            style={{ minWidth: 'auto', padding: '0.55rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#112D4E', whiteSpace: 'nowrap' }}>{t('admin.submissionDate')}</label>
                        <input
                            type="date"
                            value={subDateFilter}
                            onChange={(e) => setSubDateFilter(e.target.value)}
                            className={styles.searchInput}
                            style={{ minWidth: 'auto', padding: '0.55rem' }}
                        />
                    </div>

                    <select value={receiptFilter} onChange={(e) => setReceiptFilter(e.target.value)}>
                        <option value="">{t('admin.receiptAll')}</option>
                        <option value="yes">{t('admin.hasReceipt')}</option>
                        <option value="no">{t('admin.noReceipt')}</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={styles.count}>{t('common.found', { count: filteredArticles.length })}</span>
                    <button
                        className={styles.addBtn}
                        onClick={handleDownloadAll}
                        disabled={filteredArticles.length === 0}
                        style={filteredArticles.length === 0
                            ? { opacity: 0.5, cursor: 'not-allowed', background: 'linear-gradient(135deg, #155724, #28a745)' }
                            : { background: 'linear-gradient(135deg, #155724, #28a745)' }
                        }
                    >
                        ↓ {t('admin.downloadAll', { count: filteredArticles.length })}
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.articleName')}</th>
                            <th>{t('admin.author')}</th>
                            <th>{t('admin.conference')}</th>
                            <th>{t('admin.conferenceDate')}</th>
                            <th>{t('common.status')}</th>
                            <th>{t('admin.submittedAt')}</th>
                            <th>{t('admin.receipt')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map(article => (
                            <tr key={article.article_id}>
                                <td>{article.article_id}</td>
                                <td className={styles.titleCell}>{article.title}</td>
                                <td>
                                    <div>{article.author_name}</div>
                                    <div className={styles.subText}>{article.author_email}</div>
                                </td>
                                <td>{article.conference_title || '—'}</td>
                                <td>{article.conference_date ? formatDate(article.conference_date) : '—'}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[STATUS_CLASSES[article.status]]}`}>
                                        {t(`status.${article.status}`)}
                                    </span>
                                </td>
                                <td>{formatDate(article.submitted_at)}</td>
                                <td>
                                    {article.receipt_name ? (
                                        <button
                                            className={styles.downloadTableBtn}
                                            style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#856404' }}
                                            onClick={() => handleReceiptDownload(article.article_id, article.receipt_name)}
                                        >
                                            {t('common.download')}
                                        </button>
                                    ) : (
                                        <span style={{ color: '#999', fontSize: '0.85rem' }}>—</span>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actionBtns}>
                                        <button
                                            className={styles.reviewBtn}
                                            onClick={() => openReview(article)}
                                        >
                                            {t('common.review')}
                                        </button>
                                        <button
                                            className={styles.downloadTableBtn}
                                            onClick={() => handleDownload(article.article_id, article.file_name)}
                                        >
                                            {t('common.download')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredArticles.length === 0 && (
                            <tr><td colSpan="9" className={styles.emptyRow}>{t('admin.noArticles')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {reviewModal && (
                <div className={styles.modalOverlay} onClick={() => setReviewModal(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('admin.reviewTitle', { title: reviewModal.title })}</h3>
                        <p className={styles.modalAuthor}>{t('admin.reviewAuthor', { name: reviewModal.author_name, email: reviewModal.author_email })}</p>

                        <div className={styles.formGroup}>
                            <label>{t('common.status')}</label>
                            <select
                                value={reviewData.status}
                                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                            >
                                {statusOptions.filter(s => s.value).map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('admin.reviewComment')}</label>
                            <textarea
                                value={reviewData.admin_comment}
                                onChange={(e) => setReviewData({ ...reviewData, admin_comment: e.target.value })}
                                rows={4}
                                placeholder={t('admin.reviewPlaceholder')}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.submitFormBtn} onClick={handleReview}>{t('common.save')}</button>
                            <button className={styles.cancelFormBtn} onClick={() => setReviewModal(null)}>{t('common.cancel')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageArticles;
