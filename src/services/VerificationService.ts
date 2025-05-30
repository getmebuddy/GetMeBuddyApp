import apiClient from '../api/auth'; // Assuming this is an AxiosInstance
import { AxiosResponse } from 'axios';
import { UserVerificationStatus } from '../screens/verification/VerificationHomeScreen'; // Reuse this type

// Interface for image file objects (e.g., from react-native-image-picker)
export interface ImageFile {
  uri: string;
  name: string;
  type: string; // e.g., 'image/jpeg'
}

// Interface for background check user data
export interface BackgroundCheckUserData {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  ssnLast4?: string; // Example, ensure secure handling
  // Add other fields required by the background check provider
}

// Interface for a single reference
export interface ReferenceData {
  name: string;
  email: string;
  phone?: string;
  relationship: string; // e.g., 'Former Employer', 'Colleague'
  // Optional: a brief comment or statement from the reference if collected beforehand
  statement?: string;
}

// Generic success response for simple verification steps
export interface SimpleVerificationResponse {
  success: boolean;
  message: string;
  verificationStatus?: Partial<UserVerificationStatus>; // Optionally return updated status
}

// Response for identity verification (might include review status)
export interface IdentityVerificationResponse extends SimpleVerificationResponse {
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}


export const verificationService = {
  // Basic verification
  verifyEmail: (email: string, verificationCode: string): Promise<AxiosResponse<SimpleVerificationResponse>> => {
    return apiClient.post('/verification/email/verify/', { email, code: verificationCode }); // Adjusted endpoint and payload
  },

  requestEmailCode: (email: string): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post('/verification/email/request_code/', { email });
  },

  verifyPhone: (phone: string, verificationCode: string): Promise<AxiosResponse<SimpleVerificationResponse>> => {
    return apiClient.post('/verification/phone/verify/', { phone_number: phone, code: verificationCode }); // Adjusted payload
  },

  requestPhoneCode: (phone: string): Promise<AxiosResponse<{ message: string }>> => {
    return apiClient.post('/verification/phone/request_code/', { phone_number: phone });
  },

  submitProfilePhoto: (photo: ImageFile): Promise<AxiosResponse<IdentityVerificationResponse>> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as any); // Type assertion for FormData compatibility
    // Potentially add user_id to formData if API requires it here
    return apiClient.post('/verification/profile_photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Enhanced verification
  submitIdentityDocuments: (idImages: ImageFile[]): Promise<AxiosResponse<IdentityVerificationResponse>> => {
    const formData = new FormData();
    idImages.forEach((image, index) => {
      formData.append(`id_image_${index + 1}`, { // Field names like id_image_1, id_image_2
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });
    // Potentially add document_type (e.g., 'passport', 'drivers_license') if API supports it
    return apiClient.post('/verification/identity_documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Liveness check / video selfie
  submitLivenessVideo: (videoFile: ImageFile): Promise<AxiosResponse<IdentityVerificationResponse>> => {
    const formData = new FormData();
    formData.append('video_selfie', {
      uri: videoFile.uri,
      name: videoFile.name,
      type: videoFile.type,
    } as any);
    return apiClient.post('/verification/liveness_check/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },


  // Premium verification (required for companionship)
  requestBackgroundCheck: (userData: BackgroundCheckUserData): Promise<AxiosResponse<SimpleVerificationResponse>> => {
    return apiClient.post('/verification/background_check/request/', userData);
  },

  submitReferences: (references: ReferenceData[]): Promise<AxiosResponse<SimpleVerificationResponse>> => {
    return apiClient.post('/verification/references/submit/', { references });
  },

  completeSafetyTraining: (quizAnswers: any): Promise<AxiosResponse<SimpleVerificationResponse>> => {
    // quizAnswers structure would depend on how the safety training is implemented
    return apiClient.post('/verification/safety_training/complete/', { answers: quizAnswers });
  },

  // Get overall status
  getVerificationStatus: (userId?: string | number): Promise<AxiosResponse<UserVerificationStatus>> => {
    // If userId is not provided, API might infer from auth token
    const endpoint = userId ? `/verification/status/${userId}/` : '/verification/status/';
    return apiClient.get(endpoint);
  },
};

// Note: The actual API endpoints and payload/response structures are assumed.
// These should be adjusted to match the backend API specification.
// Error handling (e.g., specific error types or parsing error responses) can be added here or in calling actions.
