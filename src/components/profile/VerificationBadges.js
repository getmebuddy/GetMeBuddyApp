// src/components/profile/VerificationBadges.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Icon, Tooltip } from 'react-native-elements';
import { COLORS } from '../../styles/colors';

const VerificationBadge = ({ type, verified, description }) => {
  const getBadgeColor = () => {
    return verified ? COLORS.primary : '#ccc';
  };

  return (
    <Tooltip
      popover={<Text style={styles.tooltipText}>{description}</Text>}
      width={200}
      height={Platform.OS === 'ios' ? undefined : 60}
      backgroundColor="#333"
      containerStyle={styles.tooltipContainer}
      withPointer={true}
    >
      <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
        <Icon name={type} type="material" size={14} color="#fff" />
      </View>
    </Tooltip>
  );
};

const VerificationBadges = ({ verificationStatus }) => {
  if (!verificationStatus) return null;
  
  return (
    <View style={styles.container}>
      <VerificationBadge
        type="email"
        verified={verificationStatus.emailVerified}
        description="Email Verified"
      />
      
      <VerificationBadge
        type="phone"
        verified={verificationStatus.phoneVerified}
        description="Phone Verified"
      />
      
      <VerificationBadge
        type="photo-camera"
        verified={verificationStatus.photoVerified}
        description="Photo Verified"
      />
      
      <VerificationBadge
        type="badge"
        verified={verificationStatus.idVerified}
        description="ID Verified"
      />
      
      <VerificationBadge
        type="security"
        verified={verificationStatus.backgroundVerified}
        description="Background Checked"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tooltipContainer: {
    padding: 10,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default VerificationBadges;