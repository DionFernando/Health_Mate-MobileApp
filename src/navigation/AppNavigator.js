import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { useRecordController } from '../controllers/RecordController';
import { useAppContext } from '../store/AppContext';
import DashboardScreen from '../views/screens/DashboardScreen';
import RecordFormScreen from '../views/screens/RecordFormScreen';
import RecordListScreen from '../views/screens/RecordListScreen';
import SettingsScreen from '../views/screens/SettingsScreen';
import StartupScreen from '../views/screens/StartupScreen';

import { LinearGradient } from 'expo-linear-gradient';

const HeaderGradient = () => (
  <LinearGradient
    colors={['#0B5D4B', '#009989']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  />
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Dashboard: ['view-dashboard', 'view-dashboard-outline'],
  Records: ['format-list-bulleted', 'format-list-bulleted'],
  Settings: ['cog', 'cog-outline'],
};

function MainTabs() {
  const { colors } = useAppContext();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerBackground: HeaderGradient,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'HealthMate' }} />
      <Tab.Screen name="Records" component={RecordListScreen} options={{ title: 'Health Records', tabBarLabel: 'Records' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { state, colors, isDark } = useAppContext();
  const { refresh } = useRecordController();
  const ready = state.status === 'ready';

  useEffect(() => {
    if (ready) refresh();
  }, [ready]);

  if (!ready) return <StartupScreen />;

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerBackground: HeaderGradient,
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RecordForm" component={RecordFormScreen} options={{ title: 'Add Record' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
