import { useState } from "react";
import { ArrowLeft, Map, TrendingUp, TrendingDown, Bell, Clock, Minus, CircleDollarSign, CalendarDays } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const AdminRouteDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { route } = location.state || {}; // Expecting route performance object

  const routeName = route?.name || "Detailed Route Report";
  const routeId = route?.id || "N/A";

  const [timeframe, setTimeframe] = useState("Today");
  // Scaler logic for mock data
  const getScaler = () => {
    if (timeframe === "This Week") return 7;
    if (timeframe === "This Month") return 30;
    return 1;
  };

  const scaler = getScaler();

  // Mock detailed stop data based loosely on generic route length
  const stops = [
    { name: route?.from || "Origin", delay: 0 },
    { name: "Intermediate Stop 1", delay: 5 },
    { name: "Intermediate Stop 2", delay: 2 },
    { name: route?.to || "Destination", delay: 0 }
  ];

  const scaledRevenue = Math.floor((route?.revenue || 0) * scaler * (0.95 + Math.random() * 0.1));
  const scaledOnTime = Math.min(100, Math.floor((route?.onTimePercent || 0) * (0.99 + Math.random() * 0.02)));

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-card px-4 pt-6 pb-4 border-b sticky top-0 z-20 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-muted rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted">{routeId}</Badge>
               <h1 className="text-lg font-bold leading-tight truncate max-w-[200px]">{routeName}</h1>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Performance Metrics & Logs</p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex p-1 bg-muted rounded-lg border border-border/50">
          {['Today', 'This Week', 'This Month'].map(tf => (
            <button 
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${timeframe === tf ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5 space-y-6">
        {/* Core KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
           <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
             <CardContent className="p-4">
               <Map className="w-5 h-5 text-blue-500 mb-2" />
               <p className="text-2xl font-black">{route?.activeBuses || 0}</p>
               <p className="text-xs text-muted-foreground font-semibold mt-0.5">Active Buses</p>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-green-50/50 dark:bg-green-950/20">
             <CardContent className="p-4">
               <CircleDollarSign className="w-5 h-5 text-green-500 mb-2" />
               <p className="text-xl font-black">₹{scaledRevenue}</p>
               <p className="text-xs text-muted-foreground font-semibold mt-0.5 flex gap-1 items-center">
                 Revenue 
                 {route?.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                 {route?.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                 {route?.trend === 'neutral' && <Minus className="w-3 h-3 text-muted-foreground" />}
               </p>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-950/20">
             <CardContent className="p-4">
               <Clock className="w-5 h-5 text-orange-500 mb-2" />
               <p className="text-2xl font-black">{scaledOnTime}%</p>
               <p className="text-xs text-muted-foreground font-semibold mt-0.5">On-Time Rate</p>
             </CardContent>
           </Card>
        </div>

        {/* Detailed Stop Demographics */}
        <div>
          <h3 className="font-bold text-sm mb-3 px-1 border-b border-border/50 pb-2 text-muted-foreground uppercase tracking-wider">Stop Activity ({timeframe})</h3>
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
             {stops.map((stop, i) => (
               <div key={i} className={`p-4 flex items-center justify-between ${i !== stops.length - 1 ? 'border-b border-border/50' : ''}`}>
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                   </div>
                   <div>
                     <p className="font-bold text-sm truncate max-w-[150px]">{stop.name}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   {stop.delay > 0 ? (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">+{stop.delay}m avg</span>
                   ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">On Time</span>
                   )}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRouteDetailsPage;
