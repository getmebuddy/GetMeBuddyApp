// src/screens/messages/MessagesScreen.js
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
import { fetchConversations } from '../../store/actions/messageActions';
import { formatDistanceToNow } from 'date-fns';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const MessagesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { conversations, loading } = useSelector(state => state.messages);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      
      // Set up refresh interval (every 30 seconds)
      const intervalId = setInterval(() => {
        loadConversations(false); // Silent refresh (no loading indicator)
      }, 30000);
      
      return () => {
        // Clean up interval when screen loses focus
        clearInterval(intervalId);
      };
    }, [])
  );

  useEffect(() => {
    // Filter conversations when search query changes
    filterConversations();
  }, [conversations, searchQuery]);

  const loadConversations = async (showLoading = true) => {
    try {
      await dispatch(fetchConversations(showLoading));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations(false);
    setRefreshing(false);
  };

  const navigateToChat = (conversationId, userName) => {
    navigation.navigate('Chat', { conversationId, userName });
  };

  // Filter conversations based on search query
  const filterConversations = () => {
    if (!conversations) return;
    
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = conversations.filter(conversation => 
        conversation.other_user.first_name.toLowerCase().includes(lowerCaseQuery) ||
        conversation.other_user.last_name.toLowerCase().includes(lowerCaseQuery) ||
        (conversation.last_message && 
         conversation.last_message.content.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  };

  const renderTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const renderConversationItem = ({ item }) => {
    const otherUser = item.other_user;
    const hasUnread = item.unread_count > 0;
    
    return (
      <TouchableOpacity 
        style={[styles.conversationItem, hasUnread && styles.unreadConversation]}
        onPress={() => navigateToChat(
          item.id, 
          `${otherUser.first_name} ${otherUser.last_name}`
        )}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={otherUser.avatar ? { uri: otherUser.avatar } : require('../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          {otherUser.online && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[
              styles.userName,
              hasUnread && styles.unreadText
            ]}>
              {`${otherUser.first_name} ${otherUser.last_name}`}
            </Text>
            <Text style={styles.timeAgo}>
              {renderTimeAgo(item.last_message?.created_at)}
            </Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            <Text 
              style={[
                styles.messagePreview,
                hasUnread && styles.unreadText
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.last_message?.content || "No messages yet"}
            </Text>
            
            {hasUnread && (
              <Badge
                value={item.unread_count}
                badgeStyle={styles.unreadBadge}
                textStyle={styles.unreadBadgeText}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyConversationsView = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="chat-bubble-outline"
        type="material"
        size={80}
        color={colors.grey400}
      />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Get matched with buddies to start chatting!
      </Text>
      
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Matches')}
      >
        <Text style={styles.emptyButtonText}>View Matches</Text>
      </TouchableOpacity>
    </View>
  );

  // Count total unread messages
  const totalUnread = conversations?.reduce(
    (total, conv) => total + conv.unread_count, 
    0
  ) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {totalUnread > 0 && (
          <Badge
            value={totalUnread}
            containerStyle={styles.headerBadgeContainer}
            badgeStyle={styles.headerBadge}
          />
        )}
      </View>
      
      <SearchBar
        placeholder="Search messages..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        round
        lightTheme
      />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={EmptyConversationsView}
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
    alignItems: 'center',
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  headerBadgeContainer: {
    marginLeft: spacing.small,
  },
  headerBadge: {
    backgroundColor: colors.error,
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
  list: {
    padding: spacing.small,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: spacing.standard,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: spacing.small,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  unreadConversation: {
    backgroundColor: colors.lightPrimary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.standard,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  unreadText: {
    fontWeight: 'bold',
    color: colors.grey900,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.grey600,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    ...typography.body,
    color: colors.grey700,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginLeft: spacing.small,
  },
  unreadBadgeText: {
    ...typography.caption,
    color: colors.white,
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

export default MessagesScreen;