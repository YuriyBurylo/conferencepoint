import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './NewConferences.module.css';
import { fetchNewConferences, fetchNewConferenceMaterials } from '../../../http/conferenceAPI';


function NewConferences() {
    let [conferenceList, setConferenceList] = useState([]);
    
    useEffect(()=> {
        fetchNewConferences().then(response => setConferenceList(response.data));
    }, []);

    return (
        <div className={styles.conferences}>
            <h2 className={styles.heading}>Актуальні конференції</h2>
            <ul>
                {
                    conferenceList.map((item, index) => <li className={styles.conference} key={index}>
                        <div className={styles.time}>{item.timing.slice(0, 10).split('-').reverse().join('.')}</div>
                        <div className={styles.status}>{item.conference_status}</div>
                        <Link className={styles.title} to={`/newconferences/${item.conference_id}`}>{item.title}</Link>
                        <div className={styles.venue}>{item.venue}</div> 
                        <div className={styles.country}>{item.country}</div>
                        <button className={styles.downloadButton} onClick={() => fetchNewConferenceMaterials(item.conference_id)}>ІНФОРМАЦІЯ ПРО КОНФЕРЕНЦІЮ</button></li>)
                }
            </ul>
        </div>
    )
}

export default NewConferences;