-- Create tables

-- Table: homepage_content
CREATE TABLE IF NOT EXISTS public.homepage_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT,
    hero_video_url TEXT,
    story_title TEXT,
    story_description TEXT,
    story_image TEXT,
    dining_description TEXT,
    dining_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    features TEXT[],
    images TEXT[],
    price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: dining
CREATE TABLE IF NOT EXISTS public.dining (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    features TEXT[],
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: gallery
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: travel_stories
CREATE TABLE IF NOT EXISTS public.travel_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    cover_image TEXT,
    gallery_images TEXT[],
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add gallery_images to travel_stories if not already there (for existing DBs)
ALTER TABLE public.travel_stories ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Table: facilities
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Cannot safely INSERT without duplicates if it's already there, so skipping duplicate INSERT here.
-- Instead, use an upsert or single insert if empty (omitted here since it likely already exists)

-- Table: site_images
CREATE TABLE IF NOT EXISTS public.site_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_name TEXT NOT NULL,
    image_key TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: experiences
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: room_images support 
CREATE TABLE IF NOT EXISTS public.room_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation using DO block
DO $$ 
BEGIN
    -- Public Read Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'homepage_content' AND policyname = 'Public read for homepage_content') THEN
        CREATE POLICY "Public read for homepage_content" ON public.homepage_content FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Public read for rooms') THEN
        CREATE POLICY "Public read for rooms" ON public.rooms FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room_images' AND policyname = 'Public read for room_images') THEN
        CREATE POLICY "Public read for room_images" ON public.room_images FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dining' AND policyname = 'Public read for dining') THEN
        CREATE POLICY "Public read for dining" ON public.dining FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery' AND policyname = 'Public read for gallery') THEN
        CREATE POLICY "Public read for gallery" ON public.gallery FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_stories' AND policyname = 'Public read for travel_stories') THEN
        CREATE POLICY "Public read for travel_stories" ON public.travel_stories FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'facilities' AND policyname = 'Public read for facilities') THEN
        CREATE POLICY "Public read for facilities" ON public.facilities FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Public read for site_images') THEN
        CREATE POLICY "Public read for site_images" ON public.site_images FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Public read for experiences') THEN
        CREATE POLICY "Public read for experiences" ON public.experiences FOR SELECT USING (true);
    END IF;

    -- Authenticated All Privileges Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'homepage_content' AND policyname = 'Auth all for homepage_content') THEN
        CREATE POLICY "Auth all for homepage_content" ON public.homepage_content FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Auth all for rooms') THEN
        CREATE POLICY "Auth all for rooms" ON public.rooms FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room_images' AND policyname = 'Auth all for room_images') THEN
        CREATE POLICY "Auth all for room_images" ON public.room_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dining' AND policyname = 'Auth all for dining') THEN
        CREATE POLICY "Auth all for dining" ON public.dining FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gallery' AND policyname = 'Auth all for gallery') THEN
        CREATE POLICY "Auth all for gallery" ON public.gallery FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_stories' AND policyname = 'Auth all for travel_stories') THEN
        CREATE POLICY "Auth all for travel_stories" ON public.travel_stories FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'facilities' AND policyname = 'Auth all for facilities') THEN
        CREATE POLICY "Auth all for facilities" ON public.facilities FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Auth all for site_images') THEN
        CREATE POLICY "Auth all for site_images" ON public.site_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Auth all for experiences') THEN
        CREATE POLICY "Auth all for experiences" ON public.experiences FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- =============================================================
-- STORAGE SETUP
-- =============================================================
-- Step 1: Create these buckets via Supabase Dashboard > Storage > New Bucket
--   Name each one exactly as listed, and set "Public bucket" = ON:
--   gallery | rooms | dining | stories | site_assets | hero | about | experiences
--
-- Step 2: Run the SQL below to add upload/delete policies:

-- Allow anyone to read public objects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read all buckets'
    ) THEN
        CREATE POLICY "Public read all buckets"
        ON storage.objects FOR SELECT
        USING ( bucket_id IN ('gallery', 'rooms', 'dining', 'stories', 'site_assets', 'hero', 'about', 'experiences') );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth upload to all buckets'
    ) THEN
        CREATE POLICY "Auth upload to all buckets"
        ON storage.objects FOR INSERT
        WITH CHECK ( auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth update all buckets'
    ) THEN
        CREATE POLICY "Auth update all buckets"
        ON storage.objects FOR UPDATE
        USING ( auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth delete all buckets'
    ) THEN
        CREATE POLICY "Auth delete all buckets"
        ON storage.objects FOR DELETE
        USING ( auth.role() = 'authenticated' );
    END IF;
END $$;

-- =============================================================
-- NEW TABLES: BOOKINGS, CONTACT, FEEDBACK, SETTINGS
-- =============================================================

-- Table: bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    room_name TEXT,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    address TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INTEGER DEFAULT 1,
    special_request TEXT,
    status TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: contact_queries
CREATE TABLE IF NOT EXISTS public.contact_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    rating INTEGER,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    address_city TEXT,
    instagram TEXT,
    facebook TEXT,
    tripadvisor TEXT,
    google_maps_embed TEXT,
    about_content TEXT,
    about_images TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for new tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Bookings: anyone can insert, only auth can read/update/delete
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Anyone can create booking') THEN
        CREATE POLICY "Anyone can create booking" ON public.bookings FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Auth manage bookings') THEN
        CREATE POLICY "Auth manage bookings" ON public.bookings FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    -- Also allow public to read bookings (for availability check)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Public read bookings') THEN
        CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
    END IF;

    -- Contact Queries: anyone can submit, only auth can manage
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_queries' AND policyname = 'Anyone can submit query') THEN
        CREATE POLICY "Anyone can submit query" ON public.contact_queries FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_queries' AND policyname = 'Auth manage queries') THEN
        CREATE POLICY "Auth manage queries" ON public.contact_queries FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Feedback: anyone can submit, only auth can manage
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Anyone can submit feedback') THEN
        CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Auth manage feedback') THEN
        CREATE POLICY "Auth manage feedback" ON public.feedback FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Settings: public read, auth manage
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public read settings') THEN
        CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Auth manage settings') THEN
        CREATE POLICY "Auth manage settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

