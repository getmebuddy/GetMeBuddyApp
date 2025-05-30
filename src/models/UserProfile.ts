// src/models/UserProfile.ts

// Sub-interface for user type selection
export interface UserType {
  activityPartner: boolean;
  companion: boolean;
}

// Type for verification level
export type VerificationLevel = 'basic' | 'enhanced' | 'premium';

// Sub-interface for skill levels in activities
export interface SkillLevels {
  [category: string]: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  // e.g., hiking: 'intermediate', yoga: 'beginner'
}

// Sub-interface for availability
export interface Availability {
  generalNotes?: string; // e.g., "Weekends only", "Evenings after 6 PM"
  specificSlots?: {
    date: string; // ISO date string e.g., "2024-07-28"
    timeRanges: { start: string; end: string; }[]; // e.g., [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "17:00" }]
  }[];
}

// Sub-interface for activity-specific preferences
export interface ActivityPreferences {
  categories: string[]; // e.g., ["hiking", "yoga", "cycling"]
  skillLevels?: SkillLevels;
  availability?: Availability;
  preferredGroupSize?: 'solo' | 'duo' | 'small_group' | 'large_group';
}

// Sub-interface for companionship-specific details
export interface CompanionshipDetails {
  conversationTopics?: string[]; // e.g., ["technology", "travel", "books"]
  personalityTraits?: string[]; // e.g., ["introverted", "extroverted", "humorous"]
  companionshipStyle?: string; // e.g., "Relaxed chat", "Active listening", "Mentorship"
  backgroundCheckComplete?: boolean;
  referenceCheckComplete?: boolean;
}

// Main User Profile Interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePictureUrl?: string;
  photos?: string[];
  bio?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer_not_to_say';
  location?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  phoneNumber?: string;

  userType: UserType;
  verificationLevel: VerificationLevel;

  activityPreferences?: ActivityPreferences;
  companionshipDetails?: CompanionshipDetails;

  interests?: string[];
  socialMediaLinks?: {
    [platform: string]: string;
  };

  joinedDate: string;
  lastLoginDate?: string;
  isActive: boolean;
}

// Simpler User type for summaries (consistent with other files)
export interface User {
  id: string;
  name: string; // Or username, first_name, last_name depending on what's usually displayed
  email: string; // Often used as a unique identifier for login, but might not be displayed publicly
  profilePictureUrl?: string; // or 'avatar'
  // Any other fields needed for brief displays, e.g., in chat lists, match cards
}

// Note on original schema:
// The previous content of this file (UserProfileSchema) appeared to be a schema definition
// (e.g., for an ORM like Mongoose or a validation library).
// The interfaces above provide static typing for UserProfile objects within the TypeScript application.
// For runtime validation, other tools (Zod, Joi, ORM schemas) would be used,
// and these TypeScript interfaces should ideally align with or be generated from those schemas.
