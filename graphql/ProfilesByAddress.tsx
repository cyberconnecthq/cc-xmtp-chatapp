import { gql } from "@apollo/client";

export const ProfilesByAddress = gql`
  query BatchProfilesByAddress($addresses: [AddressEVM!]!) {
  batchGetAddresses(addresses: $addresses) {
    address
    wallet {
      primaryProfile {
        avatar
        handle
        metadata
        profileID
        metadataInfo {
          avatar
        }
      }
    }
  }
}
`