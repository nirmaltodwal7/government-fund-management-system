import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Clock,
  TrendingDown,
  FileText
} from 'lucide-react';

const AccountsModal = ({ isOpen, onClose, transactionHistory, currentFunds }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl mr-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Government Funds Accounts</h2>
                    <p className="text-blue-100">Transaction history and fund management</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Current Funds Status */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">Current Funds</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {formatAmount(currentFunds)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">Total Deducted</div>
                      <div className="text-2xl font-bold text-red-800">
                        {formatAmount(12000 - currentFunds)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">Total Claims</div>
                      <div className="text-2xl font-bold text-green-800">
                        {transactionHistory.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Transaction History
              </h3>
              
              {transactionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400">Pension claims will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              Pension Claim - {transaction.pensionMonth}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {transaction.userInfo.fullName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(transaction.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            -{formatAmount(transaction.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Remaining: {formatAmount(transaction.remainingFunds)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Showing {transactionHistory.length} transaction{transactionHistory.length !== 1 ? 's' : ''}
                </div>
                <div>
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountsModal;
