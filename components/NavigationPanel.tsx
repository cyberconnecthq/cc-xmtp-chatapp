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
import { BatchAddressesIsFollowedByMe } from "../graphql";
import useWalletAddress from "../hooks/useWalletAddress";
import { Conversation } from "@xmtp/xmtp-js";
import { useCancellableQuery } from "../hooks/useCancellableQuery";

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
  // get the client from the store
  const client = useXmtpStore((state) => state.client);
  // check if conversations are loading from the store
  const loadingConversations = useXmtpStore(
    (state) => state.loadingConversations,
  );
  // get the ccName from the wallet address
  const { ccName } = useWalletAddress(walletAddress);

  // get the conversations map from the store
  const conversationsMap = useXmtpStore((state) => state.conversations);

  // convert the conversations map to an array
  const conversations = Array.from(conversationsMap.values());
  // get a duplicate array of the peer addresses
  let peersDuplicate = conversations.map((x) => x.peerAddress);
  // get an array of unique peer addresses
  const peers = peersDuplicate.filter(
    (n, i) => peersDuplicate.indexOf(n) === i,
  );

  // initialize state variables
  const [filterMode, setFilterMode] = useState<number>(0);
  const [isVerified, setIsVerified] = useState<any>();
  const [filtered, setFiltered] = useState<any>(conversationsMap);

  // handle the filter changes
  useEffect(() => {
    const handleFilter = async () => {
      // query the batch addresses that are followed by the user
      // eslint-disable-next-line no-use-before-define, react-hooks/rules-of-hooks
      const { data } = await useCancellableQuery({
        query: BatchAddressesIsFollowedByMe,
        variables: { toAddrList: peers, me: walletAddress },
      });
      // initialize temporary object to store isVerified status of the peers
      let tempIsVerified: any = {};
      const peerAddresses = data?.batchGetAddresses;
      //
      peerAddresses.forEach((peerAddress: any) => {
        // check if the peer is following the user
        const peerFollowingMe =
          peerAddress?.wallet?.primaryProfile?.isFollowedByMe;
        let meFollowingPeer = false;
        //
        // check if the user is following the peer
        type Node = { handle: string };
        if (ccName) {
          const extractHandles = (array: { node: Node }[]): string[] =>
            array.map((item) => item.node.handle);
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
            tempIsVerified[peerAddress.address.toLowerCase()] = 2;
          } else if (peerFollowingMe && meFollowingPeer) {
            tempIsVerified[peerAddress.address.toLowerCase()] = 3;
          } else if (!peerFollowingMe && meFollowingPeer) {
            tempIsVerified[peerAddress.address.toLowerCase()] = 1;
          }
        }
      });

      // update the isVerified status based on the filter mode
      Object.keys(tempIsVerified).forEach((key: any) => {
        if (tempIsVerified[key] === filterMode) {
          tempIsVerified[key] = true;
        } else {
          tempIsVerified[key] = false;
        }
      });

      setIsVerified(tempIsVerified);
      var tmp = new Map(filtered);
      conversationsMap.forEach((value: Conversation, key: string) => {
        if (tempIsVerified[value.peerAddress.toLowerCase()]) {
          tmp.set(key, value);
        } else {
          tmp.delete(key);
        }
      });
      setFiltered(tmp);
    };
    handleFilter();
  }, [filterMode]);

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
