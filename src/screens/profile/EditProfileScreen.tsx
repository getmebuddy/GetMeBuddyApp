import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, SafeAreaView,
  NativeSyntheticEvent, TextInputChangeEventData,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Divider } from 'react-native-elements';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Import event type
import { StackScreenProps } from '@react-navigation/stack';

import { updateUserProfile } from '../../store/actions/profileActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { UserProfile, UserProfileGender } from '../../models/UserProfile'; // UserProfileGender for gender type
import { AppDispatch, RootState } from '../../store';
import { AppStackParamList } from '../../navigation'; // Assuming EditProfile is in AppStack

// Types
type EditProfileScreenProps = StackScreenProps<AppStackParamList, 'EditProfile'>;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
  location?: string;
}

const GENDER_OPTIONS: UserProfileGender[] = ['male', 'female', 'other', 'prefer_not_to_say'];

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ route, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user as UserProfile | null); // Full UserProfile for auth user
  const { loading } = useSelector((state: RootState) => state.profile);
  
  // route.params?.profile might contain the current profile data to edit
  // This could come from ProfileScreen to prefill the form
  const initialProfileData = route.params?.profileData || authUser;


  const [firstName, setFirstName] = useState<string>(initialProfileData?.name?.split(' ')[0] || authUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState<string>(initialProfileData?.name?.split(' ').slice(1).join(' ') || authUser?.name?.split(' ').slice(1).join(' ') || '');
  const [bio, setBio] = useState<string>(initialProfileData?.bio || '');
  const [gender, setGender] = useState<UserProfileGender | ''>(initialProfileData?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | null>(
    initialProfileData?.dateOfBirth ? new Date(initialProfileData.dateOfBirth) : null
  );
  const [location, setLocation] = useState<string>(initialProfileData?.location?.city || ''); // Assuming simple string for now
  const [occupation, setOccupation] = useState<string>(''); // Assuming occupation is not in UserProfile model, add if needed

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Profile',
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.headerButtonText}>Save</Text>}
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, firstName, lastName, bio, gender, birthDate, location, occupation]); // Re-run if form values change for potential "dirty" check

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    try { return date.toISOString().split('T')[0]; } // 'YYYY-MM-DD'
    catch { return ''; }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS if needed, or manage differently
    if (selectedDate) {
      setBirthDate(selectedDate);
      setErrors(prev => ({ ...prev, birthDate: undefined })); // Clear error on change
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!bio.trim()) newErrors.bio = 'Bio is required';
    else if (bio.trim().length < 20) newErrors.bio = 'Bio should be at least 20 characters';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (birthDate > eighteenYearsAgo) newErrors.birthDate = 'You must be at least 18 years old';
    }
    if (!location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }
    const profileDataToUpdate: Partial<UserProfile> = {
      name: `${firstName.trim()} ${lastName.trim()}`, // Construct name
      bio: bio.trim(),
      gender: gender || undefined, // Send undefined if empty string, or handle as needed by backend
      dateOfBirth: birthDate ? formatDate(birthDate) : undefined,
      location: { city: location.trim() }, // Assuming location is just city for now
      // occupation, // Add if occupation is part of UserProfile model
    };

    try {
      // await dispatch(updateUserProfile(profileDataToUpdate)); // Action should take Partial<UserProfile>
      console.log("Saving profile:", profileDataToUpdate); // Placeholder
      Alert.alert('Success', 'Your profile has been updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  const renderError = (field: keyof FormErrors) => errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={[styles.input, errors.firstName && styles.inputError]} value={firstName} onChangeText={t => {setFirstName(t); setErrors(p => ({...p, firstName: undefined}));}} placeholder="Your first name" autoCapitalize="words" />
              {renderError('firstName')}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={[styles.input, errors.lastName && styles.inputError]} value={lastName} onChangeText={t => {setLastName(t); setErrors(p => ({...p, lastName: undefined}));}} placeholder="Your last name" autoCapitalize="words" />
              {renderError('lastName')}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.textArea, errors.bio && styles.inputError]} value={bio} onChangeText={t => {setBio(t); setErrors(p => ({...p, bio: undefined}));}} placeholder="Tell others about yourself..." multiline numberOfLines={5} textAlignVertical="top" maxLength={500} />
              <Text style={styles.charCount}>{bio.length}/500</Text>
              {renderError('bio')}
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroup}>
                {GENDER_OPTIONS.map(option => (
                  <TouchableOpacity key={option} style={[styles.radioButton, gender === option && styles.radioButtonSelectedContainer]} onPress={() => {setGender(option); setErrors(p => ({...p, gender: undefined}));}}>
                    <Icon name={gender === option ? 'radio-button-checked' : 'radio-button-unchecked'} type="material" size={22} color={gender === option ? COLORS.primary : COLORS.grey600} />
                    <Text style={[styles.radioText, gender === option && styles.radioTextSelected]}>{option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {renderError('gender')}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Birth Date</Text>
              <TouchableOpacity style={[styles.input, styles.dateInput, errors.birthDate && styles.inputError]} onPress={() => setShowDatePicker(true)}>
                <Text style={birthDate ? styles.dateText : styles.placeholderText}>{birthDate ? formatDate(birthDate) : 'Select your birth date'}</Text>
                <Icon name="calendar-today" type="material" size={20} color={COLORS.grey600} />
              </TouchableOpacity>
              {showDatePicker && <DateTimePicker value={birthDate || new Date(new Date().setFullYear(new Date().getFullYear() - 18))} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />}
              {renderError('birthDate')}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location (City)</Text>
              <TextInput style={[styles.input, errors.location && styles.inputError]} value={location} onChangeText={t => {setLocation(t); setErrors(p => ({...p, location: undefined}));}} placeholder="e.g., New York" autoCapitalize="words" />
              {renderError('location')}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Occupation (Optional)</Text>
              <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} placeholder="e.g., Software Engineer" autoCapitalize="sentences" />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Save Changes" buttonStyle={styles.saveButton} titleStyle={TYPOGRAPHY.button} onPress={handleSave} loading={loading} disabled={loading} />
            <Button title="Cancel" type="outline" buttonStyle={styles.cancelButton} titleStyle={styles.cancelButtonText} onPress={() => navigation.goBack()} disabled={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  headerButton: { paddingHorizontal: SPACING.medium },
  headerButtonText: { ...TYPOGRAPHY.button, color: COLORS.primary, fontSize: 16 },
  formSection: { paddingHorizontal: SPACING.medium, paddingTop: SPACING.medium },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.medium },
  formGroup: { marginBottom: SPACING.medium },
  label: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, marginBottom: SPACING.xsmall, fontWeight: '600' },
  input: { ...TYPOGRAPHY.body, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grey300, borderRadius: 8, paddingHorizontal: SPACING.medium, height: 48, color: COLORS.text },
  inputError: { borderColor: COLORS.error },
  textArea: { ...TYPOGRAPHY.body, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.grey300, borderRadius: 8, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, minHeight: 100, textAlignVertical: 'top', color: COLORS.text },
  charCount: { ...TYPOGRAPHY.caption, color: COLORS.grey600, textAlign: 'right', marginTop: SPACING.xsmall },
  radioGroup: { marginTop: SPACING.xsmall },
  radioButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.small },
  radioButtonSelectedContainer: { /* Can add specific styling for selected container if needed */ },
  radioText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.small },
  radioTextSelected: { color: COLORS.primary, fontWeight: 'bold' },
  errorText: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: SPACING.xsmall },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { ...TYPOGRAPHY.body, color: COLORS.text },
  placeholderText: { ...TYPOGRAPHY.body, color: COLORS.grey500 },
  divider: { marginVertical: SPACING.medium, backgroundColor: COLORS.grey200 },
  buttonContainer: { padding: SPACING.medium, marginTop: SPACING.small },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 25, paddingVertical: SPACING.small },
  cancelButton: { borderColor: COLORS.grey400, borderRadius: 25, paddingVertical: SPACING.small, marginTop: SPACING.small },
  cancelButtonText: { ...TYPOGRAPHY.button, color: COLORS.grey700 },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 16 }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24, extraLarge: 32,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', background: '#F4F6F8', white: '#FFFFFF', text: '#333333',
  textSecondary: '#555555', error: '#D32F2F',
  grey200: '#E5E7EB', grey300: '#D1D5DB', grey400: '#9CA3AF', grey500: '#6B7280',
  grey600: '#4B5563', grey700: '#374151', grey800: '#1F2937',
  ...COLORS,
};

export default EditProfileScreen;
