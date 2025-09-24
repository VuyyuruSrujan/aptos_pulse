import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/contact.css';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      value: 'hello@pulse-dapp.com',
      description: 'Send us an email anytime'
    },
    {
      icon: '💬',
      title: 'Discord',
      value: 'PulseDApp#1234',
      description: 'Join our community'
    },
    {
      icon: '🐦',
      title: 'Twitter',
      value: '@PulseDApp',
      description: 'Follow us for updates'
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'Decentralized',
      description: 'Building the future globally'
    }
  ];

  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Blockchain Developer',
      avatar: '👨‍💻',
      bio: 'Algorand specialist with 5+ years in DeFi'
    },
    {
      name: 'Sarah Kim',
      role: 'Product Designer',
      avatar: '👩‍🎨',
      bio: 'UX/UI expert focused on fintech innovation'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Smart Contract Auditor',
      avatar: '🔒',
      bio: 'Security researcher ensuring protocol safety'
    }
  ];

  return (
    <div className="contact-page">
      <div className="container">
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Get in Touch</h1>
          <p>Have questions about Pulse? We'd love to hear from you.</p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            className="contact-form-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="contact-form glass">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What is this about?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn-primary submit-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                  <span className="submit-icon">📤</span>
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div
            className="contact-info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="contact-info">
              <h2>Contact Information</h2>
              <div className="contact-cards">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    className="contact-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                  >
                    <div className="contact-icon">{info.icon}</div>
                    <div className="contact-details">
                      <h3>{info.title}</h3>
                      <p className="contact-value">{info.value}</p>
                      <p className="contact-description">{info.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="team-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h2>Meet the Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="team-card glass"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.03 }}
              >
                <div className="team-avatar">{member.avatar}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="faq-section glass"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <motion.div
              className="faq-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Is Pulse secure?</h3>
              <p>Yes! Pulse is built on Algorand blockchain with audited smart contracts and follows best security practices.</p>
            </motion.div>
            <motion.div
              className="faq-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <h3>What fees does Pulse charge?</h3>
              <p>Pulse only charges minimal transaction fees required by the Algorand network. No hidden fees or subscriptions.</p>
            </motion.div>
            <motion.div
              className="faq-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Can I cancel AutoPay anytime?</h3>
              <p>Absolutely! You have full control over your AutoPay settings and can modify or cancel them at any time.</p>
            </motion.div>
            <motion.div
              className="faq-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Which wallets are supported?</h3>
              <p>Currently developing integration with Algorand Wallet, MyAlgo, and Pera Wallet. More wallets coming soon!</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;