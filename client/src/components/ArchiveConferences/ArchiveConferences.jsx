import React, { useState, useEffect } from 'react';
import styles from './ArchiveConferences.module.css';
import { fetchArchiveConferences, fetchArchiveConferenceMaterials } from '../../../http/conferenceAPI';
import { Link } from 'react-router-dom';

function ArchiveConferences() {
    let [archiveConferences, setArchiveConferences] = useState([]);

    useEffect(() => {
        fetchArchiveConferences().then(response => setArchiveConferences(response.data));
    }, []);

    return (
        <div className={styles.archives}>
            <h2 className={styles.heading}>Архів конференцій</h2>
            <ul>
                {
                   archiveConferences.map((item, index) => <li className={styles.conference} key={index}>
                    <div className={styles.time}>{item.timing}</div> 
                    <div className={styles.status}>{item.conference_status}</div>
                    <Link className={styles.title} to={`/pastconferences/${item.conference_id}`}>{item.title}</Link> 
                    <div className={styles.venue}>{item.venue}</div> 
                    <div className={styles.country}>{item.country}</div>  
                    <button className={styles.downloadButton} onClick={() => fetchArchiveConferenceMaterials(item.conference_id)}>МАТЕРІАЛИ КОНФЕРЕНЦІЇ</button></li>) 
                }
            </ul>
        </div>
    )
}

export default ArchiveConferences;