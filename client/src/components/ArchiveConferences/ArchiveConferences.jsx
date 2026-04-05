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
            <div>Archives</div>
            <ul>
                {
                   archiveConferences.map((item, index) => <li key={index}>
                    Статус конференції: {item.conference_status},
                    <Link to={`/pastconferences/${item.conference_id}`}>
                    назва конференції: {item.title}, 
                    </Link> 
                    місце проведення: {item.venue}, 
                    країна: {item.country}, 
                    час проведення: {item.timing}, 
                    учасники: {item.participants}
                    <button className={styles.downloadButton} onClick={() => fetchArchiveConferenceMaterials(item.conference_id)}>МАТЕРІАЛИ КОНФЕРЕНЦІЇ</button></li>) 
                }
            </ul>
        </div>
    )
}

export default ArchiveConferences;