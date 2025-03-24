// src/screens/onboarding/UserTypeSelectionScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUserType } from '../../store/actions/profileActions';
import { COLORS } from '../../styles/colors';

const UserTypeSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  const handleSelection = (type) => {
    dispatch(setUserType(type));
    
    if (type === 'activity' || type === 'both') {
      navigation.navigate('ActivityPreferences');
    } else {
      navigation.navigate('CompanionshipPreferences');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>How would you like to use GetMeBuddy?</Text>
          <Text style={styles.subtitle}>Choose the option that best fits your needs</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleSelection('activity')}
        >
          <Image 
            source={require('../../assets/images/activity_icon.png')} 
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Find Activity Partners</Text>
            <Text style={styles.optionDescription}>
              Connect with others who share your interests for specific activities
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleSelection('companion')}
        >
          <Image 
            source={require('../../assets/images/companion_icon.png')} 
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Connect with Companions</Text>
            <Text style={styles.optionDescription}>
              Find verified companions to spend quality time with
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionCard} 
          onPress={() => handleSelection('both')}
        >
          <Image 
            source={require('../../assets/images/both_icon.png')} 
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Both Options</Text>
            <Text style={styles.optionDescription}>
              Use GetMeBuddy for both activities and companionship
            </Text>
          </View>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
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
  optionIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default UserTypeSelectionScreen;