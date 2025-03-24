// src/components/safety/SafetyToolsModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { reportUser, blockUser, shareLocation } from '../../store/actions/safetyActions';
import { COLORS } from '../../styles/colors';

const SafetyToolsModal = ({ visible, onClose, userId, meetingId }) => {
  const dispatch = useDispatch();
  const [locationShared, setLocationShared] = useState(false);
  
  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        {
          text: 'Inappropriate behavior',
          onPress: () => dispatch(reportUser(userId, 'inappropriate_behavior'))
        },
        {
          text: 'Safety concerns',
          onPress: () => dispatch(reportUser(userId, 'safety_concerns'))
        },
        {
          text: 'Misrepresentation',
          onPress: () => dispatch(reportUser(userId, 'misrepresentation'))
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const handleBlock = () => {
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user? You will no longer see their profile or receive messages from them.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Block',
          onPress: () => {
            dispatch(blockUser(userId));
            onClose();
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleShareLocation = () => {
    dispatch(shareLocation(meetingId));
    setLocationShared(true);
  };
  
  const handleEmergency = () => {
    Alert.alert(
      'Emergency Help',
      'This will alert GetMeBuddy support and share your last known location. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Get Help',
          onPress: () => {
            // In a real app, this would send an emergency alert
            Alert.alert('Emergency alert sent', 'GetMeBuddy support has been notified.');
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Safety Tools</Text>
          
          <TouchableOpacity style={styles.optionRow} onPress={handleShareLocation}>
            <Icon name="location-on" type="material" size={24} color={COLORS.primary} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>
                {locationShared ? 'Location Shared' : 'Share My Location'}
              </Text>
              <Text style={styles.optionDescription}>
                Share your real-time location with trusted contacts
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionRow} onPress={handleEmergency}>
            <Icon name="warning" type="material" size={24} color={COLORS.danger} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Emergency Help</Text>
              <Text style={styles.optionDescription}>
                Alert GetMeBuddy support in case of emergency
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionRow} onPress={handleReport}>
            <Icon name="flag" type="material" size={24} color={COLORS.warning} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Report User</Text>
              <Text style={styles.optionDescription}>
                Report inappropriate behavior or concerns
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionRow} onPress={handleBlock}>
            <Icon name="block" type="material" size={24} color={COLORS.danger} />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionText}>Block User</Text>
              <Text style={styles.optionDescription}>
                Prevent this user from contacting you
              </Text>
            </View>
          </TouchableOpacity>
          
          <Button
            title="Close"
            onPress={onClose}
            buttonStyle={styles.closeButton}
            containerStyle={styles.closeButtonContainer}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
  closeButtonContainer: {
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});

export default SafetyToolsModal;