import { useState, useEffect } from 'react';
import * as api from '../services/api';

const TransferHistory = () => {
    const [transfers, setTransfers] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWalletsAndTransfers();
    }, []);

    const fetchWalletsAndTransfers = async () => {
        setIsLoading(true);
        try {
            const [walletRes, transferRes] = await Promise.all([
                api.getWallets(),
                api.getTransactions({ type: 'Transfer', limit: 1000 })
            ]);
            setWallets(walletRes.data.data.wallets || []);
            setTransfers(transferRes.data.data.transactions || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching transfer history');
            setTransfers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getWalletName = (id) => wallets.find(w => w._id === id)?.name || id;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center py-8 px-4">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Transfer History
                    </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Track and manage all your wallet transfers
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-fadeIn">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 uppercase text-xs">
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Amount</th>
                                <th className="py-2 px-4">From</th>
                                <th className="py-2 px-4">To</th>
                                <th className="py-2 px-4">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.length === 0 ? (
                                <tr><td colSpan={5} className="py-4 px-4 text-center text-gray-600">No transfers found.</td></tr>
                            ) : (
                                transfers.map(t => (
                                    <tr key={t._id} className="border-t">
                                        <td className="py-2 px-4">{new Date(t.date).toLocaleString()}</td>
                                        <td className="py-2 px-4">₹{Number(t.amount).toLocaleString()}</td>
                                        <td className="py-2 px-4">{getWalletName(t.walletId)}</td>
                                        <td className="py-2 px-4">{getWalletName(t.toWallet)}</td>
                                        <td className="py-2 px-4">{t.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransferHistory;
