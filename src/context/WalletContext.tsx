"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import ProtonWebSDK, { Link, ProtonWebLink } from '@proton/web-sdk';

interface WalletContextType {
  activeSession: any | null;
  activeLink: Link | ProtonWebLink | undefined;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  walletConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [activeLink, setActiveLink] = useState<Link | ProtonWebLink>();
  const [walletConnected, setWalletConnected] = useState(false);

  const endpoint = process.env.NEXT_PUBLIC_PROTON_ENDPOINT!;
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  const contractAcc = process.env.NEXT_PUBLIC_CONTRACT!;

  useEffect(() => {
    const restore = async () => {
      try {
        const { link, session } = await ProtonWebSDK({
          linkOptions: {
            chainId: chainId,
            endpoints: [endpoint],
            restoreSession: true,
          },
          transportOptions: {
            requestAccount: contractAcc,
          },
          selectorOptions: {
            appName: 'Snipverse',
          },
        });

        if (session && link) {
          console.log('✅ Restored session:', session.auth.actor);
          setActiveSession(session);
          setActiveLink(link);
          setWalletConnected(true);
        }
      } catch (error) {
        console.error('❌ Error restoring session:', error);
      }
    };

    restore();
  }, []);

  const connectWallet = async () => {
    try {
      const { link, session } = await ProtonWebSDK({
        linkOptions: {
          endpoints: [endpoint],
          chainId: chainId,
          restoreSession: false,
        },
        transportOptions: {
          requestAccount: contractAcc,
        },
        selectorOptions: {
          appName: 'Snipverse',
        },
      });

      if (session) {
        setActiveSession(session);
        setActiveLink(link);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = async () => {
    if (activeLink && activeSession) {
      try {
        await activeLink.removeSession(
          "Snipverse",
          activeSession.auth.actor,
          chainId
        );
        setActiveSession(null);
        setActiveLink(undefined);
        setWalletConnected(false);
        console.log("Wallet disconnected.");
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{ activeSession, activeLink, connectWallet, disconnectWallet, walletConnected }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
