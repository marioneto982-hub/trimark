-- =============================================================================
-- TRIMARK — Seed multi-setorial de specialties
-- Reposicionamento para agência multi-setorial: além da saúde, adiciona
-- categorias de varejo, alimentação, imobiliário, educação, serviços/B2B,
-- beleza, automotivo, indústria, pet, fitness, turismo e moda.
--
-- council preenchido apenas onde há conselho profissional (OAB, CRC, CAU,
-- CREA, CRECI, CRMV, CREF); demais ficam NULL. ethics_rules_summary NULL.
--
-- Idempotente: só insere (name, category) que ainda não existam.
-- =============================================================================

INSERT INTO public.specialties (name, category, council)
SELECT v.name, v.category, v.council
FROM (VALUES
  -- Varejo & E-commerce
  ('Loja de Roupas',                 'varejo',       NULL),
  ('Calçados',                       'varejo',       NULL),
  ('Supermercado / Mercado',         'varejo',       NULL),
  ('Móveis e Decoração',             'varejo',       NULL),
  ('Eletrônicos e Celulares',        'varejo',       NULL),
  ('Papelaria',                      'varejo',       NULL),
  ('Ótica e Joalheria',              'varejo',       NULL),
  ('E-commerce / Loja Online',       'varejo',       NULL),
  ('Material de Construção',         'varejo',       NULL),
  ('Floricultura',                   'varejo',       NULL),

  -- Alimentação
  ('Restaurante',                    'alimentacao',  NULL),
  ('Pizzaria',                       'alimentacao',  NULL),
  ('Hamburgueria',                   'alimentacao',  NULL),
  ('Cafeteria',                      'alimentacao',  NULL),
  ('Padaria e Confeitaria',          'alimentacao',  NULL),
  ('Bar e Pub',                      'alimentacao',  NULL),
  ('Delivery / Food Service',        'alimentacao',  NULL),
  ('Sorveteria e Açaí',              'alimentacao',  NULL),
  ('Doceria',                        'alimentacao',  NULL),
  ('Marmitaria / Comida Caseira',    'alimentacao',  NULL),

  -- Imobiliário & Construção
  ('Imobiliária',                    'imobiliario',  NULL),
  ('Construtora',                    'imobiliario',  NULL),
  ('Incorporadora',                  'imobiliario',  NULL),
  ('Corretor de Imóveis',            'imobiliario',  'CRECI'),
  ('Arquitetura',                    'imobiliario',  'CAU'),
  ('Engenharia Civil',               'imobiliario',  'CREA'),
  ('Design de Interiores',           'imobiliario',  NULL),
  ('Loteamento',                     'imobiliario',  NULL),

  -- Educação
  ('Escola / Colégio',               'educacao',     NULL),
  ('Educação Infantil / Creche',     'educacao',     NULL),
  ('Curso de Idiomas',               'educacao',     NULL),
  ('Curso Preparatório / Pré-vestibular', 'educacao', NULL),
  ('Curso Profissionalizante',       'educacao',     NULL),
  ('Ensino Superior / Faculdade',    'educacao',     NULL),
  ('Curso Online / EAD',             'educacao',     NULL),
  ('Reforço Escolar',                'educacao',     NULL),

  -- Serviços & B2B
  ('Consultoria',                    'servicos',     NULL),
  ('Contabilidade',                  'servicos',     'CRC'),
  ('Advocacia',                      'servicos',     'OAB'),
  ('Agência de Marketing',           'servicos',     NULL),
  ('Tecnologia / Software',          'servicos',     NULL),
  ('Recursos Humanos',               'servicos',     NULL),
  ('Logística e Transporte',         'servicos',     NULL),
  ('Segurança',                      'servicos',     NULL),
  ('Limpeza e Facilities',           'servicos',     NULL),
  ('Seguros',                        'servicos',     NULL),

  -- Beleza & Estética
  ('Salão de Beleza',                'beleza',       NULL),
  ('Barbearia',                      'beleza',       NULL),
  ('Clínica de Estética',            'beleza',       NULL),
  ('Manicure e Nail Design',         'beleza',       NULL),
  ('Maquiagem',                      'beleza',       NULL),
  ('Estética Corporal',              'beleza',       NULL),
  ('Depilação',                      'beleza',       NULL),
  ('Sobrancelha e Cílios',           'beleza',       NULL),

  -- Automotivo
  ('Concessionária',                 'automotivo',   NULL),
  ('Oficina Mecânica',               'automotivo',   NULL),
  ('Autopeças',                      'automotivo',   NULL),
  ('Estética Automotiva e Lava-rápido', 'automotivo', NULL),
  ('Funilaria e Pintura',            'automotivo',   NULL),
  ('Locadora de Veículos',           'automotivo',   NULL),
  ('Motos e Moto Peças',             'automotivo',   NULL),
  ('Som e Acessórios',               'automotivo',   NULL),

  -- Indústria
  ('Metalurgia',                     'industria',    NULL),
  ('Indústria Alimentícia',          'industria',    NULL),
  ('Têxtil e Confecção',             'industria',    NULL),
  ('Moveleira',                      'industria',    NULL),
  ('Química e Plásticos',            'industria',    NULL),
  ('Gráfica e Impressão',            'industria',    NULL),
  ('Embalagens',                     'industria',    NULL),
  ('Bens de Consumo',                'industria',    NULL),

  -- Pet
  ('Pet Shop',                       'pet',          NULL),
  ('Clínica Veterinária',            'pet',          'CRMV'),
  ('Banho e Tosa',                   'pet',          NULL),
  ('Adestramento',                   'pet',          NULL),
  ('Hotel e Creche Pet',             'pet',          NULL),

  -- Academia & Fitness
  ('Academia / Musculação',          'fitness',      'CREF'),
  ('Crossfit',                       'fitness',      NULL),
  ('Personal Trainer',               'fitness',      'CREF'),
  ('Pilates e Studio',               'fitness',      NULL),
  ('Artes Marciais',                 'fitness',      NULL),
  ('Yoga',                           'fitness',      NULL),
  ('Dança',                          'fitness',      NULL),
  ('Natação',                        'fitness',      NULL),

  -- Turismo & Hotelaria
  ('Hotel e Pousada',                'turismo',      NULL),
  ('Agência de Viagens',             'turismo',      NULL),
  ('Eventos e Cerimonial',           'turismo',      NULL),
  ('Locação por Temporada',          'turismo',      NULL),
  ('Transporte Turístico',           'turismo',      NULL),
  ('Casa de Shows / Balada',         'turismo',      NULL),

  -- Moda & Vestuário
  ('Confecção / Marca de Roupa',     'moda',         NULL),
  ('Boutique',                       'moda',         NULL),
  ('Moda Íntima',                    'moda',         NULL),
  ('Moda Praia',                     'moda',         NULL),
  ('Acessórios e Bijuterias',        'moda',         NULL),
  ('Brechó',                         'moda',         NULL),
  ('Estilista / Designer de Moda',   'moda',         NULL)
) AS v(name, category, council)
WHERE NOT EXISTS (
  SELECT 1 FROM public.specialties s
  WHERE s.name = v.name AND s.category = v.category
);
