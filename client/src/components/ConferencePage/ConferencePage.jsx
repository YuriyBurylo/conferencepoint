import React from 'react';
import styles from './ConferencePage.module.css';
import { fetchNewConferenceMaterials } from '../../../http/conferenceAPI';


function ConferencePage({id, status, title, country, venue, timing}) {
    return (
        <div className={styles.home}>
            <h2>{status}</h2>
            <h1>{title}</h1>
            <p>{country}</p>
            <p>{venue}</p>
            <p>{timing}</p>
            <button onClick={() => fetchNewConferenceMaterials(id)}>Download Conference Leaflet</button>
        </div>
    )
}

export default ConferencePage;