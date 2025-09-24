import React, { useEffect, useState } from 'react';
import { Bill, Transaction, AutoPayConfig } from '../types';
import { useNavigate } from 'react-router-dom';
import { AptosClient } from 'aptos';
import { MODULE_ADDRESS, NETWORK } from '../constants';
import BillCard from '../components/BillCard';

interface AutoPayPageProps {
  bills: Bill[];
}

const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1`;
const MODULE_NAME = 'pulse';
const client = new AptosClient(NODE_URL);


// Simulate fetching AutoPayConfig for each bill (in real app, fetch from contract or backend)
const getAutoPayConfigForBill = (billId: string): AutoPayConfig | null => {
  // This should be replaced with real data source
  const configs = JSON.parse(localStorage.getItem('autopayConfigs') || '{}');
  return configs[billId] || null;
};

const AutoPayPage: React.FC<AutoPayPageProps> = ({ bills }) => {
  const [autoPayBills, setAutoPayBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [autoPayConfigs, setAutoPayConfigs] = useState<{ [billId: string]: AutoPayConfig }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const enabled = bills.filter(bill => bill.status === 'AutoPay Enabled');
    setAutoPayBills(enabled);
    // Load configs for enabled bills
    const configs: { [billId: string]: AutoPayConfig } = {};
    enabled.forEach(bill => {
      const cfg = getAutoPayConfigForBill(bill.id);
      console.log(`🔍 AutoPay config for bill ${bill.id}:`, cfg);
      if (cfg) {
        configs[bill.id] = cfg;
      } else {
        // Provide default config if not found
        configs[bill.id] = {
          billId: bill.id,
          paymentDate: 1,
          frequency: 'Monthly',
          maxAmount: bill.amount,
          enabled: true
        };
        console.log(`📝 Using default config for bill ${bill.id}`);
      }
    });
    setAutoPayConfigs(configs);
    console.log('💾 All AutoPay configs:', configs);
  }, [bills]);

  const fetchTransactions = async (billId: string) => {
    try {
      // Replace with actual contract view call for bill transactions
      const userAddress = (window as any).aptos ? (await (window as any).aptos.account()).address : null;
      if (!userAddress) return;
      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_bill_transactions`,
        type_arguments: [],
        arguments: [userAddress, billId],
      });
      setTransactions((result[0] as Transaction[]) || []);
    } catch (error) {
      setTransactions([]);
    }
  };

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    fetchTransactions(bill.id);
  };

  return (
    <div className="autopay-section">
      <h2 style={{ marginLeft: '2.5rem', marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 700, color: '#7f5af0', letterSpacing: '0.03em' }}>
        AutoPay Enabled Bills
      </h2>
  <div className="autopay-bills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginLeft: '2.5rem' }}>
        {autoPayBills.length === 0 && <p>No AutoPay enabled bills.</p>}
        {autoPayBills.map(bill => (
          <div key={bill.id} style={{ cursor: 'pointer', flex: '1 1 350px', minWidth: 320, maxWidth: 400 }} onClick={() => handleBillClick(bill)}>
            <BillCard bill={bill} onPayNow={() => {}} onEnableAutoPay={() => {}} 
              autopayConfig={autoPayConfigs[bill.id]}
              showAutopayDetails={true}
            />
          </div>
        ))}
      </div>
      {selectedBill && (
        <div className="autopay-bill-transactions">
          <h3>Transactions for {selectedBill.service}</h3>
          {transactions.length === 0 ? (
            <p>No transactions found for this bill.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Status</th>
                  <th>Hash</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.month}</td>
                    <td>{tx.status}</td>
                    <td>{tx.hash}</td>
                    <td>{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoPayPage;
