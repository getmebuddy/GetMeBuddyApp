import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';

import { updateProfile } from '../../store/actions/profileActions'; // Assume typed
import { AppDispatch, RootState } from '../../store';
import { OnboardingStackParamList } from '../../navigation';
import { CompanionshipDetails } from '../../models/UserProfile'; // For typing the payload

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Navigation props
type CompanionshipPreferencesScreenProps = StackScreenProps<OnboardingStackParamList, 'CompanionshipPreferences'>;

// For state management of selections
type CompanionshipTypeKey = 'conversation' | 'cityExploration' | 'events' | 'dining' | 'localGuide';
const COMPANIONSHIP_TYPE_OPTIONS: Record<CompanionshipTypeKey, string> = {
  conversation: "Conversation Partner",
  cityExploration: "City Exploration",
  events: "Events Companion",
  dining: "Dining Companion",
  localGuide: "Local Guide",
};

type PersonalityTraitKey = 'outgoing' | 'thoughtful' | 'adventurous' | 'relaxed' | 'intellectual';
const PERSONALITY_TRAIT_OPTIONS: Record<PersonalityTraitKey, string> = {
  outgoing: "Outgoing & Energetic",
  thoughtful: "Thoughtful & Empathetic",
  adventurous: "Adventurous & Spontaneous",
  relaxed: "Relaxed & Easygoing",
  intellectual: "Intellectual & Curious",
};

type Selections<T extends string> = Record<T, boolean>;

const CompanionshipPreferencesScreen: React.FC<CompanionshipPreferencesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userType, profileData } = useSelector((state: RootState) => state.profile as { userType: 'activity' | 'companionship' | 'both' | null, profileData: { companionshipDetails?: Partial<CompanionshipDetails> } });

  // Initialize state from Redux or defaults
  const initialCompanionTypes = Object.keys(COMPANIONSHIP_TYPE_OPTIONS).reduce((acc, key) => {
    acc[key as CompanionshipTypeKey] = profileData?.companionshipDetails?.conversationTopics?.includes(COMPANIONSHIP_TYPE_OPTIONS[key as CompanionshipTypeKey]) || false;
    return acc;
  }, {} as Selections<CompanionshipTypeKey>);

  const initialPersonalityTraits = Object.keys(PERSONALITY_TRAIT_OPTIONS).reduce((acc, key) => {
    acc[key as PersonalityTraitKey] = profileData?.companionshipDetails?.personalityTraits?.includes(PERSONALITY_TRAIT_OPTIONS[key as PersonalityTraitKey]) || false;
    return acc;
  }, {} as Selections<PersonalityTraitKey>);

  const [companionshipTypes, setCompanionshipTypes] = useState<Selections<CompanionshipTypeKey>>(initialCompanionTypes);
  const [personalityTraits, setPersonalityTraits] = useState<Selections<PersonalityTraitKey>>(initialPersonalityTraits);

  const handleToggle = <T extends string>(setter: React.Dispatch<React.SetStateAction<Selections<T>>>, key: T) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    const selectedCompanionTypes = Object.entries(companionshipTypes)
      .filter(([,isSelected]) => isSelected)
      .map(([key]) => COMPANIONSHIP_TYPE_OPTIONS[key as CompanionshipTypeKey]);

    const selectedPersonalityTraits = Object.entries(personalityTraits)
      .filter(([,isSelected]) => isSelected)
      .map(([key]) => PERSONALITY_TRAIT_OPTIONS[key as PersonalityTraitKey]);

    const detailsToSave: Partial<CompanionshipDetails> = {
      // Assuming conversationTopics field stores these types, adjust if model has a different field
      conversationTopics: selectedCompanionTypes, 
      personalityTraits: selectedPersonalityTraits,
    };

    try {
      // await dispatch(updateProfile({ companionshipDetails: detailsToSave }));
      console.log("Saving companionship details:", detailsToSave); // Placeholder

      // Navigate based on userType
      // If userType is 'companionship' only, they go to VerificationIntro.
      // If userType is 'both', they might have come from UserTypeSelection or ActivityPreferences.
      // If they came from UserTypeSelection (meaning ActivityPreferences was skipped), go to ActivityPreferences.
      // If they came from ActivityPreferences, go to VerificationIntro.
      // This logic needs careful handling based on the exact onboarding flow.
      // For simplicity here, if 'both', assume they always do ActivityPreferences next if not done.
      // A more robust solution might involve tracking completed onboarding steps in Redux state.
      if (userType === 'both' && !profileData.activityPreferences) { // A simple check, might need better state tracking
         navigation.navigate('ActivityPreferences');
      } else {
         navigation.navigate('VerificationIntro');
      }
    } catch (error) {
      console.error('Error updating companionship preferences:', error);
      Alert.alert("Error", "Could not save preferences. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Companionship Preferences</Text>
        <Text style={styles.subtitle}>What kind of companionship experience are you looking for?</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types of Companionship</Text>
          {(Object.keys(COMPANIONSHIP_TYPE_OPTIONS) as CompanionshipTypeKey[]).map(key => (
            <CheckBox
              key={key}
              title={COMPANIONSHIP_TYPE_OPTIONS[key]}
              checked={companionshipTypes[key]}
              onPress={() => handleToggle(setCompanionshipTypes, key)}
              containerStyle={styles.checkboxContainer}
              textStyle={styles.checkboxText}
              checkedColor={COLORS.primary}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Personality Traits</Text>
          {(Object.keys(PERSONALITY_TRAIT_OPTIONS) as PersonalityTraitKey[]).map(key => (
            <CheckBox
              key={key}
              title={PERSONALITY_TRAIT_OPTIONS[key]}
              checked={personalityTraits[key]}
              onPress={() => handleToggle(setPersonalityTraits, key)}
              containerStyle={styles.checkboxContainer}
              textStyle={styles.checkboxText}
              checkedColor={COLORS.primary}
            />
          ))}
        </View>

        <Button
          title="Continue"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleSubmit}
          titleStyle={TYPOGRAPHY.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1, padding: SPACING.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginBottom: SPACING.small, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.subtitle, color: COLORS.grey700, marginBottom: SPACING.large, textAlign: 'center' },
  section: { marginBottom: SPACING.large },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.medium },
  // sectionSubtitle: { ...TYPOGRAPHY.body, color: COLORS.grey600, marginBottom: SPACING.medium }, // Not used in this version
  checkboxContainer: { backgroundColor: COLORS.white, borderWidth: 0, marginLeft: 0, paddingVertical: SPACING.xsmall },
  checkboxText: { ...TYPOGRAPHY.body, fontWeight: 'normal' },
  buttonContainer: { marginTop: SPACING.medium, marginBottom: SPACING.large },
  button: { backgroundColor: COLORS.primary, borderRadius: 25, height: 50 },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 16 }, body: { fontSize: 14 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', text: '#333333',
  grey600: '#4B5563', grey700: '#374151',
  ...COLORS,
};

export default CompanionshipPreferencesScreen;
