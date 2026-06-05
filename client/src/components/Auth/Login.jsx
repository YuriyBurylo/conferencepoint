import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../../http/authAPI';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/useLanguage';
import Seo from '../Seo/Seo';
import styles from './Auth.module.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const data = await loginUser({ email, password });
            login(data.user);
            navigate('/');
        } catch {
            setError(t('auth.loginError'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <Seo
                title={t('seo.loginTitle')}
                description={t('seo.loginDescription')}
                path="/login"
                noindex
            />
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>{t('auth.loginTitle')}</h1>
                    <p>{t('auth.loginSubtitle')}</p>
                </div>
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.formGroup}>
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="login-password">{t('common.password')}</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.passwordMin')}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? t('auth.loginLoading') : t('auth.loginButton')}
                    </button>
                </form>
                <div className={styles.authFooter}>
                    <p><Link to="/forgot-password">{t('auth.forgotPassword')}</Link></p>
                    <p>{t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
