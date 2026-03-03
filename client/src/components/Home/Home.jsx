import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { fetchNextConference } from '../../../http/conferenceAPI';
import ConferencePage from '../ConferencePage/ConferencePage';

function Home() {
    const [conference, setConference] = useState({});
    const [loading, setLoading] = useState(true);
    console.log(conference);

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
            <h1 style={{textAlign: "center", marginTop: "150px"}}>Найближча конференція:</h1>
            <ConferencePage
                id={conference.conference_id}
                status={conference.conference_status} 
                title={conference.title} 
                country={conference.country} 
                venue={conference.venue} 
                timing={conference.timing}/>
        </div>
    )
}

export default Home;