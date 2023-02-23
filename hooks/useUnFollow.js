import { useCallback, useMemo, useState } from "react";
import useCyberConnect from "./useCC";

function useUnFollow() {
  const [isLoading, toggleIsLoading] = useState(false);
  const cc = useCyberConnect();

  const unFollow = useCallback(
    async (handle) => {
      if (!cc) {
        return {
          isError: true,
          message: "CC client is not ready.",
        };
      }

      toggleIsLoading(true);

      const error = await cc
        .unfollow(window.ethereum.selectedAddress, handle)
        .catch((error) => error)
        .finally(() => toggleIsLoading(false));

      if (!error) {
        return { isSuccess: true };
      } else {
        return {
          isError: true,
          message: "Network busy. Please try again later.",
        };
      }
    },
    [cc]
  );

  return useMemo(
    () => ({
      isLoading,
      unFollow,
    }),
    [isLoading, unFollow]
  );
}

export default useUnFollow;
