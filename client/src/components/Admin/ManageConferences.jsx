import React, { useState, useEffect } from 'react';
import { fetchNewConferences, fetchArchiveConferences } from '../../../http/conferenceAPI';
import { $authHost } from '../../../http/index';
import styles from './Admin.module.css';

function ManageConferences() {
    const [newConferences, setNewConferences] = useState([]);
    const [archiveConferences, setArchiveConferences] = useState([]);
    const [activeTab, setActiveTab] = useState('new');
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('new'); // 'new' or 'archive'
    const [formData, setFormData] = useState({
        conference_status: '',
        title: '',
        venue: '',
        country: '',
        timing: '',
        participants: ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadConferences = async () => {
        try {
            const [newRes, archRes] = await Promise.all([
                fetchNewConferences(),
                fetchArchiveConferences()
            ]);
            setNewConferences(newRes.data);
            setArchiveConferences(archRes.data);
        } catch (err) {
            console.error('Error loading conferences:', err);
        }
    };

    useEffect(() => {
        loadConferences();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = new FormData();
            data.append('conference_status', formData.conference_status);
            data.append('title', formData.title);
            data.append('venue', formData.venue);
            data.append('country', formData.country);
            data.append('timing', formData.timing);

            if (formType === 'new') {
                if (!file) {
                    setError('Файл листівки обов\'язковий');
                    return;
                }
                data.append('leaflet', file);
                await $authHost.post('api/newconferences', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                if (!file) {
                    setError('Файл матеріалів обов\'язковий');
                    return;
                }
                if (formData.participants) {
                    data.append('participants', formData.participants);
                }
                data.append('textpdf', file);
                await $authHost.post('api/pastconferences', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setSuccess('Конференцію створено успішно');
            setShowForm(false);
            setFormData({ conference_status: '', title: '', venue: '', country: '', timing: '', participants: '' });
            setFile(null);
            loadConferences();
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка при створенні конференції');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю конференцію?')) return;
        try {
            const endpoint = type === 'new' ? 'newconferences' : 'pastconferences';
            await $authHost.delete(`api/${endpoint}/${id}`);
            loadConferences();
            setSuccess('Конференцію видалено');
        } catch (err) {
            setError('Помилка при видаленні');
        }
    };

    const conferences = activeTab === 'new' ? newConferences : archiveConferences;

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>Управління конференціями</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'new' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        Актуальні ({newConferences.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'archive' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('archive')}
                    >
                        Архів ({archiveConferences.length})
                    </button>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setFormType(activeTab === 'new' ? 'new' : 'archive');
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? 'Скасувати' : '+ Додати конференцію'}
                </button>
            </div>

            {showForm && (
                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <h3>Нова {formType === 'new' ? 'актуальна' : 'архівна'} конференція</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Статус</label>
                            <input type="text" name="conference_status" value={formData.conference_status} onChange={handleChange} placeholder="напр. Прийом тез" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Назва</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Назва конференції" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Місце проведення</label>
                            <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="напр. Київ" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Країна</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="напр. Україна" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Дата</label>
                            <input type="date" name="timing" value={formData.timing} onChange={handleChange} required />
                        </div>
                        {formType === 'archive' && (
                            <div className={styles.formGroup}>
                                <label>Учасники (через кому)</label>
                                <input type="text" name="participants" value={formData.participants} onChange={handleChange} placeholder="Учасники" />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label>{formType === 'new' ? 'Листівка (PDF)' : 'Матеріали (PDF)'}</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitFormBtn}>Створити</button>
                </form>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Назва</th>
                            <th>Статус</th>
                            <th>Місце</th>
                            <th>Дата</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conferences.map(conf => (
                            <tr key={conf.conference_id}>
                                <td>{conf.conference_id}</td>
                                <td className={styles.titleCell}>{conf.title}</td>
                                <td>{conf.conference_status}</td>
                                <td>{conf.venue}, {conf.country}</td>
                                <td>{conf.timing?.slice(0, 10).split('-').reverse().join('.')}</td>
                                <td>
                                    <button
                                        className={styles.deleteTableBtn}
                                        onClick={() => handleDelete(conf.conference_id, activeTab)}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {conferences.length === 0 && (
                            <tr><td colSpan="6" className={styles.emptyRow}>Немає конференцій</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageConferences;
