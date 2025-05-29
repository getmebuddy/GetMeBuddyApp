import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Divider } from 'react-native-elements';
import { StackScreenProps } from '@react-navigation/stack';

import { fetchUserDetails, createMatch } from '../../store/actions/matchActions'; // Assume typed
import { COLORS } from '../../styles/colors'; // Assume typed
import { SPACING } from '../../styles/spacing'; // Assume typed
import { TYPOGRAPHY } from '../../styles/typography'; // Assume typed

import { UserProfile } from '../../models/UserProfile'; // Using UserProfile as a base
import { AppDispatch, RootState } from '../../store';
import { AppStackParamList } from '../../navigation'; // Import root stack param list

// Define the structure for user details specific to this screen, extending UserProfile
// This might include fields not directly on UserProfile or slightly different structures from API
export interface MatchUserDetail extends UserProfile {
  // Fields specific to the context of being fetched as a "match detail"
  // These might already be in UserProfile or might be additional data from a specific API endpoint
  avatar?: string; // Already in UserProfile as profilePictureUrl, ensure consistency
  birth_date?: string; // Already in UserProfile as dateOfBirth
  distance?: number;
  is_verified?: boolean; // Already in UserProfile as part of verificationLevel or specific field
  
  // Assuming interests and availabilities might have a slightly different structure or need specific typing here
  interests?: Array<{ id: string | number; name: string }>;
  availabilities?: Array<{ id: string | number; day: string; start_time: string; end_time: string }>;
  
  // Scores, if they are part of the userDetails object fetched
  match_score?: number;
  interest_score?: number;
  distance_score?: number;
  availability_score?: number;
  // If scores are nested, e.g. userDetails.scores.total_score then adjust UserDetails in Redux state
}

// Navigation props for MatchDetailsScreen
type MatchDetailsScreenProps = StackScreenProps<AppStackParamList, 'MatchDetails'>;

const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params; // userId is type string based on AppStackParamList
  const dispatch = useDispatch<AppDispatch>();
  
  // Assuming userDetails in Redux state (state.matches) is typed as MatchUserDetail | null
  const { userDetails, loading } = useSelector((state: RootState) => state.matches as { userDetails: MatchUserDetail | null; loading: boolean });
  
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);

  useEffect(() => {
    if (userId) { // Ensure userId is present before dispatching
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      await dispatch(fetchUserDetails(String(userId))); // Ensure userId is string if action expects string
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details. Please try again.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  const handleSendRequest = async () => {
    if (!userDetails) return;
    Alert.alert(
      'Send Match Request',
      `Are you sure you want to send a match request to ${userDetails.name}?`, // Use name from UserProfile
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              setSendingRequest(true);
              await dispatch(createMatch(String(userId))); // Ensure userId type matches action
              setRequestSent(true);
              setSendingRequest(false);
              Alert.alert('Success', `Match request sent to ${userDetails.name}!`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } catch (error) {
              setSendingRequest(false);
              console.error('Error sending match request:', error);
              Alert.alert('Error', 'Failed to send match request. Please try again.');
            }
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate?: string): string | number => {
    if (!birthDate) return 'Unknown age';
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !userDetails) {
    return (
      <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading profile...</Text></SafeAreaView>
    );
  }

  if (!userDetails) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error" type="material" size={80} color={COLORS.error || '#D32F2F'} />
        <Text style={styles.errorTitle}>User Not Found</Text>
        <Text style={styles.errorDescription}>We couldn't find this user. They may have deactivated their account.</Text>
        <Button title="Go Back" buttonStyle={styles.errorButton} titleStyle={TYPOGRAPHY.button} onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }
  
  // Use userDetails.profilePictureUrl for avatar if UserProfile model is used
  const avatarUri = userDetails.avatar || userDetails.profilePictureUrl;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image source={avatarUri ? { uri: avatarUri } : require('../../assets/images/default-avatar.png')} style={styles.profileImage} />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userDetails.name}</Text>
            <Text style={styles.age}>{calculateAge(userDetails.dateOfBirth)} years old</Text>
            <View style={styles.locationContainer}>
              <Icon name="place" type="material" size={16} color={COLORS.grey600} />
              <Text style={styles.location}>
                {userDetails.location?.city || 'Location unknown'}
                {userDetails.distance && ` • ${userDetails.distance.toFixed(1)} km away`}
              </Text>
            </View>
          </View>
          {userDetails.is_verified && ( // Assuming is_verified comes from MatchUserDetail
            <View style={styles.verifiedBadge}><Icon name="verified" type="material" size={16} color={COLORS.white} /></View>
          )}
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>{userDetails.bio || 'No bio provided.'}</Text>
        </View>

        {userDetails.interests && userDetails.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestTags}>
              {userDetails.interests.map((interest) => (
                <View key={interest.id.toString()} style={styles.interestTag}><Text style={styles.interestTagText}>{interest.name}</Text></View>
              ))}
            </View>
          </View>
        )}

        {userDetails.availabilities && userDetails.availabilities.length > 0 && (
          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityContainer}>
              {userDetails.availabilities.map((avail) => (
                <View key={avail.id.toString()} style={styles.availabilityItem}>
                  <View style={styles.dayBadge}><Text style={styles.dayText}>{avail.day.substring(0, 3)}</Text></View>
                  <Text style={styles.timeText}>{avail.start_time.slice(0, 5)} - {avail.end_time.slice(0, 5)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {userDetails.match_score !== undefined && ( // Check if match_score exists
            <View style={styles.matchScoreSection}>
                <Text style={styles.sectionTitle}>Match Score</Text>
                <View style={styles.scoreCard}>
                    <View style={styles.totalScoreContainer}>
                        <Text style={styles.totalScoreLabel}>Overall Match</Text>
                        <View style={styles.totalScoreCircle}><Text style={styles.totalScoreText}>{Math.round((userDetails.match_score || 0) * 100)}%</Text></View>
                    </View>
                    {(userDetails.interest_score !== undefined || userDetails.distance_score !== undefined || userDetails.availability_score !== undefined) && <Divider style={styles.scoreDivider} />}
                    <View style={styles.scoreBreakdownContainer}>
                        {userDetails.interest_score !== undefined && <ScoreBarItem label="Interests" score={userDetails.interest_score} />}
                        {userDetails.distance_score !== undefined && <ScoreBarItem label="Location" score={userDetails.distance_score} />}
                        {userDetails.availability_score !== undefined && <ScoreBarItem label="Availability" score={userDetails.availability_score} />}
                    </View>
                </View>
            </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            title={requestSent ? "Request Sent" : "Send Match Request"}
            buttonStyle={[styles.sendRequestButton, requestSent && styles.requestSentButton]}
            titleStyle={TYPOGRAPHY.button}
            onPress={handleSendRequest}
            disabled={requestSent || sendingRequest}
            loading={sendingRequest}
            icon={requestSent ? <Icon name="check" type="material" size={20} color={COLORS.white} containerStyle={{ marginRight: SPACING.small }} /> : <Icon name="handshake" type="font-awesome-5" size={16} color={COLORS.white} containerStyle={{ marginRight: SPACING.small }} />}
          />
          <Button title="Back to Search" type="outline" buttonStyle={styles.backButton} titleStyle={styles.backButtonText} onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for score bars
interface ScoreBarItemProps { label: string; score: number; }
const ScoreBarItem: React.FC<ScoreBarItemProps> = ({ label, score }) => (
    <View style={styles.scoreItem}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <View style={styles.scoreBarContainer}><View style={[styles.scoreBar, { width: `${Math.round(score * 100)}%` }]} /></View>
        <Text style={styles.scorePercentage}>{Math.round(score * 100)}%</Text>
    </View>
);

// Styles (condensed for brevity, assume they are similar to before with TYPOGRAPHY and SPACING)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', padding: SPACING.medium, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grey200, position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: SPACING.medium },
  nameContainer: { flex: 1, justifyContent: 'center' },
  name: { ...TYPOGRAPHY.h1, color: COLORS.text },
  age: { ...TYPOGRAPHY.h3, color: COLORS.grey700, marginBottom: SPACING.xsmall },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  location: { ...TYPOGRAPHY.body, color: COLORS.grey600, marginLeft: SPACING.xsmall },
  verifiedBadge: { position: 'absolute', top: SPACING.medium, right: SPACING.medium, backgroundColor: COLORS.success, borderRadius: 12, padding: SPACING.xsmall, width:24, height:24, justifyContent:'center', alignItems:'center' },
  aboutSection: { padding: SPACING.medium, backgroundColor: COLORS.white, marginBottom: SPACING.small },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.small },
  bio: { ...TYPOGRAPHY.body, color: COLORS.grey800, lineHeight: TYPOGRAPHY.body.fontSize ? TYPOGRAPHY.body.fontSize * 1.5 : 21 },
  interestsSection: { padding: SPACING.medium, backgroundColor: COLORS.white, marginBottom: SPACING.small },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap' },
  interestTag: { backgroundColor: COLORS.lightPrimary, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 16, marginRight: SPACING.xsmall, marginBottom: SPACING.xsmall },
  interestTagText: { ...TYPOGRAPHY.caption, color: COLORS.primary },
  availabilitySection: { padding: SPACING.medium, backgroundColor: COLORS.white, marginBottom: SPACING.small },
  availabilityContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  availabilityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGrey, borderRadius: 8, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, marginRight: SPACING.small, marginBottom: SPACING.small },
  dayBadge: { backgroundColor: COLORS.primary, borderRadius: 4, paddingHorizontal: SPACING.xsmall, marginRight: SPACING.xsmall },
  dayText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: 'bold' },
  timeText: { ...TYPOGRAPHY.caption, color: COLORS.text },
  noDataText: { ...TYPOGRAPHY.body, color: COLORS.grey600, fontStyle: 'italic' },
  matchScoreSection: { padding: SPACING.medium, backgroundColor: COLORS.white, marginBottom: SPACING.small },
  scoreCard: { borderWidth: 1, borderColor: COLORS.grey200, borderRadius: 8, overflow: 'hidden' },
  totalScoreContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.medium, backgroundColor: COLORS.lightPrimary },
  totalScoreLabel: { ...TYPOGRAPHY.h3, color: COLORS.primary },
  totalScoreCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  totalScoreText: { ...TYPOGRAPHY.h2, color: COLORS.white, fontWeight: 'bold' },
  scoreDivider: { height: 1, backgroundColor: COLORS.grey200 },
  scoreBreakdownContainer: { padding: SPACING.medium },
  scoreItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small },
  scoreLabel: { ...TYPOGRAPHY.body, color: COLORS.text, width: 100 },
  scoreBarContainer: { flex: 1, height: 10, backgroundColor: COLORS.lightGrey, borderRadius: 5, marginRight: SPACING.small, overflow: 'hidden' },
  scoreBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  scorePercentage: { ...TYPOGRAPHY.body, color: COLORS.primary, width: 40, textAlign: 'right' },
  actionButtons: { padding: SPACING.medium, marginBottom: SPACING.large },
  sendRequestButton: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: SPACING.small, marginBottom: SPACING.medium },
  requestSentButton: { backgroundColor: COLORS.success },
  buttonText: { ...TYPOGRAPHY.button, color: COLORS.white }, // Re-added for explicitness
  backButton: { borderColor: COLORS.grey400, borderRadius: 25, paddingVertical: SPACING.small },
  backButtonText: { ...TYPOGRAPHY.button, color: COLORS.grey700 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.large, backgroundColor: COLORS.background },
  errorTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, marginTop: SPACING.medium, marginBottom: SPACING.small, textAlign: 'center' },
  errorDescription: { ...TYPOGRAPHY.body, color: COLORS.grey700, textAlign: 'center', marginBottom: SPACING.large },
  errorButton: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: SPACING.small, paddingHorizontal: SPACING.large },
});

// Fallback definitions for styles (similar to HomeScreen)
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 14 * 1.5 },
  caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  ...TYPOGRAPHY // Assuming TYPOGRAPHY is imported and has these, this ensures they exist
};

const SPACING = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
  ...SPACING // Assuming SPACING is imported
};

const COLORS = {
  primary: '#4A80F0',
  success: '#28a745',
  error: '#D32F2F',
  background: '#F4F6F8',
  white: '#FFFFFF',
  text: '#333333',
  grey200: '#E5E7EB',
  grey400: '#9CA3AF',
  grey600: '#4B5563',
  grey700: '#374151',
  grey800: '#1F2937',
  lightPrimary: '#E0E7FF',
  lightGrey: '#F3F4F6',
  ...COLORS // Assuming COLORS is imported
};

export default MatchDetailsScreen;
