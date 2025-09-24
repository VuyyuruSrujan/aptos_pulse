import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D1117',
      color: '#ffffff',
      padding: '20px'
    }}>
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          style={{
            fontSize: '4rem',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #4A90E2, #00FFC2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.h1>
        <motion.p
          style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '24px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Oops! Page not found in the blockchain
        </motion.p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <motion.button
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #4A90E2, #00FFC2)',
              border: 'none',
              borderRadius: '24px',
              padding: '16px 32px',
              color: '#0D1117',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Return to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
