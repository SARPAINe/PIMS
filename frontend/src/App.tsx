import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/create" element={<CreateProduct />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/users" element={<Users />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
