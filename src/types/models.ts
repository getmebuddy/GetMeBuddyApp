// src/types/models.ts

// User related types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_authenticated?: boolean;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location?: string;
  occupation?: string;
  interests?: Interest[];
  availabilities?: Availability[];
  distance?: number;
}

// Activity and Interest related types
export interface Interest {
  id: string;
  name: string;
}

export interface Availability {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
}

// Match related types
export interface Match {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  is_initiator: boolean;
  other_user: UserProfile;
  created_at: string;
  last_activity?: string;
  scores?: {
    total_score: number;
    interest_score: number;
    distance_score: number;
    availability_score: number;
  };
}

export interface PotentialMatch {
  user_id: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
  scores: {
    total_score: number;
    interest_score: number;
    distance_score: number;
    availability_score: number;
  };
}

// Message and conversation related types
export interface Conversation {
  id: string;
  other_user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    online?: boolean;
  };
  last_message?: Message;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_avatar?: string;
  attachment?: Attachment;
}

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

// Verification related types
export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  photoVerified: boolean;
  idVerified: boolean;
  videoVerified: boolean;
  socialVerified: boolean;
  backgroundVerified: boolean;
  referencesVerified: boolean;
  safetyTrainingComplete: boolean;
  level: 'none' | 'basic' | 'enhanced' | 'premium';
}

// Companionship related types
export interface Companion {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  rating: number;
  responseTime: string;
  likes: number;
  meetups: number;
  types: string[];
}

// Safety related types
export interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_user_name: string;
  created_at: string;
}

export interface SharedLocation {
  meetingId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}