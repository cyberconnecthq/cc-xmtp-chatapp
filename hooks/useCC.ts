import CyberConnect, { Env } from "@cyberlab/cyberconnect-v2";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

let CCSingleInstance: any;

const getCCInstance = (provider: any) => {
  if (!!CCSingleInstance) return CCSingleInstance;

  if (!provider) return null;

  const instance = new CyberConnect({
    namespace: "CyberConnect",
    env: Env.PRODUCTION,
    provider,
    signingMessageEntity: "CyberConnect",
  });

  CCSingleInstance = instance;

  return instance;
};

function useCyberConnect(): CyberConnect | null {
  const [cc, setCc] = useState<CyberConnect | null>(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // force client render
    setCc(getCCInstance(provider));
  }, []);

  return useMemo(() => cc, [cc]);
}

export default useCyberConnect;
