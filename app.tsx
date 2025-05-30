import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store'; // Assuming store/index.ts exports the typed store
import AppNavigator from './src/navigation'; // Assuming navigation/index.tsx exports the typed AppNavigator

// Define the App component type. It takes no props.
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
