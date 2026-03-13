import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useHomepageData = () => {
    return useQuery({
        queryKey: ['homepage_content'],
        queryFn: async () => {
            const { data, error } = await supabase.from('homepage_content').select('*').single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
    });
};

export const useSiteImages = () => {
    return useQuery({
        queryKey: ['site_images'],
        queryFn: async () => {
            const { data, error } = await supabase.from('site_images').select('*');
            // Silently return empty if table doesn't exist yet
            if (error) return [];
            return data || [];
        },
    });
};

export const useExperiencesData = () => {
    return useQuery({
        queryKey: ['experiences'],
        queryFn: async () => {
            const { data, error } = await supabase.from('experiences').select('*').order('display_order', { ascending: true });
            // Silently return empty if table doesn't exist yet
            if (error) return [];
            return data || [];
        },
    });
};

export const useRoomsData = () => {
    return useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            // Try fetching with the room_images relation (requires the new schema)
            const { data, error } = await supabase
                .from('rooms')
                .select('*, room_images(id, image_url, display_order)')
                .order('created_at', { ascending: false });

            // If error (e.g. room_images table doesn't exist), fall back to rooms only
            if (error) {
                const { data: fallback, error: fallbackErr } = await supabase
                    .from('rooms')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (fallbackErr) throw fallbackErr;
                return fallback || [];
            }

            // Map the nested room_images onto the .images array to not break UI while retaining explicit relation
            const processed = data?.map(room => {
                const sortedImages = room.room_images
                    ? room.room_images.sort((a: any, b: any) => a.display_order - b.display_order)
                    : [];
                return {
                    ...room,
                    images: sortedImages.length > 0
                        ? sortedImages.map((img: any) => img.image_url)
                        : (room.images || [])
                };
            }) || [];

            return processed;
        },
    });
};

export const useDiningData = () => {
    return useQuery({
        queryKey: ['dining'],
        queryFn: async () => {
            const { data, error } = await supabase.from('dining').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });
};

export const useGalleryData = () => {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });
};

export const useTravelStoriesData = () => {
    return useQuery({
        queryKey: ['travel_stories'],
        queryFn: async () => {
            const { data, error } = await supabase.from('travel_stories').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });
};

export const useFacilitiesData = () => {
    return useQuery({
        queryKey: ['facilities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('facilities').select('*').order('name', { ascending: true });
            if (error) throw error;
            return data;
        },
    });
};
