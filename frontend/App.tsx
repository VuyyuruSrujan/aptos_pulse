import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AutoPayPage from "./pages/AutoPayPage";
import ComingSoon from "./pages/ComingSoon";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import './styles/globals.css';
import './styles/app.css';

const queryClient = new QueryClient();


// Wrapper to fetch bills from contract and pass to AutoPayPage
import { Bill } from './types';
import { mockBills } from './data/mockData';
import { AptosClient } from 'aptos';
import { NETWORK, MODULE_ADDRESS } from './constants';

const NODE_URL = `https://fullnode.${NETWORK}.aptoslabs.com/v1`;
const MODULE_NAME = 'pulse';
const client = new AptosClient(NODE_URL);

const AutoPayPageWrapper: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(mockBills);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        if (!(window as any).aptos) return;
        const userAddress = (await (window as any).aptos.account()).address;
        const result = await client.view({
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_bills`,
          type_arguments: [],
          arguments: [userAddress],
        });
        if (result && result.length > 0 && Array.isArray(result[0])) {
          const smartContractBills = result[0];
          // Use the same transformation as DashboardPage
          const transformedBills: Bill[] = smartContractBills.map((bill: any) => {
            let status: 'Pending' | 'Paid' | 'AutoPay Enabled' = 'Pending';
            if (Number(bill.status) === 1) status = 'Paid';
            if (Number(bill.status) === 2) status = 'AutoPay Enabled';
            // Decode description (vector<u8> or hex string) to string, like DashboardPage
            const convertVectorToString = (vector: any, defaultValue: string): string => {
              if (!vector) return defaultValue;
              if (typeof vector === 'string' && vector.startsWith('0x')) {
                try {
                  const hex = vector.slice(2);
                  const bytes = [];
                  for (let i = 0; i < hex.length; i += 2) {
                    bytes.push(parseInt(hex.substr(i, 2), 16));
                  }
                  return new TextDecoder().decode(new Uint8Array(bytes)) || defaultValue;
                } catch {}
              }
              if (Array.isArray(vector)) {
                try {
                  return new TextDecoder().decode(new Uint8Array(vector)) || defaultValue;
                } catch {}
              }
              if (typeof vector === 'string') return vector;
              return defaultValue;
            };
            return {
              id: bill.id.toString(),
              service: convertVectorToString(bill.description, 'No description'),
              dueDate: bill.due_date && Number(bill.due_date) > 0 ? new Date(Number(bill.due_date) * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              amount: Number(bill.amount) / 100000000,
              status,
              description: '',
              category: 'Payment',
              lastPaid: '',
              payee: bill.payee || '',
            };
          });
          setBills(transformedBills);
        }
      } catch (e) {}
    };
    fetchBills();
  }, []);
  return <AutoPayPage bills={bills} />;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/autopay" element={<AutoPayPageWrapper />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
