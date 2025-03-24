// src/models/UserProfile.js
const UserProfileSchema = {
    // Existing fields
    userId: String,
    name: String,
    email: String,
    photos: Array,
    
    // New fields for dual use case
    userType: {
      activityPartner: Boolean,
      companion: Boolean,
    },
    
    verificationLevel: {
      type: String,
      enum: ['basic', 'enhanced', 'premium'],
      default: 'basic'
    },
    
    // Activity-specific fields
    activityPreferences: {
      categories: Array,
      skillLevels: Object,
      availability: Object,
    },
    
    // Companionship-specific fields
    companionshipDetails: {
      conversationTopics: Array,
      personalityTraits: Array,
      companionshipStyle: String,
      backgroundCheckComplete: Boolean,
      referenceCheckComplete: Boolean,
    }
  };