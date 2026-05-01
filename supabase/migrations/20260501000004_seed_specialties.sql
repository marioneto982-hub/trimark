-- =============================================================================
-- TRIMARK — Seed inicial de specialties (PRD §1.1, §4.2)
-- 41 specialties cobrindo as áreas que a Trimark atende. Lista ampliável
-- via /admin/specialties pela equipe.
-- =============================================================================
INSERT INTO public.specialties (name, category, council, ethics_rules_summary) VALUES
  -- Medicina (CFM 2.336/2023)
  ('Cardiologia',                'medicina', 'CFM', 'CFM 2.336/2023 — proibido garantia de resultado, antes/depois sem consentimento, autopromoção sensacionalista.'),
  ('Dermatologia',               'medicina', 'CFM', 'CFM 2.336/2023 — antes/depois apenas com fim educativo, sem promessa.'),
  ('Ginecologia e Obstetrícia',  'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Ortopedia e Traumatologia',  'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Pediatria',                  'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Psiquiatria',                'medicina', 'CFM', 'CFM 2.336/2023 — sigilo absoluto sobre pacientes.'),
  ('Oftalmologia',               'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Endocrinologia',             'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Neurologia',                 'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Urologia',                   'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Gastroenterologia',          'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Clínica Geral',              'medicina', 'CFM', 'CFM 2.336/2023.'),
  ('Cirurgia Plástica',          'medicina', 'CFM', 'CFM 2.336/2023 — vedação a antes/depois publicitário, sem promessa estética.'),
  ('Medicina Estética',          'medicina', 'CFM', 'CFM 2.336/2023 — restrições rigorosas em conteúdo de procedimentos.'),

  -- Odontologia (CFO 196/2019)
  ('Ortodontia',                          'odontologia', 'CFO', 'CFO 196/2019 — vedado antes/depois com finalidade comercial.'),
  ('Implantodontia',                      'odontologia', 'CFO', 'CFO 196/2019.'),
  ('Endodontia',                          'odontologia', 'CFO', 'CFO 196/2019.'),
  ('Periodontia',                         'odontologia', 'CFO', 'CFO 196/2019.'),
  ('Odontopediatria',                     'odontologia', 'CFO', 'CFO 196/2019.'),
  ('Estética e Harmonização Orofacial',   'odontologia', 'CFO', 'CFO 196/2019 — atenção redobrada em conteúdo estético.'),
  ('Prótese Dentária',                    'odontologia', 'CFO', 'CFO 196/2019.'),

  -- Psicologia (CFP)
  ('Psicologia Clínica',          'psicologia', 'CFP', 'Resolução CFP — vedada exposição de pacientes; conteúdo informativo permitido.'),
  ('Psicologia Infantil',         'psicologia', 'CFP', 'Resolução CFP.'),
  ('Terapia de Casal e Família',  'psicologia', 'CFP', 'Resolução CFP.'),

  -- Nutrição (CFN)
  ('Nutrição Clínica',           'nutricao', 'CFN', 'Resolução CFN — sem promessa de emagrecimento; sem garantia de resultado.'),
  ('Nutrição Esportiva',          'nutricao', 'CFN', 'Resolução CFN.'),
  ('Nutrição Materno-Infantil',   'nutricao', 'CFN', 'Resolução CFN.'),

  -- Fisioterapia (COFFITO)
  ('Fisioterapia Ortopédica',     'fisioterapia', 'COFFITO', 'COFFITO — informativo permitido; antes/depois com restrições.'),
  ('Fisioterapia Esportiva',      'fisioterapia', 'COFFITO', 'COFFITO.'),
  ('Fisioterapia Neurofuncional', 'fisioterapia', 'COFFITO', 'COFFITO.'),
  ('Pilates e RPG',               'fisioterapia', 'COFFITO', 'COFFITO.'),

  -- Veterinária (CFMV)
  ('Clínica Veterinária — Pequenos Animais', 'veterinaria', 'CFMV', 'Resolução CFMV.'),
  ('Cirurgia Veterinária',         'veterinaria', 'CFMV', 'Resolução CFMV.'),

  -- Fonoaudiologia (CFFa)
  ('Fonoaudiologia Clínica',      'fonoaudiologia', 'CFFa', 'Resolução CFFa.'),
  ('Audiologia',                  'fonoaudiologia', 'CFFa', 'Resolução CFFa.'),

  -- Biomedicina (CFBM)
  ('Análises Clínicas',           'biomedicina', 'CFBM', 'Resolução CFBM.'),
  ('Biomedicina Estética',        'biomedicina', 'CFBM', 'Resolução CFBM — atenção em procedimentos estéticos.'),

  -- Farmácia (CFF)
  ('Farmácia Clínica',            'farmacia', 'CFF', 'Resolução CFF.'),
  ('Farmácia de Manipulação',     'farmacia', 'CFF', 'Resolução CFF.'),

  -- Enfermagem (COFEN)
  ('Enfermagem Estética',         'enfermagem', 'COFEN', 'Resolução COFEN.'),
  ('Enfermagem Domiciliar',       'enfermagem', 'COFEN', 'Resolução COFEN.')
ON CONFLICT DO NOTHING;
