-- Migration to seed ISO countries into locations table
DO $$
DECLARE
  v_cont_id uuid;
  v_sub_id uuid;
BEGIN
  -- 1. Insert Continents
  INSERT INTO public.locations (name, type, parent_id)
  VALUES ('Asia', 'continent', NULL)
  ON CONFLICT (name, parent_id) DO NOTHING;
  INSERT INTO public.locations (name, type, parent_id)
  VALUES ('Europe', 'continent', NULL)
  ON CONFLICT (name, parent_id) DO NOTHING;
  INSERT INTO public.locations (name, type, parent_id)
  VALUES ('Africa', 'continent', NULL)
  ON CONFLICT (name, parent_id) DO NOTHING;
  INSERT INTO public.locations (name, type, parent_id)
  VALUES ('Oceania', 'continent', NULL)
  ON CONFLICT (name, parent_id) DO NOTHING;
  INSERT INTO public.locations (name, type, parent_id)
  VALUES ('Americas', 'continent', NULL)
  ON CONFLICT (name, parent_id) DO NOTHING;

  -- 2. Insert Sub-regions
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Asia' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Southern Asia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Europe' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Northern Europe', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Europe' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Southern Europe', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Africa' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Northern Africa', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Polynesia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Africa' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Sub-Saharan Africa', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Americas' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Latin America and the Caribbean', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Asia' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Western Asia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Australia and New Zealand', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Europe' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Western Europe', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Europe' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Eastern Europe', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Americas' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Northern America', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Asia' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('South-eastern Asia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Asia' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Eastern Asia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Melanesia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Micronesia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;
  SELECT id INTO v_cont_id FROM public.locations WHERE name = 'Asia' AND type = 'continent' AND parent_id IS NULL;
  IF v_cont_id IS NOT NULL THEN
    INSERT INTO public.locations (name, type, parent_id)
    VALUES ('Central Asia', 'sub-region', v_cont_id)
    ON CONFLICT (name, parent_id) DO NOTHING;
  END IF;

  -- 3. Insert Countries
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Afghanistan', 'country', v_sub_id, 'AF', 'AFG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Åland Islands', 'country', v_sub_id, 'AX', 'ALA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Albania', 'country', v_sub_id, 'AL', 'ALB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Algeria', 'country', v_sub_id, 'DZ', 'DZA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('American Samoa', 'country', v_sub_id, 'AS', 'ASM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Andorra', 'country', v_sub_id, 'AD', 'AND')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Angola', 'country', v_sub_id, 'AO', 'AGO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Anguilla', 'country', v_sub_id, 'AI', 'AIA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
    VALUES ('Antarctica', 'country', NULL, 'AQ', 'ATA')
    ON CONFLICT (name, parent_id) DO NOTHING;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Antigua and Barbuda', 'country', v_sub_id, 'AG', 'ATG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Argentina', 'country', v_sub_id, 'AR', 'ARG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Armenia', 'country', v_sub_id, 'AM', 'ARM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Aruba', 'country', v_sub_id, 'AW', 'ABW')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Australia', 'country', v_sub_id, 'AU', 'AUS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Austria', 'country', v_sub_id, 'AT', 'AUT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Azerbaijan', 'country', v_sub_id, 'AZ', 'AZE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bahamas', 'country', v_sub_id, 'BS', 'BHS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bahrain', 'country', v_sub_id, 'BH', 'BHR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bangladesh', 'country', v_sub_id, 'BD', 'BGD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Barbados', 'country', v_sub_id, 'BB', 'BRB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Belarus', 'country', v_sub_id, 'BY', 'BLR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Belgium', 'country', v_sub_id, 'BE', 'BEL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Belize', 'country', v_sub_id, 'BZ', 'BLZ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Benin', 'country', v_sub_id, 'BJ', 'BEN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern America' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bermuda', 'country', v_sub_id, 'BM', 'BMU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bhutan', 'country', v_sub_id, 'BT', 'BTN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bolivia, Plurinational State of', 'country', v_sub_id, 'BO', 'BOL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bonaire, Sint Eustatius and Saba', 'country', v_sub_id, 'BQ', 'BES')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bosnia and Herzegovina', 'country', v_sub_id, 'BA', 'BIH')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Botswana', 'country', v_sub_id, 'BW', 'BWA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bouvet Island', 'country', v_sub_id, 'BV', 'BVT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Brazil', 'country', v_sub_id, 'BR', 'BRA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('British Indian Ocean Territory', 'country', v_sub_id, 'IO', 'IOT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Brunei Darussalam', 'country', v_sub_id, 'BN', 'BRN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Bulgaria', 'country', v_sub_id, 'BG', 'BGR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Burkina Faso', 'country', v_sub_id, 'BF', 'BFA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Burundi', 'country', v_sub_id, 'BI', 'BDI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cabo Verde', 'country', v_sub_id, 'CV', 'CPV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cambodia', 'country', v_sub_id, 'KH', 'KHM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cameroon', 'country', v_sub_id, 'CM', 'CMR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern America' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Canada', 'country', v_sub_id, 'CA', 'CAN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cayman Islands', 'country', v_sub_id, 'KY', 'CYM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Central African Republic', 'country', v_sub_id, 'CF', 'CAF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Chad', 'country', v_sub_id, 'TD', 'TCD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Chile', 'country', v_sub_id, 'CL', 'CHL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('China', 'country', v_sub_id, 'CN', 'CHN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Christmas Island', 'country', v_sub_id, 'CX', 'CXR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cocos (Keeling) Islands', 'country', v_sub_id, 'CC', 'CCK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Colombia', 'country', v_sub_id, 'CO', 'COL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Comoros', 'country', v_sub_id, 'KM', 'COM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Congo', 'country', v_sub_id, 'CG', 'COG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Congo, Democratic Republic of the', 'country', v_sub_id, 'CD', 'COD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cook Islands', 'country', v_sub_id, 'CK', 'COK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Costa Rica', 'country', v_sub_id, 'CR', 'CRI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Côte d''Ivoire', 'country', v_sub_id, 'CI', 'CIV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Croatia', 'country', v_sub_id, 'HR', 'HRV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cuba', 'country', v_sub_id, 'CU', 'CUB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Curaçao', 'country', v_sub_id, 'CW', 'CUW')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Cyprus', 'country', v_sub_id, 'CY', 'CYP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Czechia', 'country', v_sub_id, 'CZ', 'CZE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Denmark', 'country', v_sub_id, 'DK', 'DNK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Djibouti', 'country', v_sub_id, 'DJ', 'DJI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Dominica', 'country', v_sub_id, 'DM', 'DMA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Dominican Republic', 'country', v_sub_id, 'DO', 'DOM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Ecuador', 'country', v_sub_id, 'EC', 'ECU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Egypt', 'country', v_sub_id, 'EG', 'EGY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('El Salvador', 'country', v_sub_id, 'SV', 'SLV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Equatorial Guinea', 'country', v_sub_id, 'GQ', 'GNQ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Eritrea', 'country', v_sub_id, 'ER', 'ERI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Estonia', 'country', v_sub_id, 'EE', 'EST')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Eswatini', 'country', v_sub_id, 'SZ', 'SWZ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Ethiopia', 'country', v_sub_id, 'ET', 'ETH')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Falkland Islands (Malvinas)', 'country', v_sub_id, 'FK', 'FLK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Faroe Islands', 'country', v_sub_id, 'FO', 'FRO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Melanesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Fiji', 'country', v_sub_id, 'FJ', 'FJI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Finland', 'country', v_sub_id, 'FI', 'FIN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('France', 'country', v_sub_id, 'FR', 'FRA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('French Guiana', 'country', v_sub_id, 'GF', 'GUF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('French Polynesia', 'country', v_sub_id, 'PF', 'PYF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('French Southern Territories', 'country', v_sub_id, 'TF', 'ATF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Gabon', 'country', v_sub_id, 'GA', 'GAB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Gambia', 'country', v_sub_id, 'GM', 'GMB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Georgia', 'country', v_sub_id, 'GE', 'GEO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Germany', 'country', v_sub_id, 'DE', 'DEU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Ghana', 'country', v_sub_id, 'GH', 'GHA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Gibraltar', 'country', v_sub_id, 'GI', 'GIB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Greece', 'country', v_sub_id, 'GR', 'GRC')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern America' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Greenland', 'country', v_sub_id, 'GL', 'GRL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Grenada', 'country', v_sub_id, 'GD', 'GRD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guadeloupe', 'country', v_sub_id, 'GP', 'GLP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guam', 'country', v_sub_id, 'GU', 'GUM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guatemala', 'country', v_sub_id, 'GT', 'GTM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guernsey', 'country', v_sub_id, 'GG', 'GGY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guinea', 'country', v_sub_id, 'GN', 'GIN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guinea-Bissau', 'country', v_sub_id, 'GW', 'GNB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Guyana', 'country', v_sub_id, 'GY', 'GUY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Haiti', 'country', v_sub_id, 'HT', 'HTI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Heard Island and McDonald Islands', 'country', v_sub_id, 'HM', 'HMD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Holy See', 'country', v_sub_id, 'VA', 'VAT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Honduras', 'country', v_sub_id, 'HN', 'HND')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Hong Kong', 'country', v_sub_id, 'HK', 'HKG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Hungary', 'country', v_sub_id, 'HU', 'HUN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Iceland', 'country', v_sub_id, 'IS', 'ISL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('India', 'country', v_sub_id, 'IN', 'IND')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Indonesia', 'country', v_sub_id, 'ID', 'IDN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Iran, Islamic Republic of', 'country', v_sub_id, 'IR', 'IRN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Iraq', 'country', v_sub_id, 'IQ', 'IRQ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Ireland', 'country', v_sub_id, 'IE', 'IRL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Isle of Man', 'country', v_sub_id, 'IM', 'IMN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Israel', 'country', v_sub_id, 'IL', 'ISR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Italy', 'country', v_sub_id, 'IT', 'ITA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Jamaica', 'country', v_sub_id, 'JM', 'JAM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Japan', 'country', v_sub_id, 'JP', 'JPN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Jersey', 'country', v_sub_id, 'JE', 'JEY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Jordan', 'country', v_sub_id, 'JO', 'JOR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Central Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Kazakhstan', 'country', v_sub_id, 'KZ', 'KAZ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Kenya', 'country', v_sub_id, 'KE', 'KEN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Kiribati', 'country', v_sub_id, 'KI', 'KIR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Korea, Democratic People''s Republic of', 'country', v_sub_id, 'KP', 'PRK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Korea, Republic of', 'country', v_sub_id, 'KR', 'KOR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Kuwait', 'country', v_sub_id, 'KW', 'KWT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Central Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Kyrgyzstan', 'country', v_sub_id, 'KG', 'KGZ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Lao People''s Democratic Republic', 'country', v_sub_id, 'LA', 'LAO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Latvia', 'country', v_sub_id, 'LV', 'LVA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Lebanon', 'country', v_sub_id, 'LB', 'LBN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Lesotho', 'country', v_sub_id, 'LS', 'LSO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Liberia', 'country', v_sub_id, 'LR', 'LBR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Libya', 'country', v_sub_id, 'LY', 'LBY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Liechtenstein', 'country', v_sub_id, 'LI', 'LIE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Lithuania', 'country', v_sub_id, 'LT', 'LTU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Luxembourg', 'country', v_sub_id, 'LU', 'LUX')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Macao', 'country', v_sub_id, 'MO', 'MAC')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Madagascar', 'country', v_sub_id, 'MG', 'MDG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Malawi', 'country', v_sub_id, 'MW', 'MWI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Malaysia', 'country', v_sub_id, 'MY', 'MYS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Maldives', 'country', v_sub_id, 'MV', 'MDV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mali', 'country', v_sub_id, 'ML', 'MLI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Malta', 'country', v_sub_id, 'MT', 'MLT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Marshall Islands', 'country', v_sub_id, 'MH', 'MHL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Martinique', 'country', v_sub_id, 'MQ', 'MTQ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mauritania', 'country', v_sub_id, 'MR', 'MRT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mauritius', 'country', v_sub_id, 'MU', 'MUS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mayotte', 'country', v_sub_id, 'YT', 'MYT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mexico', 'country', v_sub_id, 'MX', 'MEX')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Micronesia, Federated States of', 'country', v_sub_id, 'FM', 'FSM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Moldova, Republic of', 'country', v_sub_id, 'MD', 'MDA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Monaco', 'country', v_sub_id, 'MC', 'MCO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mongolia', 'country', v_sub_id, 'MN', 'MNG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Montenegro', 'country', v_sub_id, 'ME', 'MNE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Montserrat', 'country', v_sub_id, 'MS', 'MSR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Morocco', 'country', v_sub_id, 'MA', 'MAR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Mozambique', 'country', v_sub_id, 'MZ', 'MOZ')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Myanmar', 'country', v_sub_id, 'MM', 'MMR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Namibia', 'country', v_sub_id, 'NA', 'NAM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Nauru', 'country', v_sub_id, 'NR', 'NRU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Nepal', 'country', v_sub_id, 'NP', 'NPL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Netherlands, Kingdom of the', 'country', v_sub_id, 'NL', 'NLD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Melanesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('New Caledonia', 'country', v_sub_id, 'NC', 'NCL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('New Zealand', 'country', v_sub_id, 'NZ', 'NZL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Nicaragua', 'country', v_sub_id, 'NI', 'NIC')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Niger', 'country', v_sub_id, 'NE', 'NER')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Nigeria', 'country', v_sub_id, 'NG', 'NGA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Niue', 'country', v_sub_id, 'NU', 'NIU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Australia and New Zealand' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Norfolk Island', 'country', v_sub_id, 'NF', 'NFK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('North Macedonia', 'country', v_sub_id, 'MK', 'MKD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Northern Mariana Islands', 'country', v_sub_id, 'MP', 'MNP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Norway', 'country', v_sub_id, 'NO', 'NOR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Oman', 'country', v_sub_id, 'OM', 'OMN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Pakistan', 'country', v_sub_id, 'PK', 'PAK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Palau', 'country', v_sub_id, 'PW', 'PLW')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Palestine, State of', 'country', v_sub_id, 'PS', 'PSE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Panama', 'country', v_sub_id, 'PA', 'PAN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Melanesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Papua New Guinea', 'country', v_sub_id, 'PG', 'PNG')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Paraguay', 'country', v_sub_id, 'PY', 'PRY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Peru', 'country', v_sub_id, 'PE', 'PER')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Philippines', 'country', v_sub_id, 'PH', 'PHL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Pitcairn', 'country', v_sub_id, 'PN', 'PCN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Poland', 'country', v_sub_id, 'PL', 'POL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Portugal', 'country', v_sub_id, 'PT', 'PRT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Puerto Rico', 'country', v_sub_id, 'PR', 'PRI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Qatar', 'country', v_sub_id, 'QA', 'QAT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Réunion', 'country', v_sub_id, 'RE', 'REU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Romania', 'country', v_sub_id, 'RO', 'ROU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Russian Federation', 'country', v_sub_id, 'RU', 'RUS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Rwanda', 'country', v_sub_id, 'RW', 'RWA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Barthélemy', 'country', v_sub_id, 'BL', 'BLM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Helena, Ascension and Tristan da Cunha', 'country', v_sub_id, 'SH', 'SHN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Kitts and Nevis', 'country', v_sub_id, 'KN', 'KNA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Lucia', 'country', v_sub_id, 'LC', 'LCA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Martin (French part)', 'country', v_sub_id, 'MF', 'MAF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern America' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Pierre and Miquelon', 'country', v_sub_id, 'PM', 'SPM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saint Vincent and the Grenadines', 'country', v_sub_id, 'VC', 'VCT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Samoa', 'country', v_sub_id, 'WS', 'WSM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('San Marino', 'country', v_sub_id, 'SM', 'SMR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sao Tome and Principe', 'country', v_sub_id, 'ST', 'STP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Saudi Arabia', 'country', v_sub_id, 'SA', 'SAU')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Senegal', 'country', v_sub_id, 'SN', 'SEN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Serbia', 'country', v_sub_id, 'RS', 'SRB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Seychelles', 'country', v_sub_id, 'SC', 'SYC')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sierra Leone', 'country', v_sub_id, 'SL', 'SLE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Singapore', 'country', v_sub_id, 'SG', 'SGP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sint Maarten (Dutch part)', 'country', v_sub_id, 'SX', 'SXM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Slovakia', 'country', v_sub_id, 'SK', 'SVK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Slovenia', 'country', v_sub_id, 'SI', 'SVN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Melanesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Solomon Islands', 'country', v_sub_id, 'SB', 'SLB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Somalia', 'country', v_sub_id, 'SO', 'SOM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('South Africa', 'country', v_sub_id, 'ZA', 'ZAF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('South Georgia and the South Sandwich Islands', 'country', v_sub_id, 'GS', 'SGS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('South Sudan', 'country', v_sub_id, 'SS', 'SSD')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Spain', 'country', v_sub_id, 'ES', 'ESP')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Southern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sri Lanka', 'country', v_sub_id, 'LK', 'LKA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sudan', 'country', v_sub_id, 'SD', 'SDN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Suriname', 'country', v_sub_id, 'SR', 'SUR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Svalbard and Jan Mayen', 'country', v_sub_id, 'SJ', 'SJM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Sweden', 'country', v_sub_id, 'SE', 'SWE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Switzerland', 'country', v_sub_id, 'CH', 'CHE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Syrian Arab Republic', 'country', v_sub_id, 'SY', 'SYR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
    VALUES ('Taiwan, Province of China', 'country', NULL, 'TW', 'TWN')
    ON CONFLICT (name, parent_id) DO NOTHING;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Central Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tajikistan', 'country', v_sub_id, 'TJ', 'TJK')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tanzania, United Republic of', 'country', v_sub_id, 'TZ', 'TZA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Thailand', 'country', v_sub_id, 'TH', 'THA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Timor-Leste', 'country', v_sub_id, 'TL', 'TLS')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Togo', 'country', v_sub_id, 'TG', 'TGO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tokelau', 'country', v_sub_id, 'TK', 'TKL')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tonga', 'country', v_sub_id, 'TO', 'TON')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Trinidad and Tobago', 'country', v_sub_id, 'TT', 'TTO')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tunisia', 'country', v_sub_id, 'TN', 'TUN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Türkiye', 'country', v_sub_id, 'TR', 'TUR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Central Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Turkmenistan', 'country', v_sub_id, 'TM', 'TKM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Turks and Caicos Islands', 'country', v_sub_id, 'TC', 'TCA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Tuvalu', 'country', v_sub_id, 'TV', 'TUV')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Uganda', 'country', v_sub_id, 'UG', 'UGA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Eastern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Ukraine', 'country', v_sub_id, 'UA', 'UKR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('United Arab Emirates', 'country', v_sub_id, 'AE', 'ARE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Europe' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Europe' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('United Kingdom of Great Britain and Northern Ireland', 'country', v_sub_id, 'GB', 'GBR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern America' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('United States of America', 'country', v_sub_id, 'US', 'USA')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Micronesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('United States Minor Outlying Islands', 'country', v_sub_id, 'UM', 'UMI')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Uruguay', 'country', v_sub_id, 'UY', 'URY')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Central Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Uzbekistan', 'country', v_sub_id, 'UZ', 'UZB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Melanesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Vanuatu', 'country', v_sub_id, 'VU', 'VUT')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Venezuela, Bolivarian Republic of', 'country', v_sub_id, 'VE', 'VEN')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'South-eastern Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Viet Nam', 'country', v_sub_id, 'VN', 'VNM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Virgin Islands (British)', 'country', v_sub_id, 'VG', 'VGB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Latin America and the Caribbean' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Americas' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Virgin Islands (U.S.)', 'country', v_sub_id, 'VI', 'VIR')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Polynesia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Oceania' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Wallis and Futuna', 'country', v_sub_id, 'WF', 'WLF')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Northern Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Western Sahara', 'country', v_sub_id, 'EH', 'ESH')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Western Asia' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Asia' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Yemen', 'country', v_sub_id, 'YE', 'YEM')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Zambia', 'country', v_sub_id, 'ZM', 'ZMB')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
  SELECT id INTO v_sub_id FROM public.locations l
    WHERE l.name = 'Sub-Saharan Africa' AND l.type = 'sub-region'
    AND l.parent_id = (SELECT id FROM public.locations WHERE name = 'Africa' AND type = 'continent' LIMIT 1);
    IF v_sub_id IS NOT NULL THEN
      INSERT INTO public.locations (name, type, parent_id, iso_code, alpha_3)
      VALUES ('Zimbabwe', 'country', v_sub_id, 'ZW', 'ZWE')
      ON CONFLICT (name, parent_id) DO NOTHING;
    END IF;
END $$;
