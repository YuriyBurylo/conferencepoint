import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Conferences.module.css';
import { fetchNewConferences, fetchNewConferenceMaterials } from '../../../http/conferenceAPI';


function Conferences() {
    let [conferenceList, setConferenceList] = useState([]);
    
    useEffect(()=> {
        fetchNewConferences().then(response => setConferenceList(response.data));
    }, []);

    return (
        <div className={styles.conferences}>
            <ul>
                {
                    conferenceList.map((item, index) => <li key={index}>
                        статус конференції: {item.conference_status}, 
                        <Link to={`/newconferences/${item.conference_id}`}>
                        назва:{item.title}
                        </Link>
                        місце проведення: {item.venue}, 
                        країна: {item.country}, 
                        дата проведення: {item.timing} 
                        <button onClick={() => fetchNewConferenceMaterials(item.conference_id)}>Download leaflet</button></li>)
                }
            </ul>
        </div>
    )
}

export default Conferences;