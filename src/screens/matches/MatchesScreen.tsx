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
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack'; // For navigating to Chat
import { SearchBar, Icon, Badge } from 'react-native-elements';

import { fetchMatches, respondToMatch } from '../../store/actions/matchActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { MainTabParamList, MessagesStackParamList, AppStackParamList } from '../../navigation'; // Assuming MessagesStackParamList for chat

// Types
interface MatchInterest {
  id: string | number;
  name: string;
}

interface OtherUserInMatch {
  id: string | number;
  first_name: string;
  last_name: string;
  avatar?: string;
  interests?: MatchInterest[];
}

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'; // Added cancelled
export type ActiveTabType = 'all' | 'pending' | 'accepted';

export interface Match {
  id: string | number;
  status: MatchStatus;
  is_initiator: boolean;
  last_activity?: string; // ISO date string
  other_user: OtherUserInMatch;
  // Add any other relevant fields from your API response for a match
  created_at: string; // ISO date string
}

// Navigation props
// MatchesScreen is a tab, but can navigate to Chat (assumed to be in a stack part of AppStack or MessagesStack)
type MatchesScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Matches'>,
  StackScreenProps<AppStackParamList> // Or a more specific MessagesStackParamList if Chat is nested there
>;

interface MatchesScreenProps {
  navigation: MatchesScreenNavigationProp['navigation'];
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { matches, loading } = useSelector((state: RootState) => state.matches as { matches: Match[] | null; loading: boolean });

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('all');

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [])
  );

  useEffect(() => {
    filterAndSetMatches();
  }, [matches, searchQuery, activeTab]);

  const loadMatches = async () => {
    try {
      await dispatch(fetchMatches());
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Optionally, show an alert to the user
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleRespondToMatch = async (matchId: string | number, response: 'accept' | 'reject') => {
    try {
      await dispatch(respondToMatch(matchId, response));
      // Matches list will update via Redux state change and useEffect
    } catch (error) {
      console.error(`Error responding to match (${response}):`, error);
      // Optionally, show an alert
    }
  };

  const navigateToChat = (matchId: string | number, otherUser: OtherUserInMatch) => {
    // Navigate to the Chat screen, assuming 'Messages' tab contains a stack navigator
    // And 'Chat' is a screen within that stack.
    // Adjust based on your actual navigation structure.
    navigation.navigate('Messages', { // This navigates to the 'Messages' tab
      screen: 'Chat', // Then to the 'Chat' screen within the MessagesTab's navigator
      params: {
        conversationId: String(matchId), // Or however you identify conversations
        recipientName: `${otherUser.first_name} ${otherUser.last_name}`,
        recipientAvatar: otherUser.avatar,
        recipientId: String(otherUser.id),
      },
    });
  };

  const filterAndSetMatches = () => {
    if (!matches) {
      setFilteredMatches([]);
      return;
    }
    let currentFilteredMatches = [...matches];
    if (activeTab === 'pending') {
      currentFilteredMatches = currentFilteredMatches.filter(match => match.status === 'pending');
    } else if (activeTab === 'accepted') {
      currentFilteredMatches = currentFilteredMatches.filter(match => match.status === 'accepted');
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentFilteredMatches = currentFilteredMatches.filter(match =>
        `${match.other_user.first_name} ${match.other_user.last_name}`.toLowerCase().includes(lowerCaseQuery) ||
        (match.other_user.interests && match.other_user.interests.some(interest =>
          interest.name.toLowerCase().includes(lowerCaseQuery)
        ))
      );
    }
    setFilteredMatches(currentFilteredMatches);
  };

  const renderMatchItem = ({ item }: ListRenderItemInfo<Match>) => {
    const isPendingIncoming = item.status === 'pending' && !item.is_initiator;
    const otherUser = item.other_user;

    return (
      <View style={styles.matchCard}>
        <TouchableOpacity
          style={styles.matchContent}
          onPress={() => item.status === 'accepted' ? navigateToChat(item.id, otherUser) : undefined}
          disabled={item.status !== 'accepted'}
        >
          <Image source={otherUser.avatar ? { uri: otherUser.avatar } : require('../../assets/images/default-avatar.png')} style={styles.avatar} />
          <View style={styles.matchInfo}>
            <View style={styles.matchHeader}>
              <Text style={styles.userName}>{`${otherUser.first_name} ${otherUser.last_name}`}</Text>
              {item.status === 'accepted' && <Badge value="Matched" badgeStyle={styles.badgeAccepted} textStyle={styles.badgeText} />}
              {item.status === 'pending' && <Badge value={item.is_initiator ? "Sent" : "Received"} badgeStyle={styles.badgePending} textStyle={styles.badgeText} />}
              {item.status === 'rejected' && <Badge value="Declined" badgeStyle={styles.badgeRejected} textStyle={styles.badgeText} />}
            </View>
            {otherUser.interests && otherUser.interests.length > 0 && (
              <View style={styles.interestTags}>
                {otherUser.interests.slice(0, 3).map(interest => <View key={interest.id.toString()} style={styles.interestTag}><Text style={styles.interestText}>{interest.name}</Text></View>)}
                {otherUser.interests.length > 3 && <View style={styles.interestTag}><Text style={styles.interestText}>+{otherUser.interests.length - 3} more</Text></View>}
              </View>
            )}
            {item.last_activity && <Text style={styles.lastActivity}>Last active: {new Date(item.last_activity).toLocaleDateString()}</Text>}
          </View>
          {item.status === 'accepted' && <Icon name="chat" type="material" size={24} color={COLORS.primary} containerStyle={styles.actionIcon} />}
        </TouchableOpacity>
        {isPendingIncoming && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleRespondToMatch(item.id, 'reject')}><Icon name="close" type="material" size={24} color={COLORS.error} /></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleRespondToMatch(item.id, 'accept')}><Icon name="check" type="material" size={24} color={COLORS.success} /></TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const EmptyMatchesView: React.FC = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" type="material" size={80} color={COLORS.grey400} />
      <Text style={styles.emptyTitle}>No Matches Yet</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pending' ? "No pending requests." : activeTab === 'accepted' ? "No accepted matches." : "Explore and connect with new buddies!"}
      </Text>
      <Button title="Find Buddies" buttonStyle={styles.emptyButton} titleStyle={TYPOGRAPHY.button} onPress={() => navigation.navigate('Home')} />
    </View>
  );

  const pendingIncomingCount = matches?.filter(match => match.status === 'pending' && !match.is_initiator).length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Your Matches</Text></View>
      <SearchBar
        placeholder="Search by name or interest..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={TYPOGRAPHY.body}
        round
        lightTheme
      />
      <View style={styles.tabs}>
        {(['all', 'pending', 'accepted'] as ActiveTabType[]).map(tabName => (
          <TouchableOpacity key={tabName} style={[styles.tab, activeTab === tabName && styles.activeTab]} onPress={() => setActiveTab(tabName)}>
            <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>{tabName.charAt(0).toUpperCase() + tabName.slice(1)}</Text>
            {tabName === 'pending' && pendingIncomingCount > 0 && <Badge value={pendingIncomingCount} containerStyle={styles.tabBadgeContainer} badgeStyle={styles.tabBadge} />}
          </TouchableOpacity>
        ))}
      </View>
      {(loading && !refreshing && filteredMatches.length === 0) ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading matches...</Text></View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent} // Changed from list to listContent
          ListEmptyComponent={EmptyMatchesView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
        />
      )}
    </SafeAreaView>
  );
};

// Styles (condensed for brevity, assume similar to previous files with COLORS, SPACING, TYPOGRAPHY)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, borderBottomWidth: 1, borderBottomColor: COLORS.grey200 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text },
  searchContainer: { backgroundColor: COLORS.background, borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.small },
  searchInputContainer: { backgroundColor: COLORS.lightGrey, height: 40, borderRadius: 20 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.grey200, marginBottom: SPACING.small },
  tab: { flex: 1, paddingVertical: SPACING.medium, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', position: 'relative' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.button, color: COLORS.grey600, textTransform: 'capitalize' },
  activeTabText: { color: COLORS.primary },
  tabBadgeContainer: { position: 'absolute', top: SPACING.small - 8, right: SPACING.medium - 15 }, // Adjusted for better positioning
  tabBadge: { backgroundColor: COLORS.error },
  listContent: { paddingHorizontal: SPACING.small, paddingBottom: SPACING.large },
  matchCard: { backgroundColor: COLORS.white, borderRadius: 10, marginBottom: SPACING.medium, elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, overflow: 'hidden' },
  matchContent: { flexDirection: 'row', padding: SPACING.medium },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: SPACING.medium },
  matchInfo: { flex: 1 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xsmall },
  userName: { ...TYPOGRAPHY.h3, color: COLORS.text },
  badgeAccepted: { backgroundColor: COLORS.success, borderRadius: 4, paddingHorizontal: SPACING.small },
  badgePending: { backgroundColor: COLORS.warning, borderRadius: 4, paddingHorizontal: SPACING.small },
  badgeRejected: { backgroundColor: COLORS.grey600, borderRadius: 4, paddingHorizontal: SPACING.small },
  badgeText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.white, fontWeight: 'bold' },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xsmall },
  interestTag: { backgroundColor: COLORS.lightPrimary, paddingHorizontal: SPACING.small, paddingVertical: 2, borderRadius: 12, marginRight: SPACING.xsmall, marginBottom: SPACING.xsmall },
  interestText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.primary },
  lastActivity: { ...TYPOGRAPHY.caption, color: COLORS.grey600, fontSize: 10 },
  actionIcon: { justifyContent: 'center', paddingLeft: SPACING.small },
  actionButtons: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.grey200 },
  actionButton: { flex: 1, paddingVertical: SPACING.medium, alignItems: 'center' },
  rejectButton: { borderRightWidth: 1, borderRightColor: COLORS.grey200 },
  acceptButton: { backgroundColor: COLORS.lightSuccess }, // Assuming lightSuccess in COLORS
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.large, paddingTop: SPACING.large, backgroundColor: COLORS.background },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.medium, textAlign: 'center' },
  emptySubtitle: { ...TYPOGRAPHY.body, color: COLORS.grey600, textAlign: 'center', marginTop: SPACING.small, marginBottom: SPACING.large },
  emptyButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.small, paddingHorizontal: SPACING.medium, borderRadius: 25 },
  // emptyButtonText: { ...TYPOGRAPHY.button, color: COLORS.white }, // Defined in TYPOGRAPHY.button
});

// Fallback style definitions have been removed.
// Assuming TYPOGRAPHY, SPACING, COLORS are correctly imported and typed from their source files.

export default MatchesScreen;
