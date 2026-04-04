import React from 'react';
import styles from './ConferencePage.module.css';


function ConferencePage({id, status, title, country, venue, timing, fetchMaterials}) {
    return (
        <div className={styles.container}>
            <h2 className={styles.status}>{status}</h2>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.country}>{country}</p>
            <p className={styles.venue}>{venue}</p>
            <p className={styles.timing}>{timing}</p>
            <button className={styles.downloadButton} onClick={() => fetchMaterials(id)}>
                Download Conference Leaflet
            </button>
        </div>
    )
}

export default ConferencePage;