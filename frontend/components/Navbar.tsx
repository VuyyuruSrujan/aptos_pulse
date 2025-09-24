import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/navbar.css';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log wallet address changes
  useEffect(() => {
    console.log("Wallet address changed:", walletAddress);
  }, [walletAddress]);
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/autopay', label: 'AutoPay' },
    { path: '/profile', label: 'Profile' },
    { path: '/contact', label: 'Contact' }
  ];

  // Check for existing wallet connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        if (window.aptos) {
          const isConnected = await window.aptos.isConnected();
          if (isConnected) {
            const accountResponse = await window.aptos.account();
            setWalletAddress(accountResponse.address);
          }
        }
      } catch (error) {
        console.error("Error checking existing wallet connection:", error);
      }
    };

    checkExistingConnection();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle navigation to dashboard with wallet check
  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link navigation
    
    console.log("Dashboard clicked! Wallet address:", walletAddress);
    console.log("Wallet connected?", !!walletAddress);
    
    if (!walletAddress) {
      console.log("No wallet connected - showing toast and redirecting");
      toast("Please connect your wallet first to access the Dashboard!");
      setTimeout(() => {
        navigate('/');
      }, 2000); // Navigate back to home after 2 seconds
    } else {
      console.log("Wallet connected - navigating to dashboard");
      navigate('/dashboard');
    }
  };

  async function disconnect() {
    try {
      if (window.aptos?.disconnect && typeof window.aptos.disconnect === 'function') {
        await window.aptos.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setWalletAddress(null);
      setShowDropdown(false);
      toast("Wallet disconnected successfully");
    }
  }

  async function copyAddress() {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast("Address copied to clipboard");
    }
  }

  //   const testToast = () => {
  //   toast("Test toast message!");
  // };

  async function connectfun() {
    console.log("Connect button clicked!");
    try {
      setWalletError(null);

      console.log("Checking for wallets...");
      console.log("window.aptos:", !!window.aptos);
      console.log("window.martian:", !!(window as any).martian);
      console.log("window.pontem:", !!(window as any).pontem);

      // Check for Petra wallet
      if (window.aptos) {
        console.log("Attempting to connect with Petra wallet...");
        const response = await window.aptos.connect();
        console.log("Petra response:", response);
        setWalletAddress(response.address);
        toast("Connected Successfully!");
        return;
      }

      // Check for Martian wallet
      if ((window as any).martian) {
        console.log("Attempting to connect with Martian wallet...");
        const response = await (window as any).martian.connect();
        console.log("Martian response:", response);
        setWalletAddress(response.address);
        toast("Connected Successfully!");
        return;
      }

      // Check for Pontem wallet
      if ((window as any).pontem) {
        console.log("Attempting to connect with Pontem wallet...");
        const response = await (window as any).pontem.connect();
        console.log("Pontem response:", response);
        setWalletAddress(response.address);
        toast("Connected Successfully!");
        return;
      }

      console.log("No wallet found");
      setWalletError("No Aptos wallet found. Please install Petra, Martian, or Pontem wallet.");
    } catch (error) {
      setWalletError("Error connecting wallet. Please try again.");
      console.error("Error connecting wallet:", error);
    }
  }

  return (
    <motion.nav
      className="navbar glass"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="neon-blue">Pulse</span>
            </motion.div>
          </Link>

          <div className="navbar-links">
            {navItems.map((item) => (
              <motion.div key={item.path} whileHover={{ scale: 1.1 }}>
                <Link
                  to={item.path}
                  className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={item.path === '/dashboard' ? handleDashboardClick : undefined}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {walletAddress ? (
            <div className="wallet-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
              <motion.button
                className="wallet-connected-btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Connected: {truncateAddress(walletAddress)}
              </motion.button>

              {showDropdown && (
                <div className="wallet-dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'rgba(13, 17, 23, 0.9)',
                  border: '1px solid rgba(74, 144, 226, 0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  minWidth: '200px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000
                }}>
                  <button
                    onClick={copyAddress}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: copied ? '#00FFC2' : '#fff',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(74, 144, 226, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy Address'}
                  </button>
                  <button
                    onClick={disconnect}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🚪 Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              className="wallet-connect-btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectfun}
            >
              Connect Wallet
            </motion.button>
          )}
          {walletError && (
            <div className="wallet-error" style={{ color: 'red', marginTop: '8px' }}>
              {walletError}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;