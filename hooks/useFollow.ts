import { useCallback, useMemo, useState } from "react";
import useCyberConnect from "./useCC";
import { useAccount } from "wagmi";

function useFollow() {
  const [isLoading, toggleIsLoading] = useState(false);
  const cc = useCyberConnect();
  const { address: addressFromWagmi, isConnected } = useAccount();
  const follow = useCallback(
    async (handle: string) => {
      if (!cc)
        return {
          isError: true,
          message: "CC client is not ready.",
        };

      toggleIsLoading(true);
      console.log(
        "follow",
        handle,
        "using",
        (window as any).ethereum?.selectedAddress,
      );
      const error = await cc
        .follow(
          addressFromWagmi || (window?.ethereum as any)?.selectedAddress,
          handle,
        )
        .catch((error) => {
          console.log(error);

          return error;
        })
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
      follow,
    }),
    [isLoading, follow],
  );
}

export default useFollow;
