// src/screens/verification/VerificationStatusScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { getVerificationStatus } from '../../store/actions/verificationActions';
import { COLORS } from '../../styles/colors';

const VerificationCard = ({ title, items, level, onPress, isActive, isComplete }) => {
  const getBadgeColor = () => {
    if (isComplete) return COLORS.success;
    if (isActive) return COLORS.primary;
    return '#ccc';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.levelBadge, { backgroundColor: getBadgeColor() }]}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      
      {items.map((item, index) => (
        <View key={index} style={styles.verificationItem}>
          <Icon 
            name={item.complete ? "check-circle" : "radio-button-unchecked"} 
            type="material" 
            size={20} 
            color={item.complete ? COLORS.success : '#ccc'} 
          />
          <Text style={[styles.itemText, item.complete && styles.completedItemText]}>
            {item.label}
          </Text>
        </View>
      ))}
      
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>
          {isComplete ? 'Completed' : isActive ? 'Active' : 'Not Started'}
        </Text>
        <Icon 
          name="chevron-right" 
          type="material" 
          size={24} 
          color={COLORS.primary} 
        />
      </View>
    </TouchableOpacity>
  );
};

const VerificationStatusScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { verificationStatus, loading } = useSelector(state => state.verification);
  const { userType } = useSelector(state => state.profile);
  
  const isCompanionType = userType === 'companion' || userType === 'both';
  
  useEffect(() => {
    dispatch(getVerificationStatus());
  }, [dispatch]);
  
  const getVerificationLevel = () => {
    if (verificationStatus.level === 'premium') return 'Premium';
    if (verificationStatus.level === 'enhanced') return 'Enhanced';
    if (verificationStatus.level === 'basic') return 'Basic';
    return 'Not Verified';
  };
  
  const getBasicItems = () => [
    { label: 'Email Verification', complete: verificationStatus.emailVerified },
    { label: 'Phone Verification', complete: verificationStatus.phoneVerified },
    { label: 'Profile Photo', complete: verificationStatus.photoVerified }
  ];
  
  const getEnhancedItems = () => [
    { label: 'ID Verification', complete: verificationStatus.idVerified },
    { label: 'Video Verification', complete: verificationStatus.videoVerified },
    { label: 'Social Media', complete: verificationStatus.socialVerified }
  ];
  
  const getPremiumItems = () => [
    { label: 'Background Check', complete: verificationStatus.backgroundVerified },
    { label: 'Reference Check', complete: verificationStatus.referencesVerified },
    { label: 'Safety Training', complete: verificationStatus.safetyTrainingComplete }
  ];
  
  const isBasicComplete = () => {
    return verificationStatus.emailVerified && 
           verificationStatus.phoneVerified && 
           verificationStatus.photoVerified;
  };
  
  const isEnhancedComplete = () => {
    return verificationStatus.idVerified && 
           verificationStatus.videoVerified && 
           verificationStatus.socialVerified;
  };
  
  const isPremiumComplete = () => {
    return verificationStatus.backgroundVerified && 
           verificationStatus.referencesVerified && 
           verificationStatus.safetyTrainingComplete;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification Center</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Your Level:</Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: verificationStatus.level === 'none' ? '#ccc' : COLORS.primary 
          }]}>
            <Text style={styles.statusBadgeText}>{getVerificationLevel()}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Verification Steps</Text>
      
      <VerificationCard
        title="Basic Verification"
        level="1"
        items={getBasicItems()}
        isActive={!isBasicComplete()}
        isComplete={isBasicComplete()}
        onPress={() => navigation.navigate('BasicVerification')}
      />
      
      <VerificationCard
        title="Enhanced Verification"
        level="2"
        items={getEnhancedItems()}
        isActive={isBasicComplete() && !isEnhancedComplete()}
        isComplete={isEnhancedComplete()}
        onPress={() => navigation.navigate('EnhancedVerification')}
      />
      
      {isCompanionType && (
        <VerificationCard
          title="Premium Verification"
          level="3"
          items={getPremiumItems()}
          isActive={isBasicComplete() && isEnhancedComplete() && !isPremiumComplete()}
          isComplete={isPremiumComplete()}
          onPress={() => navigation.navigate('PremiumVerification')}
        />
      )}
      
      <View style={styles.infoBox}>
        <Icon name="info" type="material" size={24} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {isCompanionType 
            ? 'All verification levels must be completed to offer companionship on GetMeBuddy.'
            : 'Enhanced verification increases your profile visibility and builds trust with potential matches.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    color: COLORS.text,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  completedItemText: {
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 14,
    color: '#888',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f7ff',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
});

export default VerificationStatusScreen;