import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../../http/authAPI';
import { useLanguage } from '../../context/useLanguage';
import Seo from '../Seo/Seo';
import styles from './Auth.module.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: t('auth.passwordMismatch') });
            return;
        }

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await resetPassword({ token, password });
            setMessage({ type: 'success', text: t('auth.resetPasswordSuccess') });
            setTimeout(() => navigate('/login'), 1200);
        } catch {
            setMessage({ type: 'error', text: t('auth.resetPasswordError') });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <Seo
                title={t('seo.resetPasswordTitle')}
                description={t('seo.resetPasswordDescription')}
                path="/reset-password"
                noindex
            />
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>{t('auth.resetPasswordTitle')}</h1>
                    <p>{t('auth.resetPasswordSubtitle')}</p>
                </div>
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {message.text && (
                        <div className={message.type === 'success' ? styles.success : styles.error}>
                            {message.text}
                        </div>
                    )}
                    {!token && <div className={styles.error}>{t('auth.resetMissingToken')}</div>}
                    <div className={styles.formGroup}>
                        <label htmlFor="reset-password">{t('common.password')}</label>
                        <input
                            id="reset-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.passwordMin')}
                            required
                            disabled={!token}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reset-confirm">{t('auth.confirmPassword')}</label>
                        <input
                            id="reset-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('auth.repeatPassword')}
                            required
                            disabled={!token}
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={submitting || !token}>
                        {submitting ? t('common.loading') : t('auth.resetPasswordButton')}
                    </button>
                </form>
                <div className={styles.authFooter}>
                    <p><Link to="/login">{t('auth.backToLogin')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
