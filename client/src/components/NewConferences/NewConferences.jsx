import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './NewConferences.module.css';
import { fetchNewConferences, getNewConferenceMaterialsUrl } from '../../../http/conferenceAPI';
import { buildConferenceShareUrl, buildShareTargets } from '../../utils/shareConference';
import { buildBreadcrumbJsonLd, buildConferenceItemListJsonLd } from '../../utils/seo';
import ShareIcon from '../ShareIcon/ShareIcon';
import Seo from '../Seo/Seo';
import { useLanguage } from '../../context/useLanguage';
import { localizePath } from '../../i18n/languageDetection';

function NewConferences() {
    const [conferenceList, setConferenceList] = useState([]);
    const [openShare, setOpenShare] = useState(null);
    const shareMenuRef = useRef(null);
    const shareTriggerRef = useRef(null);
    const { language, t } = useLanguage();
    const localizedPath = (path) => localizePath(path, language);

    useEffect(() => {
        fetchNewConferences().then(response => setConferenceList(response.data));
    }, []);

    useEffect(() => {
        if (!openShare) return undefined;

        const handleDocumentPointerDown = (event) => {
            const isInsideMenu = shareMenuRef.current?.contains(event.target);
            const isInsideTrigger = shareTriggerRef.current?.contains(event.target);
            if (!isInsideMenu && !isInsideTrigger) {
                setOpenShare(null);
            }
        };

        document.addEventListener('pointerdown', handleDocumentPointerDown);
        return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
    }, [openShare]);

    const getShareTargets = (item) => buildShareTargets({
        title: item.title,
        url: buildConferenceShareUrl('new', item.conference_id)
    });

    const selectedShareConference = conferenceList.find(item => item.conference_id === openShare?.id);

    const toggleShareMenu = (event, conferenceId) => {
        if (openShare?.id === conferenceId) {
            setOpenShare(null);
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const safeTop = 86;
        const safeBottom = 24;
        const gap = 8;
        const menuWidth = 180;
        const spaceBelow = window.innerHeight - rect.bottom - safeBottom - gap;
        const spaceAbove = rect.top - safeTop - gap;
        const direction = spaceBelow >= 260 || spaceBelow >= spaceAbove ? 'down' : 'up';

        setOpenShare({
            id: conferenceId,
            style: {
                left: `${Math.min(Math.max(14, rect.right - menuWidth), window.innerWidth - menuWidth - 14)}px`,
                ...(direction === 'down'
                    ? { top: `${rect.bottom + gap}px`, maxHeight: `${Math.max(180, spaceBelow)}px` }
                    : { bottom: `${window.innerHeight - rect.top + gap}px`, maxHeight: `${Math.max(180, spaceAbove)}px` })
            }
        });
    };

    return (
        <div className={styles.conferences}>
            <Seo
                title={t('seo.newTitle')}
                description={t('seo.newDescription')}
                path="/newconferences"
                jsonLd={[
                    buildBreadcrumbJsonLd([
                        { name: t('nav.home'), path: localizedPath('/') },
                        { name: t('nav.newConferences'), path: localizedPath('/newconferences') }
                    ]),
                    buildConferenceItemListJsonLd({ conferences: conferenceList, pathPrefix: localizedPath('/newconferences') })
                ]}
            />
            <h1 className={styles.heading}>{t('new.heading')}</h1>
            <ul>
                {conferenceList.map((item) => (
                    <li className={styles.conference} key={item.conference_id}>
                        <div className={styles.time}>{item.timing.slice(0, 10).split('-').reverse().join('.')}</div>
                        <div className={styles.status}>{item.conference_status}</div>
                        <Link className={styles.title} to={localizedPath(`/newconferences/${item.conference_id}`)}>{item.title}</Link>
                        <div className={styles.location}>
                            <span className={styles.venue}>{item.venue}</span>
                            <span className={styles.country}>{item.country}</span>
                        </div>
                        <div className={styles.actions}>
                            <div className={styles.shareMenuWrap} ref={openShare?.id === item.conference_id ? shareTriggerRef : null}>
                                <button className={styles.shareButton} onClick={(event) => toggleShareMenu(event, item.conference_id)}>
                                    <ShareIcon className={styles.shareIcon} />
                                    <span className={styles.shareLabel}>{t('common.share')}</span>
                                </button>
                            </div>
                            <a className={styles.downloadButton} href={getNewConferenceMaterialsUrl(item.conference_id)} download={`conference-${item.conference_id}.pdf`}>
                                {t('conference.infoButton')}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
            {openShare && selectedShareConference && (
                <div className={styles.shareMenu} style={openShare.style} ref={shareMenuRef}>
                    {getShareTargets(selectedShareConference).map(target => (
                        <a key={target.id} href={target.href} target="_blank" rel="noopener noreferrer">
                            {target.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NewConferences;
