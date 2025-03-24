import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { completeOnboarding } from '../../store/actions/profileActions';

const VerificationIntroScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userType } = useSelector(state => state.profile);
  
  const isCompanionType = userType === 'companion' || userType === 'both';
  
  const handleContinue = () => {
    dispatch(completeOnboarding());
    navigation.navigate('Verification');
  };
  
  const handleSkip = () => {
    dispatch(completeOnboarding());
    navigation.navigate('Main');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Trust & Safety Verification</Text>
        <Text style={styles.subtitle}>
          GetMeBuddy prioritizes your safety with our comprehensive verification system
        </Text>
        
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Verification introduction content will appear here.
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Required Verification</Text>
          <Text style={styles.infoText}>
            {isCompanionType 
              ? 'As a companion, you will need to complete all verification levels before being visible to others.' 
              : 'Basic verification is required for all users to ensure safety.'}
          </Text>
        </View>
        
        <Button
          title="Start Verification"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={handleContinue}
        />
        
        {!isCompanionType && (
          <Button
            title="Skip for Now"
            type="clear"
            containerStyle={styles.skipButtonContainer}
            titleStyle={styles.skipButtonTitle}
            onPress={handleSkip}
          />
        )}
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
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
  infoBox: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A80F0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4A80F0',
    borderRadius: 25,
    height: 50,
  },
  skipButtonContainer: {
    marginBottom: 20,
  },
  skipButtonTitle: {
    color: '#888',
  }
});

export default VerificationIntroScreen;