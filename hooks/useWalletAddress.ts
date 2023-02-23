import { useEffect, useState } from "react";
import { useEnsAddress, useEnsName } from "wagmi";
import { address } from "../components/Address";
import { ProfileByAddress } from "../graphql/ProfileByAddress";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import {
  isCCAddress,
  isEnsAddress,
  isValidLongWalletAddress,
  isValidRecipientAddressFormat,
} from "../helpers";
import { useXmtpStore } from "../store/xmtp";

const useWalletAddress = (address?: address | string) => {
  const recipientWalletAddress = useXmtpStore(
    (state) => state.recipientWalletAddress,
  );
  const conversationId = useXmtpStore((state) => state.conversationId);
  const setConversationId = useXmtpStore((state) => state.setConversationId);
  const [addressToUse, setAddressToUse] = useState(
    address || recipientWalletAddress,
  );
  const [ccName, setCcName] = useState("");

  const isEns = isEnsAddress(addressToUse);

  // Get full address when only have ENS
  const { data: ensAddress, isLoading: ensAddressLoading } = useEnsAddress({
    name: addressToUse,
    enabled: isEnsAddress(addressToUse),
  });

  // Get ENS if exists from full address
  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address: addressToUse as address,
    enabled: isValidLongWalletAddress(addressToUse),
  });

  const { loading: ccNameLoading, data: ccNameData } = useQuery(
    ProfileByAddress,
    { variables: { address: addressToUse } },
  );
  // Get CC name if exists from full address
  // if (isValidLongWalletAddress(addressToUse)){

  useEffect(() => {
    setAddressToUse(address || recipientWalletAddress);
    const ccHandle = ccNameData?.address?.wallet?.primaryProfile?.handle;
    const ccName = ccHandle; // ? ccHandle + ".cc" : "";
    setCcName(ccName);
    // console.log("ccName", ccName);
  }, [recipientWalletAddress, address, ccNameData]);

  useEffect(() => {
    const conversationIdArray = conversationId?.split("/") ?? [];
    if (isEns && ensAddress && !ensAddressLoading) {
      setConversationId(ensAddress);
      // conversationIdArray.length < 2 this check is to see if the conversation
      // is from another app apart from xmtp.chat
    } else if (
      isValidLongWalletAddress(recipientWalletAddress) &&
      conversationIdArray.length < 2
    ) {
      setConversationId(recipientWalletAddress);
    }
  }, [
    isEns,
    ensAddress,
    ensAddressLoading,
    recipientWalletAddress,
    conversationId,
  ]);

  return {
    isValid: isValidRecipientAddressFormat(addressToUse),
    isEns,
    ensAddress,
    ensName,
    ccName,
    isLoading: ensAddressLoading || ensNameLoading,
  };
};

export default useWalletAddress;
