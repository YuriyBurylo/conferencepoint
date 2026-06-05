import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../../http/authAPI';
import { useLanguage } from '../../context/useLanguage';
import styles from './Admin.module.css';

function ManageUsers() {
    const { formatDate, t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setSuccess(t('admin.roleUpdated'));
            loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('admin.roleUpdateError'));
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm(t('admin.deleteUserConfirm'))) return;
        try {
            await deleteUser(userId);
            setSuccess(t('admin.userDeleted'));
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || t('admin.deleteError'));
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className={styles.adminPage}><div className={styles.loading}>{t('common.loading')}</div></div>;
    }

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>{t('admin.manageUsers')}</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder={t('admin.searchUsers')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <span className={styles.count}>{t('common.total', { count: filteredUsers.length })}</span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.name')}</th>
                            <th>Email</th>
                            <th>{t('admin.institution')}</th>
                            <th>{t('admin.role')}</th>
                            <th>{t('admin.registration')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>
                                    <div className={styles.userName}>{user.full_name}</div>
                                    {user.scientific_degree && (
                                        <div className={styles.subText}>{user.scientific_degree}</div>
                                    )}
                                </td>
                                <td>{user.email}</td>
                                <td>{user.affiliation || '—'}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                        className={`${styles.roleSelect} ${user.role === 'admin' ? styles.roleAdmin : ''}`}
                                    >
                                        <option value="user">{t('profile.user')}</option>
                                        <option value="admin">{t('profile.administrator')}</option>
                                    </select>
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                                <td>
                                    <button
                                        className={styles.deleteTableBtn}
                                        onClick={() => handleDelete(user.user_id)}
                                    >
                                        {t('common.delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr><td colSpan="7" className={styles.emptyRow}>{t('admin.noUsers')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageUsers;
