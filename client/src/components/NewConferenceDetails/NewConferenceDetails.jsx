import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './NewConferenceDetails.module.css';
import ConferencePage from '../ConferencePage/ConferencePage';
import { fetchNewConferenceById, fetchNewConferenceMaterials } from '../../../http/conferenceAPI';

function NewConferenceDetails() {
    const [conference, setConference] = useState({});
    const [loading, setLoading] = useState(true);
    const {id} = useParams();

    useEffect(() => {
        fetchNewConferenceById(id).then(response => {
            setConference(response.data);
            setLoading(false);
        });
    }, []);

    
    if(loading) {
        return <p>Loading...</p>
    };

    return (
        <div style={{minHeight: '87vh', placeItems: 'center', placeContent: 'center'}} className={styles.container}>
            <ConferencePage
                id = {conference.conference_id} 
                status = {conference.conference_status} 
                title = {conference.title} 
                country = {conference.country}
                venue = {conference.venue}
                timing = {conference.timing} 
                fetchMaterials={fetchNewConferenceMaterials}/>
        </div>
    )
}

export default NewConferenceDetails;