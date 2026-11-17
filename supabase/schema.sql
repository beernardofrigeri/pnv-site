CREATE TABLE IF NOT EXISTS public.association_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (
    length(email) BETWEEN 3 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  consented boolean NOT NULL CHECK (consented = true),
  consent_version text NOT NULL CHECK (consent_version = 'interest-v1'),
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.association_interests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.association_interests FROM PUBLIC, anon, authenticated;
GRANT INSERT (name, email, consented, consent_version)
  ON TABLE public.association_interests TO anon;

DROP POLICY IF EXISTS "Allow consented interest submissions" ON public.association_interests;
CREATE POLICY "Allow consented interest submissions"
  ON public.association_interests
  FOR INSERT
  TO anon
  WITH CHECK (
    consented = true
    AND consent_version = 'interest-v1'
    AND length(btrim(name)) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 254
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );
