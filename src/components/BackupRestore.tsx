import { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import { Download, Upload } from "lucide-react";

interface BackupProfile {
  name: string;
  date: string;
  deviceModel: string;
  packages: string[];
}

export default function BackupRestore() {
  const [isLoading, setIsLoading] = useState(false);

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      
      // Get current state (you would get this from your store)
      const profile: BackupProfile = {
        name: "My Debloat Profile",
        date: new Date().toISOString(),
        deviceModel: "Unknown", // Get from device
        packages: [], // Get from selected packages
      };

      const filePath = await save({
        defaultPath: `debloat-backup-${Date.now()}.json`,
        filters: [{
          name: "JSON",
          extensions: ["json"],
        }],
      });

      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(profile, null, 2));
        alert("Backup saved successfully!");
      }
    } catch (error) {
      alert(`Backup failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      
      const filePath = await open({
        multiple: false,
        filters: [{
          name: "JSON",
          extensions: ["json"],
        }],
      });

      if (filePath) {
        const content = await readTextFile(filePath as string);
        const profile: BackupProfile = JSON.parse(content);
        
        // Restore logic here
        console.log("Restored profile:", profile);
        alert(`Restored ${profile.packages.length} apps from backup`);
      }
    } catch (error) {
      alert(`Restore failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleBackup}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
      >
        <Download className="h-4 w-4" />
        Backup
      </button>
      
      <button
        onClick={handleRestore}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
      >
        <Upload className="h-4 w-4" />
        Restore
      </button>
    </div>
  );
}
