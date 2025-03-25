// src/types/navigation/index.ts
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define your navigation parameter lists here
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Onboarding Stack
  UserTypeSelection: undefined;
  ActivityPreferences: undefined;
  CompanionshipPreferences: undefined;
  VerificationIntro: undefined;
  
  // Main Stack
  Main: undefined;
  Verification: undefined;
  
  // Details Screens
  MatchDetails: { userId: string };
  Chat: { conversationId: string; userName: string };
  ActivityDetail: { activityId: string };
  BuddyProfile: { userId: string };
  ReportConcern: undefined;
  EditProfile: undefined;
  BasicVerification: undefined;
  EnhancedVerification: undefined;
  PremiumVerification: undefined;
  SubscriptionFAQ: undefined;
};

// Helper type for accessing route params
export type RouteParams<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;

// Helper type for navigation props
export type NavigationProps<RouteName extends keyof RootStackParamList> = StackNavigationProp<
  RootStackParamList,
  RouteName
>;

// Combined props type for screens
export interface ScreenProps<RouteName extends keyof RootStackParamList> {
  route: RouteParams<RouteName>;
  navigation: NavigationProps<RouteName>;
}
