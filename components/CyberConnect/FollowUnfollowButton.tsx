import { useEffect, useState } from "react";
import useFollow from "../../hooks/useFollow";
import useUnFollow from "../../hooks/useUnFollow";
import CyberConnectStyles from "../../styles/CyberConnectStyles.module.css";
import { useAccount } from "wagmi";
import { ProfileByHandle } from "../../graphql/ProfileByHandle";
import { useQuery } from "@apollo/client";

const FollowUnfollowButton = ({ handle }: { handle: string }) => {
  const [isFollowing, toggleIsFollowing] = useState(false);
  const { follow } = useFollow();
  const { unFollow } = useUnFollow();
  const { address: addressFromWagmi, isConnected } = useAccount();
  const { data } = useQuery(ProfileByHandle, {
    variables: { handle: handle, me: addressFromWagmi },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    const checkIfFollowing = async () => {
      const isFollowedByMe = data?.profileByHandle?.isFollowedByMe || false;
      toggleIsFollowing(isFollowedByMe);
    };
    checkIfFollowing();
  }, [handle, data]);

  const handleClick = async () => {
    if (!isFollowing) {
      const { isSuccess } = await follow(handle);

      if (isSuccess) toggleIsFollowing(true);
    } else {
      const { isSuccess } = await unFollow(handle);

      if (isSuccess) toggleIsFollowing(false);
    }
  };

  return (
    <button
      className={
        isFollowing
          ? CyberConnectStyles.followBtn
          : CyberConnectStyles.unfollowBtn
      }
      onClick={handleClick}>
      {isFollowing ? "UnFollow" : "Follow"}
    </button>
  );
};

export default FollowUnfollowButton;
