import styles from './Requirements.module.css';
import Seo from '../Seo/Seo';
import { buildBreadcrumbJsonLd } from '../../utils/seo';
import { useLanguage } from '../../context/useLanguage';
import { localizePath } from '../../i18n/languageDetection';

function Requirements() {
    const { language, t } = useLanguage();
    const localizedPath = (path) => localizePath(path, language);
    const sections = t('requirements.sections');
    const firstColumn = sections.slice(0, 15);
    const secondColumn = sections.slice(15);

    return (
        <div className={styles.requirements}>
            <Seo
                title={t('seo.requirementsTitle')}
                description={t('seo.requirementsDescription')}
                path="/requirements"
                jsonLd={buildBreadcrumbJsonLd([
                    { name: t('nav.home'), path: localizedPath('/') },
                    { name: t('nav.requirements'), path: localizedPath('/requirements') }
                ])}
            />
            <h1>{t('seo.requirementsTitle').toUpperCase()}</h1>
            <h3><em>{t('requirements.invite')}</em></h3>

            <h3>{t('requirements.fieldsTitle')}</h3>
            <div className={styles.sections}>
                {[firstColumn, secondColumn].map((column, index) => (
                    <div className={styles.sectionsBlock} key={index}>
                        {column.map(section => (
                            <p key={section}>{section}</p>
                        ))}
                    </div>
                ))}
            </div>

            <h3>{t('requirements.formatTitle')}</h3>
            <div className={styles.container}>
                {t('requirements.format').map(item => <p key={item}>{item}</p>)}
            </div>

            <h3>{t('requirements.howToTitle')}</h3>
            <div className={styles.container}>
                {t('requirements.howTo').map(item => <p key={item}>{item}</p>)}
            </div>

            <h3>{t('requirements.paperTitle')}</h3>
            <div className={styles.container}>
                {t('requirements.paper').map(item => <p key={item}>{item}</p>)}
            </div>

            <h3>{t('requirements.paymentTitle')}</h3>
            <div className={styles.container}>
                <p>{t('fees.amount')} <strong>{t('fees.amountValue')}</strong></p>
                <p>{t('fees.transfer')}</p>
            </div>
            <h4>{t('fees.detailsTitle')}</h4>
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

export default Requirements;
