import { useCallback, useMemo, useState } from "react";
import useCyberConnect from "./useCC";
//
function useUnfollow() {
  const [isLoading, toggleIsLoading] = useState(false);
  const cc = useCyberConnect();

  const unFollow = useCallback(
    async (handle: string) => {
      if (!cc) {
        return {
          isError: true,
          message: "CC client is not ready.",
        };
      }

      toggleIsLoading(true);

      const error = await cc
        .unfollow((window as any).ethereum?.selectedAddress, handle)
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
    [cc],
  );

  return useMemo(
    () => ({
      isLoading,
      unFollow,
    }),
    [isLoading, unFollow],
  );
}

export default useUnfollow;
