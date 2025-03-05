// src/utils/firebase.js
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import { authAPI } from '../api/auth';

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Social authentication with Firebase
export const socialAuth = {
  // Google Sign-In
  googleSignIn: async () => {
    try {
      // Get the ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in with credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Get the Firebase ID token
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Send the token to your backend
      const response = await authAPI.firebaseAuth(firebaseToken);
      
      return response.data;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  },
  
  // Facebook Sign-In
  facebookSignIn: async () => {
    try {
      // Implement Facebook authentication
      // ...
      
      // Get the Firebase ID token and send to backend
      // ...
      
      return response.data;
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
      throw error;
    }
  },
  
  // Apple Sign-In
  appleSignIn: async () => {
    try {
      // Implement Apple authentication
      // ...
      
      // Get the Firebase ID token and send to backend
      // ...
      
      return response.data;
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      throw error;
    }
  },
  
  // Email & Password Sign-In
  emailSignIn: async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Send the token to your backend
      const response = await authAPI.firebaseAuth(firebaseToken);
      
      return response.data;
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  },
  
  // Email & Password Sign-Up
  emailSignUp: async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Send the token to your backend
      const response = await authAPI.firebaseAuth(firebaseToken);
      
      return response.data;
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      throw error;
    }
  },
  
  // Sign Out
  signOut: async () => {
    try {
      await auth().signOut();
      await authAPI.logout();
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  }
};