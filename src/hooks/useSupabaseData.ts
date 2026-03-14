import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Helper: silently return null/[] on ANY error — prevents 406/404 crashes
// when a table is empty or doesn't exist yet.

export const useHomepageData = () => {
    return useQuery({
        queryKey: ['homepage_content'],
        queryFn: async () => {
            // maybeSingle() returns null (not an error) when 0 rows exist
            const { data, error } = await supabase
                .from('homepage_content')
                .select('*')
                .maybeSingle();
            if (error) return null;   // don't throw — components fall back to static data
            return data;
        },
    });
};

export const useSiteImages = () => {
    return useQuery({
        queryKey: ['site_images'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_images').select('*');
            if (error) return [];
            return data || [];
        },
    });
};

export const useExperiencesData = () => {
    return useQuery({
        queryKey: ['experiences'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('experiences')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) return [];
            return data || [];
        },
    });
};

export const useRoomsData = () => {
    return useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data || [];
        },
    });
};

export const useDiningData = () => {
    return useQuery({
        queryKey: ['dining'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dining')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data || [];
        },
    });
};

export const useGalleryData = () => {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data || [];
        },
    });
};

export const useTravelStoriesData = () => {
    return useQuery({
        queryKey: ['travel_stories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('travel_stories')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data || [];
        },
    });
};

export const useFacilitiesData = () => {
    return useQuery({
        queryKey: ['facilities'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('facilities')
                .select('*')
                .order('name', { ascending: true });
            if (error) return [];
            return data || [];
        },
    });
};
