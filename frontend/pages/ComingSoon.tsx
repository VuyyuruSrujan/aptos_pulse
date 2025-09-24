import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/coming-soon.css';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title = "Coming Soon", 
  subtitle = "This feature is under development" 
}) => {
  return (
    <div className="coming-soon">
      <div className="container">
        <motion.div
          className="coming-soon-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="coming-soon-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            🚀
          </motion.div>

          <motion.h1
            className="coming-soon-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="coming-soon-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="coming-soon-features glass"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h3>What's Coming</h3>
            <ul className="features-list">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <span className="feature-icon">⚡</span>
                Advanced smart contract integration
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <span className="feature-icon">🔒</span>
                Multi-signature wallet support
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <span className="feature-icon">📊</span>
                Advanced analytics dashboard
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <span className="feature-icon">🌐</span>
                Cross-chain payment support
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                <span className="feature-icon">🤖</span>
                AI-powered bill prediction
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            className="coming-soon-timeline glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3>Development Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker active"></div>
                <div className="timeline-content">
                  <h4>Phase 1: Core Features</h4>
                  <p>Basic bill payment and AutoPay setup</p>
                  <span className="timeline-status completed">✅ Completed</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker active"></div>
                <div className="timeline-content">
                  <h4>Phase 2: Wallet Integration</h4>
                  <p>Connect with Algorand wallets</p>
                  <span className="timeline-status in-progress">🔄 In Progress</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>Phase 3: Advanced Features</h4>
                  <p>Smart contracts and automation</p>
                  <span className="timeline-status upcoming">⏳ Upcoming</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="coming-soon-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Link to="/dashboard">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Dashboard
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Home
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            className="coming-soon-notify glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h4>Get Notified</h4>
            <p>Stay updated on our progress and be the first to know when new features launch!</p>
            <div className="notify-form">
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Notification signup coming soon!')}
              >
                Notify Me
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;