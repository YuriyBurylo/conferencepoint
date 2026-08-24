import promoImage from '../../assets/science-chums-promo.png';
import styles from './ScienceChumsPromo.module.css';

function ScienceChumsPromo() {
    return (
        <aside className={styles.promo} aria-label="ScienceChums promotion">
            <a
                className={styles.link}
                href="https://app.sciencechums.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img
                    className={styles.image}
                    src={promoImage}
                    alt="ScienceChums — turn conference connections into research impact. Join free."
                    width="700"
                    height="308"
                    loading="lazy"
                />
            </a>
        </aside>
    );
}

export default ScienceChumsPromo;
