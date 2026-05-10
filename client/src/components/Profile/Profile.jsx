import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../../http/authAPI';
import styles from './Profile.module.css';

function Profile() {
    const { user, login, token } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        affiliation: '',
        scientific_degree: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                affiliation: user.affiliation || '',
                scientific_degree: user.scientific_degree || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateProfile(formData);
            login(token, { ...user, ...updated });
            setEditing(false);
            setMessage({ type: 'success', text: 'Профіль оновлено успішно' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка при оновленні' });
        }
    };

    if (!user) return null;

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        {user.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h2>{user.full_name}</h2>
                    <span className={styles.roleBadge}>{user.role === 'admin' ? 'Адміністратор' : 'Користувач'}</span>
                </div>

                {message.text && (
                    <div className={message.type === 'success' ? styles.success : styles.error}>
                        {message.text}
                    </div>
                )}

                {!editing ? (
                    <div className={styles.profileInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Повне ім'я</span>
                            <span className={styles.value}>{user.full_name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Установа</span>
                            <span className={styles.value}>{user.affiliation || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Науковий ступінь</span>
                            <span className={styles.value}>{user.scientific_degree || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Дата реєстрації</span>
                            <span className={styles.value}>{new Date(user.created_at).toLocaleDateString('uk-UA')}</span>
                        </div>
                        <button className={styles.editBtn} onClick={() => setEditing(true)}>
                            Редагувати профіль
                        </button>
                    </div>
                ) : (
                    <form className={styles.editForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Повне ім'я</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Установа</label>
                            <input
                                type="text"
                                name="affiliation"
                                value={formData.affiliation}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Науковий ступінь</label>
                            <input
                                type="text"
                                name="scientific_degree"
                                value={formData.scientific_degree}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.saveBtn}>Зберегти</button>
                            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>Скасувати</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;
