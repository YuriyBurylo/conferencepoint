import React, { useState, useEffect, useMemo } from 'react';
import { getAllArticles, reviewArticle, downloadArticle, downloadReceipt, downloadAllArticles } from '../../../http/articlesAPI';
import styles from './Admin.module.css';

const STATUS_OPTIONS = [
    { value: '', label: 'Всі статуси' },
    { value: 'pending', label: 'Очікує розгляду' },
    { value: 'under_review', label: 'На рецензії' },
    { value: 'accepted', label: 'Прийнято' },
    { value: 'rejected', label: 'Відхилено' },
    { value: 'revision_needed', label: 'Потрібна доопрацювання' },
];

const STATUS_CLASSES = {
    'pending': 'statusPending',
    'under_review': 'statusReview',
    'accepted': 'statusAccepted',
    'rejected': 'statusRejected',
    'revision_needed': 'statusRevision',
};

function ManageArticles() {
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

    const loadArticles = async () => {
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
    };

    useEffect(() => {
        loadArticles();
    }, [statusFilter, authorFilter, confDateFilter, subDateFilter, receiptFilter]);

    const openReview = (article) => {
        setReviewModal(article);
        setReviewData({ status: article.status, admin_comment: '' });
    };

    const handleReview = async () => {
        setError('');
        try {
            await reviewArticle(reviewModal.article_id, reviewData);
            setSuccess('Статус оновлено');
            setReviewModal(null);
            loadArticles();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при оновленні');
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            await downloadArticle(id, fileName);
        } catch (err) {
            alert('Помилка при завантаженні');
        }
    };

    const handleReceiptDownload = async (id, fileName) => {
        try {
            await downloadReceipt(id, fileName);
        } catch (err) {
            alert('Помилка при завантаженні квитанції');
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
            alert(err.response?.status === 404 ? 'Немає статей для завантаження' : 'Помилка при завантаженні');
        }
    };

    if (loading) {
        return <div className={styles.adminPage}><div className={styles.loading}>Завантаження...</div></div>;
    }

    const filteredArticles = articles.filter(a =>
        !titleFilter || a.title?.toLowerCase().includes(titleFilter.toLowerCase())
    );

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>Управління статтями</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <div className={styles.filterGroup} style={{flexWrap: 'wrap'}}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <input 
                        type="text" 
                        placeholder="Пошук за назвою статті..." 
                        value={titleFilter} 
                        onChange={(e) => setTitleFilter(e.target.value)} 
                        className={styles.searchInput}
                        style={{minWidth: '200px'}}
                    />
                    
                    <input 
                        type="text" 
                        placeholder="Пошук за автором або email..." 
                        value={authorFilter} 
                        onChange={(e) => setAuthorFilter(e.target.value)} 
                        className={styles.searchInput}
                        style={{minWidth: '200px'}}
                    />

                    <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', color: '#112D4E', whiteSpace: 'nowrap'}}>Дата конф.:</label>
                        <input 
                            type="date" 
                            value={confDateFilter} 
                            onChange={(e) => setConfDateFilter(e.target.value)} 
                            className={styles.searchInput}
                            style={{minWidth: 'auto', padding: '0.55rem'}}
                        />
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                        <label style={{fontSize: '0.85rem', color: '#112D4E', whiteSpace: 'nowrap'}}>Подання:</label>
                        <input 
                            type="date" 
                            value={subDateFilter} 
                            onChange={(e) => setSubDateFilter(e.target.value)} 
                            className={styles.searchInput}
                            style={{minWidth: 'auto', padding: '0.55rem'}}
                        />
                    </div>

                    <select value={receiptFilter} onChange={(e) => setReceiptFilter(e.target.value)}>
                        <option value="">Квитанція: Всі</option>
                        <option value="yes">Є квитанція</option>
                        <option value="no">Немає квитанції</option>
                    </select>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <span className={styles.count}>Знайдено: {filteredArticles.length}</span>
                    <button
                        className={styles.addBtn}
                        onClick={handleDownloadAll}
                        disabled={filteredArticles.length === 0}
                        style={filteredArticles.length === 0
                            ? {opacity: 0.5, cursor: 'not-allowed', background: 'linear-gradient(135deg, #155724, #28a745)'}
                            : {background: 'linear-gradient(135deg, #155724, #28a745)'}
                        }
                    >
                        ⬇ Завантажити всі ({filteredArticles.length})
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Назва</th>
                            <th>Автор</th>
                            <th>Конференція</th>
                            <th>Дата конференції</th>
                            <th>Статус</th>
                            <th>Дата подання</th>
                            <th>КВИТАНЦІЯ</th>
                            <th>Дії</th>
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
                                <td>{article.conference_date ? new Date(article.conference_date).toLocaleDateString('uk-UA') : '—'}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[STATUS_CLASSES[article.status]]}`}>
                                        {STATUS_OPTIONS.find(s => s.value === article.status)?.label || article.status}
                                    </span>
                                </td>
                                <td>{new Date(article.submitted_at).toLocaleDateString('uk-UA')}</td>
                                <td>
                                    {article.receipt_name ? (
                                        <button
                                            className={styles.downloadTableBtn}
                                            style={{background: 'rgba(255, 193, 7, 0.1)', color: '#856404'}}
                                            onClick={() => handleReceiptDownload(article.article_id, article.receipt_name)}
                                        >
                                            Завантажити
                                        </button>
                                    ) : (
                                        <span style={{color: '#999', fontSize: '0.85rem'}}>—</span>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actionBtns}>
                                        <button
                                            className={styles.reviewBtn}
                                            onClick={() => openReview(article)}
                                        >
                                            Рецензувати
                                        </button>
                                        <button
                                            className={styles.downloadTableBtn}
                                            onClick={() => handleDownload(article.article_id, article.file_name)}
                                        >
                                            Завантажити
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredArticles.length === 0 && (
                            <tr><td colSpan="9" className={styles.emptyRow}>Немає статей</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {reviewModal && (
                <div className={styles.modalOverlay} onClick={() => setReviewModal(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3>Рецензування: {reviewModal.title}</h3>
                        <p className={styles.modalAuthor}>Автор: {reviewModal.author_name} ({reviewModal.author_email})</p>

                        <div className={styles.formGroup}>
                            <label>Статус</label>
                            <select
                                value={reviewData.status}
                                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                            >
                                {STATUS_OPTIONS.filter(s => s.value).map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Коментар рецензента</label>
                            <textarea
                                value={reviewData.admin_comment}
                                onChange={(e) => setReviewData({ ...reviewData, admin_comment: e.target.value })}
                                rows={4}
                                placeholder="Залишіть коментар для автора..."
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.submitFormBtn} onClick={handleReview}>Зберегти</button>
                            <button className={styles.cancelFormBtn} onClick={() => setReviewModal(null)}>Скасувати</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageArticles;
