import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, YStack, XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import tamaguiConfig from './tamagui.config';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { space } from './src/theme/tokens';
import { patients, scheduleSeedNotifications } from './src/data/mockData';
import { setupNotifications } from './src/notifications';
import ScreenTransition from './src/components/ScreenTransition';
import DashboardScreen from './src/screens/DashboardScreen';
import AddMedicationScreen from './src/screens/AddMedicationScreen';
import ManageMedicationsScreen from './src/screens/ManageMedicationsScreen';
import AlertScreen from './src/screens/AlertScreen';
import ReportScreen from './src/screens/ReportScreen';

export type ScreenName = 'dashboard' | 'add' | 'manage' | 'alert' | 'report';
export type Navigate = (screen: ScreenName, doseId?: string, medicationId?: string) => void;

function AppShell() {
  const { colors, isDark } = useAppTheme();
  const [screen, setScreen] = useState<ScreenName>('dashboard');
  const [activePatientId, setActivePatientId] = useState(patients[0].id);
  const [alertDoseId, setAlertDoseId] = useState<string | undefined>();
  const [editMedicationId, setEditMedicationId] = useState<string | undefined>();

  const navigate: Navigate = (next, doseId, medicationId) => {
    if (doseId) setAlertDoseId(doseId);
    setEditMedicationId(medicationId);
    setScreen(next);
  };

  useEffect(() => {
    setupNotifications().then((granted) => {
      if (granted) scheduleSeedNotifications();
    });
  }, []);

  const screenProps = { navigate, patientId: activePatientId, setActivePatientId };

  return (
    <YStack flex={1} backgroundColor={colors.bg}>
      <YStack flex={1}>
        {screen === 'dashboard' && (
          <ScreenTransition key="dashboard">
            <DashboardScreen {...screenProps} />
          </ScreenTransition>
        )}
        {screen === 'add' && (
          <ScreenTransition key={`add-${editMedicationId ?? 'new'}`}>
            <AddMedicationScreen {...screenProps} medicationId={editMedicationId} />
          </ScreenTransition>
        )}
        {screen === 'manage' && (
          <ScreenTransition key="manage">
            <ManageMedicationsScreen {...screenProps} />
          </ScreenTransition>
        )}
        {screen === 'alert' && (
          <ScreenTransition key="alert">
            <AlertScreen navigate={navigate} patientId={activePatientId} doseId={alertDoseId} />
          </ScreenTransition>
        )}
        {screen === 'report' && (
          <ScreenTransition key="report">
            <ReportScreen navigate={navigate} patientId={activePatientId} />
          </ScreenTransition>
        )}
      </YStack>

      {screen !== 'alert' && (
        <XStack
          alignItems="stretch"
          justifyContent="space-around"
          backgroundColor={colors.surface}
          borderTopWidth={1}
          borderTopColor={colors.border}
          paddingHorizontal={space.sm}
          paddingTop={space.sm}
          paddingBottom={30}
        >
          <Pressable
            onPress={() => setScreen('dashboard')}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 52,
            }}
          >
            <Feather
              name="home"
              size={23}
              color={screen === 'dashboard' ? colors.primary : colors.tabInactive}
            />
            <Text
              fontSize={11}
              fontWeight={screen === 'dashboard' ? '700' : '600'}
              color={screen === 'dashboard' ? colors.primary : colors.tabInactive}
            >
              Início
            </Text>
          </Pressable>

          <YStack flex={1} alignItems="center" justifyContent="flex-start">
            <Pressable
              onPress={() => setScreen('add')}
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                marginTop: -30,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.22,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Feather name="plus" size={23} color={colors.onPrimary} />
            </Pressable>
            <Text fontSize={11} fontWeight="700" color={colors.textSecondary} marginTop={2}>
              Adicionar
            </Text>
          </YStack>

          <Pressable
            onPress={() => setScreen('report')}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 52,
            }}
          >
            <Feather
              name="bar-chart-2"
              size={23}
              color={screen === 'report' ? colors.primary : colors.tabInactive}
            />
            <Text
              fontSize={11}
              fontWeight={screen === 'report' ? '700' : '600'}
              color={screen === 'report' ? colors.primary : colors.tabInactive}
            >
              Relatório
            </Text>
          </Pressable>
        </XStack>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </YStack>
  );
}

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </TamaguiProvider>
  );
}
