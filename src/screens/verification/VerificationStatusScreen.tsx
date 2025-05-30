import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';

import { getVerificationStatus } from '../../store/actions/verificationActions'; // Assume typed
import { UserVerificationStatus } from './VerificationHomeScreen'; // Reuse type from VerificationHomeScreen
import { VerificationStackParamList } from '../../navigation'; // Assuming this screen is in VerificationStack
import { AppDispatch, RootState } from '../../store';
import { UserPurposeType } from '../../store/actions/profileActions';
import { VerificationLevel } from '../../models/UserProfile';

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Types for VerificationCard props
interface VerificationCardItem {
  label: string;
  complete: boolean;
}

interface VerificationCardProps {
  title: string;
  items: VerificationCardItem[];
  level: string; // e.g., "1", "2", "3" for display
  onPress: () => void;
  isActive: boolean;
  isComplete: boolean;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ title, items, level, onPress, isActive, isComplete }) => {
  const getBadgeColor = () => {
    if (isComplete) return COLORS.success;
    if (isActive) return COLORS.primary;
    return COLORS.grey300;
  };
  const getLevelTextColor = () => {
    if (isComplete || isActive) return COLORS.white;
    return COLORS.grey600;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={isComplete && !isActive /* Allow re-entry if active but not complete */}>
      <View style={styles.cardHeader}>
        <View style={[styles.levelBadge, { backgroundColor: getBadgeColor() }]}>
          <Text style={[styles.levelText, {color: getLevelTextColor()}]}>{level}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        {isComplete && <Icon name="check-circle" type="material" color={COLORS.success} size={24} />}
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.verificationItem}>
          <Icon name={item.complete ? "check-box" : "check-box-outline-blank"} type="material" size={22} color={item.complete ? COLORS.success : COLORS.grey400} />
          <Text style={[styles.itemText, item.complete && styles.completedItemText]}>{item.label}</Text>
        </View>
      ))}
      <View style={styles.cardFooter}>
        <Text style={[styles.statusText, isComplete && styles.statusCompleteText, isActive && !isComplete && styles.statusActiveText]}>
          {isComplete ? 'Verification Complete' : isActive ? 'Continue Verification' : 'Verification Pending'}
        </Text>
        {(!isComplete || isActive) && <Icon name="chevron-right" type="material" size={24} color={COLORS.primary} />}
      </View>
    </TouchableOpacity>
  );
};

// Navigation props
type VerificationStatusScreenProps = StackScreenProps<VerificationStackParamList, 'VerificationStatus'>;

const VerificationStatusScreen: React.FC<VerificationStatusScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const verificationStatus = useSelector((state: RootState) => state.verification.verificationStatus as UserVerificationStatus | null);
  const loading = useSelector((state: RootState) => state.verification.loading);
  const userType = useSelector((state: RootState) => state.profile.userType as UserPurposeType | null);

  const isCompanionType = userType === 'companion' || userType === 'both';

  useEffect(() => {
    if (user?.id) {
      dispatch(getVerificationStatus(user.id));
    }
  }, [dispatch, user?.id]);

  const getOverallVerificationLevelText = (): string => {
    if (!verificationStatus?.level || verificationStatus.level === 'incomplete') return 'Not Verified';
    return verificationStatus.level.charAt(0).toUpperCase() + verificationStatus.level.slice(1);
  };

  const getLevelColor = (level?: VerificationLevel | 'incomplete'): string => {
    if (level === 'premium') return COLORS.secondary; // Premium color
    if (level === 'enhanced') return COLORS.primary;
    if (level === 'basic') return COLORS.success; // Basic complete is good
    return COLORS.grey400; // Incomplete
  };

  const getBasicItems = (): VerificationCardItem[] => [
    { label: 'Email Verified', complete: verificationStatus?.emailVerified || false },
    { label: 'Phone Verified', complete: verificationStatus?.phoneVerified || false },
    { label: 'Profile Photo Approved', complete: verificationStatus?.photoVerified || false },
  ];

  const getEnhancedItems = (): VerificationCardItem[] => [
    { label: 'ID Document Verified', complete: verificationStatus?.idVerified || false },
    { label: 'Liveness Check Passed', complete: verificationStatus?.videoVerified || false },
  ];

  const getPremiumItems = (): VerificationCardItem[] => [
    { label: 'Background Check Passed', complete: verificationStatus?.backgroundVerified || false },
  ];

  const isBasicComplete = (): boolean => !!(verificationStatus?.emailVerified && verificationStatus?.phoneVerified && verificationStatus?.photoVerified);
  const isEnhancedComplete = (): boolean => !!(isBasicComplete() && verificationStatus?.idVerified && verificationStatus?.videoVerified);
  const isPremiumComplete = (): boolean => !!(isEnhancedComplete() && verificationStatus?.backgroundVerified);

  if (loading && !verificationStatus) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading status...</Text></SafeAreaView>;
  }

  if (!verificationStatus) {
     return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Could not load verification status.</Text><Button title="Retry" onPress={() => user?.id && dispatch(getVerificationStatus(user.id))} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: COLORS.background}}>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-checkered" type="material-community" size={40} color={COLORS.white} />
        <Text style={styles.title}>Verification Center</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Current Level:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getLevelColor(verificationStatus?.level) }]}>
            <Text style={styles.statusBadgeText}>{getOverallVerificationLevelText()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Verification Progress</Text>

      <VerificationCard
        title="Basic Verification" level="1" items={getBasicItems()}
        isActive={!isBasicComplete()}
        isComplete={isBasicComplete()}
        onPress={() => navigation.navigate('BasicVerification')}
      />
      <VerificationCard
        title="Enhanced Verification" level="2" items={getEnhancedItems()}
        isActive={isBasicComplete() && !isEnhancedComplete()}
        isComplete={isEnhancedComplete()}
        onPress={() => navigation.navigate('EnhancedVerification')}
      />
      {isCompanionType && (
        <VerificationCard
          title="Professional Verification" level="3" items={getPremiumItems()}
          isActive={isEnhancedComplete() && !isPremiumComplete()} // Must complete enhanced first
          isComplete={isPremiumComplete()}
          onPress={() => navigation.navigate('PremiumVerification')}
        />
      )}

      <View style={styles.infoBox}>
        <Icon name="information-outline" type="material-community" size={24} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {isCompanionType ? 'All verification levels are required to offer companionship services.' : 'Completing more verification steps increases trust and improves your matching potential.'}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.medium, backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems:'center', marginBottom: SPACING.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.small, marginTop: SPACING.xsmall },
  statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: SPACING.medium, paddingVertical: SPACING.xsmall, borderRadius: 15 },
  statusLabel: { ...TYPOGRAPHY.subtitle, color: COLORS.white, marginRight: SPACING.small },
  statusBadge: { paddingHorizontal: SPACING.small, paddingVertical: 2, borderRadius: 10 },
  statusBadgeText: { ...TYPOGRAPHY.body, color: COLORS.white, fontWeight: 'bold' },
  sectionTitle: { ...TYPOGRAPHY.h2, marginHorizontal: SPACING.medium, marginBottom: SPACING.small, color: COLORS.textEmphasis },
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: SPACING.medium, marginBottom: SPACING.medium, padding: SPACING.medium, elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.medium },
  levelBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.small },
  levelText: { fontSize: 12, fontWeight: 'bold' },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1 },
  verificationItem: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xsmall + 2 },
  itemText: { marginLeft: SPACING.small, ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  completedItemText: { color: COLORS.text, textDecorationLine: 'none' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.small, paddingTop: SPACING.small, borderTopWidth: 1, borderTopColor: COLORS.grey100 },
  statusText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600' },
  statusCompleteText: { color: COLORS.success },
  statusActiveText: { color: COLORS.primary },
  infoBox: { flexDirection: 'row', backgroundColor: COLORS.lightPrimaryBackground, padding: SPACING.medium, margin: SPACING.medium, borderRadius: 10, alignItems: 'center' },
  infoText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.small, flex: 1, lineHeight: TYPOGRAPHY.body?.fontSize ? TYPOGRAPHY.body.fontSize * 1.4 : 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.medium },
  errorText: { ...TYPOGRAPHY.body, color: COLORS.error, marginBottom: SPACING.medium, textAlign: 'center' },
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
  text: '#333333', textEmphasis: '#111111', textSecondary: '#555555', error: '#D32F2F',
  success: '#28a745', warning: '#FB8C00',
  grey100: '#F3F4F6', grey300: '#D1D5DB', grey400: '#9CA3AF', grey500: '#6B7280',
  lightPrimaryBackground: '#E0E7FF',
  ...COLORS,
};

export default VerificationStatusScreen;
