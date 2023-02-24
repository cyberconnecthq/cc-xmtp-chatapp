import { gql } from "@apollo/client";

export const ProfileByHandle = gql`
  query ProfileByHandle($handle: String!, $me: AddressEVM!) {
    profileByHandle(handle: $handle) {
      isFollowedByMe(me: $me)
      owner {
        address
        chainID
      }
      handle
      id
      profileID
      namespace {
        name
        chainID
      }
      followers {
        totalCount
      }
    }
  }
`;
