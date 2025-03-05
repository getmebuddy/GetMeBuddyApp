// src/screens/HomeScreen.js
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
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Button, Icon, Divider } from 'react-native-elements';
import { fetchPotentialMatches } from '../store/actions/matchActions';
import { getLocation } from '../utils/locationUtils';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import typography from '../styles/typography';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { potentialMatches, loading } = useSelector(state => state.matches);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  // Fetch potential matches when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPotentialMatches();
      getLocation().then(location => {
        if (location) {
          setLocation(location);
        }
      });
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const loadPotentialMatches = async () => {
    try {
      await dispatch(fetchPotentialMatches());
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPotentialMatches();
    setRefreshing(false);
  };

  const handleMatchRequest = (userId) => {
    // Navigate to match request screen with user details
    navigation.navigate('MatchDetails', { userId });
  };

  const renderMatchItem = ({ item }) => (
    <Card containerStyle={styles.matchCard}>
      <View style={styles.cardHeader}>
        <Image
          source={item.profile.avatar ? { uri: item.profile.avatar } : require('../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{`${item.first_name} ${item.last_name}`}</Text>
          <View style={styles.locationContainer}>
            <Icon name="place" type="material" size={16} color={colors.grey600} />
            <Text style={styles.locationText}>
              {item.profile.distance ? `${item.profile.distance.toFixed(1)} km away` : 'Location unknown'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.interestsContainer}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestTags}>
          {item.profile.interests && item.profile.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest.name}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.availabilityContainer}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.availabilityTags}>
          {item.profile.availabilities && item.profile.availabilities.map((availability, index) => (
            <View key={index} style={styles.availabilityTag}>
              <Text style={styles.availabilityText}>
                {`${availability.day} (${availability.start_time.substring(0, 5)}-${availability.end_time.substring(0, 5)})`}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.bioContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText} numberOfLines={3}>
          {item.profile.bio || 'No bio available'}
        </Text>
      </View>
      
      <View style={styles.matchScoreContainer}>
        <Text style={styles.matchScoreText}>
          Match Score: {Math.round(item.scores.total_score * 100)}%
        </Text>
        <View style={styles.scoreBreakdown}>
          <Text style={styles.scoreBreakdownText}>
            Interests: {Math.round(item.scores.interest_score * 100)}%
          </Text>
          <Text style={styles.scoreBreakdownText}>
            Distance: {Math.round(item.scores.distance_score * 100)}%
          </Text>
          <Text style={styles.scoreBreakdownText}>
            Availability: {Math.round(item.scores.availability_score * 100)}%
          </Text>
        </View>
      </View>
      
      <Button
        title="Let's Meet!"
        buttonStyle={styles.matchButton}
        titleStyle={styles.matchButtonText}
        onPress={() => handleMatchRequest(item.user_id)}
        icon={
          <Icon
            name="handshake"
            type="font-awesome-5"
            size={16}
            color="white"
            style={{ marginRight: 8 }}
          />
        }
      />
    </Card>
  );

  const EmptyMatchesView = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="person-search"
        type="material"
        size={80}
        color={colors.grey400}
      />
      <Text style={styles.emptyTitle}>No matches found!</Text>
      <Text style={styles.emptySubtitle}>
        Try updating your interests or expanding your search radius to find buddies
      </Text>
      <Button
        title="Adjust Preferences"
        buttonStyle={styles.emptyButton}
        titleStyle={styles.emptyButtonText}
        onPress={() => navigation.navigate('Profile', { screen: 'Preferences' })}
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
            onPress={() => navigation.navigate('Profile')}
          >
            <Image
              source={user.profile?.avatar ? { uri: user.profile.avatar } : require('../assets/images/default-avatar.png')}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  list: {
    padding: spacing.small,
  },
  matchCard: {
    borderRadius: 10,
    padding: spacing.small,
    marginBottom: spacing.standard,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: spacing.small,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    ...typography.h2,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...typography.caption,
    color: colors.grey600,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.xs,
    color: colors.grey800,
  },
  interestsContainer: {
    marginVertical: spacing.xs,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  interestText: {
    ...typography.caption,
    color: colors.white,
  },
  availabilityContainer: {
    marginVertical: spacing.xs,
  },
  availabilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilityTag: {
    backgroundColor: colors.lightPrimary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  availabilityText: {
    ...typography.caption,
    color: colors.primary,
  },
  bioContainer: {
    marginVertical: spacing.xs,
  },
  bioText: {
    ...typography.body,
    color: colors.grey700,
  },
  matchScoreContainer: {
    marginTop: spacing.small,
    marginBottom: spacing.small,
    padding: spacing.small,
    backgroundColor: colors.lightGrey,
    borderRadius: 8,
  },
  matchScoreText: {
    ...typography.subtitle,
    color: colors.grey900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  scoreBreakdownText: {
    ...typography.caption,
    color: colors.grey700,
  },
  matchButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.small,
    marginTop: spacing.small,
  },
  matchButtonText: {
    ...typography.button,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.grey700,
    marginTop: spacing.standard,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.extraLarge * 2,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.grey800,
    marginTop: spacing.standard,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.grey600,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.standard,
    marginTop: spacing.large,
  },
  emptyButtonText: {
    ...typography.button,
  },
});

export default HomeScreen;