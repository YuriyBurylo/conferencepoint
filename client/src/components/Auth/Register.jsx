import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../../http/authAPI';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/useLanguage';
import Seo from '../Seo/Seo';
import styles from './Auth.module.css';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        affiliation: '',
        scientific_degree: '',
        academic_title: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }

        if (formData.password.length < 10) {
            setError(t('auth.passwordTooShort'));
            return;
        }

        if (!/[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(formData.password) || !/\d/.test(formData.password)) {
            setError(t('auth.passwordWeak'));
            return;
        }

        setSubmitting(true);

        try {
            const submitData = { ...formData };
            delete submitData.confirmPassword;
            const data = await registerUser(submitData);
            login(data.user);
            navigate('/');
        } catch {
            setError(t('auth.registerError'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <Seo
                title={t('seo.registerTitle')}
                description={t('seo.registerDescription')}
                path="/register"
                noindex
            />
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>{t('auth.registerTitle')}</h1>
                    <p>{t('auth.registerSubtitle')}</p>
                </div>
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-name">{t('auth.fullName')}</label>
                        <input
                            id="reg-name"
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder={t('auth.fullNamePlaceholder')}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-email">Email *</label>
                        <input
                            id="reg-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="reg-password">{t('common.password')} *</label>
                            <input
                                id="reg-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('auth.passwordMin')}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="reg-confirm">{t('auth.confirmPassword')}</label>
                            <input
                                id="reg-confirm"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={t('auth.repeatPassword')}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-affiliation">{t('auth.affiliation')}</label>
                        <input
                            id="reg-affiliation"
                            type="text"
                            name="affiliation"
                            value={formData.affiliation}
                            onChange={handleChange}
                            placeholder={t('auth.affiliationPlaceholder')}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-degree">{t('auth.scientificDegree')}</label>
                        <input
                            id="reg-degree"
                            type="text"
                            name="scientific_degree"
                            value={formData.scientific_degree}
                            onChange={handleChange}
                            placeholder={t('auth.scientificDegreePlaceholder')}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-title">{t('auth.academicTitle')}</label>
                        <input
                            id="reg-title"
                            type="text"
                            name="academic_title"
                            value={formData.academic_title}
                            onChange={handleChange}
                            placeholder={t('auth.academicTitlePlaceholder')}
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? t('auth.loginLoading') : t('auth.registerButton')}
                    </button>
                </form>
                <div className={styles.authFooter}>
                    <p>{t('auth.haveAccount')} <Link to="/login">{t('nav.login')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
