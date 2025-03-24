import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/actions/profileActions';

const ActivityPreferencesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userType } = useSelector(state => state.profile);
  
  const handleContinue = () => {
    // In a real implementation, we'd collect and dispatch the preferences
    
    // If user selected 'both' and came here from companionship, go to verification
    // If user selected 'activity', go straight to verification
    // Otherwise, continue to companionship (this is fallback, shouldn't happen)
    if (userType === 'both') {
      // This is approximate logic - in a real app, we'd track the flow better
      navigation.navigate('VerificationIntro');
    } else if (userType === 'activity') {
      navigation.navigate('VerificationIntro');
    } else {
      navigation.navigate('CompanionshipPreferences');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Activity Preferences</Text>
        <Text style={styles.subtitle}>Tell us about the activities you enjoy</Text>
        
        {/* Placeholder for activity preference selection UI */}
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Activity preferences selection UI will be implemented here.
          </Text>
        </View>
        
        <Button
          title="Continue"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A80F0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  placeholderContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4A80F0',
    borderRadius: 25,
    height: 50,
  }
});

export default ActivityPreferencesScreen;