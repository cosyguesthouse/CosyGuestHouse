-- Step 1: Rename the old "rooms" table to "room_categories" to preserve data.
ALTER TABLE public.rooms RENAME TO room_categories;
ALTER TABLE public.room_categories RENAME COLUMN name TO category_name;
ALTER TABLE public.room_categories ADD COLUMN capacity INTEGER DEFAULT 2;

-- Rename policies for room_categories
ALTER POLICY "Public read for rooms" ON public.room_categories RENAME TO "Public read for room_categories";
ALTER POLICY "Auth all for rooms" ON public.room_categories RENAME TO "Auth all for room_categories";

-- Step 2: Create the new physical 'rooms' table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL,
    category_id UUID REFERENCES public.room_categories(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Auth manage rooms" ON public.rooms FOR ALL USING (auth.role() = 'authenticated');

-- Step 3: Update `bookings` table to use category AND physical room
-- Previous room_id pointed to the old 'rooms' (which is now room_categories)
ALTER TABLE public.bookings RENAME COLUMN room_id TO category_id;
ALTER TABLE public.bookings RENAME COLUMN room_name TO category_name;

-- Add actual physical room_id that points to the new rooms table
ALTER TABLE public.bookings ADD COLUMN room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL;
