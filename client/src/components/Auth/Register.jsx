import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../../http/authAPI';
import { useAuth } from '../../context/AuthContext';
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Паролі не співпадають');
            return;
        }

        if (formData.password.length < 6) {
            setError('Пароль має бути мінімум 6 символів');
            return;
        }

        setSubmitting(true);

        try {
            const { confirmPassword, ...submitData } = formData;
            const data = await registerUser(submitData);
            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при реєстрації');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h2>Реєстрація</h2>
                    <p>Створіть обліковий запис для участі в конференціях</p>
                </div>
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-name">Повне ім'я *</label>
                        <input
                            id="reg-name"
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Петренко Андрій Васильович"
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
                            <label htmlFor="reg-password">Пароль *</label>
                            <input
                                id="reg-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Мінімум 6 символів"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="reg-confirm">Підтвердіть пароль *</label>
                            <input
                                id="reg-confirm"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Повторіть пароль"
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-affiliation">Установа / Університет</label>
                        <input
                            id="reg-affiliation"
                            type="text"
                            name="affiliation"
                            value={formData.affiliation}
                            onChange={handleChange}
                            placeholder="Назва установи"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-degree">Науковий ступінь</label>
                        <input
                            id="reg-degree"
                            type="text"
                            name="scientific_degree"
                            value={formData.scientific_degree}
                            onChange={handleChange}
                            placeholder="напр. к.т.н., д.е.н."
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-title">Вчене звання</label>
                        <input
                            id="reg-title"
                            type="text"
                            name="academic_title"
                            value={formData.academic_title}
                            onChange={handleChange}
                            placeholder="напр. доцент, професор"
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? 'Завантаження...' : 'Зареєструватися'}
                    </button>
                </form>
                <div className={styles.authFooter}>
                    <p>Вже маєте обліковий запис? <Link to="/login">Увійти</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
