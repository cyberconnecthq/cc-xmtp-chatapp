import { gql } from "@apollo/client";

export const AddressFollowingMe = gql`
  query AddressFollowingMe($me: AddressEVM!, $address: AddressEVM!) {
    address(address: $me) {
      wallet {
        primaryProfile {
          isFollowedByMe(me: $address)
        }
      }
    }
  }
`;
