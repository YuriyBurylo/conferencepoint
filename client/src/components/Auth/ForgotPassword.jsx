import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../../http/authAPI';
import { useLanguage } from '../../context/useLanguage';
import Seo from '../Seo/Seo';
import styles from './Auth.module.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resetLink, setResetLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setResetLink('');
        setSubmitting(true);

        try {
            const data = await requestPasswordReset({ email });
            setMessage({ type: 'success', text: data.message || t('auth.resetRequested') });
            setResetLink(data.reset_url || '');
        } catch {
            setMessage({ type: 'error', text: t('auth.resetPasswordError') });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <Seo
                title={t('seo.forgotPasswordTitle')}
                description={t('seo.forgotPasswordDescription')}
                path="/forgot-password"
                noindex
            />
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>{t('auth.forgotPasswordTitle')}</h1>
                    <p>{t('auth.forgotPasswordSubtitle')}</p>
                </div>
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {message.text && (
                        <div className={message.type === 'success' ? styles.success : styles.error}>
                            {message.text}
                        </div>
                    )}
                    {resetLink && (
                        <div className={styles.resetBox}>
                            <a href={resetLink}>{t('auth.openResetLink')}</a>
                        </div>
                    )}
                    <div className={styles.formGroup}>
                        <label htmlFor="forgot-email">Email</label>
                        <input
                            id="forgot-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? t('common.loading') : t('auth.requestResetButton')}
                    </button>
                </form>
                <div className={styles.authFooter}>
                    <p><Link to="/login">{t('auth.backToLogin')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
