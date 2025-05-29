import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { reportUser, blockUser, shareLocation } from '../../store/actions/safetyActions'; // Assuming actions are typed
import { COLORS } from '../../styles/colors'; // Assuming COLORS are typed
import { AppDispatch } from '../../store'; // Assuming AppDispatch is defined for typed dispatch

export type ReportReason = 'inappropriate_behavior' | 'safety_concerns' | 'misrepresentation' | 'spam' | 'other';

// Props for SafetyToolsModal
export interface SafetyToolsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | number; // User ID of the person who might be reported/blocked
  meetingId?: string | number; // Optional: ID of the meeting for location sharing context
}

const SafetyToolsModal: React.FC<SafetyToolsModalProps> = ({
  visible,
  onClose,
  userId,
  meetingId,
}) => {
  const dispatch = useDispatch<AppDispatch>(); // Use typed dispatch if AppDispatch is available
  const [locationShared, setLocationShared] = useState<boolean>(false);

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Select a reason for reporting this user:',
      [
        { text: 'Inappropriate Behavior', onPress: () => dispatch(reportUser(userId, 'inappropriate_behavior')) },
        { text: 'Safety Concerns', onPress: () => dispatch(reportUser(userId, 'safety_concerns')) },
        { text: 'Misrepresentation', onPress: () => dispatch(reportUser(userId, 'misrepresentation')) },
        { text: 'Spam Account', onPress: () => dispatch(reportUser(userId, 'spam')) },
        { text: 'Other', onPress: () => dispatch(reportUser(userId, 'other')) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user? This action cannot be undone easily and you will no longer see their profile or receive messages from them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block User',
          onPress: () => {
            dispatch(blockUser(userId));
            Alert.alert('User Blocked', 'This user has been blocked.');
            onClose(); // Close modal after blocking
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareLocation = () => {
    if (!meetingId) {
      Alert.alert('Error', 'Meeting ID is not available to share location.');
      return;
    }
    // Assuming shareLocation is a thunk or action that handles the logic
    dispatch(shareLocation(meetingId, true)); // true to start sharing
    setLocationShared(true);
    Alert.alert('Location Shared', 'Your location is now being shared for this meeting.');
    // Consider providing a way to stop sharing location, e.g., setLocationShared(false)
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Help',
      'This will immediately alert GetMeBuddy emergency support and share your current location. Use only in genuine emergencies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Emergency',
          onPress: () => {
            // dispatch(triggerEmergencyAlert(userId, meetingId)); // Example emergency action
            Alert.alert('Emergency Alert Sent', 'Support has been notified and will be in touch shortly.');
            onClose(); // Close modal after triggering emergency
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const safetyOptions = [
    {
      title: locationShared ? 'Location Sharing Active' : 'Share My Location',
      description: 'Share your real-time location with emergency contacts during this meeting.',
      icon: 'location-on',
      iconColor: locationShared ? COLORS.success : COLORS.primary, // Assuming COLORS.success
      onPress: handleShareLocation,
      disabled: !meetingId, // Disable if no meetingId
    },
    {
      title: 'Emergency Help',
      description: 'Alert GetMeBuddy support in case of an emergency.',
      icon: 'warning',
      iconColor: COLORS.danger,
      onPress: handleEmergency,
    },
    {
      title: 'Report User',
      description: 'Report inappropriate behavior or safety concerns about this user.',
      icon: 'flag',
      iconColor: COLORS.warning,
      onPress: handleReport,
    },
    {
      title: 'Block User',
      description: 'Prevent this user from seeing your profile or contacting you.',
      icon: 'block',
      iconColor: COLORS.danger,
      onPress: handleBlock,
    },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>Safety Tools</Text>
          {safetyOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionRow, option.disabled && styles.optionDisabled]}
              onPress={option.onPress}
              disabled={option.disabled}
              accessibilityRole="button"
              accessibilityLabel={option.title}
            >
              <Icon name={option.icon} type="material" size={24} color={option.disabled ? COLORS.grey3 : option.iconColor} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionText, option.disabled && styles.optionTextDisabled]}>{option.title}</Text>
                <Text style={[styles.optionDescription, option.disabled && styles.optionTextDisabled]}>{option.description}</Text>
              </View>
              <Icon name="chevron-right" type="material" size={24} color={option.disabled ? COLORS.grey3 : COLORS.grey4} />
            </TouchableOpacity>
          ))}
          <Button
            title="Close"
            onPress={onClose}
            buttonStyle={styles.closeButton}
            titleStyle={styles.closeButtonTitle}
            containerStyle={styles.closeButtonContainer}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.background || '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10, // Adjusted padding
    paddingTop: 20,
    paddingBottom: 30, // For safe area on iOS
  },
  modalTitle: {
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    marginBottom: 25, // Increased margin
    textAlign: 'center',
    color: COLORS.text || '#333',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10, // Added horizontal padding to row items
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#eee',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  optionText: {
    fontSize: 17, // Slightly larger option text
    fontWeight: '600', // Semibold
    color: COLORS.text || '#333',
    marginBottom: 3,
  },
  optionTextDisabled: {
    color: COLORS.grey3, // Assuming COLORS.grey3 for disabled text
  },
  optionDescription: {
    fontSize: 13, // Smaller description
    color: COLORS.textSecondary || '#777',
  },
  closeButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 10, // Align with modal content padding
  },
  closeButton: {
    backgroundColor: COLORS.grey1, // A less prominent close button
    borderRadius: 10,
    paddingVertical: 12,
  },
  closeButtonTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  // Assuming some grey colors are defined in COLORS
  // Fallbacks for missing COLORS properties
  grey1: COLORS.grey1 || '#e9ecef',
  grey3: COLORS.grey3 || '#adb5bd',
  grey4: COLORS.grey4 || '#ced4da',
  success: COLORS.success || '#28a745',
});

export default SafetyToolsModal;
