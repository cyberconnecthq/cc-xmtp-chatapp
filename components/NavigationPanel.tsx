import { LinkIcon, ExclamationCircleIcon } from "@heroicons/react/outline";
import { useXmtpStore } from "../store/xmtp";
import ConversationsList from "./ConversationsList";
import Loader from "./Loader";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import useHandleConnect from "../hooks/useHandleConnect";
import useInitXmtpClient from "../hooks/useInitXmtpClient";
import MyListbox from "./CyberConnect/MyListbox";
import { useEffect, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  // client as apolloClient,
  BatchAddressesIsFollowedByMe,
  AddressFollowingMe,
} from "../graphql";
import useWalletAddress from "../hooks/useWalletAddress";
import { Conversation } from "@xmtp/xmtp-js";

type NavigationPanelProps = {
  isError: boolean;
};

const NavigationPanel = ({ isError }: NavigationPanelProps): JSX.Element => {
  const { address } = useAccount();
  const client = useXmtpStore((state) => state.client);
  const { handleConnect } = useHandleConnect();
  const { initClient } = useInitXmtpClient();

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-8rem)] overflow-y-auto">
      {address && client !== null ? (
        <ConversationsPanel walletAddress={address} />
      ) : (
        <>
          {!address ? (
            <NoWalletConnectedMessage isError={isError}>
              <ConnectButton.Custom>
                {({ account, chain, mounted }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;
                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                      })}>
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              type="button"
                              className="bg-p-600 px-4 rounded-lg h-[40px] text-white font-bold"
                              onClick={handleConnect}
                              data-testid="no-wallet-connected-cta">
                              Connect Wallet
                            </button>
                          );
                        }
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </NoWalletConnectedMessage>
          ) : (
            <NoXMTPConnectedMessage>
              <button
                type="button"
                className="bg-p-600 px-4 rounded-lg h-[40px] text-white font-bold cursor-pointer"
                onClick={initClient}
                data-testid="no-wallet-connected-cta">
                Connect XMTP
              </button>
            </NoXMTPConnectedMessage>
          )}
        </>
      )}
    </div>
  );
};

const NoWalletConnectedMessage: React.FC<{
  isError: boolean;
  children?: React.ReactNode;
}> = ({ isError, children }) => {
  return (
    <div className="flex flex-col flex-grow justify-center">
      <div className="flex flex-col items-center px-4 text-center">
        {isError ? (
          <ExclamationCircleIcon className="h-8 w-8" aria-hidden="true" />
        ) : (
          <LinkIcon
            className="h-8 w-8 mb-1 stroke-n-200 md:stroke-n-300"
            aria-hidden="true"
            data-testid="no-wallet-connected-icon"
          />
        )}
        <p
          className="text-xl md:text-lg text-n-200 md:text-n-300 font-bold"
          data-testid="no-wallet-connected-header">
          {isError ? "Error connecting" : "No wallet connected"}
        </p>
        <p
          className="text-lx md:text-md text-n-200 font-normal"
          data-testid="no-wallet-connected-subheader">
          {isError ? "Please try again" : "Please connect a wallet to begin"}
        </p>
      </div>
      <div className="mt-2 flex justify-center items-center">{children}</div>
    </div>
  );
};

const NoXMTPConnectedMessage: React.FC<{
  isError?: boolean;
  children?: React.ReactNode;
}> = ({ isError, children }) => {
  return (
    <div className="flex flex-col flex-grow justify-center">
      <div className="flex flex-col items-center px-4 text-center">
        {isError ? (
          <ExclamationCircleIcon className="h-8 w-8" aria-hidden="true" />
        ) : (
          <LinkIcon
            className="h-8 w-8 mb-1 stroke-n-200 md:stroke-n-300"
            aria-hidden="true"
            data-testid="no-wallet-connected-icon"
          />
        )}
        <p
          className="text-xl md:text-lg text-n-200 md:text-n-300 font-bold"
          data-testid="no-wallet-connected-header">
          {isError ? "Error connecting" : "XMTP client not connected"}
        </p>
        <p
          className="text-lx md:text-md text-n-200 font-normal"
          data-testid="no-wallet-connected-subheader">
          {isError ? "Please try again" : "Please connect to XMTP"}
        </p>
      </div>
      <div className="mt-2 flex justify-center items-center">{children}</div>
    </div>
  );
};

function extractHandles(array: Array<any>) {
  return array.map(function (item: any) {
    return item.node.handle;
  });
}

const ConversationsPanel = ({
  walletAddress,
}: {
  walletAddress: string;
}): JSX.Element => {
  const client = useXmtpStore((state) => state.client);
  const loadingConversations = useXmtpStore(
    (state) => state.loadingConversations,
  );
  const { ccName } = useWalletAddress(walletAddress);
  console.log("ccName", ccName);
  const conversationsMap = useXmtpStore((state) => state.conversations);
  const conversations = Array.from(conversationsMap.values());
  // console.log("conversationsMap", conversationsMap);
  // console.log("conversations", conversations);
  let peersDuplicate = conversations.map((x) => x.peerAddress);
  const peers = peersDuplicate.filter(
    (n, i) => peersDuplicate.indexOf(n) === i,
  );
  console.log("peers", peers);

  const [filterMode, setFilterMode] = useState<number>(0);
  const [isVerified, setIsVerified] = useState<any>();
  const [filtered, setFiltered] = useState<any>(conversationsMap);
  const [getFollowingData] = useLazyQuery(BatchAddressesIsFollowedByMe);
  // const { data } = useQuery(BatchAddressesIsFollowedByMe, {
  //   variables: { toAddrList: peers, me: walletAddress },
  // });
  // console.log("data", data);
  useEffect(() => {
    const handleFilter = async () => {
      const { data } = await getFollowingData({
        variables: { toAddrList: peers, me: walletAddress },
      });
      let temp: any = {};
      const peerAddresses = data?.batchGetAddresses;
      console.log("peerAddresses", peerAddresses);
      peerAddresses.forEach((peerAddress: any) => {
        const peerFollowedByMe =
          peerAddress?.wallet?.primaryProfile?.isFollowedByMe;
        let meFollowingPeer = false;
        console.log("ccName", ccName);
        if (ccName) {
          const extractHandles = (array) =>
            array.map((item) => item.node.handle);
          const followingsArr = peerAddress?.followings?.edges || [{}];
          const followingHandles = extractHandles(followingsArr);
          if (followingHandles.includes(ccName)) {
            meFollowingPeer = true;
          }
        }
        console.log(
          "peerFollowedByMe",
          peerFollowedByMe,
          "meFollowingPeer",
          meFollowingPeer,
        );
        if (peerFollowedByMe && !meFollowingPeer) {
          temp[peerAddress.address.toLowerCase()] = 2;
        } else if (peerFollowedByMe && meFollowingPeer) {
          temp[peerAddress.address.toLowerCase()] = 3;
        } else if (!peerFollowedByMe && meFollowingPeer) {
          temp[peerAddress.address.toLowerCase()] = 1;
        } else {
          temp[peerAddress.address.toLowerCase()] = 0;
        }
        // temp[peerAddress.address.toLowerCase()] = peerAddress?.wallet
        //   ?.primaryProfile?.isFollowedByMe
        //   ? 2
        //   : 0;
      });
      Object.keys(temp).forEach((key: any) => {
        if (temp[key] === filterMode) {
          temp[key] = true;
        } else {
          temp[key] = false;
        }
      });
      console.log("temp", temp);
      setIsVerified(temp);
    };
    handleFilter();
  }, [filterMode]);

  useEffect(() => {
    if (filterMode && isVerified) {
      console.log("filtering");
      let tmp: any = {};
      conversationsMap.forEach((value: any, key: any) => {
        if (isVerified[value.peerAddress.toLowerCase()]) {
          tmp[key] = value; //.push(conversation);
        }
      });
      console.log("New filtered conv map", tmp);
      setFiltered(tmp);
    }
  }, [filterMode, isVerified]);

  if (client === undefined) {
    return (
      <Loader
        headingText="Awaiting signatures..."
        subHeadingText="Use your wallet to sign"
        isLoading
      />
    );
  }

  if (loadingConversations) {
    return (
      <Loader
        headingText="Loading conversations..."
        subHeadingText="Please wait a moment"
        isLoading
      />
    );
  }

  return (
    <div>
      <MyListbox setFilterMode={setFilterMode} />
      <nav className="flex-1 pb-4" data-testid="conversations-list-panel">
        <ConversationsList conversations={filtered} />
      </nav>
    </div>
  );
};

export default NavigationPanel;
