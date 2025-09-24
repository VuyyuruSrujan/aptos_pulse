interface AptosWallet {
  isConnected: () => Promise<boolean>;
  connect: () => Promise<{ address: string }>;
  account: () => Promise<{ address: string }>;
  disconnect?: () => Promise<void>;
}

interface Window {
  aptos?: AptosWallet;
  martian?: {
    connect: () => Promise<{ address: string }>;
  };
  pontem?: {
    connect: () => Promise<{ address: string }>;
  };
}
