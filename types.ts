
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  subItems?: MenuItem[];
}

export enum MachineStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export interface User {
  id?: string;
  username: string;
  password?: string; // Only used for verification, avoid exposing if possible
  fullName: string;
  role: string;
  isDefaultPassword?: boolean;
}

export interface Machine {
  id: number;
  label: string;
  status: MachineStatus;
  userName?: string; // If a student is logged in
}

export interface LabConfig {
  id: string;
  name: string;
  columns: number[][]; // Array of columns, each column is an array of machine IDs
}

export interface DashboardStat {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  color: string;
}

export interface MachineLog {
  issues: string[]; // List of selected issues (CPU, Mouse, etc.)
  note: string;     // Detailed status note
  lastUpdated: string; // ISO or formatted date string
  updatedBy: string;   // User account name
}

export interface MachineHistoryEntry {
  id?: string;
  status: MachineStatus;
  issues: string[];
  note: string;
  updatedBy: string;
  timestamp: any; // Firestore Timestamp or Date object (for local)
  formattedDate: string; // String representation for display
}

// Database Record Structure
export interface MachineRecord {
  id: string;         // Unique Key: "labId_machineNumber" (e.g., "lab1_15")
  labId: string;      // "lab-1" or "lab-3"
  machineNumber: number;
  status: MachineStatus;
  log?: MachineLog;
  updatedAt?: any;    // Firestore Timestamp or Date
}

// Global System Settings
export interface GlobalSettings {
  themeId: string;
  updatedBy?: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;      // Main brand color (buttons, active states)
    primaryHover: string; // Hover state
    secondary: string;    // Accents
  };
  enableSnow?: boolean;   // For Christmas/Winter themes
  enableTet?: boolean;    // For Lunar New Year theme
  enableMidAutumn?: boolean; // For Mid-Autumn Festival
}

// Version Configuration
export interface AppVersionConfig {
  version: string;
  downloadUrl: string;
  updatedBy?: string;
  updatedAt?: any;
}
