import styles from './Fees.module.css';
import Seo from '../Seo/Seo';
import { buildBreadcrumbJsonLd } from '../../utils/seo';
import { useLanguage } from '../../context/useLanguage';
import { localizePath } from '../../i18n/languageDetection';

function Fees() {
    const { language, t } = useLanguage();
    const localizedPath = (path) => localizePath(path, language);

    return (
        <div className={styles.fees}>
            <Seo
                title={t('seo.feesTitle')}
                description={t('seo.feesDescription')}
                path="/fees"
                jsonLd={buildBreadcrumbJsonLd([
                    { name: t('nav.home'), path: localizedPath('/') },
                    { name: t('nav.fees'), path: localizedPath('/fees') }
                ])}
            />
            <h1>{t('seo.feesTitle').toUpperCase()}</h1>
            <div className={styles.container}>
                <p className={styles.payment}>{t('fees.amount')} <strong>{t('fees.amountValue')}</strong></p>
                <p className={styles.payment}>{t('fees.transfer')}</p>
            </div>
            <h3>{t('fees.detailsTitle')}</h3>
            <div className={styles.container}>
                <p><strong>{t('fees.bank')}</strong> {t('fees.bankValue')}</p>
                <p><strong>{t('fees.recipient')}</strong> {t('fees.recipientValue')}</p>
                <p><strong>{t('fees.recipientCode')}</strong> 2949904670</p>
                <p><strong>IBAN:</strong> UA593052990000026009026201252</p>
                <p><strong>{t('fees.paymentPurpose')}</strong> {t('fees.paymentPurposeValue')}</p>
            </div>
        </div>
    );
}

export default Fees;
