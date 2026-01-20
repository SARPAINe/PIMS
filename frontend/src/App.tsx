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
import Profile from './pages/Profile';
import Assets from './pages/Assets';
import AssetTypes from './pages/AssetTypes';
import CreateAsset from './pages/CreateAsset';
import AssetDetail from './pages/AssetDetail';
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
                            <Route path="/assets" element={<Assets />} />
                            <Route path="/assets/types" element={<AssetTypes />} />
                            <Route path="/assets/create" element={<CreateAsset />} />
                            <Route path="/assets/:id" element={<AssetDetail />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
