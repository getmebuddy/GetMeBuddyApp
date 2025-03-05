// src/screens/profile/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Divider } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateUserProfile } from '../../store/actions/profileActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const EditProfileScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.profile);
  const { profile } = route.params || {};
  
  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [birthDate, setBirthDate] = useState(
    profile?.birth_date ? new Date(profile.birth_date) : null
  );
  const [location, setLocation] = useState(profile?.location || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});

  // Set navigation header
  useEffect(() => {
    navigation.setOptions({
      title: 'Edit Profile',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.headerButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading, firstName, lastName, bio, gender, birthDate, location, occupation]);

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!bio.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (bio.length < 20) {
      newErrors.bio = 'Bio should be at least 20 characters';
    }
    
    if (!gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      // Check if user is at least 18 years old
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      
      if (birthDate > eighteenYearsAgo) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to first error field could be implemented here
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }
    
    try {
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        bio,
        gender,
        birth_date: birthDate ? formatDate(birthDate) : null,
        location,
        occupation,
      };
      
      await dispatch(updateUserProfile(profileData));
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.textArea, errors.bio && styles.inputError]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell potential buddies about yourself..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{bio.length}/500</Text>
              {errors.bio && (
                <Text style={styles.errorText}>{errors.bio}</Text>
              )}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'male' && styles.radioButtonSelected
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Icon
                    name={gender === 'male' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    type="material"
                    size={20}
                    color={gender === 'male' ? colors.primary : colors.grey600}
                  />
                  <Text style={[
                    styles.radioText,
                    gender === 'male' && styles.radioTextSelected
                  ]}>
                    Male
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'female' && styles.radioButtonSelected
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Icon
                    name={gender === 'female' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    type="material"
                    size={20}
                    color={gender === 'female' ? colors.primary : colors.grey600}
                  />
                  <Text style={[
                    styles.radioText,
                    gender === 'female' && styles.radioTextSelected
                  ]}>
                    Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'other' && styles.radioButtonSelected
                  ]}
                  onPress={() => setGender('other')}
                >
                  <Icon
                    name={gender === 'other' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    type="material"
                    size={20}
                    color={gender === 'other' ? colors.primary : colors.grey600}
                  />
                  <Text style={[
                    styles.radioText,
                    gender === 'other' && styles.radioTextSelected
                  ]}>
                    Other
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    gender === 'prefer_not_to_say' && styles.radioButtonSelected
                  ]}
                  onPress={() => setGender('prefer_not_to_say')}
                >
                  <Icon
                    name={gender === 'prefer_not_to_say' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    type="material"
                    size={20}
                    color={gender === 'prefer_not_to_say' ? colors.primary : colors.grey600}
                  />
                  <Text style={[
                    styles.radioText,
                    gender === 'prefer_not_to_say' && styles.radioTextSelected
                  ]}>
                    Prefer not to say
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Birth Date</Text>
              <TouchableOpacity 
                style={[styles.input, errors.birthDate && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={birthDate ? styles.dateText : styles.placeholderText}>
                  {birthDate ? formatDate(birthDate) : 'Select your birth date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              {errors.birthDate && (
                <Text style={styles.errorText}>{errors.birthDate}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter your city, state"
                autoCapitalize="words"
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Occupation</Text>
              <TextInput
                style={styles.input}
                value={occupation}
                onChangeText={setOccupation}
                placeholder="What do you do? (optional)"
                autoCapitalize="words"
              />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              buttonStyle={styles.saveButton}
              titleStyle={styles.saveButtonText}
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />
            
            <Button
              title="Cancel"
              type="outline"
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
              onPress={() => navigation.goBack()}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: spacing.standard,
  },
  headerButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  formSection: {
    padding: spacing.standard,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.standard,
  },
  formGroup: {
    marginBottom: spacing.standard,
  },
  label: {
    ...typography.subtitle,
    color: colors.grey800,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey300,
    borderRadius: 8,
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey300,
    borderRadius: 8,
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.small,
    minHeight: 120,
  },
  charCount: {
    ...typography.caption,
    color: colors.grey600,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  radioGroup: {
    marginTop: spacing.small,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  radioButtonSelected: {
    // Style for selected radio button
  },
  radioText: {
    ...typography.body,
    color: colors.grey800,
    marginLeft: spacing.small,
  },
  radioTextSelected: {
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  dateText: {
    ...typography.body,
    color: colors.text,
  },
  placeholderText: {
    ...typography.body,
    color: colors.grey500,
  },
  divider: {
    marginVertical: spacing.small,
  },
  buttonContainer: {
    padding: spacing.standard,
    marginBottom: spacing.extraLarge,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.small,
    marginBottom: spacing.standard,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  cancelButton: {
    borderColor: colors.grey400,
    borderRadius: 25,
    paddingVertical: spacing.small,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.grey700,
  },
});

export default EditProfileScreen;