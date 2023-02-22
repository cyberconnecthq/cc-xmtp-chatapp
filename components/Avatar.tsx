import Blockies from "react-blockies";
import { useEnsAvatar } from "wagmi";
import { address } from "./Address";
import { ProfileByAddress } from "../graphql/ProfileByAddress";
import { gql, useQuery } from '@apollo/client';

type AvatarProps = {
  peerAddress: address;
};

const Avatar = ({ peerAddress }: AvatarProps) => {
  const { loading: isLoading, error, data } = useQuery(ProfileByAddress, { variables: { "address": peerAddress } });

  // if (!data.address.wallet.primaryProfile.metadataInfo.avatar) {
  //   const { data, isLoading } = useEnsAvatar({
  //     address: peerAddress,
  //   });

  // }

  if (isLoading) {
    return (
      <div className="animate-pulse flex">
        <div className="rounded-full bg-gray-200 h-10 w-10" />
      </div>
    );
  }

  if (data) {
    return (
      <div>
        <div className="w-10 h-10 rounded-full border border-n-80" />
        <img
          className="w-10 h-10 rounded-full z-10 -mt-10"
          src={data?.address?.wallet?.primaryProfile?.metadataInfo?.avatar }
          // alt={peerAddress}
        />
      </div>
    );
  }

  return (
    <div data-testid="connected-footer-image">
      <Blockies
        seed={peerAddress.toLowerCase()}
        scale={5}
        size={8}
        className="rounded-full"
      />
    </div>
  );
};

export default Avatar;
