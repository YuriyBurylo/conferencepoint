import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { fetchNextConference, getNewConferenceMaterialsUrl } from '../../../http/conferenceAPI';
import ConferencePage from '../ConferencePage/ConferencePage';
import Seo from '../Seo/Seo';
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '../../utils/seo';
import { useLanguage } from '../../context/useLanguage';

function Home() {
    const [conference, setConference] = useState({});
    const [loading, setLoading] = useState(true);
    const { locale, t } = useLanguage();

    useEffect(() => {
        fetchNextConference().then(res => {
            setConference(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <div className={styles.home}>
            <Seo
                title={t('seo.homeTitle')}
                description={t('seo.homeDescription')}
                path="/"
                jsonLd={[buildOrganizationJsonLd(), buildWebsiteJsonLd(locale)]}
            />
            <h1 className={styles.heading}>{t('home.heading')}</h1>
            <h2 className={styles.subheading}>{t('home.nextConference')}</h2>
            <div className={styles.conference}>
                <ConferencePage
                    id={conference.conference_id}
                    status={conference.conference_status}
                    title={conference.title}
                    country={conference.country}
                    venue={conference.venue}
                    timing={conference.timing}
                    materialsUrl={getNewConferenceMaterialsUrl(conference.conference_id)}
                    btn={t('conference.infoButton')}
                />
            </div>
        </div>
    );
}

export default Home;
