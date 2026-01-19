import { useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { Smartphone, RefreshCw, AlertCircle } from "lucide-react";

export default function DeviceInfo() {
  const { devices, selectedDevice, isLoading, error, fetchDevices, setSelectedDevice } = useAppStore();

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="mb-6 rounded-lg border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Connected Devices
        </h2>
        <button
          onClick={fetchDevices}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {devices.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg mb-2">No devices connected</p>
          <p className="text-sm">
            Please enable USB debugging and connect your Android device
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`w-full text-left rounded-lg border p-4 transition-all ${
                selectedDevice === device.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{device.model}</p>
                  <p className="text-sm text-muted-foreground">
                    {device.manufacturer} • Android {device.androidVersion}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{device.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
