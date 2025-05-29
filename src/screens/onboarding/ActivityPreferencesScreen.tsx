import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, CheckBox, Input, Slider } from 'react-native-elements'; // Added for example UI
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';

import { updateProfile } from '../../store/actions/profileActions'; // Assume typed
import { AppDispatch, RootState } from '../../store';
import { OnboardingStackParamList } from '../../navigation'; // Import OnboardingStackParamList
import { ActivityPreferences as ActivityPreferencesData, SkillLevels, Availability } from '../../models/UserProfile'; // Import from UserProfile model

import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

// Navigation props
type ActivityPreferencesScreenProps = StackScreenProps<OnboardingStackParamList, 'ActivityPreferences'>;

// Example available categories - this might come from an API or config file
const AVAILABLE_CATEGORIES = ['Hiking', 'Yoga', 'Cycling', 'Running', 'Swimming', 'Team Sports', 'Gaming'];
const SKILL_OPTIONS = ['beginner', 'intermediate', 'advanced', 'expert'] as const; // Use const for literal types
type SkillOption = typeof SKILL_OPTIONS[number];


const ActivityPreferencesScreen: React.FC<ActivityPreferencesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userType, profileData } = useSelector((state: RootState) => state.profile as { userType: 'activity' | 'companionship' | 'both' | null, profileData: { activityPreferences?: Partial<ActivityPreferencesData> } });

  // State for preferences - initialize with existing profile data or defaults
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profileData?.activityPreferences?.categories || []);
  const [skillLevels, setSkillLevels] = useState<Partial<SkillLevels>>(profileData?.activityPreferences?.skillLevels || {});
  const [preferredGroupSize, setPreferredGroupSize] = useState<'solo' | 'duo' | 'small_group' | 'large_group' | undefined>(profileData?.activityPreferences?.preferredGroupSize);
  // Simplified availability for example
  const [availabilityNotes, setAvailabilityNotes] = useState<string>(profileData?.activityPreferences?.availability?.generalNotes || '');


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSkillChange = (category: string, level: SkillOption) => {
    setSkillLevels(prev => ({ ...prev, [category]: level }));
  };

  const handleContinue = async () => {
    const preferencesToSave: Partial<ActivityPreferencesData> = {
      categories: selectedCategories,
      skillLevels: skillLevels as SkillLevels, // Cast if sure all selected skills are valid
      preferredGroupSize,
      availability: { generalNotes: availabilityNotes } // Save simplified availability
    };

    try {
      // Dispatch action to save preferences
      // await dispatch(updateProfile({ activityPreferences: preferencesToSave })); // Assuming updateProfile can take partial profile
      console.log("Saving preferences:", preferencesToSave); // Placeholder for actual dispatch

      // Navigation logic based on userType
      if (userType === 'both' || userType === 'activity') {
        navigation.navigate('VerificationIntro');
      } else {
        // This case should ideally not be reached if userType is 'companionship' only,
        // as they might skip this screen. Or, it's a fallback.
        navigation.navigate('CompanionshipPreferences'); 
      }
    } catch (error) {
      console.error("Failed to save activity preferences:", error);
      Alert.alert("Error", "Could not save your preferences. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Activity Preferences</Text>
        <Text style={styles.subtitle}>Tell us about the activities you enjoy and how you like to participate.</Text>

        <Text style={styles.sectionTitle}>Favorite Activities</Text>
        <View style={styles.checkboxContainer}>
          {AVAILABLE_CATEGORIES.map(category => (
            <CheckBox
              key={category}
              title={category}
              checked={selectedCategories.includes(category)}
              onPress={() => toggleCategory(category)}
              containerStyle={styles.checkbox}
              textStyle={styles.checkboxText}
              checkedColor={COLORS.primary}
            />
          ))}
        </View>

        {selectedCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skill Levels</Text>
            {selectedCategories.map(category => (
              <View key={category} style={styles.skillLevelItem}>
                <Text style={styles.skillLabel}>{category}:</Text>
                <View style={styles.skillButtons}>
                    {SKILL_OPTIONS.map(level => (
                        <Button 
                            key={level}
                            title={level.charAt(0).toUpperCase() + level.slice(1)}
                            type={skillLevels[category] === level ? "solid" : "outline"}
                            onPress={() => handleSkillChange(category, level)}
                            buttonStyle={[styles.skillButton, skillLevels[category] === level && styles.skillButtonSelected]}
                            titleStyle={[styles.skillButtonTitle, skillLevels[category] === level && styles.skillButtonTitleSelected]}
                        />
                    ))}
                </View>
              </View>
            ))}
          </>
        )}
        
        <Text style={styles.sectionTitle}>Preferred Group Size</Text>
        {/* Example: Radio buttons or a segmented control for group size */}
        <View style={styles.skillButtons}> 
            {(['solo', 'duo', 'small_group', 'large_group'] as const).map(size => (
                <Button
                    key={size}
                    title={size.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}
                    type={preferredGroupSize === size ? "solid" : "outline"}
                    onPress={() => setPreferredGroupSize(size)}
                    buttonStyle={[styles.skillButton, preferredGroupSize === size && styles.skillButtonSelected]}
                    titleStyle={[styles.skillButtonTitle, preferredGroupSize === size && styles.skillButtonTitleSelected]}
                />
            ))}
        </View>


        <Text style={styles.sectionTitle}>Availability Notes</Text>
        <Input
          placeholder="e.g., Weekends, Evenings after 6 PM"
          value={availabilityNotes}
          onChangeText={setAvailabilityNotes}
          multiline
          numberOfLines={3}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        
        <Button
          title="Continue"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleContinue}
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
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.large, marginBottom: SPACING.medium },
  checkboxContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  checkbox: { backgroundColor: 'transparent', borderWidth: 0, width: '48%', marginLeft: 0, marginRight: 0 },
  checkboxText: { ...TYPOGRAPHY.body, fontWeight: 'normal' },
  skillLevelItem: { marginBottom: SPACING.medium },
  skillLabel: { ...TYPOGRAPHY.body, color: COLORS.text, marginBottom: SPACING.small, fontWeight: '600' },
  skillButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: SPACING.small },
  skillButton: { borderRadius: 20, marginRight: SPACING.small, marginBottom: SPACING.small, paddingHorizontal: SPACING.small },
  skillButtonSelected: { backgroundColor: COLORS.primary },
  skillButtonTitle: { ...TYPOGRAPHY.caption, color: COLORS.primary },
  skillButtonTitleSelected: { color: COLORS.white },
  inputContainer: { borderWidth: 1, borderColor: COLORS.grey200, borderRadius: 8, paddingHorizontal: SPACING.small },
  inputText: { ...TYPOGRAPHY.body, minHeight: 60, textAlignVertical: 'top' },
  buttonContainer: { marginTop: SPACING.large, marginBottom: SPACING.medium },
  button: { backgroundColor: COLORS.primary, borderRadius: 25, height: 50 },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666' }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', text: '#333333',
  grey200: '#E5E7EB', grey700: '#374151',
  ...COLORS,
};

export default ActivityPreferencesScreen;
