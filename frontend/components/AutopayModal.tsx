import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bill, AutoPayConfig } from '../types';
import '../styles/autopay-modal.css';

interface AutopayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onSave: (config: AutoPayConfig) => void;
}

const AutopayModal: React.FC<AutopayModalProps> = ({ isOpen, onClose, bill, onSave }) => {
  const [config, setConfig] = useState<Partial<AutoPayConfig>>({
    paymentDate: 1,
    frequency: 'Monthly',
    maxAmount: bill?.amount || 0,
    enabled: true
  });

  const handleSave = () => {
    if (!bill) return;
    // Log selected date and frequency
    console.log('AutoPay Setup:');
    console.log('Bill ID:', bill.id);
    console.log('Selected Payment Date:', config.paymentDate);
    console.log('Selected Frequency:', config.frequency);
    console.log('Max Amount:', config.maxAmount);
    
    const autoPayConfig: AutoPayConfig = {
      billId: bill.id,
      paymentDate: config.paymentDate || 1,
      frequency: config.frequency || 'Monthly',
      maxAmount: config.maxAmount || bill.amount,
      enabled: true
    };
    
    onSave(autoPayConfig);
    onClose();
  };

  const handleClose = () => {
    setConfig({
      paymentDate: 1,
      frequency: 'Monthly',
      maxAmount: bill?.amount || 0,
      enabled: true
    });
    onClose();
  };

  if (!bill) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="autopay-modal glass"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2>Setup AutoPay</h2>
              <motion.button
                className="close-btn"
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>

            <div className="modal-body">
              <div className="bill-summary">
                <h3>{bill.service}</h3>
                <div className="bill-amount-display">
                  <span className="currency">$</span>
                  <span className="amount">{bill.amount.toFixed(2)}</span>
                </div>
                <p className="bill-category">{bill.category}</p>
              </div>

              <div className="autopay-form">
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <select
                    className="form-input"
                    value={config.paymentDate}
                    onChange={(e) => setConfig({ ...config, paymentDate: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-input"
                    value={config.frequency}
                    onChange={(e) => setConfig({ ...config, frequency: e.target.value as 'Monthly' | 'Quarterly' | 'Yearly' })}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                {/* <div className="form-group">
                  <label className="form-label">Maximum Payment Limit</label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      className="form-input amount-input"
                      value={config.maxAmount}
                      onChange={(e) => setConfig({ ...config, maxAmount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="form-hint">
                    AutoPay will only process if the bill amount is less than or equal to this limit.
                  </p>
                </div> */}

                <div className="autopay-benefits">
                  <h4>AutoPay Benefits</h4>
                  <ul>
                    <li>✅ Never miss a payment</li>
                    <li>✅ Avoid late fees</li>
                    <li>✅ Smart contract security</li>
                    <li>✅ Cancel anytime</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <motion.button
                className="btn-secondary"
                onClick={handleClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="btn-primary"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enable AutoPay
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AutopayModal;