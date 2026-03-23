-- Endereço institucional FAPEX (sede ao lado do campus Ondina/UFBA — fontes públicas UFBA / fapex.org.br)
UPDATE public.programa
SET endereco = 'Rua Professor Edgard Mata, 128 - Ondina, Salvador - BA, CEP 40170-140'
WHERE slug = 'pinovara';

UPDATE public.registro_ropa rr
SET endereco = 'Rua Professor Edgard Mata, 128 - Ondina, Salvador - BA, CEP 40170-140'
FROM public.programa p
WHERE p.slug = 'pinovara' AND rr.programa_id = p.id;
