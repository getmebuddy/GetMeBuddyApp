import { Platform } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes as GoogleStatusCodes } from '@react-native-google-signin/google-signin';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next'; // Example for Facebook
// import { appleAuth } from '@invertase/react-native-apple-authentication'; // Example for Apple

import { authAPI, LoginResponse as BackendLoginResponse } from '../api/auth'; // Assuming LoginResponse from your backend API

// Interface for the firebaseConfig object (though not used for @R<y_bin_359>NFB initialization)
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  // measurementId?: string; // Optional, for Analytics
}

// This config is usually for web Firebase SDK, or for reference.
// @react-native-firebase uses native configuration files (google-services.json, GoogleService-Info.plist).
export const firebaseConfig: FirebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with actual values if used for other purposes
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Configure Google Sign-In (typically in your app's entry point)
// GoogleSignin.configure({
//   webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_SERVICES_JSON', // From google-services.json
//   offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
// });


// Type for the expected return data from successful social auth methods after backend call
// This should match your backend's response structure for firebaseAuth endpoint.
// Using BackendLoginResponse imported from api/auth.ts
type SocialAuthResponseData = BackendLoginResponse;


export const socialAuth = {
  googleSignIn: async (): Promise<SocialAuthResponseData | null> => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) {
        throw new Error("Google Sign-In failed to get ID token.");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential: FirebaseAuthTypes.UserCredential = await auth().signInWithCredential(googleCredential);

      if (!userCredential.user) {
        throw new Error("Firebase user not found after Google Sign-In.");
      }

      const firebaseToken: string = await userCredential.user.getIdToken();
      const response = await authAPI.firebaseAuth(firebaseToken); // Expects AxiosResponse<BackendLoginResponse>

      return response.data;
    } catch (error: any) {
      if (error.code === GoogleStatusCodes.SIGN_IN_CANCELLED) {
        console.log('Google Sign-In cancelled by user');
      } else if (error.code === GoogleStatusCodes.IN_PROGRESS) {
        console.log('Google Sign-In already in progress');
      } else if (error.code === GoogleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('Google Play Services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error.code, error.message);
      }
      // Do not rethrow the error to allow UI to handle null response gracefully, or rethrow if preferred
      return null;
    }
  },

  // Facebook Sign-In (Placeholder - actual implementation needed)
  facebookSignIn: async (): Promise<SocialAuthResponseData | null> => {
    try {
      // const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      // if (result.isCancelled) {
      //   console.log('Facebook Sign-In cancelled'); return null;
      // }
      // const data = await AccessToken.getCurrentAccessToken();
      // if (!data?.accessToken) {
      //   throw new Error('Something went wrong obtaining the Facebook access token');
      // }
      // const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      // const userCredential = await auth().signInWithCredential(facebookCredential);
      // const firebaseToken = await userCredential.user.getIdToken();
      // const response = await authAPI.firebaseAuth(firebaseToken);
      // return response.data;
      console.warn('Facebook Sign-In not implemented');
      return null; // Placeholder
    } catch (error: any) {
      console.error('Facebook Sign-In Error:', error);
      return null;
    }
  },

  // Apple Sign-In (Placeholder - actual implementation needed)
  appleSignIn: async (): Promise<SocialAuthResponseData | null> => {
    try {
      // const appleAuthRequestResponse = await appleAuth.performRequest({ ... });
      // const { identityToken } = appleAuthRequestResponse;
      // if (!identityToken) { throw new Error('Apple Sign-In failed to get ID token.'); }
      // const appleCredential = auth.AppleAuthProvider.credential(identityToken, rawNonce); // Nonce handling needed
      // const userCredential = await auth().signInWithCredential(appleCredential);
      // const firebaseToken = await userCredential.user.getIdToken();
      // const response = await authAPI.firebaseAuth(firebaseToken);
      // return response.data;
      console.warn('Apple Sign-In not implemented');
      return null; // Placeholder
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      return null;
    }
  },

  emailSignIn: async (email: string, password: string): Promise<SocialAuthResponseData | null> => {
    try {
      const userCredential: FirebaseAuthTypes.UserCredential = await auth().signInWithEmailAndPassword(email, password);
      if (!userCredential.user) {
        throw new Error("Firebase user not found after email sign-in.");
      }
      const firebaseToken: string = await userCredential.user.getIdToken();
      const response = await authAPI.firebaseAuth(firebaseToken);
      return response.data;
    } catch (error: any) {
      console.error('Email Sign-In Error:', error.code, error.message);
      // Consider mapping Firebase error codes to user-friendly messages
      throw error; // Rethrow to be handled by calling UI
    }
  },

  emailSignUp: async (email: string, password: string): Promise<SocialAuthResponseData | null> => {
    try {
      const userCredential: FirebaseAuthTypes.UserCredential = await auth().createUserWithEmailAndPassword(email, password);
      if (!userCredential.user) {
        throw new Error("Firebase user not created after email sign-up.");
      }
      const firebaseToken: string = await userCredential.user.getIdToken();
      // Typically, after sign-up, you might want to create a profile on your backend
      // The firebaseAuth endpoint might handle this if it creates a user on first token validation
      const response = await authAPI.firebaseAuth(firebaseToken);
      return response.data;
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error.code, error.message);
      // Consider mapping Firebase error codes (e.g., 'auth/email-already-in-use')
      throw error; // Rethrow
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await GoogleSignin.signOut(); // Sign out from Google
      // await LoginManager.logOut(); // Sign out from Facebook
      await auth().signOut(); // Sign out from Firebase
      // No need to call authAPI.logout() if it primarily clears local tokens/state managed by Redux/frontend.
      // If authAPI.logout() invalidates a backend session token, then it's appropriate here.
      // Assuming authAPI.logout() is for backend session, and frontend state is cleared by Redux logout action.
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      // Don't rethrow usually, as sign out should try to complete as much as possible
    }
  },

  getCurrentFirebaseUser: (): FirebaseAuthTypes.User | null => {
    return auth().currentUser;
  },

  onAuthStateChanged: (listener: (user: FirebaseAuthTypes.User | null) => void): (() => void) => {
    return auth().onAuthStateChanged(listener);
  },
};

// It's good practice to initialize Firebase related services (like GoogleSignin.configure)
// at the app's entry point (e.g., App.tsx or index.js) rather than in a utility file,
// but this depends on the project structure.
