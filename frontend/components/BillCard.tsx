import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill } from '../types';
import '../styles/billcard.css';

import { AutoPayConfig } from '../types';
interface BillCardProps {
  bill: Bill;
  onPayNow: (billId: string) => void;
  onEnableAutoPay: (billId: string) => void;
  autopayConfig?: AutoPayConfig;
  showAutopayDetails?: boolean;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onPayNow, onEnableAutoPay, autopayConfig, showAutopayDetails = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'status-paid';
      case 'Pending': return 'status-pending';
      case 'AutoPay Enabled': return 'status-autopay';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && bill.status === 'Pending';
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`bill-card glass ${isOverdue(bill.dueDate) ? 'overdue' : ''}`}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        layout
      >
        <div className="bill-header">
          <div className="bill-service">
            <h3>{bill.service}</h3>
            <p className="bill-category">{bill.category}</p>
          </div>
          <motion.div
            className={`status-badge ${getStatusColor(bill.status)}`}
            whileHover={{ scale: 1.05 }}
          >
            {bill.status}
          </motion.div>
        </div>

        <div className="bill-details">
          <div className="bill-amount">
            <span className="currency"></span>
            <span className="amount">{bill.amount.toFixed(2)} APT</span>
          </div>
          {showAutopayDetails && autopayConfig ? (
            <div className="bill-autopay-schedule" style={{ marginBottom: '0.5rem' }}>
              <span className="due-label">AutoPay Schedule:</span>
              <span className="autopay-schedule-value">
                Pay on day <b>{autopayConfig.paymentDate}</b> of each <b>{autopayConfig.frequency}</b>
                {autopayConfig.maxAmount && (
                  <span>, up to <b>{autopayConfig.maxAmount} APT</b></span>
                )}
              </span>
            </div>
          ) : (
            <div className="bill-due">
              <span className="due-label">Due Date:</span>
              <span className={`due-date ${isOverdue(bill.dueDate) ? 'overdue-date' : ''}`}>
                {formatDate(bill.dueDate)}
              </span>
            </div>
          )}

          {bill.description && (
            <div className="bill-description">
              <p>{bill.description}</p>
            </div>
          )}

          {bill.payee && (
            <div className="bill-payee">
              <span className="payee-label">Recipient:</span>
              <span className="payee-address" title={bill.payee}>
                {bill.payee.length > 20 ? `${bill.payee.slice(0, 10)}...${bill.payee.slice(-6)}` : bill.payee}
              </span>
            </div>
          )}

          {bill.lastPaid && (
            <div className="last-paid">
              <span>Last paid: {formatDate(bill.lastPaid)}</span>
            </div>
          )}
        </div>

        <div className="bill-actions">
          {bill.status === 'Pending' && (
            <motion.button
              className="btn-primary"
              onClick={() => onPayNow(bill.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pay Now
            </motion.button>
          )}
          
          {bill.status !== 'AutoPay Enabled' && (
            <motion.button
              className="btn-secondary"
              onClick={() => onEnableAutoPay(bill.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enable AutoPay
            </motion.button>
          )}

          {bill.status === 'AutoPay Enabled' && (
            <motion.div
              className="autopay-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="neon-purple">🤖 AutoPay Actived</span>
            </motion.div>
          )}
        </div>

        {isOverdue(bill.dueDate) && (
          <motion.div
            className="overdue-indicator"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ⚠️ Overdue
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BillCard;