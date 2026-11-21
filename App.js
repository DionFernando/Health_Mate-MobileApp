import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider, useAppContext } from './src/store/AppContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedStatusBar />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { isDark } = useAppContext();
}
