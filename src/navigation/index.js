// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding screens
import UserTypeSelectionScreen from '../screens/onboarding/UserTypeSelectionScreen'; // New
import ActivityPreferencesScreen from '../screens/onboarding/ActivityPreferencesScreen';
import CompanionshipPreferencesScreen from '../screens/onboarding/CompanionshipPreferencesScreen'; // New
import VerificationIntroScreen from '../screens/onboarding/VerificationIntroScreen'; // New

// Main app screens
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Verification screens
import BasicVerificationScreen from '../screens/verification/BasicVerificationScreen'; // New
import EnhancedVerificationScreen from '../screens/verification/EnhancedVerificationScreen'; // New
import PremiumVerificationScreen from '../screens/verification/PremiumVerificationScreen'; // New
import VerificationStatusScreen from '../screens/verification/VerificationStatusScreen'; // New

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const OnboardingStack = createStackNavigator();
const VerificationStack = createStackNavigator();

// Onboarding navigation
const OnboardingNavigator = () => (
  <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <OnboardingStack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
    <OnboardingStack.Screen name="ActivityPreferences" component={ActivityPreferencesScreen} />
    <OnboardingStack.Screen name="CompanionshipPreferences" component={CompanionshipPreferencesScreen} />
    <OnboardingStack.Screen name="VerificationIntro" component={VerificationIntroScreen} />
  </OnboardingStack.Navigator>
);

// Verification navigation
const VerificationNavigator = () => (
  <VerificationStack.Navigator>
    <VerificationStack.Screen name="VerificationStatus" component={VerificationStatusScreen} options={{ title: 'Verification Center' }} />
    <VerificationStack.Screen name="BasicVerification" component={BasicVerificationScreen} options={{ title: 'Basic Verification' }} />
    <VerificationStack.Screen name="EnhancedVerification" component={EnhancedVerificationScreen} options={{ title: 'Enhanced Verification' }} />
    <VerificationStack.Screen name="PremiumVerification" component={PremiumVerificationScreen} options={{ title: 'Premium Verification' }} />
  </VerificationStack.Navigator>
);

// Main tab navigation
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Matches') {
          iconName = 'people';
        } else if (route.name === 'Messages') {
          iconName = 'chat';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        
        return <Icon name={iconName} type="material" size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: '#4A80F0',
      inactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Matches" component={MatchesScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { onboardingCompleted } = useSelector(state => state.profile);
  
  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Auth flows
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      ) : !onboardingCompleted ? (
        // Onboarding flows
        <OnboardingNavigator />
      ) : (
        // Main app
        <Stack.Navigator>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Verification" 
            component={VerificationNavigator}
            options={{ headerShown: false }}
          />
          {/* Add other stack screens here */}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;