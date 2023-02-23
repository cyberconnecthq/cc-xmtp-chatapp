import { useState } from "react";
import useFollow from "../../hooks/useFollow";
import useUnFollow from "../../hooks/useUnFollow";

const FollowButton = ({ handle }: { handle: string }) => {
  const [isFollowing, toggleIsFollowing] = useState(false);
  const { follow } = useFollow();
  const { unFollow } = useUnFollow();

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
    <button className="follow-btn" onClick={handleClick}>
      {isFollowing ? "UnFollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
