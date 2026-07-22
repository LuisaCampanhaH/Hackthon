import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { ScrollView, YStack, XStack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '../theme/ThemeContext';
import { radii, shadow, space } from '../theme/tokens';
import { patients, getPatient, getMedication, type DoseLogEntry } from '../data/mockData';
import type { Navigate } from '../../App';

function nextOccurrence(scheduledTime: string) {
  const [h, m] = scheduledTime.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() < Date.now()) target.setDate(target.getDate() + 1);
  return target;
}

function minutesLate(scheduledTime: string) {
  const [h, m] = scheduledTime.split(':').map(Number);
  const scheduled = new Date();
  scheduled.setHours(h, m, 0, 0);
  return Math.max(1, Math.round((Date.now() - scheduled.getTime()) / 60000));
}

function FadeScaleIn({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [anim]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

function PulseDot({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <YStack width={10} height={10} alignItems="center" justifyContent="center">
      <Animated.View
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.45, 0.12, 0] }),
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
        }}
      />
      <YStack width={10} height={10} borderRadius={5} backgroundColor={color} />
    </YStack>
  );
}

export default function DashboardScreen({
  navigate,
  patientId,
  setActivePatientId,
}: {
  navigate: Navigate;
  patientId: string;
  setActivePatientId: (id: string) => void;
}) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const patient = getPatient(patientId);

  const pendingDoses = patient.doseLog
    .filter((d) => d.status === 'pending')
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const nextDose = pendingDoses[0];
  const nextMed = nextDose ? getMedication(patient, nextDose.medicationId) : undefined;

  const [remaining, setRemaining] = useState(() =>
    nextDose ? nextOccurrence(nextDose.scheduledTime).getTime() - Date.now() : 0
  );
  useEffect(() => {
    if (!nextDose) return;
    const target = nextOccurrence(nextDose.scheduledTime).getTime();
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
    // re-run only when the next dose actually changes, not on every object identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDose?.id]);

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const countdownLabel = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

  function iconFor(dose: DoseLogEntry, isNext: boolean) {
    if (dose.status === 'taken') {
      return (
        <YStack
          width={32}
          height={32}
          borderRadius={16}
          backgroundColor={colors.success}
          alignItems="center"
          justifyContent="center"
        >
          <Feather name="check" size={18} color={colors.onPrimary} />
        </YStack>
      );
    }
    if (dose.status === 'late') {
      return (
        <Pressable onPress={() => navigate('alert', dose.id)}>
          <YStack
            width={32}
            height={32}
            borderRadius={16}
            backgroundColor={colors.warn}
            alignItems="center"
            justifyContent="center"
          >
            <Feather name="clock" size={18} color={colors.onWarn} />
          </YStack>
        </Pressable>
      );
    }
    if (isNext) {
      return (
        <YStack
          width={32}
          height={32}
          borderRadius={16}
          borderWidth={3}
          borderColor={colors.primary}
          alignItems="center"
          justifyContent="center"
        >
          <YStack width={8} height={8} borderRadius={4} backgroundColor={colors.primary} />
        </YStack>
      );
    }
    return (
      <YStack
        width={32}
        height={32}
        borderRadius={16}
        backgroundColor={colors.surface}
        borderWidth={2.5}
        borderColor={colors.border}
      />
    );
  }

  return (
    <YStack flex={1} position="relative">
      <ScrollView
        backgroundColor={colors.bg}
        contentContainerStyle={{ paddingTop: 52, paddingBottom: 12 }}
      >
        <XStack
          paddingHorizontal={space.lg}
          paddingBottom={space.md}
          alignItems="center"
          justifyContent="space-between"
        >
          <Pressable
            onPress={() => setSwitcherOpen((v) => !v)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.surfaceAlt,
              borderRadius: radii.pill,
              paddingVertical: 6,
              paddingRight: 14,
              paddingLeft: 6,
            }}
          >
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={colors.primary}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={colors.onPrimary} fontWeight="700" fontSize={15}>
                {patient.initials}
              </Text>
            </YStack>
            <YStack>
              <Text fontSize={16} fontWeight="700" color={colors.textPrimary}>
                {patient.name}
              </Text>
              <Text fontSize={11.5} color={colors.textSecondary}>
                Trocar paciente
              </Text>
            </YStack>
            <Feather name="chevron-down" size={14} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.textPrimary} />
          </Pressable>
        </XStack>

        <XStack
          marginHorizontal={space.lg}
          marginBottom={space.section}
          paddingVertical={space.sm}
          paddingHorizontal={space.md}
          borderRadius={radii.sm}
          alignItems="center"
          gap={space.sm}
          backgroundColor={patient.device.online ? colors.successTint : colors.warnTint}
        >
          {patient.device.online ? (
            <PulseDot color={colors.success} />
          ) : (
            <YStack width={10} height={10} borderRadius={5} backgroundColor={colors.warn} />
          )}
          <Text
            fontSize={14.5}
            fontWeight="700"
            color={patient.device.online ? colors.successText : colors.warnText}
          >
            {patient.device.online ? 'Dispositivo Online' : 'Dispositivo Offline'}
          </Text>
          <Text fontSize={12.5} color={colors.textMuted}>
            · {patient.device.syncLabel}
          </Text>
        </XStack>

        {patient.device.online && nextMed && nextDose ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginHorizontal: space.lg,
              marginBottom: space.section,
              borderRadius: radii.lg,
              padding: space.cardPad,
              ...shadow.hero,
            }}
          >
            <Text
              fontSize={12}
              fontWeight="700"
              letterSpacing={1}
              color={colors.onPrimary}
              opacity={0.85}
              textTransform="uppercase"
            >
              Próximo medicamento
            </Text>
            <Text fontSize={25} fontWeight="800" color={colors.onPrimary} marginTop={4}>
              {nextMed.name} · {nextMed.dosage}
            </Text>
            <Text fontSize={14.5} color={colors.onPrimary} opacity={0.85} marginTop={4}>
              às {nextDose.scheduledTime}
            </Text>
            <XStack alignItems="flex-end" gap={space.sm} marginTop={space.md}>
              <Text
                fontSize={38}
                fontWeight="800"
                color={colors.onPrimary}
                fontVariant={['tabular-nums']}
              >
                {countdownLabel}
              </Text>
              <Text
                fontSize={14}
                fontWeight="600"
                color={colors.onPrimary}
                opacity={0.85}
                paddingBottom={7}
              >
                até a próxima dose
              </Text>
            </XStack>
          </LinearGradient>
        ) : (
          <YStack
            marginHorizontal={space.lg}
            marginBottom={space.section}
            borderRadius={radii.lg}
            padding={space.cardPad}
            backgroundColor={colors.surfaceAlt}
          >
            <XStack alignItems="center" gap={space.sm}>
              <Feather name="alert-triangle" size={22} color={colors.textSecondary} />
              <Text fontSize={17} fontWeight="700" color={colors.textPrimary}>
                Agenda indisponível
              </Text>
            </XStack>
            <Text fontSize={13.5} color={colors.textSecondary} marginTop={space.xs}>
              Dispositivo offline — não é possível calcular a próxima dose.
            </Text>
          </YStack>
        )}

        <YStack
          marginHorizontal={space.lg}
          backgroundColor={colors.surface}
          borderWidth={1}
          borderColor={colors.border}
          borderRadius={radii.lg}
          padding={space.cardPadSm}
          {...shadow.card}
        >
          <XStack alignItems="center" justifyContent="space-between" marginBottom={space.md}>
            <Text
              fontSize={12.5}
              fontWeight="700"
              color={colors.textMuted}
              textTransform="uppercase"
            >
              Histórico de hoje
            </Text>
            <Pressable
              onPress={() => navigate('manage')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <Feather name="sliders" size={13} color={colors.primary} />
              <Text fontSize={12.5} fontWeight="700" color={colors.primary}>
                Gerenciar
              </Text>
            </Pressable>
          </XStack>
          <YStack gap={2}>
            {patient.doseLog.map((dose) => {
              const med = getMedication(patient, dose.medicationId);
              const isNext = nextDose?.id === dose.id;
              return (
                <XStack key={dose.id} gap={space.md} paddingVertical={space.sm}>
                  {iconFor(dose, isNext)}
                  <YStack flex={1}>
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack gap={space.sm} alignItems="center">
                        <Text
                          fontSize={14.5}
                          fontWeight="700"
                          color={colors.textPrimary}
                          minWidth={44}
                        >
                          {dose.scheduledTime}
                        </Text>
                        <Text fontSize={16.5} fontWeight="700" color={colors.textPrimary}>
                          {med?.name} · {med?.dosage}
                        </Text>
                      </XStack>
                      {dose.status === 'late' && (
                        <Feather name="chevron-right" size={18} color={colors.warnText} />
                      )}
                    </XStack>
                    {dose.status === 'taken' && (
                      <Text fontSize={13} color={colors.successText} marginTop={4}>
                        Tomado às {dose.takenAt}
                      </Text>
                    )}
                    {dose.status === 'late' && (
                      <Pressable onPress={() => navigate('alert', dose.id)}>
                        <Text fontSize={13} color={colors.warnText} marginTop={4}>
                          Atrasado há {minutesLate(dose.scheduledTime)} minutos · toque para ver
                        </Text>
                      </Pressable>
                    )}
                  </YStack>
                </XStack>
              );
            })}
          </YStack>
        </YStack>
      </ScrollView>

      {switcherOpen && (
        <YStack position="absolute" top={112} left={space.lg} right={space.lg}>
          <FadeScaleIn>
            <YStack
              backgroundColor={colors.surface}
              borderWidth={1}
              borderColor={colors.border}
              borderRadius={radii.lg}
              overflow="hidden"
              {...shadow.dropdown}
            >
              {patients
                .filter((p) => p.id !== patientId)
                .map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      setActivePatientId(p.id);
                      setSwitcherOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <YStack
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor={colors.primaryTint}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color={colors.primary} fontWeight="700" fontSize={13.5}>
                        {p.initials}
                      </Text>
                    </YStack>
                    <Text flex={1} fontSize={15.5} fontWeight="700" color={colors.textPrimary}>
                      {p.name}
                    </Text>
                    <YStack
                      width={9}
                      height={9}
                      borderRadius={4.5}
                      backgroundColor={p.device.online ? colors.success : colors.warn}
                    />
                  </Pressable>
                ))}
            </YStack>
          </FadeScaleIn>
        </YStack>
      )}
    </YStack>
  );
}
