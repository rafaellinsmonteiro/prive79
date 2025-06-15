
-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create model_categories join table to allow many-to-many Model <-> Category
CREATE TABLE public.model_categories (
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (model_id, category_id)
);

-- Optional: Public read access (view categories and associations), lock down writes if needed
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_categories ENABLE ROW LEVEL SECURITY;

-- Policies for public read
CREATE POLICY "Allow public read on categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on model_categories"
  ON public.model_categories FOR SELECT
  USING (true);

-- (You should add more policies for insert/update/delete as desired)
