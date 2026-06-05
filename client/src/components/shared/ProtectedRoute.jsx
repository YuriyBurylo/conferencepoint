import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/useLanguage';
import Seo from '../Seo/Seo';

function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();

    if (loading) {
        return <div style={{ minHeight: '87vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem' }}>{t('common.loading')}</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Seo
                title={t('protected.title')}
                description={t('protected.description')}
                path={location.pathname}
                noindex
            />
            {children}
        </>
    );
}

export default ProtectedRoute;
