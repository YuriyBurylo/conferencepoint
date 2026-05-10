import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../../http/authAPI';
import styles from './Admin.module.css';

function ManageUsers() {
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
            setSuccess('Роль оновлено');
            loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при оновленні ролі');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цього користувача? Всі його статті також будуть видалені.')) return;
        try {
            await deleteUser(userId);
            setSuccess('Користувача видалено');
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при видаленні');
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className={styles.adminPage}><div className={styles.loading}>Завантаження...</div></div>;
    }

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>Управління користувачами</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder="Пошук за ім'ям або email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <span className={styles.count}>Всього: {filteredUsers.length}</span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ім'я</th>
                            <th>Email</th>
                            <th>Установа</th>
                            <th>Роль</th>
                            <th>Реєстрація</th>
                            <th>Дії</th>
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
                                        <option value="user">Користувач</option>
                                        <option value="admin">Адміністратор</option>
                                    </select>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString('uk-UA')}</td>
                                <td>
                                    <button
                                        className={styles.deleteTableBtn}
                                        onClick={() => handleDelete(user.user_id)}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr><td colSpan="7" className={styles.emptyRow}>Користувачів не знайдено</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageUsers;
