import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { Icon } from 'react-native-elements';

import { getVerificationStatus } from '../../store/actions/verificationActions'; // Assume typed
// Assuming VerificationCard is or will be a typed component
import VerificationCard, { VerificationItem } from '../../components/verification/VerificationCard'; 

import { AppDispatch, RootState } from '../../store';
import { UserProfile, VerificationLevel } from '../../models/UserProfile';
import { UserPurposeType } from '../../store/actions/profileActions';
import { VerificationStackParamList } from '../../navigation'; // Assuming this screen is in VerificationStack

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Types
export interface UserVerificationStatus {
  level?: VerificationLevel | 'incomplete'; // From UserProfile.ts or a more specific 'incomplete'
  emailVerified?: boolean;
  phoneVerified?: boolean;
  photoVerified?: boolean; // Or a status like 'pending_review', 'approved', 'rejected'
  idVerified?: boolean;
  videoVerified?: boolean;
  socialVerified?: boolean;
  backgroundVerified?: boolean;
  referencesVerified?: boolean;
  safetyTrainingComplete?: boolean;
  // Add other specific verification fields as needed
}

// Navigation props
type VerificationHomeScreenProps = StackScreenProps<VerificationStackParamList, 'VerificationHome'>;

const VerificationHomeScreen: React.FC<VerificationHomeScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const user = useSelector((state: RootState) => state.auth.user as UserProfile | null);
  const verificationStatus = useSelector((state: RootState) => state.verification.verificationStatus as UserVerificationStatus | null);
  const loading = useSelector((state: RootState) => state.verification.loading);
  const userType = useSelector((state: RootState) => state.profile.userType as UserPurposeType | null);

  useEffect(() => {
    if (user?.id) {
      dispatch(getVerificationStatus(user.id));
    }
  }, [dispatch, user?.id]);

  const renderVerificationCards = () => {
    const isCompanion = userType === 'companion' || userType === 'both';

    const basicItems: VerificationItem[] = [
      { label: 'Email Verified', isComplete: verificationStatus?.emailVerified || false },
      { label: 'Phone Verified', isComplete: verificationStatus?.phoneVerified || false },
      { label: 'Profile Photo Submitted', isComplete: verificationStatus?.photoVerified || false }, // Status might be more complex
    ];

    const enhancedItems: VerificationItem[] = [
      { label: 'ID Document Verified', isComplete: verificationStatus?.idVerified || false },
      { label: 'Liveness Check / Video Selfie', isComplete: verificationStatus?.videoVerified || false },
      // { label: 'Social Media Accounts Linked', isComplete: verificationStatus?.socialVerified || false },
    ];
    
    const premiumItems: VerificationItem[] = [
      { label: 'Background Check Passed', isComplete: verificationStatus?.backgroundVerified || false },
      // { label: 'Reference Checks Complete', isComplete: verificationStatus?.referencesVerified || false },
      // { label: 'Safety Training Quiz Passed', isComplete: verificationStatus?.safetyTrainingComplete || false },
    ];

    return (
      <View style={styles.cardsContainer}>
        <VerificationCard
          title="Basic Verification"
          description="Essential for all users to ensure authenticity."
          items={basicItems}
          onPress={() => navigation.navigate('BasicVerification')}
          status={verificationStatus?.emailVerified && verificationStatus?.phoneVerified && verificationStatus?.photoVerified ? 'complete' : 'pending'}
        />
        <VerificationCard
          title="Enhanced Verification"
          description={isCompanion ? "Required for Companions" : "Boost your profile's trust score."}
          items={enhancedItems}
          onPress={() => navigation.navigate('EnhancedVerification')}
          status={verificationStatus?.idVerified && verificationStatus?.videoVerified ? 'complete' : 'pending'}
        />
        {isCompanion && (
          <VerificationCard
            title="Professional Verification"
            description="Required for offering Companionship services."
            items={premiumItems}
            onPress={() => navigation.navigate('PremiumVerification')}
            status={verificationStatus?.backgroundVerified ? 'complete' : 'pending'} // Simplified status
          />
        )}
      </View>
    );
  };

  if (loading && !verificationStatus) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading status...</Text></SafeAreaView>;
  }
  
  const currentVerificationLevel = verificationStatus?.level || 'Incomplete';
  const levelColor = currentVerificationLevel === 'premium' ? COLORS.success : currentVerificationLevel === 'enhanced' ? COLORS.warning : currentVerificationLevel === 'basic' ? COLORS.primary : COLORS.grey500;

  return (
    <SafeAreaView style={{flex:1, backgroundColor: COLORS.background}}>
    <ScrollView style={styles.container}>
      <View style={styles.pageHeader}>
          <Icon name="shield-check" type="material-community" size={40} color={COLORS.primary} />
          <Text style={styles.title}>Verification Center</Text>
          <Text style={styles.subtitle}>Enhance your profile's trust and safety by completing verification steps.</Text>
      </View>
      
      <View style={styles.statusOverviewCard}>
        <Text style={styles.statusTitle}>Your Current Verification Level</Text>
        <View style={[styles.statusBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.statusLevelText}>{currentVerificationLevel.toUpperCase()}</Text>
        </View>
        {currentVerificationLevel === 'incomplete' && <Text style={styles.statusSubtitle}>Complete more steps to increase your level.</Text>}
      </View>

      {renderVerificationCards()}

      <TouchableOpacity style={styles.helpLink} onPress={() => Alert.alert("Help", "Verification FAQ / Support (placeholder)")}>
        <Icon name="help-circle-outline" type="material-community" size={20} color={COLORS.primary} />
        <Text style={styles.helpLinkText}>Need help with verification?</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageHeader: { alignItems: 'center', paddingVertical: SPACING.medium, marginBottom: SPACING.small, paddingHorizontal: SPACING.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginTop: SPACING.small, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xsmall },
  statusOverviewCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.medium, marginHorizontal: SPACING.medium, marginBottom: SPACING.medium, alignItems: 'center', elevation: 2, shadowColor:COLORS.black, shadowOpacity:0.1, shadowOffset:{width:0,height:1}, shadowRadius:2 },
  statusTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.small },
  statusBadge: { paddingHorizontal: SPACING.medium, paddingVertical: SPACING.xsmall, borderRadius: 15 },
  statusLevelText: { ...TYPOGRAPHY.subtitle, color: COLORS.white, fontWeight: 'bold', textTransform: 'capitalize' },
  statusSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: SPACING.xsmall },
  cardsContainer: { paddingHorizontal: SPACING.medium },
  helpLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.medium, marginTop: SPACING.small },
  helpLinkText: { ...TYPOGRAPHY.body, color: COLORS.primary, marginLeft: SPACING.xsmall, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.medium },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' }, h3: { fontSize: 18, fontWeight: '600'},
  subtitle: { fontSize: 16 }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', black: '#000000', background: '#F4F6F8',
  text: '#333333', textSecondary: '#555555',
  success: '#28a745', warning: '#FB8C00',
  grey400: '#9CA3AF', grey500: '#6B7280',
  ...COLORS,
};

export default VerificationHomeScreen;
