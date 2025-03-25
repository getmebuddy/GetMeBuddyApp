import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUserType } from '../../store/actions/profileActions';

const UserTypeSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  const handleSelection = (type) => {
    dispatch(setUserType(type));
    
    // Navigate based on selection
    if (type === 'activity') {
      navigation.navigate('ActivityPreferences');
    } else if (type === 'companion') {
      navigation.navigate('CompanionshipPreferences');
    } else {
      // For 'both', we'll go to activity preferences first
      navigation.navigate('ActivityPreferences');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>How would you like to use GetMeBuddy?</Text>
      <Text style={styles.subtitle}>Choose the option that best fits your needs</Text>
      
      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => handleSelection('activity')}
      >
        <Text style={styles.optionTitle}>Find Activity Partners</Text>
        <Text style={styles.optionDescription}>
          Connect with others for specific activities based on shared interests
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => handleSelection('companion')}
      >
        <Text style={styles.optionTitle}>Connect with Companions</Text>
        <Text style={styles.optionDescription}>
          Find verified companions to spend time with in various settings
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => handleSelection('both')}
      >
        <Text style={styles.optionTitle}>Both Options</Text>
        <Text style={styles.optionDescription}>
          Use GetMeBuddy for both activities and companionship
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => handleSelection('activity')}
      >
        <Icon name="directions-run" type="material" size={30} color="#4A80F0" />
        <Text style={styles.optionTitle}>Find Activity Partners</Text>
        <Text style={styles.optionDescription}>
          Connect with verified buddies for hiking, gaming, sports, or any activity you enjoy
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4A80F0',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionCard: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  }
});

export default UserTypeSelectionScreen;