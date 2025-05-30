import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from 'react-native-elements'; // Button from react-native-elements
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import VerificationBadges from '../../components/profile/VerificationBadges'; // Assume this component is typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { UserProfile as UserProfileModel, VerificationLevel } from '../../models/UserProfile';
import { MainTabParamList, AppStackParamList } from '../../navigation';
import { logout } from '../../store/actions/authActions'; // For logout
import { fetchProfile } from '../../store/actions/profileActions'; // To fetch profile data

// Internal Components with Types
interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface ProfileTagProps {
  label: string;
}

const ProfileTag: React.FC<ProfileTagProps> = ({ label }) => (
  <View style={styles.tag}><Text style={styles.tagText}>{label}</Text></View>
);

// Navigation Props
type ProfileScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  StackScreenProps<AppStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp['navigation'];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Use actual profile data from Redux state
  const userProfile = useSelector((state: RootState) => state.profile.profileData as UserProfileModel | null);
  const userType = useSelector((state: RootState) => state.profile.userType);
  // Assuming verificationStatus is part of UserProfile or fetched separately
  // For now, let's use verificationLevel from UserProfile
  const verificationLevel = userProfile?.verificationLevel || 'basic';
  const authUser = useSelector((state: RootState) => state.auth.user); // For name fallback

  // Fetch profile data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProfile()); // Action to fetch/refresh profile data
    }, [dispatch])
  );

  const isActivityType = userType === 'activity' || userType === 'both';
  const isCompanionType = userType === 'companion' || userType === 'both';

  const navigateToEditProfile = () => {
    // Pass current profile data to EditProfileScreen for prefilling
    navigation.navigate('AppStack', { screen: 'EditProfile', params: { profileData: userProfile || undefined } });
  };

  const navigateToScreen = (screenName: keyof AppStackParamList | 'SettingsScreenPlaceholder') => { // Allow placeholder
    if (screenName === 'SettingsScreenPlaceholder') {
        Alert.alert("Coming Soon", "This feature is under development.");
        return;
    }
    // Type assertion needed if screenName is not strictly from AppStackParamList keys for placeholders
    navigation.navigate('AppStack', { screen: screenName as keyof AppStackParamList });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) }
    ]);
  };

  if (!userProfile) {
    // Optional: Show a loading indicator or a message if profile is not yet loaded
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const displayName = userProfile.name || `${authUser?.name || 'User'}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={userProfile.profilePictureUrl ? { uri: userProfile.profilePictureUrl } : require('../../assets/images/default-avatar.png')} style={styles.profileImage} />
          <Text style={styles.name}>{displayName}</Text>
          <VerificationBadges verificationLevel={verificationLevel as VerificationLevel} />
          <View style={styles.buttonContainer}>
            <Button title="Edit Profile" icon={<Icon name="edit" type="material" size={18} color={COLORS.white} style={{ marginRight: SPACING.xsmall }} />} buttonStyle={styles.editButton} titleStyle={TYPOGRAPHY.buttonSmall} onPress={navigateToEditProfile} />
            <Button title="Verification" icon={<Icon name="shield-check" type="material-community" size={18} color={COLORS.white} style={{ marginRight: SPACING.xsmall }} />} buttonStyle={styles.verificationButton} titleStyle={TYPOGRAPHY.buttonSmall} onPress={() => navigateToScreen('Verification')} />
          </View>
        </View>

        <View style={styles.content}>
          <ProfileSection title="About Me">
            <Text style={styles.bioText}>{userProfile.bio || 'No bio provided. Tap "Edit Profile" to add one!'}</Text>
          </ProfileSection>

          {isActivityType && userProfile.activityPreferences && (
            <ProfileSection title="Activity Preferences">
              {userProfile.activityPreferences.categories?.length > 0 && (
                <View style={styles.tagContainer}>
                  {userProfile.activityPreferences.categories.map((category, index) => <ProfileTag key={index} label={category} />)}
                </View>
              )}
              {userProfile.activityPreferences.availability?.generalNotes && (
                <View style={styles.detailRow}><Icon name="schedule" type="material" size={16} color={COLORS.grey600} /><Text style={styles.detailText}>Available: {userProfile.activityPreferences.availability.generalNotes}</Text></View>
              )}
            </ProfileSection>
          )}

          {isCompanionType && userProfile.companionshipDetails && (
            <ProfileSection title="Companionship">
              {userProfile.companionshipDetails.conversationTopics?.length > 0 && (<><Text style={styles.sectionSubtitle}>Preferred Topics</Text><View style={styles.tagContainer}>{userProfile.companionshipDetails.conversationTopics.map((type, index) => <ProfileTag key={index} label={type} />)}</View></>)}
              {userProfile.companionshipDetails.personalityTraits?.length > 0 && (<><Text style={styles.sectionSubtitle}>Desired Traits</Text><View style={styles.tagContainer}>{userProfile.companionshipDetails.personalityTraits.map((trait, index) => <ProfileTag key={index} label={trait} />)}</View></>)}
            </ProfileSection>
          )}

          <ProfileSection title="Settings & More">
            <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('SubscriptionScreen')}>
              <Icon name="payment" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Subscription & Payments</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('SafetyScreen')}>
              <Icon name="health-and-safety" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Safety Center</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
             <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('BadgesScreen')}>
              <Icon name="military-tech" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Badges & Achievements</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('SettingsScreenPlaceholder')}>
              <Icon name="notifications" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Notification Preferences</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('SettingsScreenPlaceholder')}>
              <Icon name="lock" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Privacy Settings</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow} onPress={() => navigateToScreen('SettingsScreenPlaceholder')}>
              <Icon name="help-outline" type="material" size={20} color={COLORS.grey800} /><Text style={styles.settingText}>Help & Support</Text><Icon name="chevron-right" type="material" size={20} color={COLORS.grey400} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={handleLogout}>
              <Icon name="logout" type="material-community" size={20} color={COLORS.danger} /><Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ProfileSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: SPACING.medium, borderBottomWidth: 1, borderBottomColor: COLORS.grey200, backgroundColor: COLORS.white },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: SPACING.medium, borderWidth: 3, borderColor: COLORS.primary },
  name: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: SPACING.small },
  buttonContainer: { flexDirection: 'row', marginTop: SPACING.medium },
  editButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.medium, borderRadius: 20, marginRight: SPACING.small },
  verificationButton: { backgroundColor: COLORS.success, paddingHorizontal: SPACING.medium, borderRadius: 20 },
  content: { paddingBottom: SPACING.large }, // Added paddingBottom
  section: { marginBottom: SPACING.small, backgroundColor: COLORS.white, padding: SPACING.medium },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.textEmphasis, marginBottom: SPACING.medium },
  sectionSubtitle: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, marginTop: SPACING.small, marginBottom: SPACING.xsmall },
  bioText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: TYPOGRAPHY.body?.fontSize ? TYPOGRAPHY.body.fontSize * 1.5 : 21 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.small },
  tag: { backgroundColor: COLORS.lightPrimary, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 15, marginRight: SPACING.xsmall, marginBottom: SPACING.xsmall },
  tagText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xsmall },
  detailText: { marginLeft: SPACING.small, ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.medium, borderBottomWidth: 1, borderBottomColor: COLORS.grey100 },
  settingText: { flex: 1, marginLeft: SPACING.medium, ...TYPOGRAPHY.body, color: COLORS.text },
  logoutRow: { borderBottomWidth: 0, marginTop: SPACING.small },
  logoutText: { flex: 1, marginLeft: SPACING.medium, ...TYPOGRAPHY.body, color: COLORS.danger, fontWeight: '600' },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' }, subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14 }, caption: { fontSize: 12 }, buttonSmall: { fontSize: 14, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', black: '#000000', text: '#333333', textEmphasis: '#111111', textSecondary: '#555555',
  grey100: '#F3F4F6', grey200: '#E5E7EB', grey400: '#9CA3AF', grey600: '#4B5563',
  background: '#F4F6F8', lightPrimary: '#E0E7FF', danger: '#D32F2F', success: '#28a745',
  ...COLORS,
};

export default ProfileScreen;
