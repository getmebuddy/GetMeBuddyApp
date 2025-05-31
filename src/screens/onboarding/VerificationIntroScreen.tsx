import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Icon } from 'react-native-elements'; // Added Icon
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';

import { completeOnboarding } from '../../store/actions/profileActions'; // Assume typed
import { UserPurposeType } from '../../store/actions/profileActions'; // Assuming this type is exported
import { AppDispatch, RootState } from '../../store';
import { OnboardingStackParamList, AppStackParamList } from '../../navigation'; // Import relevant ParamLists

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Navigation props
// This screen is in OnboardingStack, but navigates to screens in AppStack
type VerificationIntroScreenProps = StackScreenProps<OnboardingStackParamList, 'VerificationIntro'>;


const VerificationIntroScreen: React.FC<VerificationIntroScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userType = useSelector((state: RootState) => state.profile.userType as UserPurposeType | null);

  const isCompanionType = userType === 'companion' || userType === 'both';

  const handleContinueToVerification = () => {
    // Mark onboarding as complete before navigating to verification,
    // as verification might be a separate flow they can exit and return to.
    // Or, completeOnboarding could be called AFTER verification is done.
    // For now, assuming completing onboarding means finishing preference screens.
    dispatch(completeOnboarding());

    // Navigate to the Verification stack/screen within the main app structure
    // This assumes 'Verification' is a navigator or screen in AppStackParamList
    navigation.getParent<StackScreenProps<AppStackParamList>['navigation']>()?.replace('Verification', { screen: 'VerificationStatus' });
    // Using replace to prevent going back to onboarding stack from verification
  };

  const handleSkipToMainApp = () => {
    dispatch(completeOnboarding());
    // Navigate to the Main app stack/tabs
    navigation.getParent<StackScreenProps<AppStackParamList>['navigation']>()?.replace('Main', { screen: 'Home' });
  };

  const verificationBenefits = [
    "Build trust within the community.",
    "Gain access to more features and matches.",
    "Companions often require higher verification levels.",
    "Ensure a safer experience for everyone.",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Icon name="shield-check" type="material-community" size={60} color={COLORS.primary} containerStyle={styles.iconHeader} />
        <Text style={styles.title}>Trust & Safety Verification</Text>
        <Text style={styles.subtitle}>
          GetMeBuddy prioritizes your safety. Our verification system helps create a secure and trustworthy environment for all users.
        </Text>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why Verify?</Text>
          {verificationBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon name="check-circle" type="material" size={20} color={COLORS.success} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            {isCompanionType ? "Comprehensive Verification Required" : "Basic Verification Recommended"}
          </Text>
          <Text style={styles.infoText}>
            {isCompanionType
              ? 'As you\'ve indicated interest in companionship services, completing our multi-level verification is essential to ensure safety and build trust. This process may include ID checks and background screening for higher tiers.'
              : 'We recommend all users complete at least basic verification. It enhances your profile credibility and contributes to a safer community.'}
          </Text>
        </View>

        <Button
          title="Start Verification Process"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleContinueToVerification}
          titleStyle={TYPOGRAPHY.button}
          icon={<Icon name="shield-lock" type="material-community" size={20} color={COLORS.white} iconStyle={{ marginRight: SPACING.small }}/>}
        />

        {!isCompanionType && (
          <Button
            title="Maybe Later (Proceed to App)"
            type="clear"
            containerStyle={styles.skipButtonContainer}
            titleStyle={styles.skipButtonTitle}
            onPress={handleSkipToMainApp}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1, padding: SPACING.medium, justifyContent: 'center' },
  iconHeader: { marginBottom: SPACING.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, textAlign: 'center', marginBottom: SPACING.small },
  subtitle: { ...TYPOGRAPHY.subtitle, color: COLORS.grey700, textAlign: 'center', marginBottom: SPACING.large, lineHeight: TYPOGRAPHY.subtitle?.fontSize ? TYPOGRAPHY.subtitle.fontSize * 1.4 : 22 },
  benefitsContainer: {
    backgroundColor: COLORS.lightSuccessBackground || '#E6FFFA',
    borderRadius: 10,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  benefitsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.success || '#28A745',
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xsmall,
  },
  benefitIcon: {
    marginRight: SPACING.small,
    marginTop: 2,
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary || '#333',
    flex: 1,
  },
  infoBox: {
    backgroundColor: COLORS.lightPrimaryBackground || '#E0E7FF',
    padding: SPACING.medium,
    borderRadius: 10,
    marginBottom: SPACING.large,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginBottom: SPACING.xsmall },
  infoText: { ...TYPOGRAPHY.body, color: COLORS.text, lineHeight: TYPOGRAPHY.body?.fontSize ? TYPOGRAPHY.body.fontSize * 1.5 : 20 },
  buttonContainer: { marginBottom: SPACING.small },
  button: { backgroundColor: COLORS.primary, borderRadius: 25, height: 50, paddingVertical: SPACING.small },
  skipButtonContainer: { marginBottom: SPACING.medium },
  skipButtonTitle: { color: COLORS.grey600, ...TYPOGRAPHY.button, fontSize: 14 },
});

// Fallback style definitions have been removed.
// Assuming TYPOGRAPHY, SPACING, COLORS are correctly imported and typed from their source files.

export default VerificationIntroScreen;
