import apiClient from './auth'; // apiClient is an AxiosInstance
import { AxiosResponse } from 'axios';
import { User } from '../models/UserProfile'; // Assuming a UserProfile model/type

// Placeholder types - these should be refined based on actual API schema

// Represents a single message
export interface Message {
  id: string | number;
  conversation_id: string | number;
  sender_id: string | number;
  sender_details?: Partial<User>; // Optional: embed sender info
  text_content?: string;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
  // Add other message content types (e.g., location, sticker)
  created_at: string; // ISO 8601 date-time
  read_at?: string | null; // ISO 8601 date-time, null if unread
}

// Represents a conversation or chat session
export interface Conversation {
  id: string | number;
  participants: Partial<User>[]; // Array of users involved in the conversation
  last_message?: Message; // Optional: embed the last message for previews
  unread_count?: number; // Number of unread messages for the current user
  created_at: string;
  updated_at: string; // Timestamp of the last activity
}

// Payload for sending a new message
export interface SendMessagePayload {
  conversation_id?: string | number; // For sending to existing conversation
  recipient_id?: string | number; // For starting a new conversation with a user
  text_content?: string;
  image_url?: string; // Or use FormData for image uploads
  // Add other message content types
}

// Parameters for fetching messages (e.g., pagination)
export interface GetMessagesParams {
  before?: string | number; // Message ID or timestamp to fetch older messages
  limit?: number; // Number of messages to fetch
}

export const messagesAPI = {
  // Gets all conversations for the current user
  getConversations: (): Promise<AxiosResponse<Conversation[]>> => {
    return apiClient.get('/messaging/conversations/');
  },

  // Gets messages within a specific conversation
  getMessagesInConversation: (
    conversationId: string | number,
    params?: GetMessagesParams
  ): Promise<AxiosResponse<Message[]>> => {
    return apiClient.get(`/messaging/conversations/${conversationId}/messages/`, { params });
  },

  // Sends a new message
  sendMessage: (payload: SendMessagePayload): Promise<AxiosResponse<Message>> => {
    // The endpoint might vary based on whether it's a new conversation or existing one
    // This example assumes a single endpoint that handles both via payload properties
    return apiClient.post('/messaging/messages/', payload);
  },

  // Marks messages as read in a conversation
  markMessagesAsRead: (
    conversationId: string | number,
    lastReadMessageId?: string | number // Optional: mark up to a specific message
  ): Promise<AxiosResponse<{ success: boolean }>> => {
    return apiClient.post(`/messaging/conversations/${conversationId}/read/`, {
      last_read_message_id: lastReadMessageId,
    });
  },
  
  // Deletes a message (soft or hard delete)
  deleteMessage: (messageId: string | number): Promise<AxiosResponse<{ success: boolean }>> => {
    return apiClient.delete(`/messaging/messages/${messageId}/`);
  },
};
