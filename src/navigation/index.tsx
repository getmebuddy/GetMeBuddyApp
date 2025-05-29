import React, { useEffect, useState } from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Assuming RootState and AppDispatch are defined in your store
import { RootState, AppDispatch } from '../store';

// Auth screens - ensure these are .tsx or correctly typed
import LoginScreen from '../screens/auth/LoginScreen'; // Already .tsx
import RegisterScreen from '../screens/auth/RegisterScreen'; // Assume .tsx or correctly typed
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'; // Assume .tsx

// Onboarding screens
import UserTypeSelectionScreen from '../screens/onboarding/UserTypeSelectionScreen';
import ActivityPreferencesScreen from '../screens/onboarding/ActivityPreferencesScreen';
import CompanionshipPreferencesScreen from '../screens/onboarding/CompanionshipPreferencesScreen';
import VerificationIntroScreen from '../screens/onboarding/VerificationIntroScreen';

// Main app screens
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Verification screens
import VerificationStatusScreen from '../screens/verification/VerificationStatusScreen';

// Actions
import { getCurrentUser } from '../store/actions/authActions'; // Ensure this action is typed
import { COLORS } from '../styles/colors'; // Assuming COLORS are typed

// Parameter lists for navigators
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  UserTypeSelection: undefined;
  ActivityPreferences: undefined;
  CompanionshipPreferences: undefined;
  VerificationIntro: undefined;
};

export type VerificationStackParamList = {
  VerificationStatus: undefined;
  // Add other verification screen params here, e.g., VerificationSubmitDocuments: { type: string }
};

export type MainTabParamList = {
  Home: undefined;
  Matches: undefined;
  Messages: undefined;
  Profile: undefined;
};

// This will be the root stack for when the user is authenticated and onboarding is complete
export type AppStackParamList = {
  Main: { screen?: keyof MainTabParamList }; // To allow navigating to specific tabs
  Verification: { screen?: keyof VerificationStackParamList }; // To allow navigating to specific verification screens
  // Add other top-level stack screens here, e.g., ActivityDetail: { activityId: string }
  // CompanionDetail: { companionId: string }, Chat: { conversationId: string }
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const OnboardingStackNav = createStackNavigator<OnboardingStackParamList>();
const VerificationStackNav = createStackNavigator<VerificationStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const AppRootStack = createStackNavigator<AppStackParamList>();

// Onboarding Navigator Component
const OnboardingNavigator: React.FC = () => (
  <OnboardingStackNav.Navigator screenOptions={{ headerShown: false }}>
    <OnboardingStackNav.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
    <OnboardingStackNav.Screen name="ActivityPreferences" component={ActivityPreferencesScreen} />
    <OnboardingStackNav.Screen name="CompanionshipPreferences" component={CompanionshipPreferencesScreen} />
    <OnboardingStackNav.Screen name="VerificationIntro" component={VerificationIntroScreen} />
  </OnboardingStackNav.Navigator>
);

// Verification Navigator Component
const VerificationNavigator: React.FC = () => (
  <VerificationStackNav.Navigator>
    <VerificationStackNav.Screen
      name="VerificationStatus"
      component={VerificationStatusScreen}
      options={{ title: 'Verification Center' }}
    />
  </VerificationStackNav.Navigator>
);

// Main Tab Navigator Component
const MainTabNavigator: React.FC = () => (
  <MainTab.Navigator
    screenOptions={({ route }: { route: RouteProp<MainTabParamList, keyof MainTabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
        let iconName: string = 'help'; // Default icon
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Matches') iconName = 'people';
        else if (route.name === 'Messages') iconName = 'chat';
        else if (route.name === 'Profile') iconName = 'person';
        return <Icon name={iconName} type="material" size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary || '#4A80F0',
      tabBarInactiveTintColor: COLORS.grey3 || 'gray',
      headerShown: false, // Usually, individual screens in tabs have their own headers or none
    })}
  >
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Matches" component={MatchesScreen} />
    <MainTab.Screen name="Messages" component={MessagesScreen} />
    <MainTab.Screen name="Profile" component={ProfileScreen} />
  </MainTab.Navigator>
);

// Main App Navigator (Root after auth/onboarding)
const AuthenticatedAppNavigator: React.FC = () => (
  <AppRootStack.Navigator>
    <AppRootStack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
    <AppRootStack.Screen name="Verification" component={VerificationNavigator} options={{ presentation: 'modal' }} />
    {/* Other global stack screens like Modals, Detail screens can go here */}
  </AppRootStack.Navigator>
);


const AppNavigator: React.FC = () => {
  const { user, token, loading: authLoading } = useSelector((state: RootState) => state.auth);
  // Assuming profile state has onboardingCompleted. If not, adjust selector.
  const { onboardingCompleted, loading: profileLoading } = useSelector((state: RootState) => state.profile || { onboardingCompleted: false, loading: false });
  const dispatch = useDispatch<AppDispatch>();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken && !token) { // If we have a token in storage but not in redux state
          await dispatch(getCurrentUser()); // getCurrentUser should set user and token in redux
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        // Potentially clear stored token if it's invalid
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [dispatch, token]);

  if (isCheckingAuth || authLoading || profileLoading) {
    // Replace with a proper Splash Screen component
    return null; 
  }

  return (
    <NavigationContainer>
      {!user || !token ? ( // Check for user object and token presence
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      ) : !onboardingCompleted ? (
        <OnboardingNavigator />
      ) : (
        <AuthenticatedAppNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
