import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitArticle } from '../../../http/articlesAPI';
import { fetchNewConferences } from '../../../http/conferenceAPI';
import { useLanguage } from '../../context/useLanguage';
import styles from './SubmitArticle.module.css';

function SubmitArticle() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const sections = t('requirements.sections');
    const [step, setStep] = useState(1);
    const [conferences, setConferences] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        conference_id: '',
        title: '',
        section: '',
        udk_index: '',
        abstract: '',
        keywords: '',
    });
    const [articleFile, setArticleFile] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);

    useEffect(() => {
        fetchNewConferences().then(res => setConferences(res.data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1 && !formData.title) {
            setError(t('submit.titleRequired'));
            return;
        }
        if (step === 3) {
            if (!articleFile) {
                setError(t('submit.articleRequired'));
                return;
            }
            if (!receiptFile) {
                setError(t('submit.receiptRequired'));
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            if (formData.conference_id) data.append('conference_id', formData.conference_id);
            if (formData.section) data.append('section', formData.section);
            if (formData.udk_index) data.append('udk_index', formData.udk_index);
            if (formData.abstract) data.append('abstract', formData.abstract);
            if (formData.keywords) data.append('keywords', formData.keywords);
            data.append('article', articleFile);
            if (receiptFile) data.append('receipt', receiptFile);

            await submitArticle(data);
            navigate('/my-articles');
        } catch {
            setError(t('submit.error'));
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.submitPage}>
            <div className={styles.submitCard}>
                <div className={styles.submitHeader}>
                    <h2>{t('submit.title')}</h2>
                    <p>{t('submit.stepCounter', { step, total: 4 })}</p>
                </div>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formContent}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h3>{t('submit.basicInfo')}</h3>
                            <div className={styles.formGroup}>
                                <label>{t('submit.conference')}</label>
                                <select name="conference_id" value={formData.conference_id} onChange={handleChange}>
                                    <option value="">{t('submit.chooseConference')}</option>
                                    {conferences.map(c => (
                                        <option key={c.conference_id} value={c.conference_id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('submit.articleTitle')}</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder={t('submit.articleTitlePlaceholder')}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('submit.section')}</label>
                                <select name="section" value={formData.section} onChange={handleChange}>
                                    <option value="">{t('submit.chooseSection')}</option>
                                    {sections.map((section) => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('submit.udk')}</label>
                                <input
                                    type="text"
                                    name="udk_index"
                                    value={formData.udk_index}
                                    onChange={handleChange}
                                    placeholder={t('submit.udkPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h3>{t('submit.abstractKeywords')}</h3>
                            <div className={styles.formGroup}>
                                <label>{t('submit.abstract')}</label>
                                <textarea
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleChange}
                                    placeholder={t('submit.abstractPlaceholder')}
                                    rows={5}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('submit.keywords')}</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder={t('submit.keywordsPlaceholder')}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h3>{t('submit.files')}</h3>
                            <div className={styles.formGroup}>
                                <label>{t('submit.articleFile')}</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        id="article-file"
                                        accept=".doc,.docx,.pdf"
                                        onChange={(e) => setArticleFile(e.target.files[0])}
                                    />
                                    <label htmlFor="article-file" className={styles.fileLabel}>
                                        {articleFile ? (
                                            <span className={styles.fileName}>{articleFile.name}</span>
                                        ) : (
                                            <span>{t('submit.chooseFile')}</span>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('submit.receiptFile')}</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        id="receipt-file"
                                        accept=".pdf"
                                        onChange={(e) => setReceiptFile(e.target.files[0])}
                                    />
                                    <label htmlFor="receipt-file" className={styles.fileLabel}>
                                        {receiptFile ? (
                                            <span className={styles.fileName}>{receiptFile.name}</span>
                                        ) : (
                                            <span>{t('submit.chooseFile')}</span>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.stepContent}>
                            <h3>{t('submit.reviewSend')}</h3>
                            <div className={styles.reviewSection}>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>{t('common.title')}:</span>
                                    <span>{formData.title}</span>
                                </div>
                                {formData.section && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>{t('submit.section')}:</span>
                                        <span>{formData.section}</span>
                                    </div>
                                )}
                                {formData.udk_index && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>{t('submit.udk')}:</span>
                                        <span>{formData.udk_index}</span>
                                    </div>
                                )}
                                {formData.abstract && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>{t('submit.abstract')}:</span>
                                        <span>{formData.abstract}</span>
                                    </div>
                                )}
                                {formData.keywords && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>{t('submit.keywords')}:</span>
                                        <span>{formData.keywords}</span>
                                    </div>
                                )}
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>{t('submit.file')}</span>
                                    <span>{articleFile?.name}</span>
                                </div>
                                {receiptFile && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>{t('submit.receipt')}</span>
                                        <span>{receiptFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.stepActions}>
                    {step > 1 && (
                        <button className={styles.prevBtn} onClick={prevStep}>{t('common.back')}</button>
                    )}
                    {step < 4 ? (
                        <button className={styles.nextBtn} onClick={nextStep}>{t('common.next')}</button>
                    ) : (
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? t('submit.sending') : t('submit.send')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubmitArticle;
