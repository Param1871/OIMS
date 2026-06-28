import React, { useState, useEffect } from 'react';
import { transactionApi } from '@/store/api/transaction.api';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Loader2, AlertCircle } from 'lucide-react';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await transactionApi.getAll();
        if (res.success) setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx: any) => 
    tx.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'RECEIPT': return <div className="p-2 rounded-full bg-green-100 text-green-600"><ArrowDownLeft className="w-4 h-4" /></div>;
      case 'ISSUE': return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><ArrowUpRight className="w-4 h-4" /></div>;
      case 'TRANSFER': return <div className="p-2 rounded-full bg-purple-100 text-purple-600"><ArrowRightLeft className="w-4 h-4" /></div>;
      default: return <div className="p-2 rounded-full bg-gray-100 text-gray-600"><AlertCircle className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Immutable ledger of all inventory movements (receipts, issues, transfers).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by ID or Item Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all" 
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 text-gray-400" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty & Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(tx.type)}
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{tx.transactionNumber}</div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">{tx.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tx.item?.name || 'Unknown Item'}</div>
                      <div className="text-xs text-gray-500">{tx.item?.itemCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm">
                        <span className={`font-bold ${tx.type === 'RECEIPT' ? 'text-green-600' : tx.type === 'ISSUE' ? 'text-blue-600' : 'text-purple-600'}`}>
                          {tx.type === 'RECEIPT' ? '+' : tx.type === 'ISSUE' ? '-' : ''}{tx.quantity} {tx.item?.unit}
                        </span>
                        <span className="text-xs text-gray-500">Bal: {tx.balanceAfter}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tx.referenceType || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{tx.referenceId || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                       No stock transactions found.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;