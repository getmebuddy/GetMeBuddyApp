// src/components/profile/VerificationBadges.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Icon, Tooltip } from 'react-native-elements';
import { COLORS } from '../../styles/colors';
import { VerificationStatus } from '../../types/models';

interface VerificationBadgeProps {
  type: string;
  verified: boolean;
  description: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ type, verified, description }) => {
  const getBadgeColor = (): string => {
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

interface VerificationBadgesProps {
  verificationStatus: VerificationStatus | null;
}

const VerificationBadges: React.FC<VerificationBadgesProps> = ({ verificationStatus }) => {
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
      
      {/* Additional badges... */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  tooltipText: {
    fontSize: 12,
    color: '#fff',
  },
  badge: {
    width: 20,
    height: 20,
    color: '#fff',
  },
  tooltipContainer: {
    padding: 10,
    borderRadius: 5,
  },
  // More styles...
});

export default VerificationBadges;
