import { Calendar } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { ScreenHeader } from "@/components/ScreenHeader";

const scheduleData = [
  { time: "06:00 AM", route: "204C", from: "Chandigarh", to: "Mohali", status: "completed" },
  { time: "09:30 AM", route: "204C", from: "Mohali", to: "Chandigarh", status: "completed" },
  { time: "12:00 PM", route: "204C", from: "Chandigarh", to: "Mohali", status: "active" },
  { time: "03:30 PM", route: "204C", from: "Mohali", to: "Chandigarh", status: "upcoming" },
  { time: "06:00 PM", route: "204C", from: "Chandigarh", to: "Mohali", status: "upcoming" },
];

const ScheduleScreen = () => {
  return (
    <MobileLayout>
      <ScreenHeader
        title="Today's Schedule"
        left={
          <span className="inline-flex h-10 w-10 items-center justify-center">
            <Calendar size={22} className="text-primary" aria-hidden />
          </span>
        }
      />
      <div className="space-y-4 px-4 pb-4 pt-4">
        <p className="text-sm text-muted-foreground">March 14, 2026 • 5 trips scheduled</p>

        <div className="space-y-2">
          {scheduleData.map((trip, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <p className="text-xs text-muted-foreground">{trip.time.split(" ")[1]}</p>
                <p className="text-sm font-bold text-foreground">{trip.time.split(" ")[0]}</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{trip.from} → {trip.to}</p>
                <p className="text-xs text-muted-foreground">Route {trip.route}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                trip.status === "completed" ? "bg-success/10 text-success"
                : trip.status === "active" ? "bg-primary/10 text-primary"
                : "bg-secondary text-muted-foreground"
              }`}>
                {trip.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default ScheduleScreen;
