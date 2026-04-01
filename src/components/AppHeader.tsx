import { Bell } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppHeader() {
  const handleNotifications = () => {
    toast.info("Notifications", {
      description: "You're all caught up. Route and schedule updates appear here.",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-end gap-2 px-4 py-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={handleNotifications}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}