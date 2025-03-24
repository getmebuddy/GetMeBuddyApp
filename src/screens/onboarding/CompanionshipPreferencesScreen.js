// src/screens/onboarding/CompanionshipPreferencesScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../store/actions/profileActions';
import { COLORS } from '../../styles/colors';

const CompanionshipPreferencesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userType } = useSelector(state => state.profile);
  
  const [companionshipTypes, setCompanionshipTypes] = useState({
    conversation: false,
    cityExploration: false,
    events: false,
    dining: false,
    local: false,
  });
  
  const [personalityTraits, setPersonalityTraits] = useState({
    outgoing: false,
    thoughtful: false,
    adventurous: false,
    relaxed: false,
    intellectual: false,
  });
  
  const handleSubmit = async () => {
    try {
      await dispatch(updateProfile({
        companionshipDetails: {
          companionshipTypes: Object.keys(companionshipTypes).filter(key => companionshipTypes[key]),
          personalityTraits: Object.keys(personalityTraits).filter(key => personalityTraits[key]),
        }
      }));
      
      if (userType === 'both') {
        navigation.navigate('ActivityPreferences');
      } else {
        navigation.navigate('VerificationIntro');
      }
    } catch (error) {
      console.error('Error updating companionship preferences:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Companionship Preferences</Text>
        <Text style={styles.subtitle}>Let us know what kind of companionship experience you're looking for</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What types of companionship interest you?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          
          <CheckBox
            title="Conversation Partner"
            checked={companionshipTypes.conversation}
            onPress={() => setCompanionshipTypes({
              ...companionshipTypes,
              conversation: !companionshipTypes.conversation
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="City Exploration"
            checked={companionshipTypes.cityExploration}
            onPress={() => setCompanionshipTypes({
              ...companionshipTypes,
              cityExploration: !companionshipTypes.cityExploration
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Events Companion"
            checked={companionshipTypes.events}
            onPress={() => setCompanionshipTypes({
              ...companionshipTypes,
              events: !companionshipTypes.events
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Dining Companion"
            checked={companionshipTypes.dining}
            onPress={() => setCompanionshipTypes({
              ...companionshipTypes,
              dining: !companionshipTypes.dining
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Local Guide"
            checked={companionshipTypes.local}
            onPress={() => setCompanionshipTypes({
              ...companionshipTypes,
              local: !companionshipTypes.local
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What personality traits do you prefer in a companion?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          
          <CheckBox
            title="Outgoing & Energetic"
            checked={personalityTraits.outgoing}
            onPress={() => setPersonalityTraits({
              ...personalityTraits,
              outgoing: !personalityTraits.outgoing
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Thoughtful & Empathetic"
            checked={personalityTraits.thoughtful}
            onPress={() => setPersonalityTraits({
              ...personalityTraits,
              thoughtful: !personalityTraits.thoughtful
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Adventurous & Spontaneous"
            checked={personalityTraits.adventurous}
            onPress={() => setPersonalityTraits({
              ...personalityTraits,
              adventurous: !personalityTraits.adventurous
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Relaxed & Easygoing"
            checked={personalityTraits.relaxed}
            onPress={() => setPersonalityTraits({
              ...personalityTraits,
              relaxed: !personalityTraits.relaxed
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
          
          <CheckBox
            title="Intellectual & Curious"
            checked={personalityTraits.intellectual}
            onPress={() => setPersonalityTraits({
              ...personalityTraits,
              intellectual: !personalityTraits.intellectual
            })}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />
        </View>
        
        <Button
          title="Continue"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleSubmit}
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
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 8,
    marginLeft: 0,
    marginRight: 0,
  },
  checkboxText: {
    fontWeight: 'normal',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    height: 50,
  },
});

export default CompanionshipPreferencesScreen;