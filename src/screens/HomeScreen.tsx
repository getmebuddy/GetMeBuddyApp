import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ListRenderItemInfo,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native'; // For combining navigator types
import { StackScreenProps } from '@react-navigation/stack';
import { Card, Button, Icon } from 'react-native-elements'; // Divider removed as not used

import { fetchPotentialMatches } from '../store/actions/matchActions'; // Assume typed
import { getLocation, LocationCoords } from '../utils/locationUtils'; // Assume LocationCoords is { latitude: number; longitude: number; }
import { COLORS } from '../styles/colors'; // Assume typed
import { SPACING } from '../styles/spacing'; // Assume typed
import { TYPOGRAPHY } from '../styles/typography'; // Assume typed

import { UserProfile as User } from '../models/UserProfile'; // Use UserProfile as User
import { AppDispatch, RootState } from '../store';
// Explicitly point to index if Metro/TS has trouble resolving directory imports for types
import { MainTabParamList, AppStackParamList } from '../navigation/index';

// Define the structure of a Potential Match item
interface MatchInterest {
  id: string | number;
  name: string;
}

interface MatchAvailability {
  id: string | number;
  day: string; // e.g., "Monday"
  start_time: string; // e.g., "09:00:00"
  end_time: string; // e.g., "17:00:00"
}

interface MatchProfile {
  avatar?: string;
  distance?: number;
  interests?: MatchInterest[];
  availabilities?: MatchAvailability[];
  bio?: string;
}

interface MatchScores {
  total_score: number;
  interest_score: number;
  distance_score: number;
  availability_score: number;
  // Add other score components if any
}

export interface PotentialMatch {
  user_id: string | number; // Assuming user_id is the primary key for a match
  first_name: string;
  last_name: string;
  profile: MatchProfile;
  scores: MatchScores;
}

// Navigation props for HomeScreen: it's a tab screen, but can also navigate via root stack
type HomeScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  StackScreenProps<AppStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp['navigation']; // Extract navigation object
  // route: HomeScreenNavigationProp['route']; // If route params were needed
}


const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { potentialMatches, loading } = useSelector((state: RootState) => state.matches);
  const { user } = useSelector((state: RootState) => state.auth); // User from auth state
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPotentialMatches();
      getLocation().then(loc => {
        if (loc) setLocation(loc);
      }).catch(error => console.log("Error getting location:", error));
      return () => {};
    }, []) // Removed dispatch from dependencies as loadPotentialMatches is stable if not using its args
  );

  const loadPotentialMatches = async () => {
    try {
      // TODO: Pass location if API supports location-based matching
      // if (location) {
      //   await dispatch(fetchPotentialMatches({ latitude: location.latitude, longitude: location.longitude }));
      // } else {
      await dispatch(fetchPotentialMatches());
      // }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPotentialMatches();
    setRefreshing(false);
  };

  const handleMatchRequest = (userId: string | number) => {
    // navigation.navigate('MatchDetails', { userId }); // Assuming MatchDetails is part of AppStackParamList
    // For now, let's assume it's a screen in the AppStackParamList
    navigation.navigate('AppStack', { screen: 'MatchDetails', params: { userId: String(userId) } });
  };

  const renderMatchItem = ({ item }: ListRenderItemInfo<PotentialMatch>) => (
    <Card containerStyle={styles.matchCard}>
      <View style={styles.cardHeader}>
        <Image
          source={item.profile.avatar ? { uri: item.profile.avatar } : require('../../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{`${item.first_name} ${item.last_name}`}</Text>
          <View style={styles.locationContainer}>
            <Icon name="place" type="material" size={16} color={COLORS.grey600} />
            <Text style={styles.locationText}>
              {item.profile.distance ? `${item.profile.distance.toFixed(1)} km away` : 'Location unknown'}
            </Text>
          </View>
        </View>
      </View>

      {item.profile.interests && item.profile.interests.length > 0 && (
        <View style={styles.interestsContainer}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestTags}>
            {item.profile.interests.map((interest) => (
              <View key={interest.id.toString()} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.profile.availabilities && item.profile.availabilities.length > 0 && (
         <View style={styles.availabilityContainer}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityTags}>
            {item.profile.availabilities.map((availability) => (
              <View key={availability.id.toString()} style={styles.availabilityTag}>
                <Text style={styles.availabilityText}>
                  {`${availability.day} (${availability.start_time.substring(0, 5)}-${availability.end_time.substring(0, 5)})`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.profile.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText} numberOfLines={3}>{item.profile.bio}</Text>
        </View>
      )}

      <View style={styles.matchScoreContainer}>
        <Text style={styles.matchScoreText}>Match Score: {Math.round(item.scores.total_score * 100)}%</Text>
        {/* Optional: Score breakdown can be detailed or removed for brevity */}
      </View>

      <Button
        title="Let's Meet!"
        buttonStyle={styles.matchButton}
        titleStyle={TYPOGRAPHY.button}
        onPress={() => handleMatchRequest(item.user_id)}
        icon={<Icon name="handshake" type="font-awesome-5" size={16} color={COLORS.white} style={{ marginRight: SPACING.small }}/>}
      />
    </Card>
  );

  const EmptyMatchesView: React.FC = () => (
    <View style={styles.emptyContainer}>
      <Icon name="person-search" type="material" size={80} color={COLORS.grey400} />
      <Text style={styles.emptyTitle}>No matches found!</Text>
      <Text style={styles.emptySubtitle}>Try updating your interests or expanding your search radius.</Text>
      <Button
        title="Adjust Preferences"
        buttonStyle={styles.emptyButton}
        titleStyle={TYPOGRAPHY.button}
        onPress={() => navigation.navigate('Profile', { screen: 'EditProfile' })} // Assuming EditProfile or a Preferences screen under Profile tab
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Buddies</Text>
        {user && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')} // Navigates to Profile tab
          >
            <Image
              source={user.profilePictureUrl ? { uri: user.profilePictureUrl } : require('../../assets/images/default-avatar.png')}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        )}
      </View>

      {(loading && !refreshing && (!potentialMatches || potentialMatches.length === 0)) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding perfect buddies for you...</Text>
        </View>
      ) : (
        <FlatList
          data={potentialMatches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={EmptyMatchesView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

// Basic style object structure, assuming specific values are in imported objects
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, borderBottomWidth: 1, borderBottomColor: COLORS.grey200 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary },
  profileButton: { borderRadius: 20, overflow: 'hidden' },
  profileAvatar: { width: 40, height: 40, borderRadius: 20 },
  list: { padding: SPACING.small, paddingBottom: SPACING.large }, // Added paddingBottom
  matchCard: { borderRadius: 10, padding: SPACING.medium, marginBottom: SPACING.medium, backgroundColor: COLORS.white, elevation: 3, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', marginBottom: SPACING.medium },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: SPACING.medium },
  userInfo: { flex: 1, justifyContent: 'center' },
  userName: { ...TYPOGRAPHY.h2, marginBottom: 4, color: COLORS.text },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationText: { ...TYPOGRAPHY.caption, color: COLORS.grey600 },
  sectionTitle: { ...TYPOGRAPHY.subtitle, marginBottom: SPACING.small, color: COLORS.text },
  interestsContainer: { marginVertical: SPACING.small },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap' },
  interestTag: { backgroundColor: COLORS.secondary, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 16, marginRight: SPACING.small, marginBottom: SPACING.small },
  interestText: { ...TYPOGRAPHY.caption, color: COLORS.white },
  availabilityContainer: { marginVertical: SPACING.small },
  availabilityTags: { flexDirection: 'row', flexWrap: 'wrap' },
  availabilityTag: { backgroundColor: COLORS.lightPrimary, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 16, marginRight: SPACING.small, marginBottom: SPACING.small },
  availabilityText: { ...TYPOGRAPHY.caption, color: COLORS.primary },
  bioContainer: { marginVertical: SPACING.small },
  bioText: { ...TYPOGRAPHY.body, color: COLORS.grey700, lineHeight: 18 },
  matchScoreContainer: { marginTop: SPACING.medium, marginBottom: SPACING.medium, padding: SPACING.small, backgroundColor: COLORS.lightGrey, borderRadius: 8 },
  matchScoreText: { ...TYPOGRAPHY.subtitle, color: COLORS.textEmphasis, textAlign: 'center', marginBottom: SPACING.xsmall },
  matchButton: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: SPACING.small, marginTop: SPACING.medium },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.large, paddingTop: SPACING.extraLarge, backgroundColor: COLORS.background },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.medium, textAlign: 'center' },
  emptySubtitle: { ...TYPOGRAPHY.body, color: COLORS.grey600, textAlign: 'center', marginTop: SPACING.small },
  emptyButton: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: SPACING.small, paddingHorizontal: SPACING.medium, marginTop: SPACING.large },
});

// Fallback style definitions have been removed.
// Assuming TYPOGRAPHY, SPACING, COLORS are correctly imported and typed from their source files.


export default HomeScreen;
