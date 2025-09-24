import React from 'react';
import { motion } from 'framer-motion';
import '../styles/footer.css';

const Footer: React.FC = () => {
  const socialLinks = [
    { name: 'GitHub', url: '#', icon: '🔗' },
    { name: 'Twitter', url: '#', icon: '🐦' },
    { name: 'Discord', url: '#', icon: '💬' },
    { name: 'Telegram', url: '#', icon: '✈️' }
  ];

  return (
    <motion.footer 
      className="footer glass"
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="neon-blue">Pulse</h3>
            <p className="footer-description">
              Next-generation decentralized bill payment and AutoPay system built on Algorand blockchain.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="#docs">Documentation</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Community</h4>
            <div className="social-links">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  className="social-link"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  title={link.name}
                >
                  <span>{link.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            <p>&copy; 2024 Pulse dApp. Built with ❤️ on Algorand.</p>
            <p className="tech-stack">React • TypeScript • Framer Motion • Three.js</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;