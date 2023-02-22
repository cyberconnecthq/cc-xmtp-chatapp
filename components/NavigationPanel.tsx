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
import { useQuery } from "@apollo/client";
import {
  client as apolloClient,
  BatchAddressesIsFollowedByMe,
  AddressFollowingMe,
} from "../graphql";

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

const ConversationsPanel = ({
  walletAddress,
}: {
  walletAddress: string;
}): JSX.Element => {
  const client = useXmtpStore((state) => state.client);
  const loadingConversations = useXmtpStore(
    (state) => state.loadingConversations,
  );
  const conversationsMap = useXmtpStore((state) => state.conversations);
  const conversations = Array.from(conversationsMap.values());
  console.log("conversationsMap", conversationsMap);
  console.log("conversations", conversations);
  let peersDuplicate = conversations.map((x) => x.peerAddress);
  const peers = peersDuplicate.filter(
    (n, i) => peersDuplicate.indexOf(n) === i,
  );
  console.log("peers", peers);

  const [followings, setFollowings] = useState<any>([]);
  const [filterMode, setFilterMode] = useState<number>(0);
  const [isVerified, setIsVerified] = useState<any>();
  const { loading: followingLoading, data: followingData } = useQuery(
    BatchAddressesIsFollowedByMe,
    { variables: { toAddrList: peers, me: walletAddress } },
  );

  useEffect(() => {
    const handleFilter = async () => {
      console.log(followingData);
      if (followingData) {
        let temp: any = {};
        let peerAddresses = [];
        peerAddresses = followingData?.batchGetAddresses;
        console.log("peerAddresses", peerAddresses);
        peerAddresses.forEach((peerAddress: any) => {
          temp[peerAddress.address.toLowerCase()] = peerAddress?.wallet
            ?.primaryProfile?.isFollowedByMe
            ? 2
            : 0;
        });
        console.log("temp", temp);
        setIsVerified(temp);
      }
      console.log("isVerified", isVerified);
      if (isVerified) {
        // const followerData = async (
        //   address: string,
        //   me: string,
        // ): Promise<{ data: any }> => {
        //   const data = await apolloClient.query({
        //     query: AddressFollowingMe,
        //     variables: {
        //       address: address,
        //       me: me,
        //     },
        //   });
        //   return data;
        // };
        peers.forEach((peerAddress: any) => {
          console.log("peerAddress", peerAddress);
          console.log("walletAddress", walletAddress);
          const { data } = useQuery(AddressFollowingMe, {
            variables: {
              address: walletAddress,
              me: peerAddress,
            },
          });
          // const data = followerData(walletAddress, peerAddress);
          console.log("data", data);
          isVerified[peerAddress.toLowerCase()] += data?.address?.wallet
            ?.primaryProfile?.isFollowedByMe
            ? 1
            : 0;
          console.log("isVerified", isVerified);
          Object.keys(isVerified).forEach((key: any) => {
            if (isVerified[key] === filterMode) {
              isVerified[key] = true;
            } else {
              isVerified[key] = false;
            }
          });

          // followerData(walletAddress, peerAddress).then((data) => {
          //   isVerified[peerAddress.address.toLowerCase()] += data?.address?.wallet
          //     ?.primaryProfile?.isFollowedByMe
          //     ? 1
          //     : 0;
          // });
        });
      }
    };
    handleFilter();
  }, [filterMode]);

  let filtered = conversationsMap;
  console.log("filterMode", filterMode);
  console.log("isVerified", isVerified);
  if (filterMode && isVerified) {
    console.log("filtering");
    conversationsMap.forEach((value: any, key: any) => {
      if (!isVerified[value.peerAddress.toLowerCase()]) {
        filtered.delete(key); //.push(conversation);
      }
    });
  }
  console.log("filtered map", filtered);
  // let filtered = conversations;
  // if (filterMode) {
  //   filtered = conversations.filter(
  //     (conversation) => isVerified[conversation.peerAddress.toLowerCase()],
  //   );
  // }
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
