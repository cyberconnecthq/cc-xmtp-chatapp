import { classNames, shortAddress } from "../helpers";
import useWalletAddress from "../hooks/useWalletAddress";

export type address = `0x${string}`;

type AddressProps = {
  address: address;
  className?: string;
};

const Address = ({ address, className }: AddressProps): JSX.Element => {
  const { ensName, ccName, isLoading } = useWalletAddress(address);
  console.log("ensName", ensName, "ccName", ccName);
  return (
    <span
      className={classNames(
        className || "",
        "font-mono",
        isLoading ? "animate-pulse" : "",
      )}
      title={address}
      data-testid="connected-footer-secondary-text">
      {ccName || ensName || shortAddress(address)}
    </span>
  );
};

export default Address;
