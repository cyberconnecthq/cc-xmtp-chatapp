import { useQuery } from '@apollo/client'
import { ProfileByAddress } from '../graphql/ProfileByAddress'


const fetchMostRecentMessage = async (
    convo: Conversation,
): Promise<{ key: string; message?: DecodedMessage }> => {
    const { loading: isLoading, error, data } = useQuery(ProfileByAddress, { variables: { "address": peerAddress } });
    const key = getConversationId(convo);
    const newMessages = await convo?.messages({
        limit: 1,
        direction: SortDirection.SORT_DIRECTION_DESCENDING,
    });

    if (!newMessages?.length) {
        return { key };
    }
    return { key, message: newMessages[0] };
};

export default fetchMostRecentMessage;
