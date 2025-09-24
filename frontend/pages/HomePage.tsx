import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';
import '../styles/homepage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <ThreeBackground />
      
      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span className="neon-blue">Pulse</span>
            <br />
            <span className="gradient-text">Unified Bill Payment & AutoPay</span>
          </motion.h1>
          
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Experience the future of decentralized bill payments on Algorand blockchain. 
            Never miss a payment again with smart contracts and automated scheduling.
          </motion.p>
          
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link to="/dashboard">
              <motion.button
                className="btn-primary hero-cta"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(74, 144, 226, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <span className="cta-arrow">→</span>
              </motion.button>
            </Link>
            
            <motion.button
              className="btn-secondary hero-demo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('Demo coming soon!')}
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="feature-grid">
            <motion.div
              className="feature-card glass"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon">🔐</div>
              <h3>Secure Payments</h3>
              <p>Smart contract security with Algorand blockchain technology</p>
            </motion.div>

            <motion.div
              className="feature-card glass"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon">🤖</div>
              <h3>AutoPay</h3>
              <p>Set up automated payments and never worry about due dates</p>
            </motion.div>

            <motion.div
              className="feature-card glass"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon">⚡</div>
              <h3>Instant Processing</h3>
              <p>Lightning-fast transactions with minimal fees</p>
            </motion.div>

            <motion.div
              className="feature-card glass"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Track spending patterns and payment history</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="stats-grid glass">
            <div className="stat-item">
              <motion.div
                className="stat-number neon-green"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
              >
                10K+
              </motion.div>
              <div className="stat-label">Bills Paid</div>
            </div>
            <div className="stat-item">
              <motion.div
                className="stat-number neon-blue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.6 }}
              >
                $2M+
              </motion.div>
              <div className="stat-label">Total Volume</div>
            </div>
            <div className="stat-item">
              <motion.div
                className="stat-number neon-purple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.8 }}
              >
                99.9%
              </motion.div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;