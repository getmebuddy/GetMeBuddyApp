// src/types/api.ts
import { User, Match, Conversation, Message, VerificationStatus } from './models';

// Auth API responses
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

export interface UserResponse {
  user: User;
}

// Matches API responses
export interface GetMatchesResponse {
  matches: Match[];
}

export interface MatchResponse {
  match: Match;
}

// Messages API responses
export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface MessageResponse {
  message: Message;
}

// Verification API responses
export interface VerificationStatusResponse {
  status: VerificationStatus;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}