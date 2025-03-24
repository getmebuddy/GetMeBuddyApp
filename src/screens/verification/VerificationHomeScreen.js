// src/screens/verification/VerificationHomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { getVerificationStatus } from '../../store/actions/verificationActions';
import VerificationCard from '../../components/verification/VerificationCard';

const VerificationHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { verificationStatus } = useSelector(state => state.verification);
  const { userType } = useSelector(state => state.profile);
  
  useEffect(() => {
    dispatch(getVerificationStatus(user.id));
  }, [dispatch, user.id]);
  
  const renderVerificationRequirements = () => {
    // Different requirements based on user type
    const isCompanion = userType === 'companion' || userType === 'both';
    
    return (
      <View>
        {/* Basic verification - required for all */}
        <VerificationCard
          title="Basic Verification"
          description="Required for all users"
          items={[
            { label: 'Email Verification', complete: verificationStatus?.emailVerified },
            { label: 'Phone Verification', complete: verificationStatus?.phoneVerified },
            { label: 'Profile Photo', complete: verificationStatus?.photoVerified }
          ]}
          onPress={() => navigation.navigate('BasicVerification')}
        />
        
        {/* Enhanced verification */}
        <VerificationCard
          title="Enhanced Verification"
          description={isCompanion ? "Required for companions" : "Recommended for all users"}
          items={[
            { label: 'ID Verification', complete: verificationStatus?.idVerified },
            { label: 'Video Verification', complete: verificationStatus?.videoVerified },
            { label: 'Social Media', complete: verificationStatus?.socialVerified }
          ]}
          onPress={() => navigation.navigate('EnhancedVerification')}
        />
        
        {/* Premium verification - only for companions */}
        {isCompanion && (
          <VerificationCard
            title="Premium Verification"
            description="Required for companionship services"
            items={[
              { label: 'Background Check', complete: verificationStatus?.backgroundVerified },
              { label: 'Reference Check', complete: verificationStatus?.referencesVerified },
              { label: 'Safety Training', complete: verificationStatus?.safetyTrainingComplete }
            ]}
            onPress={() => navigation.navigate('PremiumVerification')}
          />
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Verification Center</Text>
      <Text style={styles.subtitle}>
        Complete verification steps to build trust and safety
      </Text>
      
      {renderVerificationRequirements()}
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Your Verification Level</Text>
        <Text style={styles.statusLevel}>
          {verificationStatus?.level || 'Incomplete'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Style definitions here
});

export default VerificationHomeScreen;