import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ListRenderItemInfo,
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { useDispatch } from 'react-redux'; // useSelector removed as it's not used
// import { getActivities } from '../../store/actions/activityActions'; // Assuming this action exists
import { COLORS } from '../../styles/colors'; // Assuming COLORS are typed
import { NavigationProp, ParamListBase } from '@react-navigation/native'; // Basic navigation type

// Define the structure for an activity creator
export interface ActivityCreator {
  name: string;
  avatar: string;
}

// Define the structure for an activity
export interface Activity {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  image: string;
  creator: ActivityCreator;
}

// Props for ActivityCard
interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      <Image source={{ uri: activity.image }} style={styles.activityImage} accessibilityIgnoresInvertColors />
      <View style={styles.cardContent}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <View style={styles.detailRow}>
          <Icon name="calendar" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="map-pin" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="users" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.participants} participants</Text>
        </View>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: activity.creator.avatar }}
            style={styles.userAvatar}
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.userName}>Organized by {activity.creator.name}</Text>
        </View>
      </View>
      <Button title="Join" buttonStyle={styles.joinButton} titleStyle={styles.joinButtonText} />
    </TouchableOpacity>
  );
};

// Props for ActivityFeed
interface ActivityFeedProps {
  navigation: NavigationProp<ParamListBase>; // Use specific navigator type if available
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ navigation }) => {
  const dispatch = useDispatch(); // Consider AppDispatch type: const dispatch = useDispatch<AppDispatch>();

  // TODO: Replace with actual data fetching and Redux state
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Morning Hike at Sunset Trail',
      date: 'Tomorrow, 8:00 AM',
      location: 'Sunset Park',
      participants: 3,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
      creator: { name: 'Sarah', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
    },
    {
      id: '2',
      name: 'Beginner Yoga Class',
      date: 'Friday, 6:30 PM',
      location: 'Community Center',
      participants: 5,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      creator: { name: 'Mike', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    },
  ]);

  useEffect(() => {
    // Example of dispatching an action (ensure getActivities is typed if used)
    // dispatch(getActivities() as any); // Use 'as any' if action type is complex or not fully set up
  }, [dispatch]);

  const renderActivityCard = ({ item }: ListRenderItemInfo<Activity>) => (
    <ActivityCard
      activity={item}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {activities.length === 0 ? (
        <View style={styles.emptyFeedContainer}>
          <Text style={styles.emptyFeedText}>No activities available right now.</Text>
          {/* Optionally, add a button to refresh or create an activity */}
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f8f8f8', // Use theme color
  },
  listContent: {
    padding: 20,
  },
  emptyFeedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyFeedText: {
    fontSize: 16,
    color: COLORS.textSecondary || '#666',
  },
  card: {
    backgroundColor: COLORS.cardBackground || '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Increased elevation slightly
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: 180, // Slightly increased image height
  },
  cardContent: {
    padding: 15,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text || '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10, // Increased margin
    fontSize: 14,
    color: COLORS.textSecondary || '#555',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12, // Increased margin
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#eee',
    paddingTop: 12, // Increased padding
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10, // Increased margin
  },
  userName: {
    fontSize: 14,
    color: COLORS.textSecondary || '#555',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10, // Keep rounded bottom corners
    borderBottomRightRadius: 10,
    paddingVertical: 10, // Added padding
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white || '#fff',
  },
});

export default ActivityFeed;
