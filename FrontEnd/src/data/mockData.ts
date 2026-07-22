// Simulated global app state. The ESP32 box will replace this with real
// device telemetry later — for now it's just an in-memory mock store.

import { cancelDoseNotifications, scheduleDoseNotifications } from '../notifications';

export interface DeviceStatus {
  online: boolean;
  syncLabel: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  stock: number;
  times: string[]; // "HH:mm", one per daily dose
}

export type DoseStatus = 'pending' | 'taken' | 'late';

export interface DoseLogEntry {
  id: string;
  medicationId: string;
  scheduledTime: string; // "HH:mm"
  status: DoseStatus;
  takenAt?: string; // "HH:mm"
  notifyId?: string; // scheduled local notification for the dose time
  lateNotifyId?: string; // scheduled local notification for the late reminder
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  device: DeviceStatus;
  medications: Medication[];
  doseLog: DoseLogEntry[];
}

export interface AdherenceDay {
  label: string;
  taken: number;
  missed: number;
}

export const patients: Patient[] = [
  {
    id: 'p1',
    name: 'Maria Oliveira',
    initials: 'MO',
    device: { online: true, syncLabel: 'sincronizado há 2 min' },
    medications: [
      { id: 'med-1', name: 'Losartana', dosage: '50mg', stock: 24, times: ['08:00', '20:00'] },
      { id: 'med-2', name: 'Metformina', dosage: '850mg', stock: 12, times: ['12:00'] },
      { id: 'med-3', name: 'Sinvastatina', dosage: '20mg', stock: 30, times: ['21:00'] },
    ],
    doseLog: [
      {
        id: 'dose-1',
        medicationId: 'med-1',
        scheduledTime: '08:00',
        status: 'taken',
        takenAt: '08:03',
      },
      { id: 'dose-2', medicationId: 'med-2', scheduledTime: '12:00', status: 'late' },
      { id: 'dose-3', medicationId: 'med-1', scheduledTime: '20:00', status: 'pending' },
      { id: 'dose-4', medicationId: 'med-3', scheduledTime: '21:00', status: 'pending' },
    ],
  },
  {
    id: 'p2',
    name: 'José Ferreira',
    initials: 'JF',
    device: { online: false, syncLabel: 'offline há 3 horas' },
    medications: [
      { id: 'med-4', name: 'AAS Infantil', dosage: '100mg', stock: 18, times: ['13:15'] },
    ],
    doseLog: [{ id: 'dose-5', medicationId: 'med-4', scheduledTime: '13:15', status: 'pending' }],
  },
];

export const weeklyAdherence: AdherenceDay[] = [
  { label: 'Seg', taken: 6, missed: 0 },
  { label: 'Ter', taken: 6, missed: 0 },
  { label: 'Qua', taken: 5, missed: 1 },
  { label: 'Qui', taken: 6, missed: 0 },
  { label: 'Sex', taken: 5, missed: 1 },
  { label: 'Sáb', taken: 6, missed: 0 },
  { label: 'Dom', taken: 5, missed: 1 },
];

export const adherenceStats = { scheduled: 42, onTime: 40, late: 2 };
export const streakDays = 7;

export function getPatient(id: string) {
  return patients.find((p) => p.id === id)!;
}

export function addMedication(
  patientId: string,
  input: { name: string; dosage: string; stock: number; times: string[] }
) {
  const patient = getPatient(patientId);
  const med: Medication = { ...input, id: `med-${Date.now()}` };
  patient.medications.push(med);
  med.times.forEach((time) => {
    const dose: DoseLogEntry = {
      id: `dose-${Date.now()}-${time}`,
      medicationId: med.id,
      scheduledTime: time,
      status: 'pending',
    };
    patient.doseLog.push(dose);
    scheduleDoseNotifications(med.name, med.dosage, time).then((ids) => Object.assign(dose, ids));
  });
  return med;
}

export function updateMedication(
  patientId: string,
  medicationId: string,
  input: { name: string; dosage: string; stock: number; times: string[] }
) {
  const patient = getPatient(patientId);
  const med = getMedication(patient, medicationId);
  if (!med) return;
  Object.assign(med, input);
  // Re-derive today's pending occurrences from the new schedule; taken/late
  // entries already logged stay as history.
  const stale = patient.doseLog.filter(
    (d) => d.medicationId === medicationId && d.status === 'pending'
  );
  stale.forEach(cancelDoseNotifications);
  patient.doseLog = patient.doseLog.filter(
    (d) => d.medicationId !== medicationId || d.status !== 'pending'
  );
  input.times.forEach((time) => {
    const dose: DoseLogEntry = {
      id: `dose-${Date.now()}-${time}`,
      medicationId,
      scheduledTime: time,
      status: 'pending',
    };
    patient.doseLog.push(dose);
    scheduleDoseNotifications(med.name, med.dosage, time).then((ids) => Object.assign(dose, ids));
  });
}

export function deleteMedication(patientId: string, medicationId: string) {
  const patient = getPatient(patientId);
  patient.doseLog
    .filter((d) => d.medicationId === medicationId && d.status === 'pending')
    .forEach(cancelDoseNotifications);
  patient.medications = patient.medications.filter((m) => m.id !== medicationId);
  patient.doseLog = patient.doseLog.filter((d) => d.medicationId !== medicationId);
}

export function markDoseTaken(patientId: string, doseId: string) {
  const dose = getPatient(patientId).doseLog.find((d) => d.id === doseId);
  if (dose) {
    cancelDoseNotifications(dose);
    dose.status = 'taken';
    dose.takenAt = new Date().toTimeString().slice(0, 5);
  }
}

// Seed data has pending doses created without going through addMedication,
// so they have no notifications yet — schedule them once at app startup.
export function scheduleSeedNotifications() {
  patients.forEach((patient) => {
    patient.doseLog
      .filter((d) => d.status === 'pending' && !d.notifyId)
      .forEach((dose) => {
        const med = getMedication(patient, dose.medicationId);
        if (!med) return;
        scheduleDoseNotifications(med.name, med.dosage, dose.scheduledTime).then((ids) =>
          Object.assign(dose, ids)
        );
      });
  });
}

export function getMedication(patient: Patient, medicationId: string) {
  return patient.medications.find((m) => m.id === medicationId);
}
