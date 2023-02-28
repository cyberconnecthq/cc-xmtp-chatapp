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
import { BatchAddressesFollowStatus } from "../graphql";
import useWalletAddress from "../hooks/useWalletAddress";
import { Conversation } from "@xmtp/xmtp-js";
import { useLazyQuery } from "@apollo/client";

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

/**
 * ConversationsPanel component
 *
 * @param {string} walletAddress - The wallet address of the user
 * @return {JSX.Element} - The ConversationsPanel component
 */
const ConversationsPanel = ({
  walletAddress,
}: {
  walletAddress: string;
}): JSX.Element => {
  /* XMTP CONTEXT & STORE */
  // get the client from the store
  const client = useXmtpStore((state) => state.client);
  // check if conversations are loading from the store
  const loadingConversations = useXmtpStore(
    (state) => state.loadingConversations,
  );
  // get the conversations map from the store
  const conversationsMap = useXmtpStore((state) => state.conversations);

  // get the ccName from the wallet address
  const { ccName } = useWalletAddress(walletAddress);

  // convert the conversations map to an array
  const peersDuplicate = Array.from(conversationsMap.values()).map(
    (x) => x.peerAddress,
  );
  // get an array of unique peer addresses
  const peers = peersDuplicate.filter(
    (n, i) => peersDuplicate.indexOf(n) === i,
  );

  // initialize state variables
  const [filterMode, setFilterMode] = useState<number>(0);
  // const [isVerified, setIsVerified] = useState<any>();
  const [filtered, setFiltered] = useState<any>(conversationsMap);
  // query the batch addresses that are followed by the user
  const [getBatchAddressesFollowStatus] = useLazyQuery(
    BatchAddressesFollowStatus,
  );
  // handle the filter changes
  useEffect(() => {
    const handleFilter = async () => {
      console.log("peers length", peers.length);
      if (peers.length > 0) {
        // get the follow status of the peers
        const addressesFollowStatusData = await getBatchAddressesFollowStatus({
          variables: { toAddrList: peers, me: walletAddress },
          fetchPolicy: "cache-and-network",
        });
        if (addressesFollowStatusData) {
          // initialize temporary object to store isVerified status of the peers
          let tempIsVerified: any = {};
          console.log("data", addressesFollowStatusData);
          const peerAddresses =
            addressesFollowStatusData?.data?.batchGetAddresses;
          // iterate through the peer addresses and determine the isVerified status of each peer based on the filter mode selected
          peerAddresses.forEach((peerAddress: any) => {
            // check if the peer is following the user
            const peerFollowingMe =
              peerAddress?.wallet?.primaryProfile?.isFollowedByMe;
            let meFollowingPeer = false;
            // check if the user is following the peer
            type Node = { profile: { handle: string } };
            if (ccName) {
              // extract the handles from the followings array of the peer address object and check if the user's ccName is in the array
              const extractHandles = (array: { node: Node }[]): string[] =>
                array.map((item) => item.node.profile.handle);
              const followingsArr = peerAddress?.followings?.edges || [{}];
              const followingHandles = extractHandles(followingsArr);
              if (followingHandles.includes(ccName)) {
                meFollowingPeer = true;
              }
            }

            // initialize the isVerified status to 0
            tempIsVerified[peerAddress.address.toLowerCase()] = 0;
            // determine the isVerified status based on the filter mode
            if (filterMode) {
              if (peerFollowingMe && !meFollowingPeer) {
                tempIsVerified[peerAddress.address.toLowerCase()] = 1;
              } else if (!peerFollowingMe && meFollowingPeer) {
                tempIsVerified[peerAddress.address.toLowerCase()] = 2;
              } else if (peerFollowingMe && meFollowingPeer) {
                tempIsVerified[peerAddress.address.toLowerCase()] = 3;
              }
            }
          });

          // update the isVerified status based on the filter mode
          Object.entries(tempIsVerified).forEach(([key, value]) => {
            tempIsVerified[key] = value === filterMode;
          });
          // filter the conversations map based on the isVerified status
          const filteredMap = new Map(
            Array.from(conversationsMap.entries()).filter(([key, value]) => {
              const isVerified =
                tempIsVerified[value.peerAddress.toLowerCase()];
              return isVerified;
            }),
          );
          // update the filtered state variable
          setFiltered(filteredMap);
        }
      }
    };
    handleFilter();
  }, [filterMode, conversationsMap]);

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
  //
  console.log("filtered", filtered);
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
