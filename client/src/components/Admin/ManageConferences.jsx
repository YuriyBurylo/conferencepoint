import React, { useState, useEffect, useMemo } from 'react';
import { fetchNewConferences, fetchAdminArchiveConferences, fetchNewConferenceMaterials, fetchArchiveConferenceMaterials, moveConferenceToArchive, updateArchiveConference, updateNewConference } from '../../../http/conferenceAPI';
import { $authHost } from '../../../http/index';
import { useLanguage } from '../../context/useLanguage';
import styles from './Admin.module.css';

function ManageConferences() {
    const { t } = useLanguage();
    const [newConferences, setNewConferences] = useState([]);
    const [archiveConferences, setArchiveConferences] = useState([]);
    const [activeTab, setActiveTab] = useState('new');
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState('new');
    const [editingConference, setEditingConference] = useState(null);
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
                fetchAdminArchiveConferences()
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

    const resetForm = () => {
        setFormData({ conference_status: '', title: '', venue: '', country: '', timing: '', participants: '' });
        setEditingConference(null);
        setFile(null);
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

            if (editingConference) {
                data.append('conference_id', editingConference.conference_id);
                if (formType === 'archive' && formData.participants) {
                    data.append('participants', formData.participants);
                }
                if (file) {
                    data.append(formType === 'new' ? 'leaflet' : 'textpdf', file);
                }
                if (formType === 'new') {
                    await updateNewConference(data);
                } else {
                    await updateArchiveConference(data);
                }
            } else if (formType === 'new') {
                if (!file) {
                    setError(t('admin.leafletRequired'));
                    return;
                }
                data.append('leaflet', file);
                await $authHost.post('api/newconferences', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                if (!file) {
                    setError(t('admin.materialsRequired'));
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

            setSuccess(editingConference ? t('admin.conferenceSaved') : t('admin.conferenceCreated'));
            setShowForm(false);
            resetForm();
            loadConferences();
        } catch (err) {
            setError(err.response?.data?.message || t('admin.conferenceSaveError'));
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(t('admin.deleteConferenceConfirm'))) return;
        try {
            const endpoint = type === 'new' ? 'newconferences' : 'pastconferences';
            await $authHost.delete(`api/${endpoint}/${id}`);
            loadConferences();
            setSuccess(t('admin.conferenceDeleted'));
        } catch {
            setError(t('admin.deleteError'));
        }
    };

    const handleDownload = async (id, type) => {
        try {
            if (type === 'new') {
                await fetchNewConferenceMaterials(id);
            } else {
                await fetchArchiveConferenceMaterials(id);
            }
        } catch {
            setError(t('admin.materialsDownloadError'));
        }
    };

    const handleMoveToArchive = async (id) => {
        if (!window.confirm(t('admin.moveConfirm'))) return;
        try {
            await moveConferenceToArchive(id);
            setSuccess(t('admin.movedToArchive'));
            loadConferences();
        } catch (err) {
            setError(err.response?.data?.message || t('admin.moveError'));
        }
    };

    const openEditForm = (conf, type) => {
        setFormType(type);
        setEditingConference(conf);
        setFormData({
            conference_status: conf.conference_status || '',
            title: conf.title || '',
            venue: conf.venue || '',
            country: conf.country || '',
            timing: conf.timing?.slice(0, 10) || '',
            participants: Array.isArray(conf.participants) ? conf.participants.join(', ') : ''
        });
        setFile(null);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const [nameFilter, setNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const conferences = activeTab === 'new' ? newConferences : archiveConferences;

    const filteredConferences = useMemo(() => (
        conferences.filter(conf => {
            if (nameFilter && !conf.title?.toLowerCase().includes(nameFilter.toLowerCase())) return false;
            if (statusFilter && !conf.conference_status?.toLowerCase().includes(statusFilter.toLowerCase())) return false;
            if (countryFilter && !conf.country?.toLowerCase().includes(countryFilter.toLowerCase())) return false;
            if (cityFilter && !conf.venue?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
            if (dateFilter && conf.timing?.slice(0, 10) !== dateFilter) return false;
            return true;
        })
    ), [conferences, nameFilter, statusFilter, countryFilter, cityFilter, dateFilter]);

    const formTitle = editingConference
        ? (formType === 'new' ? t('admin.editCurrentConference') : t('admin.editArchiveConference'))
        : (formType === 'new' ? t('admin.newCurrentConference') : t('admin.newArchiveConference'));

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.pageTitle}>{t('admin.manageConferences')}</h2>

            {error && <div className={styles.errorMsg}>{error}</div>}
            {success && <div className={styles.successMsg}>{success}</div>}

            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'new' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        {t('admin.current')} ({newConferences.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'archive' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('archive')}
                    >
                        {t('nav.archive')} ({archiveConferences.length})
                    </button>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setFormType(activeTab === 'new' ? 'new' : 'archive');
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? t('common.cancel') : t('admin.addConference')}
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterGroup} style={{ flexWrap: 'wrap' }}>
                    <input type="text" placeholder={t('admin.searchByTitle')} value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className={styles.searchInput} style={{ minWidth: '180px' }} />
                    <input type="text" placeholder={t('admin.statusPlaceholder')} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.searchInput} style={{ minWidth: '140px' }} />
                    <input type="text" placeholder={t('admin.cityPlaceholder')} value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={styles.searchInput} style={{ minWidth: '120px' }} />
                    <input type="text" placeholder={t('admin.countryPlaceholder')} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className={styles.searchInput} style={{ minWidth: '120px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#112D4E', whiteSpace: 'nowrap' }}>{t('common.date')}:</label>
                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={styles.searchInput} style={{ minWidth: 'auto', padding: '0.55rem' }} />
                    </div>
                </div>
                <span className={styles.count}>{t('common.found', { count: filteredConferences.length })}</span>
            </div>

            {showForm && (
                <form className={styles.createForm} onSubmit={handleSubmit}>
                    <h3>{formTitle}</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>{t('common.status')}</label>
                            <input type="text" name="conference_status" value={formData.conference_status} onChange={handleChange} placeholder={t('admin.statusExample')} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('common.title')}</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder={t('admin.conferenceTitlePlaceholder')} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('admin.place')}</label>
                            <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder={t('admin.placePlaceholder')} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('common.country')}</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder={t('admin.countryPlaceholder')} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('common.date')}</label>
                            <input type="date" name="timing" value={formData.timing} onChange={handleChange} required />
                        </div>
                        {formType === 'archive' && (
                            <div className={styles.formGroup}>
                                <label>{t('admin.participants')}</label>
                                <input type="text" name="participants" value={formData.participants} onChange={handleChange} placeholder={t('admin.participantsPlaceholder')} />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label>{formType === 'new' ? t('admin.leaflet') : t('admin.materials')}</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required={!editingConference} />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitFormBtn}>{editingConference ? t('common.save') : t('common.create')}</button>
                </form>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('common.title')}</th>
                            <th>{t('common.status')}</th>
                            <th>{t('common.city')}</th>
                            <th>{t('common.country')}</th>
                            <th>{t('common.date')}</th>
                            <th>{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredConferences.map(conf => (
                            <tr key={conf.conference_id}>
                                <td>{conf.conference_id}</td>
                                <td className={styles.titleCell}>{conf.title}</td>
                                <td>
                                    {conf.conference_status}
                                    {activeTab === 'archive' && !conf.is_published && (
                                        <div className={styles.subText}>{t('admin.draft')}</div>
                                    )}
                                </td>
                                <td>{conf.venue}</td>
                                <td>{conf.country}</td>
                                <td>{conf.timing?.slice(0, 10).split('-').reverse().join('.')}</td>
                                <td>
                                    <div className={styles.actionBtns}>
                                        {(activeTab === 'new' || conf.is_published) && (
                                            <button className={styles.downloadTableBtn} onClick={() => handleDownload(conf.conference_id, activeTab)}>
                                                {t('common.download')}
                                            </button>
                                        )}
                                        {activeTab === 'new' && (
                                            <button className={styles.reviewBtn} onClick={() => openEditForm(conf, 'new')}>
                                                {t('common.edit')}
                                            </button>
                                        )}
                                        {activeTab === 'new' && (
                                            <button className={styles.reviewBtn} onClick={() => handleMoveToArchive(conf.conference_id)}>
                                                {t('admin.moveToArchive')}
                                            </button>
                                        )}
                                        {activeTab === 'archive' && (
                                            <button className={styles.reviewBtn} onClick={() => openEditForm(conf, 'archive')}>
                                                {t('common.edit')}
                                            </button>
                                        )}
                                        <button className={styles.deleteTableBtn} onClick={() => handleDelete(conf.conference_id, activeTab)}>
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredConferences.length === 0 && (
                            <tr><td colSpan="7" className={styles.emptyRow}>{t('admin.noConferences')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageConferences;
