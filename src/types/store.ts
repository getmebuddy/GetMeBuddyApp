// src/types/store.ts
import { 
  User, 
  Match, 
  PotentialMatch, 
  Conversation, 
  Message, 
  UserProfile, 
  VerificationStatus,
  Companion,
  BlockedUser,
  SharedLocation
} from './models';

// Root State type
export interface RootState {
  auth: AuthState;
  profile: ProfileState;
  matches: MatchState;
  messages: MessageState;
  verification: VerificationState;
  companionship: CompanionshipState;
  safety: SafetyState;
}

// Auth State
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Profile State
export interface ProfileState {
  profile: UserProfile | null;
  userType: 'activity' | 'companion' | 'both' | null;
  onboardingCompleted: boolean;
  loading: boolean;
  error: string | null;
}

// Match State
export interface MatchState {
  matches: Match[];
  potentialMatches: PotentialMatch[];
  userDetails?: any; // Will be refined later when we know the exact shape
  loading: boolean;
  error: string | null;
}

// Message State
export interface MessageState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

// Verification State
export interface VerificationState {
  verificationStatus: VerificationStatus;
  loading: boolean;
  error: string | null;
}

// Companionship State
export interface CompanionshipState {
  companions: Companion[];
  companionshipRequests: any[]; // Will be refined later when we know the exact shape
  loading: boolean;
  error: string | null;
}

// Safety State
export interface SafetyState {
  blockedUsers: BlockedUser[];
  sharedLocations: SharedLocation[];
  safetySettings?: any; // Will be refined later
  loading: boolean;
  error: string | null;
}

// Action types
export interface Action<T> {
  type: T;
}

export interface ActionWithPayload<T, P> {
  type: T;
  payload: P;
}

export type AppAction<T, P = undefined> = 
  P extends undefined ? Action<T> : ActionWithPayload<T, P>;