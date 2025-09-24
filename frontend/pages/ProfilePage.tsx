import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AptosClient } from "aptos";
import { NETWORK, MODULE_ADDRESS } from "../constants";
import '../styles/profile.css';

const ProfilePage: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [lockedFunds, setLockedFunds] = useState<number>(0);
  const [lockAmount, setLockAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1`;
  const MODULE_NAME = "pulse";
  const client = new AptosClient(NODE_URL);

  // Get user's wallet address
  const getUserAddress = async () => {
    try {
      if ((window as any).aptos) {
        const accountResponse = await (window as any).aptos.account();
        return accountResponse.address;
      }
      return null;
    } catch (error) {
      console.log('No wallet connected:', error);
      return null;
    }
  };

  // Fetch user balance from smart contract
  const fetchBalance = async (address: string) => {
    try {
      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_balance`,
        type_arguments: [],
        arguments: [address],
      });
      
      // Convert from octas to APT
      const balanceInAPT = Number(result[0]) / 100000000;
      setBalance(balanceInAPT);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch locked funds from smart contract
  const fetchLockedFunds = async (address: string) => {
    try {
      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_locked_funds`,
        type_arguments: [],
        arguments: [address],
      });
      
      // Convert from octas to APT
      const lockedInAPT = Number(result[0]) / 100000000;
      setLockedFunds(lockedInAPT);
    } catch (error) {
      console.error('Error fetching locked funds:', error);
    }
  };

  // Fetch transaction history from smart contract
  const fetchTransactionHistory = async (address: string) => {
    try {
      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_transaction_history`,
        type_arguments: [],
        arguments: [address],
      });
      
      console.log('Transaction history result:', result);
      const historyData = Array.isArray(result[0]) ? result[0] : [];
      
      // Get batch transaction hashes from localStorage
      const batchHashes = JSON.parse(localStorage.getItem('batchTransactionHashes') || '{}');
      const userHashes = batchHashes[address] || [];
      
      // Merge batch transaction hashes with transaction history
      const enrichedHistory = historyData.map((group: any, index: number) => {
        // Match by reverse chronological order (latest first)
        const hashData = userHashes[userHashes.length - 1 - index];
        return {
          ...group,
          batch_transaction_hash: hashData?.hash || null
        };
      });
      
      setTransactionHistory(enrichedHistory);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(userAddress);
      showToastMessage('Address copied successfully!');
    } catch (error) {
      console.error('Failed to copy address:', error);
      showToastMessage('Failed to copy address');
    }
  };

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Handle lock funds form submission
  const handleLockFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lockAmount || Number(lockAmount) <= 0) {
      showToastMessage('Please enter a valid amount');
      return;
    }

    if (Number(lockAmount) > balance) {
      showToastMessage('Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);
      
      if (!(window as any).aptos) throw new Error("Wallet not connected");
      if (!MODULE_ADDRESS) throw new Error("Contract address not configured");

      // Convert APT to octas
      const amountInOctas = Math.floor(Number(lockAmount) * 100000000);

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::lock_funds`,
        type_arguments: [],
        arguments: [amountInOctas],
      };

      console.log('Locking funds payload:', payload);
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      
      if (!response?.hash) throw new Error("Transaction failed");
      
      await client.waitForTransaction(response.hash);
      
      showToastMessage(`Successfully locked ${lockAmount} APT!`);
      setLockAmount('');
      
      // Refresh balances
      if (userAddress) {
        await fetchBalance(userAddress);
        await fetchLockedFunds(userAddress);
      }
      
    } catch (error: any) {
      console.error('Lock funds error:', error);
      showToastMessage(`Error: ${error?.message || "Failed to lock funds"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      const address = await getUserAddress();
      if (address) {
        setUserAddress(address);
        await fetchBalance(address);
        await fetchLockedFunds(address);
        await fetchTransactionHistory(address);
      }
    };

    loadUserData();
  }, []);

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 10)}...${address.slice(-6)}`;
    }
    return address;
  };

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Profile</h1>
          <p>Manage your wallet and locked funds</p>
        </motion.div>

        <div className="profile-content">
          {/* User Info Section */}
          <motion.div
            className="profile-card user-info-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2>Wallet Information</h2>
            
            {userAddress ? (
              <div className="wallet-details">
                <div className="address-section">
                  <label>Connected Address:</label>
                  <div className="address-display">
                    <span className="address-text" title={userAddress}>
                      {formatAddress(userAddress)}
                    </span>
                    <motion.button
                      className="copy-btn"
                      onClick={copyAddress}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📋 Copy
                    </motion.button>
                  </div>
                </div>

                <div className="balance-info">
                  <div className="balance-item">
                    <span className="balance-label">Available Balance:</span>
                    <span className="balance-value">{balance.toFixed(4)} APT</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Locked Funds:</span>
                    <span className="balance-value locked">{lockedFunds.toFixed(4)} APT</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-wallet">
                <p>Please connect your wallet to view profile information</p>
              </div>
            )}
          </motion.div>

          {/* Lock Funds Section */}
          {userAddress && (
            <motion.div
              className="profile-card lock-funds-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2>Lock Funds</h2>
              <p>Lock your APT tokens in the smart contract for security</p>
              
              <form onSubmit={handleLockFunds} className="lock-funds-form">
                <div className="form-group">
                  <label htmlFor="lockAmount">Amount to Lock (APT):</label>
                  <input
                    type="number"
                    id="lockAmount"
                    value={lockAmount}
                    onChange={(e) => setLockAmount(e.target.value)}
                    placeholder="Enter amount in APT"
                    max={balance}
                    required
                  />
                  <small>Available: {balance.toFixed(4)} APT</small>
                </div>

                <motion.button
                  type="submit"
                  className="lock-funds-btn"
                  disabled={isLoading || !lockAmount || Number(lockAmount) <= 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? 'Locking...' : 'Lock Funds'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Transaction History Section */}
          {userAddress && transactionHistory.length > 0 && (
            <motion.div
              className="profile-card transaction-history-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2>Transaction History</h2>
              <p>Your payment group transactions</p>
              
              <div className="transaction-groups">
                {transactionHistory.map((group: any, index: number) => (
                  <div key={group.group_id} className="transaction-group">
                    <div 
                      className="group-header"
                      onClick={() => setExpandedGroup(expandedGroup === index ? null : index)}
                    >
                      <div className="group-info">
                        <span className="group-title">Group Transaction #{group.group_id}</span>
                        <span className="group-amount">{(Number(group.total_amount) / 100000000).toFixed(4)} APT</span>
                      </div>
                      <div className="group-details">
                        <span className="transaction-count">{group.transactions.length} bills</span>
                        <span className={`group-status ${group.status === 1 ? 'completed' : 'pending'}`}>
                          {group.status === 1 ? '✅ Completed' : '⏳ Pending'}
                        </span>
                        <span className="expand-icon">
                          {expandedGroup === index ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                    
                    {expandedGroup === index && (
                      <motion.div
                        className="group-transactions"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {/* Batch Transaction Hash */}
                        {group.batch_transaction_hash && (
                          <div className="batch-transaction-hash" style={{ 
                            marginBottom: '1rem', 
                            padding: '0.75rem', 
                            background: '#f0f8ff', 
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                              Batch Transaction Hash:
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span 
                                style={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.85rem',
                                  color: '#333',
                                  background: '#fff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd'
                                }}
                                title={group.batch_transaction_hash}
                              >
                                {`${group.batch_transaction_hash.slice(0, 12)}...${group.batch_transaction_hash.slice(-12)}`}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(group.batch_transaction_hash);
                                  showToastMessage('Batch transaction hash copied!');
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                📋 Copy
                              </button>
                              <button
                                onClick={() => {
                                  window.open(`https://explorer.aptoslabs.com/txn/${group.batch_transaction_hash}?network=testnet`, '_blank');
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                🔍 Explorer
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                          Individual Payments in this Batch:
                        </div>
                        {group.transactions.map((tx: any, txIndex: number) => {
                          return (
                            <div key={txIndex} className="transaction-item">
                              <div className="transaction-details">
                              <div className="transaction-line">
                                <span className="label">Bill ID:</span>
                                <span className="value">#{tx.bill_id}</span>
                              </div>
                              <div className="transaction-line">
                                <span className="label">Description:</span>
                                <span className="value">
                                  {typeof tx.description === 'string' 
                                    ? tx.description 
                                    : Array.isArray(tx.description) 
                                      ? new TextDecoder().decode(new Uint8Array(tx.description))
                                      : 'No description available'
                                  }
                                </span>
                              </div>
                              <div className="transaction-line">
                                <span className="label">From:</span>
                                <span className="value address">
                                  {tx.from_address.slice(0, 10)}...{tx.from_address.slice(-6)}
                                </span>
                              </div>
                              <div className="transaction-line">
                                <span className="label">To:</span>
                                <span className="value address">
                                  {tx.to_address.slice(0, 10)}...{tx.to_address.slice(-6)}
                                </span>
                              </div>
                              <div className="transaction-line">
                                <span className="label">Amount:</span>
                                <span className="value amount">
                                  {(Number(tx.amount) / 100000000).toFixed(4)} APT
                                </span>
                              </div>

                            </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <motion.div
            className="toast-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;