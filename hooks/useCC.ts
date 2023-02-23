import CyberConnect, { Env } from "@cyberlab/cyberconnect-v2";
import { useEffect, useMemo, useState } from "react";

let CCSingleInstance: any;

const getCCInstance = (provider: any) => {
  if (!!CCSingleInstance) return CCSingleInstance;

  if (!provider) return null;

  const instance = new CyberConnect({
    namespace: "CyberConnect",
    env: Env.STAGING,
    provider,
    signingMessageEntity: "CyberConnect",
  });

  CCSingleInstance = instance;

  return instance;
};

function useCyberConnect() {
  const [cc, setCc] = useState(null);

  useEffect(() => {
    // force client render
    setCc(getCCInstance(window.ethereum));
  }, []);

  return useMemo(() => cc, [cc]);
}

export default useCyberConnect;
