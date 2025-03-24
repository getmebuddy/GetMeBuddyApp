// src/screens/onboarding/VerificationIntroScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { completeOnboarding } from '../../store/actions/profileActions';
import { COLORS } from '../../styles/colors';

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
        <Image 
          source={require('../../assets/images/verification_intro.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Trust & Safety Verification</Text>
        <Text style={styles.subtitle}>
          GetMeBuddy prioritizes your safety with our comprehensive verification system
        </Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.feature}>
            <Icon name="check-circle" type="material" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Basic verification for all users</Text>
          </View>
          
          <View style={styles.feature}>
            <Icon name="check-circle" type="material" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Enhanced verification for more trust</Text>
          </View>
          
          {isCompanionType && (
            <View style={styles.feature}>
              <Icon name="check-circle" type="material" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Premium verification required for companions</Text>
            </View>
          )}
          
          <View style={styles.feature}>
            <Icon name="check-circle" type="material" size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Verification badges build confidence</Text>
          </View>
        </View>
        
        <View style={styles.requiredSection}>
          <Text style={styles.requiredTitle}>Required Verification</Text>
          <Text style={styles.requiredText}>
            {isCompanionType 
              ? 'As a companion, you'll need to complete all verification levels before being visible to others.' 
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
    alignItems: 'center',
  },
  headerImage: {
    width: '80%',
    height: 200,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  featureContainer: {
    width: '100%',
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  requiredSection: {
    width: '100%',
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  requiredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  requiredText: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    height: 50,
  },
  skipButtonContainer: {
    width: '100%',
  },
  skipButtonTitle: {
    color: '#888',
  },
});

export default VerificationIntroScreen;