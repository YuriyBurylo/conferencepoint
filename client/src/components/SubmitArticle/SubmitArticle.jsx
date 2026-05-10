import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitArticle } from '../../../http/articlesAPI';
import { fetchNewConferences } from '../../../http/conferenceAPI';
import styles from './SubmitArticle.module.css';

const SECTIONS = [
    'Секція 01. Сільськогосподарські науки',
    'Секція 02. Ветеринарні науки',
    'Секція 03. Біологічні науки',
    'Секція 04. Медичні науки',
    'Секція 05. Фармацевтичні науки',
    'Секція 06. Хімічні науки',
    'Секція 07. Технічні науки',
    'Секція 08. Фізико-математичні науки',
    'Секція 09. Інформаційно-комунікаційні технології',
    'Секція 10. Транспорт та інфраструктура',
    'Секція 11. Географічні науки',
    'Секція 12. Геолого-мінералогічні науки',
    'Секція 13. Архітектура та будівництво',
    'Секція 14. Астрономія',
    'Секція 15. Освіта та педагогічні науки',
    'Секція 16. Психологічні науки',
    'Секція 17. Соціологічні науки',
    'Секція 18. Журналістика',
    'Секція 19. Мистецтвознавство та дизайн',
    'Секція 20. Історичні науки',
    'Секція 21. Культурологія',
    'Секція 22. Література',
    'Секція 23. Документознавство',
    'Секція 24. Політичні науки',
    'Секція 25. Філологічні науки',
    'Секція 26. Філософські науки',
    'Секція 27. Економічні науки та маркетинг',
    'Секція 28. Юридичні науки',
    'Секція 29. Публічне управління',
    'Секція 30. Охорона праці та безпека життєдіяльності',
];

function SubmitArticle() {
    const navigate = useNavigate();
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
            setError('Назва статті обов\'язкова');
            return;
        }
        if (step === 3 && !articleFile) {
            setError('Файл статті обов\'язковий');
            return;
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
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при відправленні');
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.submitPage}>
            <div className={styles.submitCard}>
                <div className={styles.submitHeader}>
                    <h2>Подати статтю</h2>
                    <p>Крок {step} з 4</p>
                </div>

                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formContent}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <h3>Основна інформація</h3>
                            <div className={styles.formGroup}>
                                <label>Конференція</label>
                                <select name="conference_id" value={formData.conference_id} onChange={handleChange}>
                                    <option value="">Оберіть конференцію</option>
                                    {conferences.map(c => (
                                        <option key={c.conference_id} value={c.conference_id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Назва статті *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Повна назва вашої статті"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Секція конференції</label>
                                <select name="section" value={formData.section} onChange={handleChange}>
                                    <option value="">Оберіть секцію</option>
                                    {SECTIONS.map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Індекс УДК</label>
                                <input
                                    type="text"
                                    name="udk_index"
                                    value={formData.udk_index}
                                    onChange={handleChange}
                                    placeholder="напр. 004.8"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <h3>Анотація та ключові слова</h3>
                            <div className={styles.formGroup}>
                                <label>Анотація</label>
                                <textarea
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleChange}
                                    placeholder="2-3 речення опису вашої роботи"
                                    rows={5}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ключові слова (через кому)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="напр. машинне навчання, нейронні мережі, класифікація"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <h3>Завантаження файлів</h3>
                            <div className={styles.formGroup}>
                                <label>Файл статті * (.doc, .docx, .pdf)</label>
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
                                            <span>Натисніть для вибору файлу</span>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Квитанція про оплату (необов'язково)</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        id="receipt-file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => setReceiptFile(e.target.files[0])}
                                    />
                                    <label htmlFor="receipt-file" className={styles.fileLabel}>
                                        {receiptFile ? (
                                            <span className={styles.fileName}>{receiptFile.name}</span>
                                        ) : (
                                            <span>Натисніть для вибору файлу</span>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.stepContent}>
                            <h3>Перевірка та відправлення</h3>
                            <div className={styles.reviewSection}>
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Назва:</span>
                                    <span>{formData.title}</span>
                                </div>
                                {formData.section && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Секція:</span>
                                        <span>{formData.section}</span>
                                    </div>
                                )}
                                {formData.udk_index && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>УДК:</span>
                                        <span>{formData.udk_index}</span>
                                    </div>
                                )}
                                {formData.abstract && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Анотація:</span>
                                        <span>{formData.abstract}</span>
                                    </div>
                                )}
                                {formData.keywords && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Ключові слова:</span>
                                        <span>{formData.keywords}</span>
                                    </div>
                                )}
                                <div className={styles.reviewItem}>
                                    <span className={styles.reviewLabel}>Файл:</span>
                                    <span>{articleFile?.name}</span>
                                </div>
                                {receiptFile && (
                                    <div className={styles.reviewItem}>
                                        <span className={styles.reviewLabel}>Квитанція:</span>
                                        <span>{receiptFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.stepActions}>
                    {step > 1 && (
                        <button className={styles.prevBtn} onClick={prevStep}>Назад</button>
                    )}
                    {step < 4 ? (
                        <button className={styles.nextBtn} onClick={nextStep}>Далі</button>
                    ) : (
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Відправлення...' : 'Відправити'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubmitArticle;
