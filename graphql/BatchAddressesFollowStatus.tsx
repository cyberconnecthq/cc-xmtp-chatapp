import { gql } from "@apollo/client";

export const BatchAddressesFollowStatus = gql`
  query BatchAddressesFollowStatus(
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
      followings {
        edges {
          node {
            profile {
              handle
            }
          }
        }
      }
    }
  }
`;
