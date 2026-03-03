import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { fetchNextConference, fetchNewConferenceMaterials } from '../../../http/conferenceAPI';
import ConferencePage from '../ConferencePage/ConferencePage';

function Home() {
    const [conference, setConference] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNextConference().then(res => {
            setConference(res.data);
            setLoading(false);
        });
    }, []);

    if(loading) {
        return <p>Loading...</p>
    };

    return (
        <div className={styles.home}>
            <h1 className={styles.heading}>Найближча конференція:</h1>
            <ConferencePage
                id={conference.conference_id}
                status={conference.conference_status} 
                title={conference.title} 
                country={conference.country} 
                venue={conference.venue} 
                timing={conference.timing}
                fetchMaterials={fetchNewConferenceMaterials}/>
        </div>
    )
}

export default Home;