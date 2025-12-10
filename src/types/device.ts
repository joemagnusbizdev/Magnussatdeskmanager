export interface DeviceUser {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idPassport: string;
  email: string;
  phone: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export type DeviceStatus = 'active' | 'pending' | 'archived';
export type DeviceLocation = 'in' | 'out'; // 'in' = inventory, 'out' = in the field

export interface PresetMessage {
  id: string;
  slot: number;
  message: string;
}

export interface Device {
  id: string;
  imei: string;
  deviceNumber: number; // Magnus internal device number
  deviceName: string; // Internal description (e.g., "inReach Mini 2 - Alpha")
  status: DeviceStatus;
  location: DeviceLocation;
  user?: DeviceUser;
  satDeskId: string;
  rentalStart: string;
  rentalEnd: string;
  lastContact?: string;
  notes?: string;
  garminLogin?: string;
  presetMessages: PresetMessage[];
}