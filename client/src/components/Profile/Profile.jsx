import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/useLanguage';
import { changePassword, updateProfile } from '../../../http/authAPI';
import styles from './Profile.module.css';

function Profile() {
    const { user, login } = useAuth();
    const { formatDate, t } = useLanguage();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        affiliation: '',
        scientific_degree: '',
        academic_title: ''
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    const startEditing = () => {
        setFormData({
            full_name: user.full_name || '',
            affiliation: user.affiliation || '',
            scientific_degree: user.scientific_degree || '',
            academic_title: user.academic_title || ''
        });
        setEditing(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateProfile(formData);
            login({ ...user, ...updated });
            setEditing(false);
            setMessage({ type: 'success', text: t('profile.updated') });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch {
            setMessage({ type: 'error', text: t('profile.updateError') });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: t('auth.passwordMismatch') });
            return;
        }

        setPasswordSubmitting(true);
        try {
            await changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            setMessage({ type: 'success', text: t('profile.passwordChanged') });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch {
            setMessage({ type: 'error', text: t('profile.passwordChangeError') });
        } finally {
            setPasswordSubmitting(false);
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
                    <span className={styles.roleBadge}>{user.role === 'admin' ? t('profile.administrator') : t('profile.user')}</span>
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
                            <span className={styles.label}>{t('profile.fullName')}</span>
                            <span className={styles.value}>{user.full_name}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>{t('profile.affiliation')}</span>
                            <span className={styles.value}>{user.affiliation || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>{t('profile.scientificDegree')}</span>
                            <span className={styles.value}>{user.scientific_degree || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>{t('profile.academicTitle')}</span>
                            <span className={styles.value}>{user.academic_title || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>{t('profile.registeredAt')}</span>
                            <span className={styles.value}>{formatDate(user.created_at)}</span>
                        </div>
                        <button className={styles.editBtn} onClick={startEditing}>
                            {t('profile.edit')}
                        </button>
                        <form className={styles.passwordSection} onSubmit={handlePasswordSubmit}>
                            <h3>{t('profile.changePassword')}</h3>
                            <div className={styles.formGroup}>
                                <label>{t('profile.currentPassword')}</label>
                                <input
                                    type="password"
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('profile.newPassword')}</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('profile.confirmNewPassword')}</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn} disabled={passwordSubmitting}>
                                {passwordSubmitting ? t('common.loading') : t('profile.changePassword')}
                            </button>
                        </form>
                    </div>
                ) : (
                    <form className={styles.editForm} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>{t('profile.fullName')}</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('profile.affiliation')}</label>
                            <input
                                type="text"
                                name="affiliation"
                                value={formData.affiliation}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('profile.scientificDegree')}</label>
                            <input
                                type="text"
                                name="scientific_degree"
                                value={formData.scientific_degree}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('profile.academicTitle')}</label>
                            <input
                                type="text"
                                name="academic_title"
                                value={formData.academic_title}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.saveBtn}>{t('common.save')}</button>
                            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>{t('common.cancel')}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;
