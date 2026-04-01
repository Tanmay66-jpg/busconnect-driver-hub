import { loadBusRoutes } from "../utils/ExcelLoader";
import { authService } from "./authService";

export interface DashboardMetrics {
  totalRoutes: number;
  activeBuses: number;
  todaysRevenue: number;
}

export interface LiveBus {
  id: string;
  routeNo: string;
  status: "On Time" | "Delayed" | "Warning";
  time: string;
  from: string;
  to: string;
  driverName: string;
  driverPhone: string;
}

export interface RoutePerformance {
  id: string;
  name: string;
  from: string;
  to: string;
  activeBuses: number;
  onTimePercent: number;
  revenue: number;
  trend: "up" | "down" | "neutral";
}

export interface AIRecommendation {
  id: string;
  type: "opportunity" | "warning" | "insight";
  title: string;
  description: string;
  actionText: string;
  impactScore: number;
  routeId?: string;
}

import { supabase } from "../lib/supabase";

export const adminService = {
  // Helpers
  getBookings: async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Supabase bookings fetch failed, using empty array", e);
      return [];
    }
  },

  getUsers: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("Supabase users fetch failed, using empty array", e);
      return [];
    }
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const routes = await loadBusRoutes();
    const users = await adminService.getUsers();
    const bookings = await adminService.getBookings();

    // Calculate revenue from mock "myBookings" list
    const todaysRevenue = bookings.reduce((sum: number, b: any) => sum + (Number(b.price) || 0), 0) + 12540; // Add baseline mock revenue

    // Count unique routes
    const uniqueRoutes = new Set(routes.map(r => r.route_no)).size;

    return {
      totalRoutes: uniqueRoutes > 0 ? uniqueRoutes : 42, // fallback if fetch fails
      activeBuses: uniqueRoutes > 0 ? Math.floor(uniqueRoutes * 2.5) : 108,
      todaysRevenue: todaysRevenue,
    };
  },

  getLiveBuses: async (): Promise<LiveBus[]> => {
    const routes = await loadBusRoutes();
    const bookings = await adminService.getBookings();

    if (routes.length === 0) return [];

    // Map the first few routes as "live buses" and adjust occupancy based on bookings
    const driverNames = ["Raman Singh", "Gurpreet Singh", "Jaswinder Kumar", "Amit Sharma", "Baljit Singh", "Sundeep Yadav"];
    
    return routes.slice(0, 5).map((r, i) => {
      // Find if this route was booked recently
      const routeBookings = bookings.filter((b: any) => b.from === r.from_stop || b.to === r.to_stop).length;
      
      const isBooked = routeBookings > 0;
      const baseOccupancy = 40 + (i * 10);
      const randomOffset = Math.floor(Math.random() * 20);

      // Deterministic but "random-looking" phone numbers based on route index
      const dummyPhone = `+91 98765 ${40000 + (i * 1234)}`;

      return {
        id: `bus_${i}`,
        routeNo: r.route_no,
        status: i % 4 === 0 ? "Warning" : (i % 3 === 0 ? "Delayed" : "On Time"),
        time: "Just now",
        from: r.from_stop,
        to: r.to_stop,
        driverName: driverNames[i % driverNames.length],
        driverPhone: dummyPhone,
      };
    });
  },

  getRoutePerformance: async (): Promise<RoutePerformance[]> => {
    try {
      const routes = await loadBusRoutes();
      const bookings = await adminService.getBookings();
      
      let dataToProcess = routes.length > 0 ? routes.slice(0, 15) : [];
      
      // Fallback if routes are empty
      if (dataToProcess.length === 0) {
        console.log("No routes from Excel, using fallbacks");
        return [
          { id: "R-101", name: "Sector 17 → Mohali", from: "Sector 17", to: "Mohali", activeBuses: 8, onTimePercent: 94, revenue: 12450, trend: "up" },
          { id: "R-204", name: "Zirakpur → Panchkula", from: "Zirakpur", to: "Panchkula", activeBuses: 5, onTimePercent: 82, revenue: 9800, trend: "up" },
          { id: "R-305", name: "ISBT 43 → University", from: "ISBT 43", to: "University", activeBuses: 12, onTimePercent: 91, revenue: 15600, trend: "up" },
          { id: "R-402", name: "Manimajra → Airport", from: "Manimajra", to: "Airport", activeBuses: 4, onTimePercent: 98, revenue: 5200, trend: "neutral" },
          { id: "R-511", name: "Kharar → Landran", from: "Kharar", to: "Landran", activeBuses: 6, onTimePercent: 88, revenue: 7400, trend: "down" }
        ];
      }

      const grouped = dataToProcess.map((r, i) => {
        const routeBookings = bookings.filter((b: any) => b.from === r.from_stop || b.to === r.to_stop);
        const bookingRevenue = routeBookings.reduce((sum: number, b: any) => sum + (Number(b.price) || 0), 0);
        
        return {
          id: r.route_no || `R-${100 + i}`,
          name: `${r.from_stop} → ${r.to_stop}`,
          from: r.from_stop,
          to: r.to_stop,
          activeBuses: Math.floor(Math.random() * 5) + 2,
          onTimePercent: 85 + Math.floor(Math.random() * 10),
          revenue: bookingRevenue > 0 ? bookingRevenue + 1200 : 450 + (i * 300),
          trend: bookingRevenue > 0 ? "up" : (i % 3 === 0 ? "down" : "neutral") as "up" | "down" | "neutral"
        };
      });

      return grouped.sort((a, b) => b.revenue - a.revenue);
    } catch (e) {
      console.error("Error in getRoutePerformance", e);
      return [
        { id: "ERR", name: "Data Loading Error", from: "N/A", to: "N/A", activeBuses: 0, onTimePercent: 0, revenue: 0, trend: "neutral" }
      ];
    }
  },

  getSmartRecommendations: async (): Promise<AIRecommendation[]> => {
    const performances = await adminService.getRoutePerformance();
    
    const recommendations: AIRecommendation[] = [];

    // Find highest revenue route
    const highRev = performances.find(p => p.revenue > 10000);
    if (highRev) {
      recommendations.push({
        id: "rec_1",
        type: "opportunity",
        title: "High Revenue Route",
        description: `Route ${highRev.id} (${highRev.name}) is performing exceptionally well. Adding 2 buses could further increase daily revenue.`,
        actionText: `Deploy Buses to ${highRev.id}`,
        impactScore: 92,
        routeId: highRev.id
      });
    } else {
       recommendations.push({
        id: "rec_1",
        type: "opportunity",
        title: "Peak Hour Optimization",
        description: `Reallocating 3 buses to Sector 17 junction during 5-7 PM can reduce wait times by 12 mins.`,
        actionText: "Apply Schedule Sync",
        impactScore: 88
      });
    }

    // Find lowest on-time route
    const lowOnTime = performances.find(p => p.onTimePercent < 90);
    if (lowOnTime) {
      recommendations.push({
        id: "rec_2",
        type: "warning",
        title: "Frequent Delays",
        description: `Route ${lowOnTime.id} has dropped to ${lowOnTime.onTimePercent}% on-time rate. Suggest routing via bypass.`,
        actionText: "View Alternate Routes",
        impactScore: 75,
        routeId: lowOnTime.id
      });
    }

    recommendations.push({
      id: "rec_3",
      type: "insight",
      title: "Student Pass Utilization",
      description: "University route purchases show a 15% WoW increase. Consider offering dedicated student monthly passes.",
      actionText: "Review Pricing Strategy",
      impactScore: 65
    });

    return recommendations;
  }
};
