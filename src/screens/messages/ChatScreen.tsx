import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, SafeAreaView,
  ListRenderItemInfo, NativeSyntheticEvent, TextInputChangeEventData,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'react-native-image-picker';
import { format } from 'date-fns';

import { fetchMessages, sendMessage, markMessageRead } from '../../store/actions/messageActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { UserProfile as AuthUser } from '../../models/UserProfile'; // User from auth state
import { AppDispatch, RootState } from '../../store';
import { MessagesStackParamList, AppStackParamList } from '../../navigation'; // Assuming these are defined

// Types
interface MessageAttachmentAPI { // Attachment structure from API (in a message)
  url: string;
  type: string; // e.g., 'image/jpeg', 'application/pdf'
  name: string;
  size?: number;
}

export interface MessageType {
  id: string | number;
  conversation_id: string | number;
  sender_id: string | number;
  sender_avatar?: string;
  content?: string;
  attachment?: MessageAttachmentAPI;
  created_at: string; // ISO date string
  is_read?: boolean;
  recipient_id?: string | number; // If available from backend
}

interface AttachmentFile { // For local attachment state before upload
  uri: string;
  type: string; // MIME type
  name: string;
  size?: number;
}

// Navigation props
type ChatScreenRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackScreenProps<MessagesStackParamList, 'Chat'>['navigation']; // Or AppStackParamList if navigating outside MessagesStack

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { conversationId, userName, recipientId, recipientAvatar } = route.params; // recipientId & avatar for profile navigation
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList<MessageType>>(null);
  const inputRef = useRef<TextInput>(null);

  const user = useSelector((state: RootState) => state.auth.user as AuthUser | null); // AuthUser or null
  const { messages: storeMessages, loading } = useSelector((state: RootState) => state.messages as { messages: MessageType[] | null; loading: boolean });
  
  const [messageText, setMessageText] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  
  // Typing indicator state, not fully implemented with backend
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: userName,
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleViewProfile}>
          <Icon name="person-circle-outline" type="ionicon" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName, recipientId, recipientAvatar]);

  useFocusEffect(
    useCallback(() => {
      if (conversationId) loadMessages(true);
      // const intervalId = setInterval(() => { if(conversationId) loadMessages(false); }, 10000); // Consider WebSocket instead of polling
      return () => { 
        // clearInterval(intervalId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [conversationId])
  );

  useEffect(() => {
    if (storeMessages && storeMessages.length > 0 && user) {
      const unreadMessageIds = storeMessages
        .filter(msg => !msg.is_read && msg.sender_id !== user.id)
        .map(msg => msg.id);
      if (unreadMessageIds.length > 0) {
        dispatch(markMessageRead(conversationId, unreadMessageIds));
      }
    }
  }, [storeMessages, user, dispatch, conversationId]);

  const loadMessages = async (showLoadingIndicator = true) => {
    try {
      await dispatch(fetchMessages(conversationId, showLoadingIndicator));
    } catch (error) { console.error('Error fetching messages:', error); }
  };

  const handleRefresh = async () => {
    setRefreshing(true); await loadMessages(false); setRefreshing(false);
  };

  const handleSend = async () => {
    if ((!messageText || messageText.trim() === '') && !attachment) return;
    if (!user) { Alert.alert("Error", "User not authenticated."); return; }

    const textToSend = messageText.trim();
    const attachmentToSend = attachment;
    setMessageText(''); setAttachment(null);

    try {
      await dispatch(sendMessage(conversationId, textToSend, attachmentToSend)); // Ensure sendMessage handles FormData if attachment is file
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      // flatListRef.current?.scrollToOffset({ animated: true, offset: 0 }); // Inverted list scrolls to end automatically on new data
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
      setMessageText(textToSend); setAttachment(attachmentToSend); // Restore on error
    }
  };

  const handleAttachmentSelection = () => {
    const options: ImagePicker.ImageLibraryOptions = { mediaType: 'mixed', quality: 0.7 };
    ImagePicker.launchImageLibrary(options, (response: ImagePicker.ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorCode) { Alert.alert('Error', response.errorMessage || 'Failed to select attachment'); return; }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.uri && asset.type && asset.fileName) {
          if ((asset.fileSize || 0) > 10 * 1024 * 1024) { Alert.alert('File too large', 'Max 10MB.'); return; }
          setAttachment({ uri: asset.uri, type: asset.type, name: asset.fileName, size: asset.fileSize });
        }
      }
    });
  };
  
  const handleRemoveAttachment = () => setAttachment(null);

  const handleViewProfile = () => {
    if (recipientId) {
      // Assuming 'BuddyProfile' is a screen in AppStackParamList or a shared stack
      // This part is tricky because ChatScreen is likely in MessagesStack.
      // We might need to navigate to a different stack.
      // (navigation as any).navigate('AppStack', { screen: 'BuddyProfile', params: { userId: recipientId } });
       Alert.alert("Profile", `Viewing profile of user ID: ${recipientId}`); // Placeholder
    } else {
      Alert.alert("Error", "User profile information is unavailable.");
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    // Basic typing indicator logic (client-side only for now)
    if (!isTyping && text.length > 0) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { if (isTyping) setIsTyping(false); }, 1500);
  };

  const formatMessageTime = (timestamp: string): string => {
    try { return format(new Date(timestamp), new Date(timestamp).toDateString() === new Date().toDateString() ? 'p' : 'MMM d, p'); }
    catch { return ''; }
  };

  const shouldShowDateHeader = (message: MessageType, index: number, allMessages: MessageType[]): boolean => {
    if (index === allMessages.length - 1) return true;
    return new Date(message.created_at).toDateString() !== new Date(allMessages[index + 1].created_at).toDateString();
  };

  const renderDateHeader = (timestamp: string): string => {
    const date = new Date(timestamp); const today = new Date(); const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const renderMessageItem = ({ item, index }: ListRenderItemInfo<MessageType>) => {
    if (!user) return null;
    const isUserMessage = item.sender_id === user.id;
    const showHeader = shouldShowDateHeader(item, index, storeMessages || []);

    return (
      <>
        {showHeader && <View style={styles.dateHeaderContainer}><Text style={styles.dateHeaderText}>{renderDateHeader(item.created_at)}</Text></View>}
        <View style={[styles.messageContainer, isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer]}>
          {!isUserMessage && <Image source={item.sender_avatar ? { uri: item.sender_avatar } : require('../../assets/images/default-avatar.png')} style={styles.messageAvatar} />}
          <View style={[styles.messageBubble, isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble]}>
            {item.attachment && (
              <View style={styles.attachmentContainer}>
                {item.attachment.type.startsWith('image/') ? <Image source={{ uri: item.attachment.url }} style={styles.attachmentImage} resizeMode="cover" />
                  : <View style={styles.fileAttachment}><Icon name="insert-drive-file" type="material" size={24} color={COLORS.grey700} /><Text style={styles.fileName} numberOfLines={1}>{item.attachment.name}</Text></View>}
              </View>
            )}
            {item.content && item.content.trim() !== '' && <Text style={[styles.messageText, isUserMessage ? styles.userMessageText : styles.otherMessageText]}>{item.content}</Text>}
            <Text style={[styles.messageTime, isUserMessage ? styles.userMessageTime : styles.otherMessageTime]}>
              {formatMessageTime(item.created_at)}
              {isUserMessage && item.is_read && <Text style={styles.readReceipt}> ✓✓</Text>}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} style={styles.container}>
        {(loading && !refreshing && (!storeMessages || storeMessages.length === 0)) ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading messages...</Text></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={storeMessages ? [...storeMessages].reverse() : []} // Reverse for inverted display
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            inverted // Displays messages from bottom
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={<View style={styles.emptyChatContainer}><Text style={styles.emptyChatText}>No messages yet. Start the conversation!</Text></View>}
          />
        )}
        {attachment && (
          <View style={styles.attachmentPreview}>
            {attachment.type?.startsWith('image/') ? <Image source={{ uri: attachment.uri }} style={styles.attachmentPreviewImage} resizeMode="contain" />
              : <View style={styles.filePreview}><Icon name="insert-drive-file" type="material" size={28} color={COLORS.grey700} /><Text style={styles.fileName} numberOfLines={1}>{attachment.name}</Text></View>}
            <TouchableOpacity style={styles.removeAttachmentButton} onPress={handleRemoveAttachment}><Icon name="close" type="material" size={20} color={COLORS.white} /></TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachmentSelection}><Icon name="attach-file" type="material" size={24} color={COLORS.grey700} /></TouchableOpacity>
          <TextInput ref={inputRef} style={styles.input} placeholder="Type a message..." value={messageText} onChangeText={handleTextChange} multiline maxLength={1000} />
          <TouchableOpacity style={[styles.sendButton, (!messageText.trim() && !attachment) && styles.sendButtonDisabled]} onPress={handleSend} disabled={!messageText.trim() && !attachment}>
            <Icon name="send" type="material" size={24} color={(!messageText.trim() && !attachment) ? COLORS.grey400 : COLORS.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles (condensed for brevity, assume similar to previous with fallbacks for COLORS, SPACING, TYPOGRAPHY)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.chatBackground || COLORS.background },
  headerButton: { paddingHorizontal: SPACING.medium },
  messagesList: { paddingVertical: SPACING.small, paddingHorizontal: SPACING.small },
  dateHeaderContainer: { alignItems: 'center', marginVertical: SPACING.medium },
  dateHeaderText: { ...TYPOGRAPHY.caption, color: COLORS.grey600, backgroundColor: COLORS.lightGrey, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall, borderRadius: 10 },
  messageContainer: { flexDirection: 'row', marginBottom: SPACING.medium, alignItems: 'flex-end'},
  userMessageContainer: { justifyContent: 'flex-end' },
  otherMessageContainer: { justifyContent: 'flex-start' },
  messageAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: SPACING.xsmall, marginBottom: SPACING.xsmall/2 },
  messageBubble: { maxWidth: '75%', borderRadius: 16, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small },
  userMessageBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4, marginLeft: 'auto' },
  otherMessageBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4, elevation: 1, shadowColor: COLORS.black, shadowOpacity: 0.1, shadowOffset: {width:0, height:1}, shadowRadius:1 },
  messageText: { ...TYPOGRAPHY.body },
  userMessageText: { color: COLORS.white },
  otherMessageText: { color: COLORS.text },
  messageTime: { ...TYPOGRAPHY.caption, fontSize: 10, marginTop: SPACING.xsmall, alignSelf: 'flex-end' },
  userMessageTime: { color: COLORS.lightPrimary }, // Lighter color for user's time
  otherMessageTime: { color: COLORS.grey600 },
  readReceipt: { color: COLORS.blue500 || '#2196F3', marginLeft: SPACING.xsmall }, // Assuming blue500 for read receipt
  attachmentContainer: { marginBottom: SPACING.xsmall, borderRadius: 8, overflow: 'hidden' },
  attachmentImage: { width: 200, height: 150, borderRadius: 8 },
  fileAttachment: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.grey100 || '#f0f0f0', borderRadius: 8, padding: SPACING.small },
  fileName: { ...TYPOGRAPHY.caption, color: COLORS.text, marginLeft: SPACING.xsmall, flexShrink: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.small, paddingVertical: SPACING.small, borderTopWidth: 1, borderTopColor: COLORS.grey200, backgroundColor: COLORS.white },
  attachButton: { padding: SPACING.small },
  input: { flex: 1, backgroundColor: COLORS.lightGrey, borderRadius: 20, paddingHorizontal: SPACING.medium, paddingVertical: Platform.OS === 'ios' ? SPACING.small : SPACING.xsmall, marginHorizontal: SPACING.xsmall, maxHeight: 100, ...TYPOGRAPHY.body },
  sendButton: { padding: SPACING.small },
  sendButtonDisabled: { opacity: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
  attachmentPreview: { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', padding: SPACING.small, borderTopWidth: 1, borderTopColor: COLORS.grey200, position: 'relative' },
  attachmentPreviewImage: { width: 60, height: 60, borderRadius: 8 },
  filePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lightGrey, borderRadius: 8, padding: SPACING.small, flex: 1 },
  removeAttachmentButton: { position: 'absolute', top: SPACING.xsmall, right: SPACING.xsmall, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  emptyChatContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.large },
  emptyChatText: { ...TYPOGRAPHY.body, color: COLORS.grey600 },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', background: '#F4F6F8', white: '#FFFFFF', black: '#000000',
  text: '#333333', grey100: '#f0f0f0', grey200: '#E5E7EB', grey400: '#9CA3AF',
  grey600: '#4B5563', grey700: '#374151', lightGrey: '#F3F4F6',
  lightPrimary: '#E0E7FF', blue500: '#2196F3', chatBackground: '#ECE5DD',
  ...COLORS,
};

export default ChatScreen;
