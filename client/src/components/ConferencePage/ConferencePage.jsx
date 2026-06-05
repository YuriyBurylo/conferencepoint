import React from 'react';
import styles from './ConferencePage.module.css';


function ConferencePage({id, status, title, country, venue, timing, fetchMaterials, materialsUrl, btn}) {
    return (
        <div className={styles.container}>
            <h2 className={styles.status}>{status}</h2>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.country}>{country}</p>
            <p className={styles.venue}>{venue}</p>
            <p className={styles.timing}>{timing.slice(0, 10).split('-').reverse().join('.')}</p>
            {materialsUrl ? (
                <a className={styles.downloadButton} href={materialsUrl} download={`conference-${id}.pdf`}>
                    {btn}
                </a>
            ) : (
                <button className={styles.downloadButton} onClick={() => fetchMaterials(id)}>
                    {btn}
                </button>
            )}
        </div>
    )
}

export default ConferencePage;
