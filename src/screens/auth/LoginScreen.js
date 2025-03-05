// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/actions/authActions';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      await dispatch(login(email, password));
      // Navigation happens automatically via auth state change
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
          
          <Input
            placeholder="Password"
            leftIcon={<Icon name="lock" type="material" size={24} color="gray" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon 
                  name={showPassword ? "visibility-off" : "visibility"} 
                  type="material" 
                  size={24} 
                  color="gray" 
                />
              </TouchableOpacity>
            }
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <Button
            title="Login"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            onPress={handleLogin}
            loading={loading}
          />
          
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4A80F0',
    borderRadius: 25,
    height: 50,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#4A80F0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#888',
  },
  signupText: {
    color: '#4A80F0',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
  }
});

export default LoginScreen;