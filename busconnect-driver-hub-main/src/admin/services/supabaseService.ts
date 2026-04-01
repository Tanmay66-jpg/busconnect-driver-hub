import { supabase } from "../lib/supabase";

export interface Booking {
    id?: string;
    user_id: string;
    from_location: string;
    to_location: string;
    date: string;
    status: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface BusLocation {
    bus_id: string;
    latitude: number;
    longitude: number;
}

export const supabaseService = {
    // 1. Create/Update User & Profile after Firebase Auth
    createUserProfile: async (id: string, name: string, emailOrPhone: string, type: 'email' | 'phone') => {
        try {
            // First ensure user exists in users table
            const { error: userError } = await supabase.from('users').upsert([
                { id, phone: type === 'phone' ? emailOrPhone : null }
            ]);
            if (userError) throw userError;

            // Then upsert into user_profiles
            const { error: profileError } = await supabase.from('user_profiles').upsert([
                { 
                    id, 
                    name, 
                    email: type === 'email' ? emailOrPhone : null,
                    role: 'user'
                }
            ]);
            if (profileError) throw profileError;

            return { success: true };
        } catch (error: any) {
            console.error("Supabase Create Profile Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    // 2. Add a new booking
    addBooking: async (booking: Booking) => {
        try {
            const { data, error } = await supabase.from('bookings').insert([booking]).select();
            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            console.error("Supabase Add Booking Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    // 3. Save Search History
    saveSearchHistory: async (user_id: string, from_location: string, to_location: string) => {
        try {
            const { error } = await supabase.from('search_history').insert([
                { user_id, from_location, to_location }
            ]);
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error("Supabase Save Search Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    // 4. Update Bus Location (Live Tracking)
    updateBusLocation: async (bus_id: string, latitude: number, longitude: number) => {
        try {
            const { error } = await supabase.from('bus_locations').upsert([
                { bus_id, latitude, longitude, updated_at: new Date().toISOString() }
            ], { onConflict: 'bus_id' });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error("Supabase Update Bus Error:", error.message);
            return { success: false, error: error.message };
        }
    },

    // Dashboard Query Examples (Exported for UI to use)
    getAllUsers: async () => {
        return await supabase.from('user_profiles').select('*');
    },

    getBookingsPerUser: async (user_id: string) => {
        return await supabase.from('bookings').select('*').eq('user_id', user_id).order('date', { ascending: false });
    },

    getRouteHistory: async (user_id: string) => {
        return await supabase.from('search_history').select('*').eq('user_id', user_id).order('searched_at', { ascending: false });
    }
};
