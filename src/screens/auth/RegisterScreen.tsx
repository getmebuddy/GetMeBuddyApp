import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/actions/authActions';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await dispatch(register(email, password));
    } catch (error) {
      // Error handling is done in the reducer
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>GetMeBuddy</Text>
          <Text style={styles.tagline}>Find your perfect activity partner</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Email"
            leftIcon={<Icon name="email" type="material" size={24} color="gray" />}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007bff',
  },
  tagline: {
    fontSize: 16,
    color: 'gray',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});

export default RegisterScreen;
