import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Icon } from 'react-native-elements';
import { StackScreenProps } from '@react-navigation/stack';

import { setUserType, UserPurposeType } from '../../store/actions/profileActions'; // Assume UserPurposeType is exported
import { AppDispatch } from '../../store';
import { OnboardingStackParamList } from '../../navigation';

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Navigation props
type UserTypeSelectionScreenProps = StackScreenProps<OnboardingStackParamList, 'UserTypeSelection'>;

interface Option {
  id: UserPurposeType;
  title: string;
  description: string;
  iconName: string;
  iconType: string;
}

const options: Option[] = [
  {
    id: 'activity',
    title: 'Find Activity Partners',
    description: 'Connect with verified buddies for hiking, gaming, sports, or any activity you enjoy.',
    iconName: 'directions-run',
    iconType: 'material',
  },
  {
    id: 'companion',
    title: 'Connect with Companions',
    description: 'Find verified companions to spend time with in various settings, from casual chats to events.',
    iconName: 'groups',
    iconType: 'material',
  },
  {
    id: 'both',
    title: 'Both Options',
    description: 'Use GetMeBuddy for both finding activity partners and connecting with companions.',
    iconName: 'swap-horiz',
    iconType: 'material',
  },
];

const UserTypeSelectionScreen: React.FC<UserTypeSelectionScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelection = (type: UserPurposeType) => {
    dispatch(setUserType(type));

    if (type === 'activity' || type === 'both') {
      navigation.navigate('ActivityPreferences');
    } else if (type === 'companion') {
      navigation.navigate('CompanionshipPreferences');
    }
    // If 'both', ActivityPreferences will then navigate to CompanionshipPreferences or VerificationIntro
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>How would you like to use GetMeBuddy?</Text>
        <Text style={styles.subtitle}>Choose the option that best fits your needs. You can change this later in your profile.</Text>

        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => handleSelection(option.id)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${option.title}`}
          >
            <Icon name={option.iconName} type={option.iconType} size={30} color={COLORS.primary} containerStyle={styles.iconContainer}/>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.medium,
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.grey700,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey, // Or white with more shadow
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    marginRight: SPACING.medium,
    backgroundColor: COLORS.lightPrimary, // Light background for icon
    padding: SPACING.small,
    borderRadius: 25, // Circular background
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xsmall,
  },
  optionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.grey600,
    lineHeight: TYPOGRAPHY.body?.fontSize ? TYPOGRAPHY.body.fontSize * 1.4 : 18,
  },
});

// Fallback style definitions have been removed.
// Assuming TYPOGRAPHY, SPACING, COLORS are correctly imported and typed from their source files.

export default UserTypeSelectionScreen;
