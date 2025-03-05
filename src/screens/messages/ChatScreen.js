// src/screens/messages/ChatScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import * as ImagePicker from 'react-native-image-picker';
import { 
  fetchMessages, 
  sendMessage, 
  markMessageRead 
} from '../../store/actions/messageActions';
import { format } from 'date-fns';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, userName } = route.params;
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useSelector(state => state.auth);
  const { messages, loading } = useSelector(state => state.messages);
  
  const [messageText, setMessageText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Set navigation header title
  useEffect(() => {
    navigation.setOptions({
      title: userName,
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleViewProfile}
        >
          <Icon name="info" type="material" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName]);

  useFocusEffect(
    useCallback(() => {
      // Load messages when screen is focused
      loadMessages();
      
      // Refresh messages every 10 seconds
      const intervalId = setInterval(() => {
        loadMessages(false); // Silent refresh
      }, 10000);
      
      return () => {
        clearInterval(intervalId);
        // Clear typing timeout if it exists
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, [conversationId])
  );

  // Mark messages as read when they appear
  useEffect(() => {
    if (messages && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(message => !message.is_read && message.sender_id !== user.id)
        .map(message => message.id);
      
      if (unreadMessageIds.length > 0) {
        dispatch(markMessageRead(unreadMessageIds));
      }
    }
  }, [messages, user, dispatch]);

  const loadMessages = async (showLoading = true) => {
    try {
      await dispatch(fetchMessages(conversationId, showLoading));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages(false);
    setRefreshing(false);
  };

  const handleSend = async () => {
    if ((!messageText || messageText.trim() === '') && !attachment) {
      return; // Don't send empty messages
    }
    
    try {
      // Clear input and attachment
      const textToSend = messageText;
      const attachmentToSend = attachment;
      
      setMessageText('');
      setAttachment(null);
      
      // Send message to server
      await dispatch(sendMessage(conversationId, textToSend, attachmentToSend));
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
      
      // Scroll to bottom
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleAttachment = () => {
    const options = {
      mediaType: 'mixed',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
    };
    
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', 'Failed to select attachment');
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];
        
        // Check file size (limit to 10MB)
        if (selectedAsset.fileSize > 10 * 1024 * 1024) {
          Alert.alert('File too large', 'Please select a file smaller than 10MB');
          return;
        }
        
        setAttachment({
          uri: selectedAsset.uri,
          type: selectedAsset.type,
          name: selectedAsset.fileName || 'attachment',
          size: selectedAsset.fileSize,
        });
      }
    });
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleViewProfile = () => {
    // Navigate to the other user's profile
    navigation.navigate('BuddyProfile', { 
      userId: messages[0]?.sender_id === user.id ? 
        messages[0]?.recipient_id : messages[0]?.sender_id
    });
  };

  const handleTextChange = (text) => {
    setMessageText(text);
    
    // Handle typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      // Send typing started event to server (could implement with socket)
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        // Send typing stopped event to server
      }
    }, 1500);
  };

  const formatMessageTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && 
                     date.getMonth() === now.getMonth() && 
                     date.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return format(date, 'h:mm a'); // 3:42 PM
      } else {
        return format(date, 'MMM d, h:mm a'); // Jun 12, 3:42 PM
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const shouldShowDate = (message, index) => {
    if (index === messages.length - 1) return true;
    
    const currentDate = new Date(message.created_at).toDateString();
    const nextDate = new Date(messages[index + 1].created_at).toDateString();
    
    return currentDate !== nextDate;
  };

  const renderDateHeader = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return format(date, 'MMMM d, yyyy'); // June 12, 2023
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const renderMessage = ({ item, index }) => {
    const isUserMessage = item.sender_id === user.id;
    const showDateHeader = shouldShowDate(item, index);
    
    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>
              {renderDateHeader(item.created_at)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer
        ]}>
          {!isUserMessage && (
            <Image
              source={item.sender_avatar ? { uri: item.sender_avatar } : require('../../assets/images/default-avatar.png')}
              style={styles.messageAvatar}
            />
          )}
          
          <View style={[
            styles.messageBubble,
            isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble
          ]}>
            {item.attachment && (
              <View style={styles.attachmentContainer}>
                {item.attachment.type.startsWith('image/') ? (
                  <Image
                    source={{ uri: item.attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileAttachment}>
                    <Icon name="insert-drive-file" type="material" size={24} color={colors.grey700} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.attachment.name}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {item.content && item.content.trim() !== '' && (
              <Text style={[
                styles.messageText,
                isUserMessage ? styles.userMessageText : styles.otherMessageText
              ]}>
                {item.content}
              </Text>
            )}
            
            <Text style={[
              styles.messageTime,
              isUserMessage ? styles.userMessageTime : styles.otherMessageTime
            ]}>
              {formatMessageTime(item.created_at)}
              {isUserMessage && item.is_read && (
                <Text style={styles.readReceipt}> ✓✓</Text>
              )}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages?.slice().reverse()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            inverted={true}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}

        {/* Attachment preview */}
        {attachment && (
          <View style={styles.attachmentPreview}>
            {attachment.type?.startsWith('image/') ? (
              <Image
                source={{ uri: attachment.uri }}
                style={styles.attachmentPreviewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.filePreview}>
                <Icon name="insert-drive-file" type="material" size={28} color={colors.grey700} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.removeAttachmentButton}
              onPress={handleRemoveAttachment}
            >
              <Icon name="close" type="material" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachment}
          >
            <Icon name="attach-file" type="material" size={24} color={colors.grey700} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText || messageText.trim() === '') && !attachment
                ? styles.sendButtonDisabled
                : {}
            ]}
            onPress={handleSend}
            disabled={(!messageText || messageText.trim() === '') && !attachment}
          >
            <Icon 
              name="send" 
              type="material" 
              size={24} 
              color={
                (!messageText || messageText.trim() === '') && !attachment
                  ? colors.grey400
                  : colors.primary
              } 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.small,
  },
  messagesList: {
    padding: spacing.small,
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: spacing.small,
  },
  dateHeaderText: {
    ...typography.caption,
    color: colors.grey600,
    backgroundColor: colors.lightGrey,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.xs / 2,
    borderRadius: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: spacing.xs,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: spacing.small,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.lightGrey,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
  },
  userMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: colors.lightGrey,
  },
  otherMessageTime: {
    color: colors.grey600,
  },
  readReceipt: {
    color: colors.lightBlue,
  },
  attachmentContainer: {
    marginBottom: spacing.xs,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.small,
  },
  fileName: {
    ...typography.caption,
    color: colors.grey700,
    marginLeft: spacing.xs,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
    backgroundColor: colors.white,
  },
  attachButton: {
    padding: spacing.small,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    marginHorizontal: spacing.small,
    maxHeight: 100,
    ...typography.body,
  },
  sendButton: {
    padding: spacing.small,
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
  attachmentPreview: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.grey200,
    position: 'relative',
  },
  attachmentPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 8,
    padding: spacing.small,
    flex: 1,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;