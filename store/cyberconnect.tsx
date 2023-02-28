import { ReactNode, createContext, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import useWalletAddress from "../hooks/useWalletAddress";

export interface CyberConnectContextType {
  handle: string | undefined;
  setHandle: (handle: string) => void;
  address: string | undefined;
  setAddress: (address: string) => void;
  followers: string[];
  setFollowers: (followers: string[]) => void;
  following: string[];
  setFollowing: (following: string[]) => void;
}

export const CyberConnectContext = createContext<CyberConnectContextType>({
  handle: undefined,
  setHandle: () => {},
  address: undefined,
  setAddress: () => {},
  followers: [],
  setFollowers: () => {},
  following: [],
  setFollowing: () => {},
});

export const CyberConnectProvider = ({ children }: { children: ReactNode }) => {
  const [handle, setHandle] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string>("");
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const { address: walletAddress } = useAccount();
  const { ccName } = useWalletAddress(walletAddress);
  useEffect(() => {
    if (ccName) {
      setHandle(ccName);
      // fetch followers
      // fetch following
    }
  }, [handle]);

  return (
    <CyberConnectContext.Provider
      value={{
        handle,
        setHandle,
        address,
        setAddress,
        followers,
        setFollowers,
        following,
        setFollowing,
      }}>
      {children}
    </CyberConnectContext.Provider>
  );
};
