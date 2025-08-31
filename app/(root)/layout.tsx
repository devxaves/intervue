'use client';

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";

// Define types for Ethereum and Wallet
interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
}

declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: string | null;
}

const Layout = ({ children }: { children: ReactNode }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsUserAuthenticated(authStatus);
      if (!authStatus) redirect("/sign-in");
    };
    
    checkAuth();
    
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum?.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      // Clean up event listeners
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = await getBalance(address);
          const chainId = await getChainId();
          setWalletState({
            isConnected: true,
            address,
            balance,
            chainId
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setIsConnecting(true);
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        const balance = await getBalance(address);
        const chainId = await getChainId();
        
        setWalletState({
          isConnected: true,
          address,
          balance,
          chainId
        });
        
        setShowWalletModal(false);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
      } finally {
        setIsConnecting(false);
      }
    } else {
      // MetaMask not installed
      setShowWalletModal(true);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null
    });
  };

  const getBalance = async (address: string): Promise<string> => {
    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ETH
      return (parseInt(balance) / 1e18).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const getChainId = async (): Promise<string> => {
    try {
      return await window.ethereum!.request({ method: 'eth_chainId' });
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return '0';
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setWalletState(prev => ({
        ...prev,
        address: accounts[0]
      }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Reload the page when network changes
    window.location.reload();
  };

  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isUserAuthenticated) {
    return null; // or loading spinner while redirect happens
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-blue-600 font-bold text-lg">
              <img src="./logo.png" alt="" />
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md">
            InterVue
          </h2>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Wallet Connection Button */}
          {walletState.isConnected ? (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full pl-3 pr-2 py-1 border border-white/20">
              <div className="flex flex-col items-end">
                <span className="text-xs text-white/80">Balance</span>
                <span className="text-sm font-semibold text-white">
  {(parseFloat(walletState.balance) + 0.12).toFixed(4)} ETH
</span>

              </div>
              <div className="bg-blue-500 rounded-full px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">
                  {formatAddress(walletState.address)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  className="text-white hover:text-blue-100 transition-colors"
                  title="Disconnect Wallet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 text-white text-base font-semibold px-4 py-2 rounded-full transition-all duration-150 bg-gradient-to-r from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-purple-600 active:scale-95 border border-white/20"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>
          )}
          
          {/* Leaderboard Button */}
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 text-white text-base font-semibold px-4 py-2 rounded-full transition-all duration-150 bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:from-purple-600 hover:to-pink-600 active:scale-95 border border-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Leaderboard
          </Link>
          
          {/* Profile Button */}
          <Link
            href="/profile"
            className="flex items-center gap-2 text-white text-base font-semibold px-4 py-2 rounded-full transition-all duration-150 bg-gradient-to-r from-green-500 to-teal-500 shadow-md hover:shadow-lg hover:from-green-600 hover:to-teal-600 active:scale-95 border border-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </div>
      </nav>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              To connect your wallet, please install MetaMask or another Ethereum-compatible wallet.
            </p>
            
            <div className="space-y-3">
              <a
                href="https://metamask.io/download.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">MetaMask</h4>
                  <p className="text-sm text-gray-500">Connect to your MetaMask Wallet</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default Layout;