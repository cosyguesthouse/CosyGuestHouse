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

-- Note: Ensure to configure RLS securely directly in the Supabase dashboard afterwards so admins can insert and public can SELECT.
-- Example of enabling RLS on attractions:
-- ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow selects public" ON public.attractions FOR SELECT USING (true);
