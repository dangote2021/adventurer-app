-- =============================================================================
-- Adventurer V5 — Supabase Seed Data
-- =============================================================================
-- Idempotent: uses ON CONFLICT (id) DO NOTHING throughout.
-- Tables: auth.users, auth.identities, profiles, spots, events, coaches,
--         market_items.
-- Deterministic UUIDs for coaches/profiles so re-runs are safe.
-- =============================================================================


-- ======================= AUTH.USERS (8 coach users) ==========================
-- Insert fake users into Supabase auth schema so profiles FK is satisfied.
-- Password hash = bcrypt of 'password123' (dev only, never use in production).

INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
)
VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'marie.dupont@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Marie Dupont"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0002-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'yann.legoff@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Yann Le Goff"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0003-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'sophie.martin@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Sophie Martin"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0004-4000-a000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'lucas.moreau@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Lucas Moreau"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0005-4000-a000-000000000005', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'emma.petit@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Emma Petit"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0006-4000-a000-000000000006', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'thomas.bernard@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Thomas Bernard"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0007-4000-a000-000000000007', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'julie.roux@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Julie Roux"}'::jsonb,
   now(), now(), '', ''),

  ('a1b2c3d4-0008-4000-a000-000000000008', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated',
   'pierre.fabre@adventurer.dev',
   '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012',
   now(), '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Pierre Fabre"}'::jsonb,
   now(), now(), '', '')

ON CONFLICT (id) DO NOTHING;


-- ======================= AUTH.IDENTITIES =====================================

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-0001-4000-a000-000000000001',
   'a1b2c3d4-0001-4000-a000-000000000001', 'email',
   '{"sub":"a1b2c3d4-0001-4000-a000-000000000001","email":"marie.dupont@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0002-4000-a000-000000000002',
   'a1b2c3d4-0002-4000-a000-000000000002', 'email',
   '{"sub":"a1b2c3d4-0002-4000-a000-000000000002","email":"yann.legoff@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0003-4000-a000-000000000003',
   'a1b2c3d4-0003-4000-a000-000000000003', 'email',
   '{"sub":"a1b2c3d4-0003-4000-a000-000000000003","email":"sophie.martin@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0004-4000-a000-000000000004',
   'a1b2c3d4-0004-4000-a000-000000000004', 'email',
   '{"sub":"a1b2c3d4-0004-4000-a000-000000000004","email":"lucas.moreau@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0005-4000-a000-000000000005',
   'a1b2c3d4-0005-4000-a000-000000000005', 'email',
   '{"sub":"a1b2c3d4-0005-4000-a000-000000000005","email":"emma.petit@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0006-4000-a000-000000000006',
   'a1b2c3d4-0006-4000-a000-000000000006', 'email',
   '{"sub":"a1b2c3d4-0006-4000-a000-000000000006","email":"thomas.bernard@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0007-4000-a000-000000000007',
   'a1b2c3d4-0007-4000-a000-000000000007', 'email',
   '{"sub":"a1b2c3d4-0007-4000-a000-000000000007","email":"julie.roux@adventurer.dev"}'::jsonb,
   now(), now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0008-4000-a000-000000000008',
   'a1b2c3d4-0008-4000-a000-000000000008', 'email',
   '{"sub":"a1b2c3d4-0008-4000-a000-000000000008","email":"pierre.fabre@adventurer.dev"}'::jsonb,
   now(), now(), now())

ON CONFLICT DO NOTHING;


-- ======================= PROFILES (8 coach profiles) =========================

INSERT INTO profiles (id, name, avatar, location, bio, level, joined_date, is_online, last_seen, created_at, updated_at)
VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001',
   'Marie Dupont', '🏃', 'Chamonix, France',
   'Coach trail & ultra-trail certifiée ITRA. Finisheuse UTMB, spécialisée en plans d''entraînement sur mesure et nutrition de course.',
   'Expert', now(), false, now(), now(), now()),

  ('a1b2c3d4-0002-4000-a000-000000000002',
   'Yann Le Goff', '🪁', 'Brest, France',
   'Instructeur kitesurf IKO Level 3 et wing foil. Ancien compétiteur, passionné par la transmission et les sports de glisse.',
   'Expert', now(), false, now(), now(), now()),

  ('a1b2c3d4-0003-4000-a000-000000000003',
   'Sophie Martin', '🧗', 'Annecy, France',
   'Guide de haute montagne UIAGM, spécialiste alpinisme et escalade. Passionnée par les grandes voies et la formation de futurs alpinistes.',
   'Expert', now(), false, now(), now(), now()),

  ('a1b2c3d4-0004-4000-a000-000000000004',
   'Lucas Moreau', '🏄', 'Hossegor, France',
   'Coach surf et bodyboard ISA Level 2. Ancien compétiteur WQS, spécialiste du tube et de la lecture de houle sur les beachbreaks landais.',
   'Confirmé', now(), false, now(), now(), now()),

  ('a1b2c3d4-0005-4000-a000-000000000005',
   'Emma Petit', '🤿', 'Nice, France',
   'PADI Master Scuba Diver Trainer et instructrice apnée AIDA. Spécialisée dans la plongée en Méditerranée et l''apnée profonde.',
   'Expert', now(), false, now(), now(), now()),

  ('a1b2c3d4-0006-4000-a000-000000000006',
   'Thomas Bernard', '🏔️', 'Millau, France',
   'Moniteur canyoning et via ferrata diplômé d''État. Expert des gorges du Tarn et des Causses, encadrement tous niveaux.',
   'Confirmé', now(), false, now(), now(), now()),

  ('a1b2c3d4-0007-4000-a000-000000000007',
   'Julie Roux', '🚵', 'Morzine, France',
   'Coach VTT et vélo BEES, spécialiste enduro et cross-country dans les Alpes. Passionnée par le bike park et les itinéraires engagés.',
   'Expert', now(), false, now(), now(), now()),

  ('a1b2c3d4-0008-4000-a000-000000000008',
   'Pierre Fabre', '⛷️', 'Saint-Lary-Soulan, France',
   'Guide ski de randonnée et alpinisme dans les Pyrénées. Spécialiste nivologie, courses glaciaires et couloirs engagés.',
   'Expert', now(), false, now(), now(), now())

ON CONFLICT (id) DO NOTHING;


-- ======================= SPOTS (32 spots) ==================================

INSERT INTO spots (id, name, type, sport, description, emoji, rating, location, created_at, updated_at)
VALUES
  -- ---- Trail / Rando ----
  (gen_random_uuid(), 'Aiguilles Rouges', 'sentier', 'trail',
   'Sentier panoramique face au massif du Mont-Blanc. Départ du col des Montets, passage par le Lac Blanc. Dénivelé ~1 000 m, difficulté moyenne. Vue imprenable sur les Aiguilles de Chamonix et la Mer de Glace.',
   '🥾', 4.9, ST_Point(6.8700, 45.9700)::geography, now(), now()),

  (gen_random_uuid(), 'Sentier des Crêtes, Cassis', 'sentier', 'trail',
   'Randonnée mythique le long des falaises des Calanques entre Cassis et La Ciotat. Vues plongeantes sur la Méditerranée, Cap Canaille — la plus haute falaise maritime d''Europe (394 m).',
   '🥾', 4.7, ST_Point(5.5400, 43.2100)::geography, now(), now()),

  (gen_random_uuid(), 'GR20 Nord — Calenzana', 'sentier', 'trail',
   'Départ mythique du GR20, considéré comme le sentier de grande randonnée le plus difficile d''Europe. Étape Calenzana → Refuge d''Ortu di u Piobbu. Terrain technique, pierriers et maquis corse.',
   '🏔️', 5.0, ST_Point(8.8560, 42.5080)::geography, now(), now()),

  (gen_random_uuid(), 'Tour du Mont Blanc — Courmayeur', 'sentier', 'trail',
   'Section italienne du TMB. Versant sud du Mont-Blanc avec vue sur les glaciers du Miage et de la Brenva. Passage par le Val Ferret, ambiance alpine grandiose.',
   '🏔️', 4.8, ST_Point(6.9700, 45.7967)::geography, now(), now()),

  (gen_random_uuid(), 'Sentier Cathare', 'sentier', 'trail',
   'Itinéraire historique de 250 km reliant les châteaux cathares du Languedoc. Paysages de garrigue, gorges et forêts. Passage par Quéribus, Peyrepertuse et Montségur.',
   '🏰', 4.5, ST_Point(2.3600, 42.8700)::geography, now(), now()),

  (gen_random_uuid(), 'Cirque de Gavarnie', 'sentier', 'trail',
   'Site classé UNESCO au cœur des Pyrénées. Parois de 1 500 m de haut, cascade de 423 m (la plus haute de France). Randonnée accessible depuis le village de Gavarnie.',
   '🏔️', 4.9, ST_Point(-0.0100, 42.7350)::geography, now(), now()),

  (gen_random_uuid(), 'Vercors Grande Traversée', 'sentier', 'trail',
   'Traversée du massif du Vercors par les hauts plateaux. Paysages karstiques uniques, forêts de pins à crochets et prairies d''altitude. Faune sauvage : bouquetins, vautours fauves.',
   '🌲', 4.6, ST_Point(5.4500, 44.8700)::geography, now(), now()),

  -- ---- Kitesurf ----
  (gen_random_uuid(), 'Tarifa — Los Lances', 'spot', 'kitesurf',
   'Mecque du kitesurf européen. Vents de Levante (est) et Poniente (ouest) quasi permanents. Plage de sable fin, eau turquoise, vue sur le Maroc. Conditions idéales de mars à octobre.',
   '🪁', 4.9, ST_Point(-5.6049, 36.0087)::geography, now(), now()),

  (gen_random_uuid(), 'Dakhla — Lagon', 'spot', 'kitesurf',
   'Lagon de flat water parfait pour le freestyle et le foil. Eau chaude toute l''année, vent constant 20-30 nœuds. Spot isolé dans le Sahara marocain, ambiance unique.',
   '🪁', 5.0, ST_Point(-15.9320, 23.7130)::geography, now(), now()),

  (gen_random_uuid(), 'Leucate — La Franqui', 'spot', 'kitesurf',
   'Spot mythique de la Tramontane dans l''Aude. Vent puissant et régulier (nord-ouest). Lagune peu profonde idéale pour l''apprentissage, et pleine mer pour les confirmés.',
   '🪁', 4.6, ST_Point(3.0370, 42.9280)::geography, now(), now()),

  (gen_random_uuid(), 'Hyères — Almanarre', 'spot', 'kitesurf',
   'Spot phare de la Côte d''Azur. Double exposition Mistral/Est. Presqu''île de Giens avec vue sur Porquerolles. Flat en lagune côté étang, vagues côté mer.',
   '🪁', 4.7, ST_Point(6.1350, 43.0640)::geography, now(), now()),

  (gen_random_uuid(), 'Essaouira — Sidi Kaouki', 'spot', 'kitesurf',
   'Alizé puissant et régulier sur la côte atlantique marocaine. Plage immense, houle constante. Ambiance bohème, hébergements abordables. Meilleure saison : avril à septembre.',
   '🪁', 4.5, ST_Point(-9.7870, 31.3570)::geography, now(), now()),

  (gen_random_uuid(), 'Fuerteventura — Sotavento', 'spot', 'kitesurf',
   'Lagune naturelle qui se forme à marée basse sur plusieurs kilomètres. Eau cristalline, vent constant 25+ nœuds. Accueille le championnat du monde de windsurf et kite.',
   '🪁', 4.8, ST_Point(-14.2260, 28.0710)::geography, now(), now()),

  (gen_random_uuid(), 'Le Morne — Maurice', 'spot', 'kitesurf',
   'Lagon turquoise protégé par la barrière de corail. One Eye : vague de reef mondialement connue pour le wave riding. Le Morne Brabant classé UNESCO en toile de fond.',
   '🪁', 4.9, ST_Point(57.3120, -20.4500)::geography, now(), now()),

  -- ---- Escalade / Bloc ----
  (gen_random_uuid(), 'Fontainebleau — Bas Cuvier', 'spot', 'escalade',
   'Site de bloc mythique, berceau de l''escalade de bloc moderne. Grès aux formes sculpturales, circuits colorés de tous niveaux. Ambiance forêt domaniale, sable fin au pied des blocs.',
   '🧗', 4.8, ST_Point(2.6360, 48.4080)::geography, now(), now()),

  (gen_random_uuid(), 'Gorges du Verdon', 'spot', 'escalade',
   'Grandes voies calcaires de 300 m dans le plus grand canyon d''Europe. Falaises verticales au-dessus des eaux turquoise du Verdon. Voies historiques : Pichenibule, Mangoustine.',
   '🧗', 4.9, ST_Point(6.3900, 43.7630)::geography, now(), now()),

  (gen_random_uuid(), 'Céüse', 'spot', 'escalade',
   'Falaise en arc de cercle considérée comme l''une des plus belles du monde. Calcaire compact à gouttes d''eau, dévers athlétiques. "Biographie" (9a+) ouverte par Chris Sharma.',
   '🧗', 5.0, ST_Point(5.9380, 44.5050)::geography, now(), now()),

  (gen_random_uuid(), 'Calanques — En-Vau', 'spot', 'escalade',
   'Escalade en bord de mer dans le Parc National des Calanques. Calcaire blanc sculpté, voies de 30 à 100 m avec vue sur la Méditerranée. Accès par sentier ou en kayak.',
   '🧗', 4.7, ST_Point(5.5000, 43.2000)::geography, now(), now()),

  (gen_random_uuid(), 'Buis-les-Baronnies', 'spot', 'escalade',
   'Falaises calcaires ensoleillées dans les Baronnies provençales. Plus de 1 500 voies du 3 au 8c. Rocher gris à trous et colonnettes, ambiance Provence. Grimpable toute l''année.',
   '🧗', 4.5, ST_Point(5.2700, 44.2750)::geography, now(), now()),

  -- ---- Plongée / Apnée ----
  (gen_random_uuid(), 'Réserve de Scandola — Corse', 'spot', 'plongée',
   'Réserve naturelle UNESCO, eaux cristallines et fonds marins préservés. Mérous, corail rouge, langoustes. Orgues rhyolitiques sous-marines spectaculaires. Accès par bateau depuis Porto.',
   '🤿', 5.0, ST_Point(8.5700, 42.3700)::geography, now(), now()),

  (gen_random_uuid(), 'Blue Hole — Dahab, Egypte', 'spot', 'apnée',
   'Trou bleu de 130 m de profondeur en mer Rouge. Site d''apnée et plongée mondialement connu. Arche sous-marine à 56 m. Eaux chaudes, visibilité exceptionnelle, coraux intacts.',
   '🤿', 4.9, ST_Point(34.5400, 28.5720)::geography, now(), now()),

  (gen_random_uuid(), 'Île de Porquerolles', 'spot', 'plongée',
   'Parc national de Port-Cros et Porquerolles. Herbiers de posidonie, épaves, tombants colorés. Mérous bruns, barracudas, murènes. Eau claire, plongée accessible de avril à novembre.',
   '🤿', 4.7, ST_Point(6.2030, 43.0030)::geography, now(), now()),

  -- ---- Surf ----
  (gen_random_uuid(), 'Hossegor — La Gravière', 'spot', 'surf',
   'Beach break puissant, l''un des meilleurs tubes d''Europe. Bancs de sable changeants, vagues creuses et rapides. Accueille le Quiksilver Pro France (WCT). Réservé aux surfeurs expérimentés.',
   '🏄', 4.9, ST_Point(-1.4470, 43.6590)::geography, now(), now()),

  (gen_random_uuid(), 'Biarritz — Grande Plage', 'spot', 'surf',
   'Berceau du surf en Europe depuis 1957. Vagues accessibles pour tous niveaux. Ambiance iconique avec le Rocher de la Vierge et le phare. Spot urbain, écoles de surf nombreuses.',
   '🏄', 4.6, ST_Point(-1.5620, 43.4830)::geography, now(), now()),

  (gen_random_uuid(), 'Guéthary', 'spot', 'surf',
   'Reef break basque de classe mondiale. Parlementia : vague de gros jusqu''à 6 m. Village de pêcheurs pittoresque, falaises verdoyantes. Pour surfeurs confirmés uniquement.',
   '🏄', 4.8, ST_Point(-1.6130, 43.4210)::geography, now(), now()),

  (gen_random_uuid(), 'Ericeira — Ribeira d''Ilhas', 'spot', 'surf',
   'Réserve mondiale de surf (WSR) au Portugal. Point break droit parfait sur dalle calcaire. Vagues régulières de 1 à 3 m, idéal intermédiaire à avancé. Village authentique à 30 min de Lisbonne.',
   '🏄', 4.8, ST_Point(-9.4190, 38.9680)::geography, now(), now()),

  -- ---- Parapente ----
  (gen_random_uuid(), 'Annecy — Col de la Forclaz', 'spot', 'parapente',
   'Décollage emblématique face au lac d''Annecy. Vol thermique et panoramique au-dessus du lac turquoise, les Dents de Lanfon et la Tournette. Atterrissage à Doussard. Vol biplace très populaire.',
   '🪂', 4.9, ST_Point(6.2050, 45.8100)::geography, now(), now()),

  (gen_random_uuid(), 'Saint-Hilaire-du-Touvet', 'spot', 'parapente',
   'Site historique du parapente français, plateau de la Chartreuse. Accueille la Coupe Icare chaque septembre. Décollage à 1 000 m au-dessus de la vallée du Grésivaudan, conditions thermiques excellentes.',
   '🪂', 4.8, ST_Point(5.8870, 45.3070)::geography, now(), now()),

  (gen_random_uuid(), 'Dune du Pyla', 'spot', 'parapente',
   'Vol en soaring sur la plus haute dune d''Europe (110 m). Vent d''ouest régulier, vue sur le Bassin d''Arcachon et la forêt landaise. Idéal pour l''initiation et le vol en coucher de soleil.',
   '🪂', 4.5, ST_Point(-1.2120, 44.5890)::geography, now(), now()),

  -- ---- Ski de rando ----
  (gen_random_uuid(), 'Col du Galibier', 'spot', 'ski de rando',
   'Itinéraire classique de ski de randonnée dans les Alpes du Sud. Départ du Lautaret, montée régulière vers le col à 2 642 m. Descente nord en poudreuse face aux Écrins. Dénivelé ~800 m.',
   '⛷️', 4.7, ST_Point(6.4080, 45.0640)::geography, now(), now()),

  (gen_random_uuid(), 'Vallée Blanche — Chamonix', 'spot', 'ski de rando',
   'Descente glaciaire mythique de 20 km, du sommet de l''Aiguille du Midi (3 842 m) à Chamonix. Passage par la Mer de Glace. Paysage haute montagne exceptionnel. Guide obligatoire.',
   '⛷️', 5.0, ST_Point(6.8650, 45.8300)::geography, now(), now())

ON CONFLICT (id) DO NOTHING;


-- ======================= EVENTS (10 events) ================================

INSERT INTO events (id, title, description, emoji, sport, location, date, price, spots_available, tag, created_by)
VALUES
  (gen_random_uuid(),
   'Ultra-Trail du Mont-Blanc 2026',
   'La course mythique autour du Mont-Blanc : 171 km, 10 000 m D+, passage par la France, l''Italie et la Suisse. L''événement trail le plus prestigieux au monde.',
   '🏃', 'trail', 'Chamonix, France',
   '2026-08-28T06:00:00+02:00', 38000, 2500, 'compétition', NULL),

  (gen_random_uuid(),
   'Championnat de France de Kite',
   'Étape du championnat de France de kitesurf freestyle et big air. Les meilleurs riders français s''affrontent sur le spot de La Franqui. Entrée gratuite pour les spectateurs.',
   '🪁', 'kitesurf', 'Leucate, France',
   '2026-06-15T09:00:00+02:00', 0, 200, 'compétition', NULL),

  (gen_random_uuid(),
   'Festival Outdoor Annecy',
   'Festival dédié aux sports de plein air : projections de films d''aventure, expositions de matériel, conférences d''athlètes, essais de matériel sur le lac et en montagne.',
   '🎬', 'multisport', 'Annecy, France',
   '2026-07-10T10:00:00+02:00', 2500, 5000, 'festival', NULL),

  (gen_random_uuid(),
   'Trail des Calanques',
   'Course trail dans le Parc National des Calanques. Parcours de 30 km entre Cassis et Marseille, sentiers techniques au-dessus de la Méditerranée. Ambiance unique.',
   '🏃', 'trail', 'Cassis, France',
   '2026-03-08T07:30:00+01:00', 5500, 800, 'compétition', NULL),

  (gen_random_uuid(),
   'Coupe Icare 2026',
   'Plus grand festival de vol libre au monde à Saint-Hilaire-du-Touvet. Déguisements délirants, spectacle aérien, village exposants. Gratuit et ouvert à tous.',
   '🪂', 'parapente', 'Saint-Hilaire-du-Touvet, France',
   '2026-09-18T09:00:00+02:00', 0, 10000, 'festival', NULL),

  (gen_random_uuid(),
   'Roc d''Azur VTT',
   'Le plus grand rassemblement VTT au monde à Fréjus. Courses XC, enduro, e-bike, randos encadrées, village expo de 800 marques. 5 jours de fête du vélo.',
   '🚵', 'vtt', 'Fréjus, France',
   '2026-10-08T08:00:00+02:00', 4500, 3000, 'compétition', NULL),

  (gen_random_uuid(),
   'XTERRA France',
   'Triathlon nature cross : 1,5 km natation en lac, 30 km VTT, 10 km trail. Cadre exceptionnel des Vosges. Étape qualificative pour les championnats du monde XTERRA.',
   '🏊', 'multisport', 'Xonrupt-Longemer, France',
   '2026-06-20T08:00:00+02:00', 9500, 600, 'compétition', NULL),

  (gen_random_uuid(),
   'Salon de la Plongée 2026',
   'Le rendez-vous annuel de la plongée à Paris : exposants, conférences, baptêmes en piscine, projections sous-marines, stands de destinations plongée du monde entier.',
   '🤿', 'plongée', 'Paris, France',
   '2026-01-10T10:00:00+01:00', 1500, 8000, 'salon', NULL),

  (gen_random_uuid(),
   'GR20 Challenge Communautaire',
   'Défi communautaire Adventurer : traversée intégrale du GR20 en autonomie. Départ groupé de Calenzana, entraide et partage sur l''app. Places limitées à 50 aventuriers.',
   '🏔️', 'trail', 'Calenzana, Corse, France',
   '2026-07-01T05:00:00+02:00', 0, 50, 'communauté', NULL),

  (gen_random_uuid(),
   'Riviera Water Bike Challenge',
   'Course de water bikes (vélos aquatiques) sur la Baie des Anges à Nice. 10 km de parcours côtier, ambiance festive sur la Promenade des Anglais. Accessible à tous.',
   '🚴', 'multisport', 'Nice, France',
   '2026-05-05T09:00:00+02:00', 3500, 400, 'compétition', NULL)

ON CONFLICT (id) DO NOTHING;


-- ======================= COACHES (8 coaches) ===============================

INSERT INTO coaches (
  id, display_name, bio, sports, certifications, languages,
  base_location, hourly_rate_cents, rating_avg, review_count, session_count
)
VALUES
  ('a1b2c3d4-0001-4000-a000-000000000001',
   'Marie Dupont',
   'Finisheuse UTMB 2023, coach diplômée d''État. Je construis ton plan sur 16-24 semaines en fonction de ton job, ta famille et ta course cible. Aussi formée en nutrition sportive INSEP.',
   ARRAY['trail', 'ultra-trail'],
   ARRAY['ITRA Certified Coach', 'Diplôme d''État Trail', 'Nutrition sportive INSEP'],
   ARRAY['Français', 'Anglais'],
   'Chamonix, France', 7500, 4.9, 87, 312),

  ('a1b2c3d4-0002-4000-a000-000000000002',
   'Yann Le Goff',
   'Instructeur IKO Level 3 basé à Brest, spécialiste kitesurf et wing foil. 12 ans d''expérience, ancien compétiteur sur le circuit PKRA. Sessions adaptées à tous niveaux, du waterstart au foil.',
   ARRAY['kitesurf', 'wing foil'],
   ARRAY['IKO Level 3 Instructor', 'BPJEPS Nautisme', 'PSC1 Sauveteur aquatique'],
   ARRAY['Français', 'Anglais', 'Breton'],
   'Brest, France', 8000, 4.8, 64, 248),

  ('a1b2c3d4-0003-4000-a000-000000000003',
   'Sophie Martin',
   'Guide de haute montagne UIAGM depuis 2014. Spécialiste alpinisme et escalade grandes voies autour d''Annecy et du massif du Mont-Blanc. Première féminine de la face nord des Drus en hivernale.',
   ARRAY['alpinisme', 'escalade'],
   ARRAY['Guide UIAGM', 'Secouriste montagne PGHM', 'Instructrice FFME'],
   ARRAY['Français', 'Anglais', 'Italien'],
   'Annecy, France', 9000, 4.9, 73, 420),

  ('a1b2c3d4-0004-4000-a000-000000000004',
   'Lucas Moreau',
   'Ancien circuit WQS, coach surf et bodyboard à Hossegor depuis 2018. Spécialiste du tube et de la lecture de houle. Sessions filmées avec debrief vidéo systématique.',
   ARRAY['surf', 'bodyboard'],
   ARRAY['ISA Level 2 Coach', 'BPJEPS Surf', 'Sauveteur côtier SNSM'],
   ARRAY['Français', 'Anglais', 'Espagnol'],
   'Hossegor, France', 7000, 4.7, 52, 185),

  ('a1b2c3d4-0005-4000-a000-000000000005',
   'Emma Petit',
   'PADI Master Scuba Diver Trainer et instructrice apnée AIDA 3 étoiles. Spécialisée Méditerranée (Villefranche, îles de Lérins, Porquerolles). Tables CO2/O2, technique mouthfill, vidéo subaquatique.',
   ARRAY['plongée', 'apnée'],
   ARRAY['PADI Master Scuba Diver Trainer', 'AIDA Instructor 3★', 'Secouriste CFPS'],
   ARRAY['Français', 'Anglais', 'Italien'],
   'Nice, France', 8500, 4.9, 68, 295),

  ('a1b2c3d4-0006-4000-a000-000000000006',
   'Thomas Bernard',
   'Moniteur canyoning et via ferrata diplômé d''État, basé à Millau au cœur des Gorges du Tarn. Encadrement tous niveaux, du canyon ludique au canyon sportif engagé. Spécialiste Causses et Cévennes.',
   ARRAY['canyoning', 'via ferrata'],
   ARRAY['Diplôme d''État Canyoning', 'Brevet Via Ferrata', 'PSC1'],
   ARRAY['Français', 'Anglais'],
   'Millau, France', 6500, 4.6, 41, 167),

  ('a1b2c3d4-0007-4000-a000-000000000007',
   'Julie Roux',
   'Coach VTT BEES spécialisée enduro et cross-country dans les Portes du Soleil. Ancienne championne régionale enduro, je propose des sessions techniques en bike park et des sorties itinérantes.',
   ARRAY['VTT', 'vélo'],
   ARRAY['BEES VTT', 'Monitrice Cycliste Français', 'PSC1'],
   ARRAY['Français', 'Anglais'],
   'Morzine, France', 7000, 4.8, 56, 203),

  ('a1b2c3d4-0008-4000-a000-000000000008',
   'Pierre Fabre',
   'Guide ski de randonnée et alpinisme dans les Pyrénées centrales. Spécialiste nivologie, courses glaciaires et couloirs engagés. Sorties en petit groupe (3 pers. max) pour garantir la sécurité.',
   ARRAY['ski de rando', 'alpinisme'],
   ARRAY['Aspirant Guide UIAGM', 'Brevet nivologie', 'Secouriste montagne'],
   ARRAY['Français', 'Espagnol', 'Anglais'],
   'Saint-Lary-Soulan, France', 8000, 4.8, 49, 178)

ON CONFLICT (id) DO NOTHING;

-- Publish and verify all seed coaches
UPDATE coaches
SET is_published = true, is_verified = true
WHERE id IN (
  'a1b2c3d4-0001-4000-a000-000000000001',
  'a1b2c3d4-0002-4000-a000-000000000002',
  'a1b2c3d4-0003-4000-a000-000000000003',
  'a1b2c3d4-0004-4000-a000-000000000004',
  'a1b2c3d4-0005-4000-a000-000000000005',
  'a1b2c3d4-0006-4000-a000-000000000006',
  'a1b2c3d4-0007-4000-a000-000000000007',
  'a1b2c3d4-0008-4000-a000-000000000008'
);


-- ======================= MARKET ITEMS (15 items) ===========================

INSERT INTO market_items (id, seller_id, title, description, emoji, price, type, condition, sport, created_at, updated_at)
VALUES
  -- Marie Dupont (trail) — 3 items
  (gen_random_uuid(), 'a1b2c3d4-0001-4000-a000-000000000001',
   'Hoka Speedgoat 5 — Taille 42',
   'Environ 400 km au compteur. Semelle Vibram encore correcte, amorti préservé. Coloris noir/orange. Idéales pour sentiers techniques et ultra-trail.',
   '👟', 95.00, 'sell', 'bon état', 'trail', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0001-4000-a000-000000000001',
   'GPS Garmin Fenix 7X Sapphire Solar',
   'Parfait état, bracelet silicone neuf offert. Cartographie TopoActive, oxymètre, altimètre baro. Autonomie record (37 jours mode montre). Boîte et câble inclus.',
   '⌚', 350.00, 'sell', 'très bon état', 'trail', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0001-4000-a000-000000000001',
   'Sac trail Salomon ADV Skin 12 Set — Taille M/L',
   'Bon état, quelques traces d''usure cosmétique. Flasques souples 500 ml incluses. Système de serrage SensiFit. Parfait pour les ultras.',
   '🎒', 75.00, 'sell', 'bon état', 'trail', now(), now()),

  -- Yann Le Goff (kitesurf) — 2 items
  (gen_random_uuid(), 'a1b2c3d4-0002-4000-a000-000000000002',
   'Aile kite North Orbit 12m — 2024',
   '2 saisons d''utilisation, petite réparation sur le bord d''attaque droit (pro, invisible en vol). Bridage intact, sac de rangement inclus. Polyvalente freeride/vagues.',
   '🪁', 850.00, 'sell', 'bon état', 'kitesurf', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0002-4000-a000-000000000002',
   'Harnais kite Mystic Majestic X — Taille L',
   '1 an d''utilisation, aucun point d''usure. Coque rigide carbone, confort excellent. Crochet coulissant Bionic Core. Noir mat.',
   '🪁', 150.00, 'sell', 'très bon état', 'kitesurf', now(), now()),

  -- Sophie Martin (escalade/alpinisme) — 2 items
  (gen_random_uuid(), 'a1b2c3d4-0003-4000-a000-000000000003',
   'Baudrier Petzl Sitta — Taille M',
   'Comme neuf, utilisé une dizaine de fois en falaise. Ultra-léger (270 g), confort exceptionnel. Idéal pour la grimpe sportive et les grandes voies.',
   '🧗', 85.00, 'sell', 'comme neuf', 'escalade', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0003-4000-a000-000000000003',
   'Chaussons escalade La Sportiva Solution — 40',
   'Ressemelés une fois (Vibram XS Grip 2). Chausson précis et puissant pour le bloc et la falaise. Velcro fonctionnel. Bon pour encore ~6 mois.',
   '🧗', 65.00, 'sell', 'état correct', 'escalade', now(), now()),

  -- Lucas Moreau (surf) — 2 items
  (gen_random_uuid(), 'a1b2c3d4-0004-4000-a000-000000000004',
   'Combinaison Billabong Furnace 4/3 — Taille M',
   '1 saison de surf (environ 80 sessions). Pas de trous ni de décollements. Fermeture zip poitrine fonctionnelle. Chaude et souple.',
   '🏄', 120.00, 'sell', 'bon état', 'surf', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0004-4000-a000-000000000004',
   'Planche surf Al Merrick Neck Beard 2 — 6''2',
   'Quelques pressions sur le deck (réparées), rails intacts. Shape polyvalent pour vagues de 1 à 2 m. Dérives FCS II Performer incluses.',
   '🏄', 280.00, 'sell', 'bon état', 'surf', now(), now()),

  -- Emma Petit (plongée/apnée) — 2 items
  (gen_random_uuid(), 'a1b2c3d4-0005-4000-a000-000000000005',
   'Masque apnée Cressi Nano — noir',
   'Comme neuf, utilisé 5 fois en piscine. Volume interne ultra-réduit pour l''apnée. Silicone noir, verres trempés. Idéal freediving et chasse sous-marine.',
   '🤿', 35.00, 'sell', 'comme neuf', 'apnée', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0005-4000-a000-000000000005',
   'Combinaison apnée Beuchat Espadon 5mm — Taille M',
   'Combinaison deux pièces néoprène lisse extérieur. Utilisée une saison, pas de déchirures. Doublure intérieure Open Cell pour un confort thermique optimal.',
   '🤿', 180.00, 'sell', 'bon état', 'apnée', now(), now()),

  -- Thomas Bernard (canyoning) — 1 item
  (gen_random_uuid(), 'a1b2c3d4-0006-4000-a000-000000000006',
   'Casque canyoning Petzl Boreo — Taille S/M',
   'Utilisé 2 saisons, quelques rayures cosmétiques. Mousse de confort intacte. Conforme EN 12492, idéal canyoning et via ferrata.',
   '🪖', 35.00, 'sell', 'bon état', 'canyoning', now(), now()),

  -- Julie Roux (VTT) — 2 items
  (gen_random_uuid(), 'a1b2c3d4-0007-4000-a000-000000000007',
   'VTT Scott Spark 930 — Taille L — 2023',
   '2 000 km, révisé intégralement (freins, transmission, suspensions). Cadre carbone, Fox 34 SC, Shimano XT 12v. Roues 29 pouces. Idéal XC marathon et enduro léger.',
   '🚵', 2200.00, 'sell', 'très bon état', 'VTT', now(), now()),

  (gen_random_uuid(), 'a1b2c3d4-0007-4000-a000-000000000007',
   'Casque VTT Fox Proframe RS — Taille M — MIPS',
   'Porté une saison sans aucun choc. Système MIPS intégré, ventilation optimale pour l''enduro. Mentonnière fixe, homologué DH.',
   '🚵', 95.00, 'sell', 'très bon état', 'VTT', now(), now()),

  -- Pierre Fabre (ski de rando) — 1 item
  (gen_random_uuid(), 'a1b2c3d4-0008-4000-a000-000000000008',
   'Ski de rando Dynafit Speed 88 — 170 cm avec peaux',
   'Seulement 3 sorties, état quasi neuf. Peaux Pomoca incluses, fixations Dynafit Radical. Léger (1 180 g/ski) et polyvalent montée/descente poudreuse.',
   '⛷️', 450.00, 'sell', 'comme neuf', 'ski de rando', now(), now())

ON CONFLICT (id) DO NOTHING;

-- Ensure all seed market items are marked as available
UPDATE market_items SET is_available = true WHERE is_available = false;


-- =============================================================================
-- Seed complete. Summary:
--    8 auth.users + auth.identities (coach fake accounts)
--    8 profiles (coach profiles with FK to auth.users)
--   32 spots (trail, kitesurf, escalade, plongée, surf, parapente, ski de rando)
--   10 events (compétitions, festivals, salons, challenges communautaires)
--    8 coaches (trail, kite, alpinisme, surf, plongée, canyoning, VTT, ski rando)
--   15 market items (chaussures, ailes, baudriers, combis, GPS, masques, skis...)
-- =============================================================================
