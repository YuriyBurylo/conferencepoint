import styles from './Fees.module.css'

function Fees() {
    return (
        <div className={styles.fees}>
            <h2>ОПЛАТА ЗА УЧАСТЬ У КОНФЕРЕНЦІЇ</h2>
            <div className={styles.container}>
                <p className={styles.payment}>Організаційний внесок за участь у конференції становить <strong>200 грн.</strong></p>
                <p className={styles.payment}>Cплата організаційного внеску здійснюється шляхом переказу коштів на банківський рахунок.</p>
            </div> 
            <h3>РЕКВІЗИТИ ДЛЯ ОПЛАТИ:</h3>
            <div className={styles.container}>
                <p><strong>Назва банку:</strong> АТ КБ «ПриватБанк»</p>
                <p><strong>Найменування отримувача:</strong> ФОП Бурило Юрій Павлович</p>
                <p><strong>Код отримувача (ЄДРПОУ):</strong> 2949904670</p>
                <p><strong>Рахунок IBAN:</strong> UA593052990000026009026201252</p>
                <p><strong>У призначенні платежу треба зазначити:</strong> «Оргвнесок за публікацію тез доповіді, прізвище та ініціали автора».</p>
            </div> 
        </div>
    )
}

export default Fees;