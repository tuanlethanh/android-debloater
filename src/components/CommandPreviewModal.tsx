import { X, Copy, Terminal } from "lucide-react";
import { useState } from "react";

interface CommandPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commands: string[];
  deviceId: string;
  action: "uninstall" | "disable";
}

export default function CommandPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  commands,
  deviceId,
  action,
}: CommandPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullCommands = commands.map((pkg) => {
    if (action === "uninstall") {
      return `adb -s ${deviceId} shell pm uninstall --user 0 ${pkg}`;
    } else {
      return `adb -s ${deviceId} shell pm disable-user --user 0 ${pkg}`;
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommands.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              Preview Commands - {action === "uninstall" ? "Uninstall" : "Disable"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              The following ADB commands will be executed:
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                Device: {deviceId}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Total: {commands.length} package(s)
              </span>
            </div>
          </div>

          {/* Command List */}
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2 overflow-x-auto">
            {fullCommands.map((cmd, index) => (
              <div
                key={index}
                className="text-foreground hover:bg-muted/50 p-2 rounded transition-colors"
              >
                <span className="text-muted-foreground select-none">$ </span>
                {cmd}
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ <strong>Warning:</strong> These commands will {action} the selected apps.
              {action === "uninstall" 
                ? " You can reinstall them from Play Store later."
                : " You can re-enable them from device settings."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy Commands"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Execute Commands
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
