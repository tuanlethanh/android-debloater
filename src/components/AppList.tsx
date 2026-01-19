import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../store/appStore";
import CommandPreviewModal from "./CommandPreviewModal";
import {
  Search,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Shield,
  Ban,
} from "lucide-react";

export default function AppList() {
  const {
    selectedDevice,
    packages,
    selectedPackages,
    isLoading,
    fetchPackages,
    togglePackageSelection,
    clearSelection,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory] = useState<string>("all");
  const [showSystemApps, setShowSystemApps] = useState(true);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"uninstall" | "disable" | null>(null);
  const [activeTab, setActiveTab] = useState<"safe" | "all">("safe");

  useEffect(() => {
    if (selectedDevice) {
      fetchPackages();
    }
  }, [selectedDevice, fetchPackages]);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.label.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || pkg.category === filterCategory;

    const matchesSystemFilter = showSystemApps || !pkg.isSystemApp;
    
    // Filter by tab
    const matchesTab = activeTab === "all" || (activeTab === "safe" && pkg.safeToRemove === true);

    return matchesSearch && matchesCategory && matchesSystemFilter && matchesTab;
  });
  
  // Group safe apps by group
  const groupedSafeApps = filteredPackages.reduce((acc, pkg) => {
    if (pkg.safeToRemove && pkg.group) {
      if (!acc[pkg.group]) {
        acc[pkg.group] = [];
      }
      acc[pkg.group].push(pkg);
    }
    return acc;
  }, {} as Record<string, typeof filteredPackages>);
  
  const getGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      google_core: "⚠️ Google Core (Không nên gỡ)",
      google_app: "📱 Google Apps",
      miui_core: "⚠️ MIUI Core (Không nên gỡ)",
      miui_ads: "🚫 MIUI Ads & Analytics (Khuyến nghị gỡ)",
      xiaomi_apps: "📦 Xiaomi Apps",
      third_party: "🎯 Third-Party Apps",
      other: "📂 Other Apps",
    };
    return labels[group] || group;
  };

  const handleShowUninstallPreview = () => {
    if (selectedPackages.length === 0) return;
    setPendingAction("uninstall");
    setShowCommandModal(true);
  };

  const handleShowDisablePreview = () => {
    if (selectedPackages.length === 0) return;
    setPendingAction("disable");
    setShowCommandModal(true);
  };

  const handleExecuteAction = async () => {
    if (!pendingAction || selectedPackages.length === 0 || !selectedDevice) return;

    try {
      if (pendingAction === "uninstall") {
        await invoke("uninstall_packages", {
          deviceId: selectedDevice,
          packages: selectedPackages,
        });
      } else {
        await invoke("disable_packages", {
          deviceId: selectedDevice,
          packages: selectedPackages,
        });
      }
      clearSelection();
      await fetchPackages();
      alert(`Successfully ${pendingAction}ed ${selectedPackages.length} app(s)`);
    } catch (error) {
      console.error("Error executing action:", error);
      alert(`Error: ${error}`);
    } finally {
      setPendingAction(null);
      setShowCommandModal(false);
    }
  };

  const getSafetyIcon = (level?: string) => {
    switch (level) {
      case "safe":
        return <Shield className="h-4 w-4 text-green-500" />;
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "unsafe":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!selectedDevice) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please select a device to view apps</p>
      </div>
    );
  }

  const AppCard = ({ pkg }: { pkg: typeof filteredPackages[0] }) => {
    return (
      <div
        className={`flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50 ${
          selectedPackages.includes(pkg.packageName)
            ? "border-primary bg-primary/5"
            : "border-border"
        }`}
        onClick={() => togglePackageSelection(pkg.packageName)}
      >
        <div className="pt-1">
          {selectedPackages.includes(pkg.packageName) ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium">{pkg.label}</p>
            {getSafetyIcon(pkg.safetyLevel)}
            
            {pkg.riskLevel && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                pkg.riskLevel === "HIGH" ? "bg-red-500/10 text-red-500" :
                pkg.riskLevel === "MEDIUM" ? "bg-yellow-500/10 text-yellow-500" :
                "bg-green-500/10 text-green-500"
              }`}>
                {pkg.riskLevel}
              </span>
            )}
            
            {pkg.batteryImpact && pkg.batteryImpact === "HIGH" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                🔋 High Battery
              </span>
            )}
            
            {pkg.ramImpact && pkg.ramImpact === "HIGH" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                💾 High RAM
              </span>
            )}
            
            {pkg.isSystemApp && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                System
              </span>
            )}
            
            {pkg.reversible === false && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                ⚠️ Not Reversible
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground truncate mt-1">
            {pkg.packageName}
          </p>
          
          {pkg.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {pkg.description}
            </p>
          )}
          
          {pkg.notes && (
            <p className="text-xs font-medium text-primary mt-1">
              💡 {pkg.notes}
            </p>
          )}
        </div>

        <div
          className={`text-sm shrink-0 ${
            pkg.isEnabled ? "text-green-500" : "text-muted-foreground"
          }`}
        >
          {pkg.isEnabled ? "Enabled" : "Disabled"}
        </div>
      </div>
    );
  };

  return (
    <>
      <CommandPreviewModal
        isOpen={showCommandModal}
        onClose={() => {
          setShowCommandModal(false);
          setPendingAction(null);
        }}
        onConfirm={handleExecuteAction}
        commands={selectedPackages}
        deviceId={selectedDevice || ""}
        action={pendingAction || "uninstall"}
      />

      <div className="rounded-lg border border-border bg-background shadow-sm">
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("safe")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "safe"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🛡️ Safe to Remove
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "all"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚙️ All Apps (Advanced)
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSystemApps}
                  onChange={(e) => setShowSystemApps(e.target.checked)}
                  className="rounded border-border"
                />
                Show system apps
              </label>

              <button
                onClick={handleShowDisablePreview}
                disabled={selectedPackages.length === 0}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <Ban className="h-4 w-4" />
                Disable ({selectedPackages.length})
              </button>

              <button
                onClick={handleShowUninstallPreview}
                disabled={selectedPackages.length === 0}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
                Uninstall ({selectedPackages.length})
              </button>
            </div>
          </div>
        </div>

        {/* App List */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading apps...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No apps found</p>
            </div>
          ) : activeTab === "safe" ? (
            // Grouped view for safe apps
            <div className="space-y-6">
              {Object.entries(groupedSafeApps).map(([group, apps]) => (
                <div key={group} className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2">
                    {getGroupLabel(group)} ({apps.length})
                  </h3>
                  <div className="space-y-2">
                    {apps.map((pkg) => (
                      <AppCard key={pkg.packageName} pkg={pkg} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List view for all apps
            <div className="space-y-2">
              {filteredPackages.map((pkg) => (
                <AppCard key={pkg.packageName} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
