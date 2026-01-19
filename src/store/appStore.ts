import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface AppPackage {
  packageName: string;
  label: string;
  isSystemApp: boolean;
  isEnabled: boolean;
  category?: string;
  description?: string;
  safetyLevel?: "safe" | "caution" | "unsafe";
  // New fields from database
  safeToRemove?: boolean;
  riskLevel?: string;
  batteryImpact?: string;
  ramImpact?: string;
  reversible?: boolean;
  notes?: string;
  group?: string;
}

export interface Device {
  id: string;
  model: string;
  manufacturer: string;
  androidVersion: string;
}

interface AppState {
  devices: Device[];
  selectedDevice: string | null;
  packages: AppPackage[];
  selectedPackages: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDevices: (devices: Device[]) => void;
  setSelectedDevice: (deviceId: string | null) => void;
  setPackages: (packages: AppPackage[]) => void;
  togglePackageSelection: (packageName: string) => void;
  selectMultiplePackages: (packageNames: string[]) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchDevices: () => Promise<void>;
  fetchPackages: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  selectedDevice: null,
  packages: [],
  selectedPackages: [],
  isLoading: false,
  error: null,

  setDevices: (devices) => set({ devices }),
  setSelectedDevice: (deviceId) => set({ selectedDevice: deviceId }),
  setPackages: (packages) => set({ packages }),
  
  togglePackageSelection: (packageName) =>
    set((state) => ({
      selectedPackages: state.selectedPackages.includes(packageName)
        ? state.selectedPackages.filter((p) => p !== packageName)
        : [...state.selectedPackages, packageName],
    })),

  selectMultiplePackages: (packageNames) =>
    set({ selectedPackages: packageNames }),

  clearSelection: () => set({ selectedPackages: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchDevices: async () => {
    try {
      console.log('[DEBUG] fetchDevices called');
      set({ isLoading: true, error: null });
      
      console.log('[DEBUG] Calling invoke get_devices...');
      const devices = await invoke<Device[]>("get_devices");
      console.log('[DEBUG] Received devices:', devices);
      
      set({ devices, isLoading: false });
      
      // Auto-select first device if available
      if (devices.length > 0 && !get().selectedDevice) {
        console.log('[DEBUG] Auto-selecting first device:', devices[0].id);
        set({ selectedDevice: devices[0].id });
      }
    } catch (error) {
      console.error('[DEBUG] Error in fetchDevices:', error);
      set({ error: String(error), isLoading: false });
    }
  },

  fetchPackages: async () => {
    const { selectedDevice } = get();
    if (!selectedDevice) {
      console.log('[DEBUG] fetchPackages: No device selected');
      return;
    }

    try {
      console.log('[DEBUG] fetchPackages called for device:', selectedDevice);
      set({ isLoading: true, error: null });
      
      console.log('[DEBUG] Calling invoke list_packages...');
      const packages = await invoke<AppPackage[]>("list_packages", {
        deviceId: selectedDevice,
      });
      console.log('[DEBUG] Received packages count:', packages.length);
      console.log('[DEBUG] First 3 packages:', packages.slice(0, 3));
      
      set({ packages, isLoading: false });
    } catch (error) {
      console.error('[DEBUG] Error in fetchPackages:', error);
      set({ error: String(error), isLoading: false });
    }
  },
}));
