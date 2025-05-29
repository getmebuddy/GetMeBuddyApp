import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  RefreshControl, ActivityIndicator, SafeAreaView, ListRenderItemInfo,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { SearchBar, Icon, Badge } from 'react-native-elements';
import { formatDistanceToNowStrict } from 'date-fns'; // Using strict for cleaner output

import { fetchConversations } from '../../store/actions/messageActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { MainTabParamList, MessagesStackParamList } from '../../navigation'; // Assuming these are defined

// Types
interface OtherUserInConversation {
  id: string | number;
  first_name: string;
  last_name: string;
  avatar?: string;
  online?: boolean;
}

interface LastMessageInConversation {
  content?: string;
  created_at: string; // ISO date string
  sender_id?: string | number; // To know if it's "You: ..."
}

export interface ConversationSummary {
  id: string | number;
  other_user: OtherUserInConversation;
  last_message?: LastMessageInConversation;
  unread_count: number;
  // Add any other relevant fields from your API response
}

// Navigation props
// MessagesScreen is a tab, but navigates to Chat (assumed to be in MessagesStack)
type MessagesScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Messages'>,
  StackScreenProps<MessagesStackParamList, 'ConversationList'> // Assuming this screen itself is 'ConversationList' in a MessagesStack
  // Or just StackScreenProps<MessagesStackParamList> if navigating to Chat from a screen not in MessagesStack itself
>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp['navigation'];
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loading } = useSelector((state: RootState) => state.messages as { conversations: ConversationSummary[] | null; loading: boolean });
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredConversations, setFilteredConversations] = useState<ConversationSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadConversations(true);
      // const intervalId = setInterval(() => loadConversations(false), 30000); // Consider WebSocket
      // return () => clearInterval(intervalId);
    }, [])
  );

  useEffect(() => {
    filterAndSetConversations();
  }, [conversations, searchQuery]);

  const loadConversations = async (showLoadingIndicator = true) => {
    try { await dispatch(fetchConversations(showLoadingIndicator)); }
    catch (error) { console.error('Error fetching conversations:', error); }
  };

  const handleRefresh = async () => {
    setRefreshing(true); await loadConversations(false); setRefreshing(false);
  };

  const navigateToChat = (conversation: ConversationSummary) => {
    navigation.navigate('Chat', { // Navigates to Chat screen within MessagesStack
      conversationId: String(conversation.id),
      userName: `${conversation.other_user.first_name} ${conversation.other_user.last_name}`,
      recipientId: String(conversation.other_user.id),
      recipientAvatar: conversation.other_user.avatar,
    });
  };

  const filterAndSetConversations = () => {
    if (!conversations) { setFilteredConversations([]); return; }
    let currentFiltered = [...conversations];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter(conv =>
        `${conv.other_user.first_name} ${conv.other_user.last_name}`.toLowerCase().includes(lowerQuery) ||
        (conv.last_message?.content && conv.last_message.content.toLowerCase().includes(lowerQuery))
      );
    }
    // Sort by last message date, most recent first
    currentFiltered.sort((a, b) => {
        const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return dateB - dateA;
    });
    setFilteredConversations(currentFiltered);
  };

  const renderTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return '';
    try { return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true }); }
    catch { return ''; }
  };

  const renderConversationItem = ({ item }: ListRenderItemInfo<ConversationSummary>) => {
    const otherUser = item.other_user;
    const hasUnread = item.unread_count > 0;
    const lastMessagePrefix = item.last_message?.sender_id === currentUserId ? "You: " : "";

    return (
      <TouchableOpacity style={[styles.conversationItem, hasUnread && styles.unreadConversation]} onPress={() => navigateToChat(item)}>
        <View style={styles.avatarContainer}>
          <Image source={otherUser.avatar ? { uri: otherUser.avatar } : require('../../assets/images/default-avatar.png')} style={styles.avatar} />
          {otherUser.online && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]}>{`${otherUser.first_name} ${otherUser.last_name}`}</Text>
            <Text style={styles.timeAgo}>{renderTimeAgo(item.last_message?.created_at)}</Text>
          </View>
          <View style={styles.messagePreviewContainer}>
            <Text style={[styles.messagePreview, hasUnread && styles.unreadText]} numberOfLines={1} ellipsizeMode="tail">
              {lastMessagePrefix}{item.last_message?.content || "No messages yet"}
            </Text>
            {hasUnread && <Badge value={item.unread_count} badgeStyle={styles.unreadBadge} textStyle={styles.unreadBadgeText} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyConversationsView: React.FC = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-bubble-outline" type="material" size={80} color={COLORS.grey400} />
      <Text style={styles.emptyTitle}>No Conversations</Text>
      <Text style={styles.emptySubtitle}>Start a new chat by matching with buddies!</Text>
      <Button title="Find Matches" buttonStyle={styles.emptyButton} titleStyle={TYPOGRAPHY.button} onPress={() => navigation.navigate('Matches')} />
    </View>
  );

  const totalUnread = conversations?.reduce((total, conv) => total + conv.unread_count, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {totalUnread > 0 && <Badge value={totalUnread} containerStyle={styles.headerBadgeContainer} badgeStyle={styles.headerBadge} textStyle={styles.headerBadgeText}/>}
      </View>
      <SearchBar
        placeholder="Search conversations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={TYPOGRAPHY.body}
        round
        lightTheme
      />
      {(loading && !refreshing && filteredConversations.length === 0) ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading conversations...</Text></View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyConversationsView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
        />
      )}
    </SafeAreaView>
  );
};

// Styles (condensed, assume similar to previous files)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, borderBottomWidth: 1, borderBottomColor: COLORS.grey200 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text },
  headerBadgeContainer: { marginLeft: SPACING.small },
  headerBadge: { backgroundColor: COLORS.primary }, // Changed from error to primary for consistency
  headerBadgeText: { color: COLORS.white },
  searchContainer: { backgroundColor: COLORS.background, borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: SPACING.small },
  searchInputContainer: { backgroundColor: COLORS.lightGrey, height: 40, borderRadius: 20 },
  listContent: { paddingHorizontal: SPACING.small, paddingBottom: SPACING.large },
  conversationItem: { flexDirection: 'row', padding: SPACING.medium, backgroundColor: COLORS.white, borderRadius: 10, marginBottom: SPACING.small, elevation: 1, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1 },
  unreadConversation: { backgroundColor: COLORS.lightPrimary },
  avatarContainer: { position: 'relative', marginRight: SPACING.medium },
  avatar: { width: 50, height: 50, borderRadius: 25 }, // Slightly smaller avatar
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success, borderWidth: 2, borderColor: COLORS.white },
  conversationContent: { flex: 1, justifyContent: 'center' },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xsmall },
  userName: { ...TYPOGRAPHY.h3, color: COLORS.text },
  unreadText: { fontWeight: 'bold', color: COLORS.textEmphasis || COLORS.black },
  timeAgo: { ...TYPOGRAPHY.caption, color: COLORS.grey600, fontSize: 10 },
  messagePreviewContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messagePreview: { ...TYPOGRAPHY.body, color: COLORS.grey700, flexShrink: 1 }, // Allow text to shrink
  unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: SPACING.xsmall, marginLeft:SPACING.small },
  unreadBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: 'bold', fontSize: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.large, paddingTop: SPACING.large, backgroundColor: COLORS.background },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.medium, textAlign: 'center' },
  emptySubtitle: { ...TYPOGRAPHY.body, color: COLORS.grey600, textAlign: 'center', marginTop: SPACING.small, marginBottom: SPACING.large },
  emptyButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.small, paddingHorizontal: SPACING.medium, borderRadius: 25 },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' }, h3: { fontSize: 16, fontWeight: '600'},
  body: { fontSize: 14 }, caption: { fontSize: 12 }, button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', background: '#F4F6F8', white: '#FFFFFF', black: '#000000', text: '#333333',
  textEmphasis: '#111111', grey200: '#E5E7EB', grey400: '#9CA3AF', grey600: '#4B5563', grey700: '#374151',
  lightGrey: '#F3F4F6', lightPrimary: '#E0E7FF', error: '#D32F2F', success: '#28a745',
  ...COLORS,
};

export default MessagesScreen;
