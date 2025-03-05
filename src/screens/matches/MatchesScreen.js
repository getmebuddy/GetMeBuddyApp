// src/screens/matches/MatchesScreen.js
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
import { SearchBar, Icon, Badge } from 'react-native-elements';
import { fetchMatches, respondToMatch } from '../../store/actions/matchActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const MatchesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector(state => state.matches);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadMatches();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    // Filter matches when search query or active tab changes
    filterMatches();
  }, [matches, searchQuery, activeTab]);

  const loadMatches = async () => {
    try {
      await dispatch(fetchMatches());
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleAccept = async (matchId) => {
    try {
      await dispatch(respondToMatch(matchId, 'accept'));
      // No need to reload matches as redux state will update
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleReject = async (matchId) => {
    try {
      await dispatch(respondToMatch(matchId, 'reject'));
      // No need to reload matches as redux state will update
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const navigateToChat = (matchId, userId, userName) => {
    navigation.navigate('Messages', {
      screen: 'Chat',
      params: { matchId, userId, userName }
    });
  };

  // Filter matches based on search query and active tab
  const filterMatches = () => {
    if (!matches) return;
    
    let filtered = [...matches];
    
    // Apply tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(match => match.status === 'pending');
    } else if (activeTab === 'accepted') {
      filtered = filtered.filter(match => match.status === 'accepted');
    }
    
    // Apply search filter if query exists
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(match => 
        match.other_user.first_name.toLowerCase().includes(lowerCaseQuery) ||
        match.other_user.last_name.toLowerCase().includes(lowerCaseQuery) ||
        match.other_user.interests.some(interest => 
          interest.name.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
    
    setFilteredMatches(filtered);
  };

  const renderMatchItem = ({ item }) => {
    const isPending = item.status === 'pending';
    const isOutgoing = item.is_initiator;
    const otherUser = item.other_user;
    
    return (
      <View style={styles.matchCard}>
        <TouchableOpacity 
          style={styles.matchContent}
          onPress={() => {
            if (item.status === 'accepted') {
              navigateToChat(item.id, otherUser.id, `${otherUser.first_name} ${otherUser.last_name}`);
            }
          }}
          disabled={item.status !== 'accepted'}
        >
          <Image
            source={otherUser.avatar ? { uri: otherUser.avatar } : require('../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          
          <View style={styles.matchInfo}>
            <View style={styles.matchHeader}>
              <Text style={styles.userName}>{`${otherUser.first_name} ${otherUser.last_name}`}</Text>
              
              {item.status === 'accepted' && (
                <Badge
                  value="Matched"
                  badgeStyle={styles.badgeAccepted}
                  textStyle={styles.badgeText}
                />
              )}
              
              {item.status === 'pending' && (
                <Badge
                  value={isOutgoing ? "Sent" : "Received"}
                  badgeStyle={styles.badgePending}
                  textStyle={styles.badgeText}
                />
              )}
              
              {item.status === 'rejected' && (
                <Badge
                  value="Declined"
                  badgeStyle={styles.badgeRejected}
                  textStyle={styles.badgeText}
                />
              )}
            </View>
            
            <View style={styles.interestTags}>
              {otherUser.interests && otherUser.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest.name}</Text>
                </View>
              ))}
              
              {otherUser.interests && otherUser.interests.length > 3 && (
                <View style={styles.interestTag}>
                  <Text style={styles.interestText}>+{otherUser.interests.length - 3} more</Text>
                </View>
              )}
            </View>
            
            {item.last_activity && (
              <Text style={styles.lastActivity}>
                Last active: {new Date(item.last_activity).toLocaleDateString()}
              </Text>
            )}
          </View>
          
          {item.status === 'accepted' && (
            <Icon
              name="chat"
              type="material"
              size={24}
              color={colors.primary}
              containerStyle={styles.actionIcon}
            />
          )}
        </TouchableOpacity>
        
        {isPending && !isOutgoing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item.id)}
            >
              <Icon name="close" type="material" size={24} color={colors.error} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(item.id)}
            >
              <Icon name="check" type="material" size={24} color={colors.success} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const EmptyMatchesView = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="people-outline"
        type="material"
        size={80}
        color={colors.grey400}
      />
      <Text style={styles.emptyTitle}>No matches found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pending' 
          ? "You don't have any pending match requests" 
          : activeTab === 'accepted'
            ? "You haven't connected with any buddies yet"
            : "Start browsing to find your perfect activity buddies!"}
      </Text>
      
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>Find Buddies</Text>
      </TouchableOpacity>
    </View>
  );

  // Count pending matches for badges
  const pendingCount = matches?.filter(match => match.status === 'pending' && !match.is_initiator).length || 0;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
      </View>
      
      <SearchBar
        placeholder="Search matches..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        round
        lightTheme
      />
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
          {pendingCount > 0 && (
            <Badge
              value={pendingCount}
              containerStyle={styles.tabBadgeContainer}
              badgeStyle={styles.tabBadge}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]} 
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Matched
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your matches...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id.toString()}
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
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.small,
    marginBottom: spacing.xs,
  },
  searchInputContainer: {
    backgroundColor: colors.lightGrey,
    height: 40,
  },
  searchInput: {
    ...typography.body,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
    marginBottom: spacing.small,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.small,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.grey600,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabBadgeContainer: {
    position: 'absolute',
    top: -8,
    right: 20,
  },
  tabBadge: {
    backgroundColor: colors.error,
  },
  list: {
    padding: spacing.small,
  },
  matchCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: spacing.standard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  matchContent: {
    flexDirection: 'row',
    padding: spacing.standard,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.small,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.h3,
  },
  badgeAccepted: {
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: spacing.small,
  },
  badgePending: {
    backgroundColor: colors.warning,
    borderRadius: 4,
    paddingHorizontal: spacing.small,
  },
  badgeRejected: {
    backgroundColor: colors.grey600,
    borderRadius: 4,
    paddingHorizontal: spacing.small,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.white,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  interestTag: {
    backgroundColor: colors.lightPrimary,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  interestText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
  },
  lastActivity: {
    ...typography.caption,
    color: colors.grey600,
  },
  actionIcon: {
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.small,
    alignItems: 'center',
  },
  rejectButton: {
    borderRightWidth: 1,
    borderRightColor: colors.grey200,
  },
  acceptButton: {
    backgroundColor: colors.lightSuccess,
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
    marginBottom: spacing.large,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.large,
    borderRadius: 25,
  },
  emptyButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default MatchesScreen;