// src/screens/verification/BasicVerificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, verifyPhone } from '../../store/actions/verificationActions';
import ImageUploader from '../../components/common/ImageUploader';
import { COLORS } from '../../styles/colors';

const VerificationStep = ({ title, description, children, status, onPress }) => {
  const getStatusIcon = () => {
    if (status === 'complete') return 'check-circle';
    if (status === 'in-progress') return 'pending';
    return 'circle';
  };
  
  const getStatusColor = () => {
    if (status === 'complete') return COLORS.success;
    if (status === 'in-progress') return COLORS.primary;
    return '#ccc';
  };
  
  return (
    <TouchableOpacity style={styles.stepContainer} onPress={onPress} disabled={status === 'complete'}>
      <View style={styles.stepHeader}>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>{title}</Text>
          <Icon 
            name={getStatusIcon()} 
            type="material" 
            size={20} 
            color={getStatusColor()} 
          />
        </View>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
      
      {status !== 'complete' && (
        <View style={styles.stepContent}>
          {children}
        </View>
      )}
    </TouchableOpacity>
  );
};

const BasicVerificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { verificationStatus, loading } = useSelector(state => state.verification);
  const { user } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState(user?.email || '');
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);
  
  const [photos, setPhotos] = useState([]);
  
  const sendEmailCode = () => {
    // In a real app, this would call an API to send verification code
    setEmailSent(true);
  };
  
  const verifyEmailWithCode = async () => {
    try {
      await dispatch(verifyEmail(email, emailCode));
    } catch (error) {
      console.error('Email verification failed:', error);
    }
  };
  
  const sendPhoneCode = () => {
    // In a real app, this would call an API to send verification code
    setPhoneSent(true);
  };
  
  const verifyPhoneWithCode = async () => {
    try {
      await dispatch(verifyPhone(phone, phoneCode));
    } catch (error) {
      console.error('Phone verification failed:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Basic Verification</Text>
      <Text style={styles.subtitle}>Complete these steps to verify your basic information</Text>
      
      <VerificationStep
        title="Email Verification"
        description="Verify your email address"
        status={verificationStatus.emailVerified ? 'complete' : emailSent ? 'in-progress' : 'pending'}
        onPress={() => {}}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Send Code"
            type="outline"
            buttonStyle={styles.sendButton}
            titleStyle={styles.sendButtonTitle}
            onPress={sendEmailCode}
            disabled={!email || emailSent}
          />
        </View>
        
        {emailSent && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>
              We've sent a verification code to {email}
            </Text>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter code"
                value={emailCode}
                onChangeText={setEmailCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button
                title="Verify"
                buttonStyle={styles.verifyButton}
                onPress={verifyEmailWithCode}
                disabled={!emailCode || emailCode.length < 6}
                loading={loading}
              />
            </View>
          </View>
        )}
      </VerificationStep>
      
      <VerificationStep
        title="Phone Verification"
        description="Verify your phone number"
        status={verificationStatus.phoneVerified ? 'complete' : phoneSent ? 'in-progress' : 'pending'}
        onPress={() => {}}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button
            title="Send Code"
            type="outline"
            buttonStyle={styles.sendButton}
            titleStyle={styles.sendButtonTitle}
            onPress={sendPhoneCode}
            disabled={!phone || phoneSent}
          />
        </View>
        
        {phoneSent && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>
              We've sent a verification code to {phone}
            </Text>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter code"
                value={phoneCode}
                onChangeText={setPhoneCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button
                title="Verify"
                buttonStyle={styles.verifyButton}
                onPress={verifyPhoneWithCode}
                disabled={!phoneCode || phoneCode.length < 6}
                loading={loading}
              />
            </View>
          </View>
        )}
      </VerificationStep>
      
      <VerificationStep
        title="Profile Photo Verification"
        description="Upload a clear photo of yourself"
        status={verificationStatus.photoVerified ? 'complete' : photos.length > 0 ? 'in-progress' : 'pending'}
        onPress={() => {}}
      >
        <ImageUploader
          images={photos}
          onImagesChanged={setPhotos}
          maxImages={1}
          title="Upload Profile Photo"
          instructions="Upload a clear, well-lit photo of your face"
        />
        
        {photos.length > 0 && (
          <Button
            title="Submit Photo for Verification"
            buttonStyle={styles.submitButton}
            containerStyle={styles.submitButtonContainer}
            onPress={() => {
              // In a real app, this would upload the photo for verification
              // For now, we'll just navigate back
              navigation.goBack();
            }}
          />
        )}
      </VerificationStep>
      
      <Button
        title="Return to Verification Center"
        type="clear"
        containerStyle={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  stepContainer: {
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepHeader: {
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  stepTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  stepContent: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    borderColor: COLORS.primary,
    height: 50,
  },
  sendButtonTitle: {
    color: COLORS.primary,
  },
  verificationContainer: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 10,
  },
  verificationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 18,
    letterSpacing: 5,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
  },
  submitButtonContainer: {
    marginTop: 15,
  },
  backButtonContainer: {
    marginVertical: 20,
  },
});

export default BasicVerificationScreen;