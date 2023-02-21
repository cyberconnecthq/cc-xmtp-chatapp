import { gql } from '@apollo/client'

export const ProfileByHandle = gql`
query ProfileByHandle($handle: String!) {
  profileByHandle(handle:$handle) {
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
`