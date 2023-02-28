import { gql } from "@apollo/client";

export const ProfileByAddress = gql`
  query ProfileByAddress($address: AddressEVM!) {
    address(address: $address) {
      wallet {
        primaryProfile {
          id
          handle
          owner {
            address
            chainID
          }
          metadataInfo {
            avatar
            coverImage
          }
        }
      }
    }
  }
`;
