import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import logo from '../assets/penta_transparent_logo.png';

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-xl border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={logo}
                                        alt="Penta logo"
                                        className="h-10 w-10 object-contain"
                                    />
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            PIMS
                                        </h1>
                                        <p className="text-xs text-gray-500 -mt-1">Inventory System</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                                <Link
                                    to="/dashboard"
                                    className={`${isActive('/dashboard')
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </Link>
                                <Link
                                    to="/products"
                                    className={`${isActive('/products') || isActive('/products/create')
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Products
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/inventory"
                                        className={`${isActive('/inventory')
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Inventory
                                    </Link>
                                )}
                                <Link
                                    to="/reports"
                                    className={`${isActive('/reports')
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Reports
                                </Link>
                                <Link
                                    to="/assets"
                                    className={`${isActive('/assets') || location.pathname.startsWith('/assets')
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    Assets
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/users"
                                        className={`${isActive('/users')
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-500'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium rounded-t-lg transition-all`}
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Users
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md border-2 border-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            {user?.userType === 'ADMIN' ? (
                                                <span className="inline-flex items-center">
                                                    <svg className="h-3 w-3 text-purple-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Admin
                                                </span>
                                            ) : 'User'}
                                        </div>
                                    </div>
                                    <svg
                                        className={`h-5 w-5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100">
                                    <div className="py-1" role="menu">
                                        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                                    <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                                                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.userType === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user?.userType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <div className="flex items-center">
                                                <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">My Profile</span>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">Sign out</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}
