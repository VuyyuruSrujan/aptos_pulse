import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BillCard from '../components/BillCard';
import NotificationsPanel from '../components/NotificationsPanel';
import AutopayModal from '../components/AutopayModal';
import { Bill, Notification, FilterStatus, FormData, AutoPayConfig } from '../types';
import { mockBills, mockNotifications } from '../data/mockData';
import '../styles/dashboard.css';
import { AptosClient } from "aptos";
import { NETWORK, MODULE_ADDRESS } from "../constants";

const DashboardPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isAutopayModalOpen, setIsAutopayModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amount: 0,
    description: '',
    address: '',
    dueDate: ''
  });

  const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1`;
  const MODULE_NAME = "pulse";
  const client = new AptosClient(NODE_URL);

  // Debug configuration on component load
  console.log('🔧 === DASHBOARD CONFIGURATION ===');
  console.log('🌐 Network:', NETWORK);
  console.log('🏠 Module Address:', MODULE_ADDRESS);
  console.log('📡 Node URL:', NODE_URL);
  console.log('📦 Module Name:', MODULE_NAME);
  console.log('================================');

  // Function to get user's wallet address
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

  // Function to fetch bills from smart contract
  const fetchUserBills = async () => {
    try {
      const userAddress = await getUserAddress();
      if (!userAddress) {
        console.log('No wallet address found, using mock data');
        return;
      }

      if (!MODULE_ADDRESS) {
        console.log('Module address not configured, using mock data');
        return;
      }

      console.log('🔍 === FETCHING BILLS FROM SMART CONTRACT ===');
      console.log('👤 User Address:', userAddress);
      console.log('🏠 Module Address:', MODULE_ADDRESS);
      console.log('🔧 Function:', `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_bills`);

      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_bills`,
        type_arguments: [],
        arguments: [userAddress],
      });

      console.log('📦 Raw result from smart contract:', result);
      console.log('📊 Result type:', typeof result);
      console.log('📏 Result length:', result?.length);
      console.log('🔍 First element:', result?.[0]);
      console.log('🔍 First element type:', typeof result?.[0]);
      
      if (result && result.length > 0) {
        console.log('📝 Detailed first element structure:', JSON.stringify(result[0], null, 2));
      }
      
      if (result && result.length > 0 && Array.isArray(result[0])) {
        const smartContractBills = result[0];
        console.log('Smart contract bills:', smartContractBills);

        // Transform smart contract data to match our Bill interface
        const transformedBills: Bill[] = smartContractBills.map((bill: any, index: number) => {
          console.log(`=== Processing bill ${index} ===`);
          console.log('Raw bill data:', bill);
          console.log('Bill description type:', typeof bill.description, 'Value:', bill.description);
          console.log('Bill payee type:', typeof bill.payee, 'Value:', bill.payee);
          console.log('Bill amount:', bill.amount);
          console.log('Bill due_date:', bill.due_date);
          console.log('Bill status:', bill.status);
          
          // Helper function to convert vector<u8> to string
          const convertVectorToString = (vector: any, fieldName: string, defaultValue: string): string => {
            console.log(`Converting ${fieldName}:`, vector);
            console.log(`${fieldName} type:`, typeof vector);
            console.log(`${fieldName} is array:`, Array.isArray(vector));
            
            if (!vector) {
              console.log(`${fieldName} is null/undefined, using default:`, defaultValue);
              return defaultValue;
            }
            
            // If it's a hex string starting with 0x, convert from hex
            if (typeof vector === 'string' && vector.startsWith('0x')) {
              try {
                // Remove 0x prefix and convert hex pairs to bytes
                const hex = vector.slice(2);
                const bytes = [];
                for (let i = 0; i < hex.length; i += 2) {
                  bytes.push(parseInt(hex.substr(i, 2), 16));
                }
                const decoded = new TextDecoder().decode(new Uint8Array(bytes));
                console.log(`${fieldName} decoded from hex:`, decoded);
                return decoded || defaultValue;
              } catch (e) {
                console.log(`${fieldName} hex decode failed:`, e);
              }
            }
            
            // Try as array of numbers (vector<u8>)
            if (Array.isArray(vector)) {
              try {
                const decoded = new TextDecoder().decode(new Uint8Array(vector));
                console.log(`${fieldName} decoded from array:`, decoded);
                return decoded || defaultValue;
              } catch (e) {
                console.log(`${fieldName} array decode failed:`, e);
              }
            }
            
            // If it's already a regular string (not hex)
            if (typeof vector === 'string' && !vector.startsWith('0x')) {
              console.log(`${fieldName} is already string:`, vector);
              return vector;
            }
            
            console.log(`${fieldName} unknown format, using default:`, defaultValue);
            return defaultValue;
          };
          
          // Convert description from vector<u8> to string
          const descriptionStr = convertVectorToString(bill.description, 'description', 'No description');
          
          // Payee is already an address string, no conversion needed
          const payeeAddress = bill.payee || 'Unknown';

          // Convert timestamps to date strings  
          const dueDate = bill.due_date && Number(bill.due_date) > 0 ? 
            new Date(Number(bill.due_date) * 1000).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];

          // Convert status number to string
          let status: 'Pending' | 'Paid' | 'AutoPay Enabled' = 'Pending';
          if (Number(bill.status) === 1) status = 'Paid';
          if (Number(bill.status) === 2) status = 'AutoPay Enabled';

          // Convert amount from octas to APT
          const amount = Number(bill.amount) / 100000000;

          console.log('✅ PROCESSED BILL DETAILS:');
          console.log('💰 Amount (APT):', amount);
          console.log('📝 Description:', descriptionStr);
          console.log('💳 Payee Address:', payeeAddress);
          console.log('📅 Due Date:', dueDate);
          console.log('✅ Status:', status);
          console.log('🆔 Bill ID:', bill.id.toString());

          const transformedBill = {
            id: bill.id.toString(),
            service: descriptionStr, // Use description as service name
            dueDate: dueDate,
            amount: amount,
            status: status,
            description: descriptionStr,
            category: 'Payment', // Default category since not in contract
            payee: payeeAddress // Correct payee address
          };

          console.log('📋 Final transformed bill:', transformedBill);
          console.log('========================\n');

          return transformedBill;
        });

        console.log('Transformed bills:', transformedBills);
        setBills(transformedBills);

      } else {
        console.log('No bills found in smart contract, user has no bills yet');
        setBills([]); // Set empty array if no bills
      }

    } catch (error) {
      console.error('Error fetching bills from smart contract:', error);
      console.log('Falling back to mock data due to error');
      // Keep mock data on error
    }
  };

  // UseEffect to fetch bills on component mount and when wallet changes
  useEffect(() => {
    console.log('DashboardPage mounted, fetching user bills...');
    fetchUserBills();

    // Set up interval to periodically check for wallet changes and refresh data
    const interval = setInterval(() => {
      fetchUserBills();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredBills = bills.filter(bill => {
    if (filter === 'All') return true;
    return bill.status === filter;
  });

  const handlePayNow = (billId: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'Paid' as const, lastPaid: new Date().toISOString().split('T')[0] }
        : bill
    ));
    
    // Add success notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Payment Successful',
      message: `Bill payment completed successfully`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleOneClickPay = async () => {
    try {
      console.log('🚀 === STARTING ONE CLICK PAY (SMART CONTRACT) ===');
      console.log('🔧 DEBUG: One Click Pay button clicked, starting payment process...');
      
      const currentUser = await getUserAddress();
      if (!currentUser) {
        console.error('❌ No user address found');
        alert('Please connect your wallet');
        return;
      }

      console.log('👤 User Address:', currentUser);
      console.log('🏠 Module Address:', MODULE_ADDRESS);
      console.log('🌐 Network:', NODE_URL);
      
      if (!(window as any).aptos) throw new Error("Wallet not connected");
      if (!MODULE_ADDRESS) throw new Error("Contract address not configured");
      
      // Test if wallet is properly connected
      console.log('🔌 Wallet connection test...');
      try {
        const walletAccount = await (window as any).aptos.account();
        console.log('💼 Wallet account:', walletAccount);
      } catch (walletError) {
        console.error('❌ Wallet connection error:', walletError);
        throw new Error("Wallet connection failed");
      }

      // Check pending bills and locked funds
      console.log('🔍 Checking pending bills and locked funds...');
      console.log('📍 Contract address:', MODULE_ADDRESS);
      console.log('📍 Module name:', MODULE_NAME);
      
      // Get pending bills total from smart contract
      console.log('📞 Calling get_pending_bills_total...');
      const pendingResult = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_pending_bills_total`,
        type_arguments: [],
        arguments: [currentUser],
      });
      
      console.log('📊 Pending bills result:', pendingResult);
      
      const totalAmount = Number(pendingResult[0]) / 100000000; // Convert to APT
      const billCount = Number(pendingResult[1]);
      
      console.log(`📈 Parsed values - Total: ${totalAmount} APT, Count: ${billCount} bills`);
      
      // Also check the frontend bills array for comparison
      const frontendPendingBills = bills.filter(b => b.status === 'Pending');
      console.log(`🎯 Frontend pending bills count: ${frontendPendingBills.length}`);
      console.log('🎯 Frontend pending bills:', frontendPendingBills);
      
      if (billCount === 0) {
        console.log('⚠️ No pending bills found in smart contract');
        alert('No pending bills found');
        return;
      }

      // Get locked funds
      console.log('📞 Calling get_locked_funds...');
      const lockedResult = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_locked_funds`,
        type_arguments: [],
        arguments: [currentUser],
      });
      
      const lockedAmount = Number(lockedResult[0]) / 100000000; // Convert to APT
      const gasEstimate = billCount * 0.001; // 0.001 APT per bill for gas
      const totalNeeded = totalAmount + gasEstimate;

      console.log(`💰 Total amount needed: ${totalAmount} APT`);
      console.log(`⛽ Gas estimate: ${gasEstimate} APT`);
      console.log(`🔒 Locked amount: ${lockedAmount} APT`);
      console.log(`📊 Total needed (with gas): ${totalNeeded} APT`);

      // Check if sufficient locked funds
      if (lockedAmount < totalNeeded) {
        alert(`Insufficient locked funds!\nNeeded: ${totalNeeded.toFixed(4)} APT\nLocked: ${lockedAmount.toFixed(4)} APT\nPlease lock more funds in your Profile.`);
        return;
      }

      // Confirm with user
      const confirmed = window.confirm(
        `Pay all pending bills using locked funds?\n\n` +
        `Bills to pay: ${billCount}\n` +
        `Total amount: ${totalAmount.toFixed(4)} APT\n` +
        `Gas estimate: ${gasEstimate.toFixed(4)} APT\n` +
        `Total cost: ${totalNeeded.toFixed(4)} APT\n\n` +
        `This will use your locked funds and create a group transaction.`
      );

      if (!confirmed) return;

      // Pre-payment verification: Check payee balances before payment
      console.log('🔍 PRE-PAYMENT VERIFICATION:');
      for (let i = 0; i < frontendPendingBills.length && i < 3; i++) {
        const bill = frontendPendingBills[i];
        try {
          console.log(`📊 Bill ${i + 1}:`, {
            payee: bill.payee,
            amount: bill.amount,
            description: bill.description
          });
          
          // Check if payee address is valid/initialized
          const isInitialized = await client.view({
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_address_initialized`,
            type_arguments: [],
            arguments: [bill.payee],
          });
          
          // Get payee balance before payment
          const payeeBalanceBefore = await client.view({
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_apt_balance`,
            type_arguments: [],
            arguments: [bill.payee],
          });
          
          console.log(`💰 Payee ${bill.payee} - Initialized: ${isInitialized[0]}, Balance Before: ${Number(payeeBalanceBefore[0])/100000000} APT`);
        } catch (error) {
          console.error(`❌ Error checking payee ${bill.payee}:`, error);
        }
      }

      console.log('📡 Submitting pay all pending bills transaction...');
      console.log('📋 Transaction payload:', {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::pay_all_pending_bills`,
        args: [],
        type_args: []
      });

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::pay_all_pending_bills`,
        type_arguments: [],
        arguments: [],
      };

      console.log('🔐 Requesting wallet signature...');
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      
      console.log('📨 Transaction response:', response);
      
      if (!response?.hash) throw new Error("Transaction failed - no hash returned");
      
      console.log('⏳ Waiting for transaction confirmation...');
      console.log('🔗 Transaction hash:', response.hash);
      
      const txResult = await client.waitForTransaction(response.hash);
      console.log('✅ Transaction confirmed:', txResult);
      
      // Post-payment verification: Check payee balances after payment
      console.log('🔍 POST-PAYMENT VERIFICATION:');
      for (let i = 0; i < frontendPendingBills.length && i < 3; i++) {
        const bill = frontendPendingBills[i];
        try {
          const payeeBalanceAfter = await client.view({
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_apt_balance`,
            type_arguments: [],
            arguments: [bill.payee],
          });
          
          console.log(`💰 Payee ${bill.payee} - Balance After: ${Number(payeeBalanceAfter[0])/100000000} APT (Expected increase: ${bill.amount} APT)`);
        } catch (error) {
          console.error(`❌ Error checking payee balance after payment:`, error);
        }
      }
      
      console.log('✅ All bills paid successfully!');
      
      // Store batch transaction hash for this user
      const currentUserAddress = await getUserAddress();
      if (currentUserAddress) {
        const batchHashes = JSON.parse(localStorage.getItem('batchTransactionHashes') || '{}');
        if (!batchHashes[currentUserAddress]) {
          batchHashes[currentUserAddress] = [];
        }
        batchHashes[currentUserAddress].push({
          hash: response.hash,
          timestamp: Date.now(),
          billCount: billCount
        });
        localStorage.setItem('batchTransactionHashes', JSON.stringify(batchHashes));
      }
      
      alert(`All pending bills paid successfully using locked funds!\nTransaction Hash: ${response.hash.slice(0, 10)}...\nView this transaction in your Profile.\n\nCheck console for detailed payment verification.`);
      
      // Refresh bills from smart contract
      setTimeout(async () => {
        console.log('🔄 Refreshing bills from smart contract...');
        await fetchUserBills();
      }, 3000);

      // Add success notification with transaction hash
      const successNotification: Notification = {
        id: Date.now().toString(),
        title: 'Group Payment Complete',
        message: `Successfully paid ${billCount} pending bills using locked funds. Hash: ${response.hash.slice(0, 10)}...`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [successNotification, ...prev]);

    } catch (error: any) {
      console.error('One Click Pay error:', error);
      alert(`Error: ${error?.message || "Failed to pay bills"}`);
      
      const errorNotification: Notification = {
        id: Date.now().toString(),
        title: 'Payment Failed',
        message: error?.message || "Failed to pay all pending bills",
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [errorNotification, ...prev]);
    }
  };

  const handleEnableAutoPay = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setSelectedBill(bill);
      setIsAutopayModalOpen(true);
    }
  };

  const handleSaveAutopay = async (config: AutoPayConfig) => {

    setBills(prev => prev.map(bill => 
      bill.id === config.billId 
        ? { ...bill, status: 'AutoPay Enabled' as const }
        : bill
    ));

    // Store AutoPay config in localStorage for later retrieval
    const existingConfigs = JSON.parse(localStorage.getItem('autopayConfigs') || '{}');
    existingConfigs[config.billId] = config;
    localStorage.setItem('autopayConfigs', JSON.stringify(existingConfigs));
    console.log('💾 Stored AutoPay config:', config);

    // Store user address and bill id in localStorage
    try {
      let userAddress = null;
      if ((window as any).aptos) {
        const accountResponse = await (window as any).aptos.account();
        userAddress = accountResponse.address;
      }
      if (userAddress) {
        const autopayUsers = JSON.parse(localStorage.getItem('autopayUsers') || '[]');
        autopayUsers.push({ address: userAddress, billId: config.billId });
        localStorage.setItem('autopayUsers', JSON.stringify(autopayUsers));
        console.log('💾 Stored user address and billId:', { address: userAddress, billId: config.billId });
      }
    } catch (err) {
      console.error('Failed to store user address and billId:', err);
    }

    // Call update_bill_status entry function in Move contract
    try {
      if (!(window as any).aptos) throw new Error("Wallet not connected");
      if (!MODULE_ADDRESS) throw new Error("Contract address not configured");
      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::update_bill_status`,
        type_arguments: [],
        arguments: [config.billId, 2], // 2 = AutoPay Enabled
      };
      console.log('🔐 Requesting wallet signature for AutoPay status update...', payload);
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      console.log('📨 Transaction response:', response);
      if (!response?.hash) throw new Error("Transaction failed - no hash returned");
      const txResult = await client.waitForTransaction(response.hash);
      console.log('✅ AutoPay status updated in contract:', txResult);
    } catch (error: any) {
      console.error('Error updating AutoPay status in contract:', error);
      alert(`Error updating AutoPay status: ${error?.message || error}`);
    }

    // Send autopay bill details to backend MongoDB
    try {
      let userAddress = null;
      if ((window as any).aptos) {
        const accountResponse = await (window as any).aptos.account();
        userAddress = accountResponse.address;
      }
      if (userAddress) {
        await fetch('http://localhost:3001/api/autopay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAddress,
            billDetails: {
              ...config,
              service: selectedBill?.service,
              amount: selectedBill?.amount,
              category: selectedBill?.category,
              payee: selectedBill?.payee,
              dueDate: selectedBill?.dueDate,
            }
          })
        });
        console.log('✅ Autopay bill stored in MongoDB');
      }
    } catch (err) {
      console.error('Failed to store autopay bill in MongoDB:', err);
    }

    // Add autopay notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'AutoPay Enabled',
      message: `AutoPay has been set up for ${selectedBill?.service}`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Handle pay all pending bills
  const handlePayAllPendingBills = async () => {
    try {
      console.log('🚀 === STARTING PAY ALL PENDING BILLS ===');
      console.log('🔧 DEBUG: Button clicked, starting payment process...');
      
      const userAddress = await getUserAddress();
      if (!userAddress) {
        console.error('❌ No user address found');
        alert('Please connect your wallet');
        return;
      }

      console.log('👤 User Address:', userAddress);
      console.log('🏠 Module Address:', MODULE_ADDRESS);
      console.log('🌐 Network:', NODE_URL);
      
      if (!(window as any).aptos) throw new Error("Wallet not connected");
      if (!MODULE_ADDRESS) throw new Error("Contract address not configured");
      
      // Test if wallet is properly connected
      console.log('🔌 Wallet connection test...');
      try {
        const walletAccount = await (window as any).aptos.account();
        console.log('💼 Wallet account:', walletAccount);
      } catch (walletError) {
        console.error('❌ Wallet connection error:', walletError);
        throw new Error("Wallet connection failed");
      }

      // Check pending bills and locked funds
      console.log('🔍 Checking pending bills and locked funds...');
      console.log('📍 Contract address:', MODULE_ADDRESS);
      console.log('📍 Module name:', MODULE_NAME);
      
      // Get pending bills total
      console.log('📞 Calling get_pending_bills_total...');
      const pendingResult = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_pending_bills_total`,
        type_arguments: [],
        arguments: [userAddress],
      });
      
      console.log('📊 Pending bills result:', pendingResult);
      
      const totalAmount = Number(pendingResult[0]) / 100000000; // Convert to APT
      const billCount = Number(pendingResult[1]);
      
      console.log(`📈 Parsed values - Total: ${totalAmount} APT, Count: ${billCount} bills`);
      
      // Also check the frontend bills array for comparison
      const frontendPendingBills = bills.filter(b => b.status === 'Pending');
      console.log(`🎯 Frontend pending bills count: ${frontendPendingBills.length}`);
      console.log('🎯 Frontend pending bills:', frontendPendingBills);
      
      if (billCount === 0) {
        console.log('⚠️ No pending bills found in smart contract');
        alert('No pending bills found');
        return;
      }

      // Get locked funds
      const lockedResult = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_locked_funds`,
        type_arguments: [],
        arguments: [userAddress],
      });
      
      const lockedAmount = Number(lockedResult[0]) / 100000000; // Convert to APT
      const gasEstimate = billCount * 0.001; // 0.001 APT per bill for gas
      const totalNeeded = totalAmount + gasEstimate;

      console.log(`💰 Total amount needed: ${totalAmount} APT`);
      console.log(`⛽ Gas estimate: ${gasEstimate} APT`);
      console.log(`🔒 Locked amount: ${lockedAmount} APT`);
      console.log(`📊 Total needed (with gas): ${totalNeeded} APT`);

      if (lockedAmount < totalNeeded) {
        alert(`Insufficient locked funds!\nNeeded: ${totalNeeded.toFixed(4)} APT\nLocked: ${lockedAmount.toFixed(4)} APT\nPlease lock more funds in your Profile.`);
        return;
      }

      // Confirm with user
      const confirmed = window.confirm(
        `Pay all pending bills?\n\n` +
        `Bills to pay: ${billCount}\n` +
        `Total amount: ${totalAmount.toFixed(4)} APT\n` +
        `Gas estimate: ${gasEstimate.toFixed(4)} APT\n` +
        `Total cost: ${totalNeeded.toFixed(4)} APT\n\n` +
        `This will use your locked funds.`
      );

      if (!confirmed) return;

      console.log('📡 Submitting pay all pending bills transaction...');
      console.log('📋 Transaction payload:', {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::pay_all_pending_bills`,
        args: [],
        type_args: []
      });

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::pay_all_pending_bills`,
        type_arguments: [],
        arguments: [],
      };

      console.log('🔐 Requesting wallet signature...');
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      
      console.log('📨 Transaction response:', response);
      
      if (!response?.hash) throw new Error("Transaction failed - no hash returned");
      
      console.log('⏳ Waiting for transaction confirmation...');
      console.log('🔗 Transaction hash:', response.hash);
      
      const txResult = await client.waitForTransaction(response.hash);
      console.log('✅ Transaction confirmed:', txResult);
      console.log('✅ All bills paid successfully!');
      
      alert(`All pending bills paid successfully!\nTransaction Hash: ${response.hash.slice(0, 10)}...`);
      
      // Refresh bills and notifications
      setTimeout(async () => {
        await fetchUserBills();
      }, 3000);

      // Add success notification
      const successNotification: Notification = {
        id: Date.now().toString(),
        title: 'All Bills Paid',
        message: `Successfully paid ${billCount} pending bills using locked funds`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [successNotification, ...prev]);

    } catch (error: any) {
      console.error('Pay all bills error:', error);
      alert(`Error: ${error?.message || "Failed to pay bills"}`);
      
      const errorNotification: Notification = {
        id: Date.now().toString(),
        title: 'Payment Failed',
        message: error?.message || "Failed to pay all pending bills",
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [errorNotification, ...prev]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Console log all form data that user entered
      console.log('🚀 === STARTING BILL SUBMISSION PROCESS ===');
      console.log('📋 Form Data Object:', formData);
      console.log('💰 Amount:', formData.amount);
      console.log('📝 Description:', formData.description);
      console.log('📧 Address (Payee):', formData.address);
      console.log('📅 Due Date:', formData.dueDate);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('===============================================');    // Validate required fields
    if (!formData.description || !formData.amount || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (!(window as any).aptos) throw new Error("Wallet not connected");
      if (!MODULE_ADDRESS) throw new Error("Contract address not configured");

      // Prepare parameters to match smart contract signature
      // public entry fun add_bill(user: &signer, description: vector<u8>, amount: u64, payee: address, due_date: u64, bill_id: u64, status: u8)
      console.log('🔄 Converting form data to blockchain format...');

      // Convert description to vector<u8>
      const descriptionBytes = Array.from(new TextEncoder().encode(formData.description));

      // Convert amount to octas (assuming input is in APT)
      const amountInOctas = Math.floor(formData.amount * 100000000);

      // Convert due date to timestamp (if provided) or use default (30 days from now)
      const dueDateTimestamp = formData.dueDate
        ? Math.floor(new Date(formData.dueDate).getTime() / 1000)
        : Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);

      // bill_id: set to 0 (let contract assign)
      const billId = 0;
      // status: set to 0 (pending)
      const status = 0;

      // Validate payee address
      let payeeAddress = formData.address;
      if (!payeeAddress.startsWith('0x')) {
        payeeAddress = '0x' + payeeAddress;
      }

      const payload = {
        type: "entry_function_payload",
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_bill`,
        type_arguments: [],
        arguments: [
          descriptionBytes,   // description: vector<u8>
          amountInOctas,      // amount: u64
          payeeAddress,       // payee: address
          dueDateTimestamp,   // due_date: u64
          billId,             // bill_id: u64
          status              // status: u8
        ],
      };

      console.log('📦 Complete Payload to Blockchain:', payload);
      console.log('🎯 Function:', payload.function);
      console.log('📋 Arguments:', payload.arguments);

      console.log('📡 Submitting transaction to blockchain...');
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      console.log('📨 Transaction Response:', response);

      if (!response?.hash) throw new Error("Transaction failed");

      console.log('⏳ Waiting for transaction confirmation...');
      await client.waitForTransaction(response.hash);
      console.log('✅ Transaction confirmed!');

      // Success notification
      alert(`Bill added successfully! Transaction Hash: ${response.hash.slice(0, 10)}...`);

      // Reset form
      setFormData({ amount: 0, description: '', address: '', dueDate: '' });

      // Fetch updated bills from smart contract instead of manually adding
      console.log('🔄 Refreshing bills from smart contract after successful addition...');
      console.log('⏰ Waiting 3 seconds for blockchain to sync...');
      setTimeout(async () => {
        await fetchUserBills();
      }, 3000);
      
      // Add success notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Bill Added to Blockchain',
        message: `Bill "${formData.description}" successfully added to blockchain`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
    } catch (err: any) {
      console.error('Transaction error:', err);
      alert(`Error: ${err?.message || "Failed to add bill to blockchain"}`);
      
      // Add error notification
      const errorNotification: Notification = {
        id: Date.now().toString(),
        title: 'Transaction Failed',
        message: err?.message || "Failed to add bill to blockchain",
        type: 'error',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [errorNotification, ...prev]);
    }
  };


  const getTotalAmount = () => {
    return filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  };

  const getStatusCounts = () => {
    return {
      total: bills.length,
      paid: bills.filter(b => b.status === 'Paid').length,
      pending: bills.filter(b => b.status === 'Pending').length,
      autopay: bills.filter(b => b.status === 'AutoPay Enabled').length
    };
  };

  const statusCounts = getStatusCounts();
  const pendingBillsCount = bills.filter(bill => bill.status === 'Pending').length;

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <div className="header-title">
              <h1>Dashboard</h1>
              <p>Manage your bills and payments</p>
            </div>
            <div className="header-actions">
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onClearAll={handleClearAllNotifications}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="dashboard-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-number">{statusCounts.total}</div>
                <div className="stat-label">Total Bills</div>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-number">{statusCounts.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-number">{statusCounts.paid}</div>
                <div className="stat-label">Paid</div>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon">🤖</div>
              <div className="stat-info">
                <div className="stat-number">{statusCounts.autopay}</div>
                <div className="stat-label">AutoPay</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="dashboard-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="controls-left">
            {pendingBillsCount > 0 && (
              <motion.button
                className="btn-primary one-click-pay pulse-glow"
                onClick={handleOneClickPay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⚡ Pay All Pending ({pendingBillsCount})
              </motion.button>
            )}
          </div>
          
          <div className="filter-controls">
            {(['All', 'Pending', 'Paid', 'AutoPay Enabled'] as FilterStatus[]).map((status) => (
              <motion.button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="add-bill-form glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3>Add New Bill</h3>
          <form onSubmit={handleFormSubmit} className="bill-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount - APT</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bill description"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payee Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="recipient address"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  placeholder="Select due date"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Bill
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          className="bills-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bills-header">
            <h2>Your Bills</h2>
            <div className="bills-actions">
              <div className="total-amount">
                Total: <span className="neon-green">{getTotalAmount().toFixed(2)} APT</span>
              </div>
              {bills.filter(b => b.status === 'Pending').length > 0 && (
                <motion.button
                  className="pay-all-btn"
                  onClick={handlePayAllPendingBills}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💰 Pay All Pending Bills ({bills.filter(b => b.status === 'Pending').length})
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div 
              className="bills-grid"
              layout
            >
              {filteredBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onPayNow={handlePayNow}
                  onEnableAutoPay={handleEnableAutoPay}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredBills.length === 0 && (
            <motion.div
              className="no-bills glass"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="no-bills-icon">📋</div>
              <h3>No bills found</h3>
              <p>
                {filter === 'All' 
                  ? "You don't have any bills yet. Add one using the form above." 
                  : `No bills with "${filter}" status.`
                }
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AutopayModal
        isOpen={isAutopayModalOpen}
        onClose={() => setIsAutopayModalOpen(false)}
        bill={selectedBill}
        onSave={handleSaveAutopay}
      />
    </div>
  );
};

export default DashboardPage;