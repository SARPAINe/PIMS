import { useState, useEffect, FormEvent } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState<'ADMIN' | 'USER'>('USER');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await userService.create({
                name,
                email,
                password,
                userType,
            });
            setShowModal(false);
            resetForm();
            loadUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await userService.delete(id);
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleAdmin = async (user: User) => {
        const newUserType = user.userType === 'ADMIN' ? 'USER' : 'ADMIN';
        const action = newUserType === 'ADMIN' ? 'promote to Admin' : 'demote to User';

        if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

        try {
            await userService.update(user.id, { userType: newUserType });
            loadUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to ${action}`);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setUserType('USER');
        setError('');
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage system users and their permissions
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Add User
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Name
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Email
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    User Type
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Created
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold ${user.userType === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {user.userType}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex justify-end gap-2">
                                            {currentUser?.id !== user.id && (
                                                <button
                                                    onClick={() => handleToggleAdmin(user)}
                                                    className={`${user.userType === 'ADMIN'
                                                            ? 'text-orange-600 hover:text-orange-900'
                                                            : 'text-indigo-600 hover:text-indigo-900'
                                                        }`}
                                                >
                                                    {user.userType === 'ADMIN' ? 'Demote' : 'Promote'}
                                                </button>
                                            )}
                                            {currentUser?.id !== user.id && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowModal(false)}
                        ></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        Create New User
                                    </h3>

                                    {error && (
                                        <div className="mb-4 rounded-md bg-red-50 p-4">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Password *
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                User Type *
                                            </label>
                                            <select
                                                required
                                                value={userType}
                                                onChange={(e) =>
                                                    setUserType(e.target.value as 'ADMIN' | 'USER')
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Create User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
