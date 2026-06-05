import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ArchiveConferenceDetails.module.css';
import ConferencePage from '../ConferencePage/ConferencePage';
import { fetchArchiveConferenceById, getArchiveConferenceMaterialsUrl } from '../../../http/conferenceAPI';
import Seo from '../Seo/Seo';
import { buildBreadcrumbJsonLd, buildConferenceDescription, buildConferenceEventJsonLd } from '../../utils/seo';
import { useLanguage } from '../../context/useLanguage';
import { localizePath } from '../../i18n/languageDetection';

function ArchiveConferenceDetails() {
    const [conference, setConference] = useState({});
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { language, t } = useLanguage();
    const localizedPath = (path) => localizePath(path, language);

    useEffect(() => {
        fetchArchiveConferenceById(id).then(response => {
            setConference(response.data);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <div className={styles.container}>
            <Seo
                title={conference.title}
                description={buildConferenceDescription(conference, t)}
                path={`/pastconferences/${conference.conference_id}`}
                type="article"
                jsonLd={[
                    buildBreadcrumbJsonLd([
                        { name: t('nav.home'), path: localizedPath('/') },
                        { name: t('nav.archive'), path: localizedPath('/pastconferences') },
                        { name: conference.title, path: localizedPath(`/pastconferences/${conference.conference_id}`) }
                    ]),
                    buildConferenceEventJsonLd({
                        conference,
                        path: localizedPath(`/pastconferences/${conference.conference_id}`),
                        t
                    })
                ]}
            />
            <ConferencePage
                id={conference.conference_id}
                status={conference.conference_status}
                title={conference.title}
                country={conference.country}
                venue={conference.venue}
                timing={conference.timing}
                materialsUrl={getArchiveConferenceMaterialsUrl(conference.conference_id)}
                btn={t('conference.materialsButton')}
            />
        </div>
    );
}

export default ArchiveConferenceDetails;
