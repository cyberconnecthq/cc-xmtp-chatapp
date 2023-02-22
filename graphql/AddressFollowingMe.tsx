import { gql } from "@apollo/client";

export const BatchAddressesIsFollowedByMe = gql`
  query BatchAddressesIsFollowedByMe(
    $me: AddressEVM!
    $toAddrList: [AddressEVM!]!
  ) {
    batchGetAddresses(addresses: $toAddrList) {
      address
      wallet {
        primaryProfile {
          isFollowedByMe(me: $me)
        }
      }
    }
  }
`;
