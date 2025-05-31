import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';

import { verifyEmail, verifyPhone, submitPhotoForVerification } from '../../store/actions/verificationActions'; // Assume typed
import ImageUploader, { ImageObject } from '../../components/common/ImageUploader'; // Assuming ImageObject is exported
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { UserProfile } from '../../models/UserProfile';
import { VerificationStackParamList } from '../../navigation'; // Assuming this screen is in VerificationStack

// Types
type VerificationStatusState = 'complete' | 'in-progress' | 'pending';

interface VerificationStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
  status: VerificationStatusState;
  onPress?: () => void; // Optional if not all steps are pressable when not complete
  isExpanded?: boolean; // To control if content is visible
}

const VerificationStep: React.FC<VerificationStepProps> = ({ title, description, children, status, onPress, isExpanded }) => {
  const getStatusIconName = () => {
    if (status === 'complete') return 'check-circle';
    if (status === 'in-progress') return 'ellipse-outline'; // Or 'progress-check', 'timer-sand'
    return 'radio-button-off'; // Or 'circle-outline' for material-community
  };
  const getStatusIconType = () => (status === 'in-progress' || status === 'pending') ? 'ionicon' : 'material';


  const getStatusColor = () => {
    if (status === 'complete') return COLORS.success;
    if (status === 'in-progress') return COLORS.warning; // Changed to warning for in-progress
    return COLORS.grey400;
  };

  return (
    <View style={styles.stepOuterContainer}>
      <TouchableOpacity style={styles.stepHeader} onPress={onPress} disabled={status === 'complete' || !onPress}>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>{title}</Text>
          <Icon name={getStatusIconName()} type={getStatusIconType()} size={22} color={getStatusColor()} />
        </View>
        <Text style={styles.stepDescription}>{description}</Text>
      </TouchableOpacity>
      {(isExpanded && status !== 'complete') && <View style={styles.stepContent}>{children}</View>}
    </View>
  );
};

type BasicVerificationScreenProps = StackScreenProps<VerificationStackParamList, 'BasicVerification'>;

const BasicVerificationScreen: React.FC<BasicVerificationScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const verificationStatusData = useSelector((state: RootState) => state.verification.verificationStatus); // Assuming this structure
  const loading = useSelector((state: RootState) => state.verification.loading);
  const user = useSelector((state: RootState) => state.auth.user as UserProfile | null);

  const [currentStep, setCurrentStep] = useState<string | null>(null); // To expand one step at a time

  const [email, setEmail] = useState<string>(user?.email || '');
  const [emailCode, setEmailCode] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [phone, setPhone] = useState<string>(user?.phoneNumber || '');
  const [phoneCode, setPhoneCode] = useState<string>('');
  const [phoneSent, setPhoneSent] = useState<boolean>(false);

  const [photos, setPhotos] = useState<ImageObject[]>([]);

  // Determine status for each step based on Redux state
  const emailStatus: VerificationStatusState = verificationStatusData?.emailVerified ? 'complete' : emailSent ? 'in-progress' : 'pending';
  const phoneStatus: VerificationStatusState = verificationStatusData?.phoneVerified ? 'complete' : phoneSent ? 'in-progress' : 'pending';
  const photoStatus: VerificationStatusState = verificationStatusData?.photoVerified ? 'complete' : photos.length > 0 ? 'in-progress' : 'pending';


  const handleSendEmailCode = async () => {
    if (!email.trim()) { Alert.alert("Validation", "Please enter your email address."); return; }
    // dispatch(requestEmailVerificationCode(email)); // Example action
    setEmailSent(true); setCurrentStep('email'); // Expand this step
    Alert.alert("Code Sent", `A verification code has been sent to ${email} (simulated).`);
  };

  const handleVerifyEmailWithCode = async () => {
    if (!emailCode.trim() || emailCode.length < 6) { Alert.alert("Validation", "Please enter a valid 6-digit code."); return; }
    try { await dispatch(verifyEmail(email, emailCode)); setEmailSent(false); /* setEmailCode(''); // Optional: clear code on success */ }
    catch (error) { console.error('Email verification failed:', error); Alert.alert("Error", "Email verification failed.");}
  };

  const handleSendPhoneCode = async () => {
    if (!phone.trim()) { Alert.alert("Validation", "Please enter your phone number."); return; }
    // dispatch(requestPhoneVerificationCode(phone)); // Example action
    setPhoneSent(true); setCurrentStep('phone'); // Expand this step
    Alert.alert("Code Sent", `A verification code has been sent to ${phone} (simulated).`);
  };

  const handleVerifyPhoneWithCode = async () => {
    if (!phoneCode.trim() || phoneCode.length < 6) { Alert.alert("Validation", "Please enter a valid 6-digit code."); return; }
    try { await dispatch(verifyPhone(phone, phoneCode)); setPhoneSent(false); /* setPhoneCode(''); */ }
    catch (error) { console.error('Phone verification failed:', error); Alert.alert("Error", "Phone verification failed."); }
  };

  const handleSubmitPhoto = async () => {
    if (photos.length === 0) { Alert.alert("Validation", "Please upload a photo."); return; }
    try { await dispatch(submitPhotoForVerification(photos[0])); /* setPhotos([]); */ } // Assuming action takes one photo
    catch (error) { console.error('Photo submission failed:', error); Alert.alert("Error", "Photo submission failed."); }
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor: COLORS.background}}>
    <ScrollView style={styles.container}>
      <View style={styles.pageHeader}>
        <Icon name="shield-check-outline" type="material-community" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Basic Verification</Text>
        <Text style={styles.subtitle}>Complete these steps to enhance your profile's trustworthiness.</Text>
      </View>

      <VerificationStep title="Email Verification" description="Confirm your email address." status={emailStatus} onPress={() => emailStatus !== 'complete' && setCurrentStep('email')} isExpanded={currentStep === 'email'}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!emailSent && emailStatus !== 'complete'} />
          <Button title={emailSent ? "Resend Code" : "Send Code"} type="outline" buttonStyle={styles.sendButton} titleStyle={styles.sendButtonTitle} onPress={handleSendEmailCode} disabled={emailSent || emailStatus === 'complete' || loading} loading={loading && emailSent && currentStep === 'email'}/>
        </View>
        {emailSent && emailStatus === 'in-progress' && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>Enter the 6-digit code sent to {email}.</Text>
            <View style={styles.codeInputContainer}>
              <TextInput style={styles.codeInput} placeholder="______" value={emailCode} onChangeText={setEmailCode} keyboardType="number-pad" maxLength={6} />
              <Button title="Verify Email" buttonStyle={styles.verifyButton} onPress={handleVerifyEmailWithCode} disabled={!emailCode || emailCode.length < 6 || loading} loading={loading && currentStep === 'email'} />
            </View>
          </View>
        )}
      </VerificationStep>

      <VerificationStep title="Phone Number Verification" description="Confirm your phone number." status={phoneStatus} onPress={() => phoneStatus !== 'complete' && setCurrentStep('phone')} isExpanded={currentStep === 'phone'}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Your phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!phoneSent && phoneStatus !== 'complete'} />
          <Button title={phoneSent ? "Resend Code" : "Send Code"} type="outline" buttonStyle={styles.sendButton} titleStyle={styles.sendButtonTitle} onPress={handleSendPhoneCode} disabled={phoneSent || phoneStatus === 'complete' || loading} loading={loading && phoneSent && currentStep === 'phone'}/>
        </View>
        {phoneSent && phoneStatus === 'in-progress' && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>Enter the 6-digit code sent to {phone}.</Text>
            <View style={styles.codeInputContainer}>
              <TextInput style={styles.codeInput} placeholder="______" value={phoneCode} onChangeText={setPhoneCode} keyboardType="number-pad" maxLength={6} />
              <Button title="Verify Phone" buttonStyle={styles.verifyButton} onPress={handleVerifyPhoneWithCode} disabled={!phoneCode || phoneCode.length < 6 || loading} loading={loading && currentStep === 'phone'} />
            </View>
          </View>
        )}
      </VerificationStep>

      <VerificationStep title="Profile Photo" description="Upload a clear photo of yourself." status={photoStatus} onPress={() => photoStatus !== 'complete' && setCurrentStep('photo')} isExpanded={currentStep === 'photo'}>
        <ImageUploader images={photos} onImagesChanged={setPhotos} maxImages={1} title="" instructions="Ensure your face is clearly visible." />
        {photos.length > 0 && photoStatus === 'in-progress' && <Button title="Submit Photo" buttonStyle={styles.submitButton} containerStyle={styles.submitButtonContainer} onPress={handleSubmitPhoto} loading={loading && currentStep === 'photo'} disabled={loading} />}
      </VerificationStep>

      <Button title="Back to Verification Overview" type="clear" containerStyle={styles.backButtonContainer} titleStyle={TYPOGRAPHY.buttonLink} onPress={() => navigation.goBack()} />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageHeader: { alignItems: 'center', paddingVertical: SPACING.medium, marginBottom: SPACING.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginBottom: SPACING.xsmall, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.medium },
  stepOuterContainer: { marginBottom: SPACING.medium, backgroundColor: COLORS.white, borderRadius: 10, elevation: 1, shadowColor: COLORS.black, shadowOpacity: 0.05, shadowOffset: {width:0, height:1}, shadowRadius: 2, overflow: 'hidden' },
  stepHeader: { padding: SPACING.medium, borderBottomWidth: 1, borderBottomColor: COLORS.grey100 },
  stepTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xsmall },
  stepTitle: { ...TYPOGRAPHY.h3, color: COLORS.textEmphasis },
  stepDescription: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  stepContent: { padding: SPACING.medium },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small },
  input: { flex: 1, height: 48, borderColor: COLORS.grey300, borderWidth: 1, borderRadius: 8, paddingHorizontal: SPACING.medium, marginRight: SPACING.small, backgroundColor: COLORS.white, ...TYPOGRAPHY.body },
  sendButton: { borderColor: COLORS.primary, height: 48, paddingHorizontal:SPACING.small },
  sendButtonTitle: { ...TYPOGRAPHY.buttonSmall, color: COLORS.primary },
  verificationContainer: { backgroundColor: COLORS.lightPrimaryBackground, padding: SPACING.medium, borderRadius: 8, marginTop: SPACING.small },
  verificationText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.medium },
  codeInputContainer: { flexDirection: 'row', alignItems: 'center' },
  codeInput: { flex: 1, height: 48, borderColor: COLORS.grey300, borderWidth: 1, borderRadius: 8, paddingHorizontal: SPACING.medium, marginRight: SPACING.small, fontSize: 18, textAlign: 'center', letterSpacing: 3, backgroundColor: COLORS.white, ...TYPOGRAPHY.body },
  verifyButton: { backgroundColor: COLORS.primary, height: 48 },
  submitButton: { backgroundColor: COLORS.primary, height: 48 },
  submitButtonContainer: { marginTop: SPACING.medium },
  backButtonContainer: { marginVertical: SPACING.medium, alignItems: 'center' },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h3: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 16 }, body: { fontSize: 14 },
  buttonLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  buttonSmall: { fontSize: 14, fontWeight: 'bold' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', black: '#000000', background: '#F4F6F8',
  text: '#333333', textEmphasis: '#111111', textSecondary: '#555555',
  success: '#28a745', warning: '#FB8C00', error: '#D32F2F',
  grey100: '#F3F4F6', grey300: '#D1D5DB', grey400: '#9CA3AF',
  lightPrimaryBackground: '#E0E7FF',
  ...COLORS,
};

export default BasicVerificationScreen;
