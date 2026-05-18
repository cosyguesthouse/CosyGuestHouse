-- 1. ATTRACTIONS TABLES
CREATE TABLE IF NOT EXISTS public.attractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attraction_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attraction_id UUID REFERENCES public.attractions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MULTI-IMAGE CONTENT TABLES
CREATE TABLE IF NOT EXISTS public.dining_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dining_id UUID REFERENCES public.dining(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.story_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES public.travel_stories(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.experience_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SLIDER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.slider_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slider_type TEXT NOT NULL UNIQUE, -- 'dining_slider', 'story_slider', 'experience_slider', 'attraction_slider', 'review_slider'
    speed INTEGER DEFAULT 5000, -- milliseconds
    animation_type TEXT DEFAULT 'slide', -- 'slide', 'fade'
    pause_on_hover BOOLEAN DEFAULT true,
    show_dots BOOLEAN DEFAULT true,
    show_arrows BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INSERTS DEFAULT SETTINGS
INSERT INTO public.slider_settings (slider_type, speed)
VALUES 
('dining_slider', 5000),
('story_slider', 6000),
('experience_slider', 5000),
('attraction_slider', 4000),
('review_slider', 7000)
ON CONFLICT (slider_type) DO NOTHING;

-- 4. GOOGLE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.google_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_name TEXT NOT NULL,
    reviewer_photo TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    google_review_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all new tables
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Attractions & Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attractions' AND policyname = 'Public read attractions') THEN
        CREATE POLICY "Public read attractions" ON public.attractions FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attractions' AND policyname = 'Auth manage attractions') THEN
        CREATE POLICY "Auth manage attractions" ON public.attractions FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attraction_images' AND policyname = 'Public read attraction_images') THEN
        CREATE POLICY "Public read attraction_images" ON public.attraction_images FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attraction_images' AND policyname = 'Auth manage attraction_images') THEN
        CREATE POLICY "Auth manage attraction_images" ON public.attraction_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Dining Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dining_images' AND policyname = 'Public read dining_images') THEN
        CREATE POLICY "Public read dining_images" ON public.dining_images FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dining_images' AND policyname = 'Auth manage dining_images') THEN
        CREATE POLICY "Auth manage dining_images" ON public.dining_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Story Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'story_images' AND policyname = 'Public read story_images') THEN
        CREATE POLICY "Public read story_images" ON public.story_images FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'story_images' AND policyname = 'Auth manage story_images') THEN
        CREATE POLICY "Auth manage story_images" ON public.story_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Experience Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experience_images' AND policyname = 'Public read experience_images') THEN
        CREATE POLICY "Public read experience_images" ON public.experience_images FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experience_images' AND policyname = 'Auth manage experience_images') THEN
        CREATE POLICY "Auth manage experience_images" ON public.experience_images FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Slider Settings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slider_settings' AND policyname = 'Public read slider_settings') THEN
        CREATE POLICY "Public read slider_settings" ON public.slider_settings FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'slider_settings' AND policyname = 'Auth manage slider_settings') THEN
        CREATE POLICY "Auth manage slider_settings" ON public.slider_settings FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Google Reviews
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'google_reviews' AND policyname = 'Public read google_reviews') THEN
        CREATE POLICY "Public read google_reviews" ON public.google_reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'google_reviews' AND policyname = 'Auth manage google_reviews') THEN
        CREATE POLICY "Auth manage google_reviews" ON public.google_reviews FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- ADD SEASONAL PRICING TO ROOM CATEGORIES
ALTER TABLE public.room_categories ADD COLUMN IF NOT EXISTS seasonal_prices JSONB DEFAULT '{}'::jsonb;

-- ADD EXTRA MATTRESS RATE TO PAYMENT SETTINGS



