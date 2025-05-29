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
import { useDispatch } from 'react-redux';
// import { getCompanions } from '../../store/actions/companionshipActions'; // Assuming this action exists
import { COLORS } from '../../styles/colors'; // Assuming COLORS are typed
import { NavigationProp, ParamListBase } from '@react-navigation/native'; // Basic navigation type

// Define the structure for a Companion
export interface Companion {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  rating: number;
  responseTime: string;
  likes: number;
  meetups: number;
  types: string[];
  isVerified?: boolean; // Optional: for the verification badge
}

// Props for CompanionCard
interface CompanionCardProps {
  companion: Companion;
  onPress: () => void;
}

const CompanionCard: React.FC<CompanionCardProps> = ({ companion, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.cardHeader}>
        <Image source={{ uri: companion.avatar }} style={styles.avatar} accessibilityIgnoresInvertColors />
        {companion.isVerified && (
          <View style={styles.verificationBadge}>
            <Icon name="verified-user" type="material" size={14} color={COLORS.white || '#fff'} />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {companion.name}, {companion.age}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" size={16} color={COLORS.warning || '#FFC107'} />
            <Text style={styles.rating}>{companion.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          {companion.bio}
        </Text>

        <View style={styles.typeContainer}>
          {companion.types.map((type, index) => (
            <View key={index} style={[styles.typeTag, { backgroundColor: COLORS.secondaryBackground || '#f0f7ff'}]}>
              <Text style={[styles.typeText, {color: COLORS.secondaryText || COLORS.primary || '#007bff'}]}>{type}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="schedule" type="material" size={16} color={COLORS.textMuted || '#888'} />
            <Text style={styles.statText}>{companion.responseTime}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="favorite" type="material" size={16} color={COLORS.textMuted || '#888'} />
            <Text style={styles.statText}>{companion.likes} likes</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="history" type="material" size={16} color={COLORS.textMuted || '#888'} />
            <Text style={styles.statText}>{companion.meetups} meetups</Text>
          </View>
        </View>
      </View>

      <Button
        title="Connect"
        buttonStyle={[styles.connectButton, { backgroundColor: COLORS.primary }]}
        titleStyle={[styles.connectButtonText, { color: COLORS.white || '#fff' }]}
      />
    </TouchableOpacity>
  );
};

// Props for CompanionshipFeed
interface CompanionshipFeedProps {
  navigation: NavigationProp<ParamListBase>;
}

const CompanionshipFeed: React.FC<CompanionshipFeedProps> = ({ navigation }) => {
  const dispatch = useDispatch(); // const dispatch = useDispatch<AppDispatch>();

  // TODO: Replace with actual data fetching and Redux state
  const [companions, setCompanions] = useState<Companion[]>([
    {
      id: '1', name: 'Emma', age: 28, bio: 'Native New Yorker, happy to show you around the city or just grab coffee and chat.',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 4.9, responseTime: '< 1 hour',
      likes: 56, meetups: 24, types: ['City Guide', 'Conversation'], isVerified: true,
    },
    {
      id: '2', name: 'David', age: 32, bio: 'Museum enthusiast and foodie. Perfect companion for cultural events or trying new restaurants.',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 4.7, responseTime: '~2 hours',
      likes: 43, meetups: 19, types: ['Events', 'Dining'], isVerified: false,
    },
  ]);

  useEffect(() => {
    // dispatch(getCompanions() as any);
  }, [dispatch]);

  const renderCompanionCard = ({ item }: ListRenderItemInfo<Companion>) => (
    <CompanionCard
      companion={item}
      onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      {companions.length === 0 ? (
         <View style={styles.emptyFeedContainer}>
          <Text style={styles.emptyFeedText}>No companions available right now.</Text>
        </View>
      ) : (
        <FlatList
          data={companions}
          renderItem={renderCompanionCard}
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
    backgroundColor: COLORS.background || '#f8f8f8',
  },
  listContent: {
    padding: 15, // Adjusted padding
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
    borderRadius: 12, // Slightly more rounded
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: 220, // Increased height
  },
  verificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primary || '#007bff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Badge shadow
  },
  cardContent: {
    padding: 15,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20, // Larger name
    fontWeight: 'bold',
    color: COLORS.text || '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBackground || '#FFF8E1', // Light yellow for rating
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning || '#FFC107', // Rating star color
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary || '#555',
    marginBottom: 12,
    lineHeight: 20, // Improved readability
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeTag: {
    // backgroundColor is now set inline based on COLORS.secondaryBackground
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500', // Slightly bolder
    // color is now set inline based on COLORS.secondaryText or COLORS.primary
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Better distribution
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#eee',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center', // Center items for better look
  },
  statText: {
    marginTop: 2, // Space between icon and text
    fontSize: 12,
    color: COLORS.textMuted || '#888',
  },
  connectButton: {
    // backgroundColor is set inline from COLORS.primary
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12, // Match card border radius
    borderBottomRightRadius: 12,
    paddingVertical: 12, // Increased padding
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    // color is set inline from COLORS.white
  },
});

export default CompanionshipFeed;
