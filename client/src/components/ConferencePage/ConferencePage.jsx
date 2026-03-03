import React from 'react';
import styles from './ConferencePage.module.css';


function ConferencePage({id, status, title, country, venue, timing, fetchMaterials}) {
    return (
        <div className={styles.home}>
            <h2>{status}</h2>
            <h1>{title}</h1>
            <p>{country}</p>
            <p>{venue}</p>
            <p>{timing}</p>
            <button onClick={() => fetchMaterials(id)}>Download Conference Leaflet</button>
        </div>
    )
}

export default ConferencePage;