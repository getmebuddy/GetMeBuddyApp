import {
  FETCH_CONVERSATIONS_REQUEST, FETCH_CONVERSATIONS_SUCCESS, FETCH_CONVERSATIONS_FAILURE,
  FETCH_MESSAGES_REQUEST, FETCH_MESSAGES_SUCCESS, FETCH_MESSAGES_FAILURE,
  SEND_MESSAGE_REQUEST, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAILURE,
  MARK_MESSAGES_AS_READ_REQUEST, MARK_MESSAGES_AS_READ_SUCCESS, MARK_MESSAGES_AS_READ_FAILURE,
  RECEIVE_MESSAGE, // For potential WebSocket integration
  SET_ACTIVE_CONVERSATION, // To know which conversation's messages are being viewed
} from '../actions/types'; // Ensure these are in types.ts
import { MessageActionTypes } from '../actions/messageActions'; // Import union type
import { ConversationSummary } from '../../screens/messages/MessagesScreen'; // Type for conversation list items
import { MessageType } from '../../screens/messages/ChatScreen'; // Type for individual messages

// State Interface
export interface MessageState {
  conversations: ConversationSummary[];
  // Store messages for the currently active conversation, keyed by conversationId for simplicity,
  // or a more complex structure if multiple conversations' messages are cached.
  messagesByConversationId: Record<string | number, MessageType[]>;
  activeConversationId: string | number | null; // ID of the conversation being viewed in ChatScreen

  loadingConversations: boolean;
  loadingMessages: boolean; // Specifically for fetching messages for a conversation
  sendingMessage: boolean; // For send message action

  errorConversations: string | null;
  errorMessages: string | null;
  errorSendMessage: string | null;
}

// Initial State
const initialState: MessageState = {
  conversations: [],
  messagesByConversationId: {},
  activeConversationId: null,
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  errorConversations: null,
  errorMessages: null,
  errorSendMessage: null,
};

// Reducer Function
const messageReducer = (
  state: MessageState = initialState,
  action: MessageActionTypes
): MessageState => {
  switch (action.type) {
    case SET_ACTIVE_CONVERSATION:
      return {
        ...state,
        activeConversationId: action.payload,
        messagesByConversationId: { // Clear previous messages for new active convo unless already loaded
          ...state.messagesByConversationId,
          [action.payload]: state.messagesByConversationId[action.payload] || [],
        },
        errorMessages: null, // Clear previous errors for message fetching
      };

    case FETCH_CONVERSATIONS_REQUEST:
      return { ...state, loadingConversations: true, errorConversations: null };
    case FETCH_CONVERSATIONS_SUCCESS:
      return { ...state, loadingConversations: false, conversations: action.payload };
    case FETCH_CONVERSATIONS_FAILURE:
      return { ...state, loadingConversations: false, errorConversations: action.payload };

    case FETCH_MESSAGES_REQUEST:
      return { ...state, loadingMessages: true, errorMessages: null };
    case FETCH_MESSAGES_SUCCESS:
      if (!state.activeConversationId) return state; // Should not happen if UI is correct
      return {
        ...state,
        loadingMessages: false,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [state.activeConversationId]: action.payload.messages, // Assuming payload is { conversationId: string, messages: MessageType[] }
        },
      };
    case FETCH_MESSAGES_FAILURE:
      return { ...state, loadingMessages: false, errorMessages: action.payload };

    case SEND_MESSAGE_REQUEST:
      return { ...state, sendingMessage: true, errorSendMessage: null };
    case SEND_MESSAGE_SUCCESS:
      if (!state.activeConversationId) return state;
      // Add the new message to the list for the active conversation
      // and update the last message in the conversations list
      const newMessage = action.payload;
      return {
        ...state,
        sendingMessage: false,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [state.activeConversationId]: [newMessage, ...(state.messagesByConversationId[state.activeConversationId] || []) ],
        },
        conversations: state.conversations.map(conv =>
          conv.id === state.activeConversationId
            ? { ...conv, last_message: { content: newMessage.content, created_at: newMessage.created_at, sender_id: newMessage.sender_id }, unread_count: 0 } // Reset unread for active convo
            : conv
        ),
      };
    case SEND_MESSAGE_FAILURE:
      return { ...state, sendingMessage: false, errorSendMessage: action.payload };

    case MARK_MESSAGES_AS_READ_SUCCESS:
      // Update unread_count for the specific conversation
      // And potentially update is_read status on individual messages if detailed state is kept
      const { conversationId, readMessageIds } = action.payload; // Assuming payload structure
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv // Simplified: mark all as read for this convo
        ),
        // More detailed: update is_read on messages in messagesByConversationId[conversationId]
        messagesByConversationId: {
            ...state.messagesByConversationId,
            [conversationId]: (state.messagesByConversationId[conversationId] || []).map(msg =>
                readMessageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
            )
        }
      };

    case RECEIVE_MESSAGE: // For WebSocket integration
      const receivedMessage = action.payload;
      const convoId = receivedMessage.conversation_id;
      const isRelevantToActiveConvo = state.activeConversationId === convoId;

      return {
        ...state,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [convoId]: isRelevantToActiveConvo
            ? [receivedMessage, ...(state.messagesByConversationId[convoId] || [])]
            : (state.messagesByConversationId[convoId] || []), // Or fetch if not loaded and just update unread
        },
        conversations: state.conversations.map(conv =>
          conv.id === convoId
            ? { ...conv, last_message: { content: receivedMessage.content, created_at: receivedMessage.created_at, sender_id: receivedMessage.sender_id }, unread_count: isRelevantToActiveConvo ? 0 : (conv.unread_count || 0) + 1 }
            : conv
        ),
      };

    default:
      return state;
  }
};

export default messageReducer;

// Note:
// - Ensure all action types (RECEIVE_MESSAGE, SET_ACTIVE_CONVERSATION) are in types.ts and MessageActionTypes.
// - The logic for updating lists on SEND_MESSAGE_SUCCESS and RECEIVE_MESSAGE might need to handle message ordering (e.g., always add to start for inverted lists).
// - Marking messages as read might need more sophisticated logic based on backend responses or specific message IDs.
// - Consider how to handle pagination for messages if implemented.
