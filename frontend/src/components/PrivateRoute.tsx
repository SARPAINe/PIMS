import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
