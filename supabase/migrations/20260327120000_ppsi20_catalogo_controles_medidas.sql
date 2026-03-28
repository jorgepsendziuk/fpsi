-- PPSI 2.0: substitui catálogo legado por conteúdo de docs/ppsi/catalogo_ppsi_2_0_guia.json
-- (27 controles, 210 medidas). IDs explícitos 1–27 e 1–210.
-- Apaga respostas de programa (programa_medida / programa_controle) antes do catálogo.

DELETE FROM public.programa_medida;
DELETE FROM public.programa_controle;
DELETE FROM public.medida;
DELETE FROM public.controle;

INSERT INTO public.controle (id, numero, diagnostico, nome) VALUES
  (1, 0, 1, 'Estruturação básica para governança'),
  (2, 0, 1, 'Instrumentos fundamentais'),
  (3, 1, 2, 'Inventário de ativos institucionais'),
  (4, 2, 2, 'Inventário de soluções de software'),
  (5, 3, 2, 'Proteção de dados'),
  (6, 4, 2, 'Configuração segura de ativos institucionais e soluções de software'),
  (7, 5, 2, 'Gestão de contas'),
  (8, 6, 2, 'Gestão de acesso'),
  (9, 7, 2, 'Gestão contínua de vulnerabilidades'),
  (10, 8, 2, 'Gestão de registros de auditoria'),
  (11, 9, 2, 'Proteção de e-mail e navegador web'),
  (12, 10, 2, 'Defesa contra malware'),
  (13, 11, 2, 'Recuperação de dados'),
  (14, 12, 2, 'Gestão de infraestrutura de rede'),
  (15, 13, 2, 'Monitoramento e defesa de rede'),
  (16, 14, 2, 'Conscientização e treinamento de competências'),
  (17, 15, 2, 'Gestão de provedor de serviços'),
  (18, 16, 2, 'Segurança de aplicações'),
  (19, 17, 2, 'Gestão de incidentes'),
  (20, 18, 2, 'Testes de intrusão'),
  (21, 19, 3, 'Registro das operações de tratamento de dados pessoais'),
  (22, 20, 3, 'Ações de prevenção'),
  (23, 21, 3, 'Encarregado e direitos dos titulares'),
  (24, 22, 3, 'Contratos, acordos e instrumentos congêneres'),
  (25, 23, 3, 'Análise das operações de tratamento'),
  (26, 24, 3, 'Compartilhamento e transferência internacional'),
  (27, 25, 3, 'Princípios da Lei nº 13.709/2018');

INSERT INTO public.medida (id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao) VALUES
  (1, '0.1', 1, NULL, NULL, NULL, 'A alta administração do órgão estabelece, mantém, monitora e aprimora o sistema de gestão de riscos e controles internos relativos aos temas de privacidade e segurança da informação?', 'A alta administração deve estabelecer, manter, monitorar e aprimorar o sistema de gestão
de riscos e controles internos com vistas à identificação, à avaliação, ao tratamento, ao
monitoramento e à análise crítica dos riscos que possam impactar a implementação da
estratégia e a consecução dos objetivos da organização no cumprimento da sua missão
institucional (Decreto nº 9203/2017, art. 17), sem prejuízo das responsabilidades dos
gestores dos processos organizacionais.
Nesse contexto, os temas de privacidade e segurança da informação devem estar
integrados ao sistema de gestão de riscos e aos controles internos. Ademais, conforme
Acórdão 2387/2024 – Plenário TCU, a alta administração da organização deve liderar o
processo de gestão de riscos decorrentes de ataques cibernético.

Normas de referência: Decreto nº 9.203/2017, art. 17.'),
  (2, '0.2', 1, NULL, NULL, NULL, 'O órgão nomeou gestor de tecnologia da informação e comunicação?', 'Designar formalmente agente público, e respectivo substituto, preferencialmente entre
servidores públicos efetivos, empregados públicos ou militares, para exercer o cargo de
Gestor de Tecnologia da Informação e Comunicação, conforme atribuições previstas no
inciso IV do art. 4º da Portaria nº 778/2019 e em demais normas correlatas.

Normas de referência: Portaria SGD/ME nº 778/2019.'),
  (3, '0.3', 1, NULL, NULL, NULL, 'O órgão nomeou gestor de segurança da informação?', 'Designar formalmente servidor, e respectivo substituto, para exercer o encargo de Gestor de
Segurança da Informação conforme atribuições previstas no art. 19 da IN nº 1/2020, do
Gabinete de Segurança Institucional, da Presidência da República (GSI/PR) e demais
normas correlatas.

Normas de referência: Decreto nº 12.572/2025, art. 10, III; IN GSI/PR nº 1/2020, art. 16, I, e Capítulo VI, Seção I; IN GSI/PR nº 3/2021, art. 46.'),
  (4, '0.4', 1, NULL, NULL, NULL, 'O órgão nomeou encarregado pelo tratamento de dados pessoais?', 'Designar formalmente servidor, e respectivo substituto, para exercer o encargo de
Encarregado pelo Tratamento de Dados Pessoais, nos termos do art. 41, § 2º, da Lei nº
13.709/2018, das Resoluções ANPD nºs 15/2024 e 18/2024 e demais normas correlatas.

Normas de referência: LGPD, arts. 23, III, e 41; Resolução CD/ANPD nº 18/2024, arts. 3º, 4º, 5º e 7º; IN SGD/ME nº 117, de 19 de novembro 2020.'),
  (5, '0.5', 1, NULL, NULL, NULL, 'O órgão nomeou o responsável setorial pela gestão da integridade?', 'Designar formalmente o responsável setorial pela gestão da integridade, nos termos do
disposto no art. 5º, II do Decreto nº 11.529/2023.

Normas de referência: Decreto nº 11.529/2023, art. 5º, II.'),
  (6, '0.6', 1, NULL, NULL, NULL, 'O órgão instituiu Comitê de Segurança da Informação?', 'Instituir Comitê de Segurança da Informação ou estrutura equivalente para deliberar sobre
os assuntos relativos à Política Nacional de Segurança da Informação e sobre normas de
segurança da informação, contemplando demais atribuições do art. 20 da IN GSI/PR nº
1/2020.

Normas de referência: IN GSI/PR nº 1/2020, art. 16, II, e Capítulo VI, Seção II; Decreto nº 12.572/2025, art. 10, II.'),
  (7, '0.7', 1, NULL, NULL, NULL, 'O órgão instituiu Comitê de Proteção de Dados Pessoais?', 'Instituir Comitê de Proteção de Dados Pessoais ou estrutura equivalente para deliberar
sobre os assuntos relativos à Lei Geral de Proteção de Dados Pessoais, resoluções da
ANPD e demais normas sobre o tema.

Normas de referência: LGPD, art. 50; Resolução CD/ANPD nº 18/2024, art. 10, V.'),
  (8, '0.8', 1, NULL, NULL, NULL, 'O órgão instituiu Equipe de Prevenção, Tratamento e Resposta a Incidentes Cibernéticos (ETIR)?', 'Instituir e implementar a Equipe de Prevenção, Tratamento e Resposta a Incidentes
Cibernéticos (ETIR), composta, preferencialmente, por servidores públicos civis ocupantes
de cargo efetivo ou militares, com capacitação técnica compatível com as atividades da
equipe. Para cada membro da Equipe deverá ser designado um substituto. Elaborar o
documento de constituição da ETIR conforme NC n° 05/IN01/DSIC/GSIPR, devidamente
aprovado pela alta administração da organização, para regulamentar o funcionamento da
equipe.

Normas de referência: IN GSI/PR nº 1/2020, art. 15, IV; NC n° 05/IN01/DSIC/GSIPR.'),
  (9, '0.9', 2, NULL, NULL, NULL, 'O órgão possui Programa de Governança em Segurança da Informação (PGSI)?', 'Instituir e implementar, preferencialmente em instância colegiada, o PGSI, documento que
contém, no mínimo, o disposto na IN GSI/PR nº 3/2021, art. 45, na forma de ações
estruturadas, políticas, normas e procedimentos para promover a segurança da informação
na organização. Recomenda-se que o PGSI contemple papéis e responsabilidades dos
agentes públicos envolvidos em sua execução, os prazos para realização das ações, além
da programação para implementação dos controles e medidas de segurança da informação
do PPSI, e que especifique indicadores de desempenho, como o iSeg, a serem medidos ao
longo da execução do Programa. Revisar e atualizar o PGSI com base em informações
obtidas a partir de monitoramento contínuo e avaliações periódicas de suas ações.

Normas de referência: IN GSI/PR nº 1/2020, art. 19, I, V, XI, IN GSI/PR nº 3/2021, art. 45.'),
  (10, '0.10', 2, NULL, NULL, NULL, 'O órgão possui Programa de Governança em Privacidade (PGP)?', 'Instituir e implementar, preferencialmente em instância colegiada, o PGP, documento que
contém, no mínimo, o disposto na Lei nº 13.709/2018, art. 50, §2°, I, na forma de ações
estruturadas, políticas, normas e procedimentos para o tratamento de dados pessoais pela
organização. Recomenda-se que o PGP contemple papéis e responsabilidades dos agentes
públicos envolvidos em sua execução, os prazos para realização das ações, além da
18
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
programação para implementação dos controles e medidas de privacidade e proteção de
dados pessoais do PPSI, e que especifique indicadores de desempenho, como o iPriv, a
serem medidos ao longo da execução do Programa. Revisar e atualizar o PGP com base em
informações obtidas a partir de monitoramento contínuo e avaliações periódicas de suas
ações.

Normas de referência: Lei nº 13.709/2018, art. 50.'),
  (11, '0.11', 2, NULL, NULL, NULL, 'O órgão possui Política de Segurança da Informação (POSIN)?', 'Instituir e implementar uma Política de Segurança da Informação (POSIN), a partir da
formalização e aprovação por parte da autoridade máxima da instituição, com o objetivo de
estabelecer diretrizes, responsabilidades, competências e subsídios para a gestão da
segurança da informação. Revisar e atualizar a POSIN periodicamente ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida.

Normas de referência: IN GSI/PR nº 1/2020, Capítulo III, art. 19, III; Decreto nº 12.572/2025, art. 10, IV.'),
  (12, '0.12', 2, NULL, NULL, NULL, 'O órgão possui Política de Proteção de Dados Pessoais?', 'Instituir e implementar uma Política de Proteção de Dados Pessoais, que estabeleça as
diretrizes para o tratamento de dados pessoais, independentemente do meio em que são
tratados, incluindo papéis e responsabilidades dos agentes públicos envolvidos nos
tratamentos de dados pessoais. Instituir e divulgar demais políticas, normas e procedimentos
sobre a temática. Revisar e atualizar os documentos periodicamente ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida.

Normas de referência: Lei nº 13.709/2018, art. 50.'),
  (13, '0.13', 2, NULL, NULL, NULL, 'O órgão possui um processo de gestão de riscos de segurança da informação?', 'Estabelecer e manter, em conformidade ao Capítulo III da IN GSI/PR nº 3/2021, um
processo de gestão de riscos de segurança da informação alinhado com o modelo de gestão
de riscos institucional, compatível com a missão e os objetivos estratégicos da organização
considerando o disposto nos incisos do art. 11. Além disso, o processo deve ser composto
por, no mínimo: plano de gestão de riscos de segurança da informação, conforme disposto
no art. 13; relatório de identificação, análise e avaliação dos riscos de segurança da
informação, conforme disposto no art. 14; e, relatório de tratamento de riscos de segurança
da informação, conforme disposto no art. 15. Considerar as atribuições dispostas nos arts.
16 e 17.

Normas de referência: IN GSI/PR nº 1/2020, art. 19, IV; IN GSI/PR nº 3/2021, Capítulo III; Decreto nº 12.572/2025, art. 3º, VI, e art. 4º, III.'),
  (14, '0.14', 2, NULL, NULL, NULL, 'O órgão possui um processo de gestão de continuidade de negócios em segurança da informação?', '19
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Estabelecer e manter, em conformidade ao Capítulo IV da IN GSI/PR nº 3/2021, um
processo de gestão de continuidade de negócios em segurança da informação baseado nas
estratégias de continuidade para as atividades críticas, na avaliação dos riscos levantados
no processo de gestão de riscos e nas diretrizes institucionais sobre gestão de continuidade
de negócio. Tal processo deve ser composto por um plano de continuidade de negócios em
segurança da informação, o qual observará o disposto no relatório de identificação, análise e
avaliação de riscos de segurança da informação e a prioridade de recuperação dos
processos de negócio, revisado uma vez por ano ou após mudanças significativas nos itens
que compõem o plano. Além disso, o conteúdo do plano deve incluir o disposto no art. 23, e
ser testado regularmente. Considerar as atribuições dispostas nos arts. 25, 26 e 27.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo IV.'),
  (15, '0.15', 2, NULL, NULL, NULL, 'O órgão possui um processo de gestão de mudanças dos aspectos de segurança da informação?', 'Estabelecer e manter, em conformidade ao Capítulo V da IN GSI/PR nº 3/2021, um processo
de gestão de mudanças nos aspectos de segurança da informação, respaldado nos
relatórios do processo de gestão de riscos em segurança da informação e considerando a
análise crítica das consequências de mudanças não previstas, atuando em ações para
amenizar os efeitos adversos. O processo deve prever que a mudança seja classificada em
emergencial, rotineira ou proativa, nos termos do art. 29. O processo deve ser constituído,
minimamente, dos documentos de descrição da mudança e de avaliação e aprovação da
mudança, contemplando o conteúdo dos arts. 32 e 34. Considerar as atribuições dispostas
no parágrafo único do art. 31 e nos arts. 35 e 36.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo V.'),
  (16, '0.16', 2, NULL, NULL, NULL, 'O órgão possui um processo de avaliação de conformidade dos aspectos de segurança da informação?', 'Estabelecer e manter, em conformidade ao Capítulo VI da IN GSI/PR nº 3/2021, um
processo de avaliação de conformidade nos aspectos de segurança da informação. O
processo deve ser constituído, minimamente, do plano de verificação de conformidade e do
relatório de avaliação de conformidade, contemplando o conteúdo do art. 39 e art. 40.
Considerar as atribuições dispostas nos arts. 41, 42 e 43.

Normas de referência: IN GSI/PR nº 1/2020, art. 19, VIII; IN GSI/PR nº 3/2021, Capítulo VI; Decreto nº 12.572/2025, art. 10, VI.'),
  (17, '0.17', 2, NULL, NULL, NULL, 'O órgão possui processo de gestão de riscos relacionados ao tratamento de dados pessoais?', 'Estabelecer e manter um processo documentado de gestão de riscos relacionados às
operações de tratamento de dados pessoais, independentemente do meio em que ocorrem,
que considere também a etapa de aplicação de medidas de segurança, técnicas e
20
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
administrativas, testadas e avaliadas, aptas a proteger os dados pessoais. Periodicamente,
realizar revisão ou atualização deste processo, assim como em casos específicos quando
ocorrerem mudanças que impactem de forma significativa esta medida. Este processo pode
ser incorporado a outros processos institucionais de gestão de riscos da organização.

Normas de referência: Lei nº 13.709/2018, arts. 38, 44 e 50; Decreto nº 12.572/2025, art. 3º, VI, e art. 4º, III.'),
  (18, '1.1', 3, NULL, 'G1', NULL, 'O órgão estabelece e mantém um inventário detalhado de ativos institucionais?', 'Estabelecer e manter um inventário preciso e detalhado de todos os ativos institucionais que
realizam tratamento de dados, incluindo: dispositivos de usuário final (incluindo portáteis e
24
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
móveis), de rede, de Internet das Coisas, não computacionais e servidores, em adição ao
disposto no Capítulo II da IN GSI/PR nº 3/2021. O inventário deve conter, no mínimo:
endereço de rede (se estático), endereço de hardware, nome do ativo, proprietário, unidade
organizacional, indicação se o ativo foi aprovado para se conectar à rede. Este inventário
deve incluir ativos conectados à infraestrutura fisicamente, virtualmente ou remotamente e
aqueles dentro de ambientes de nuvem. Também deve contemplar ativos regularmente
conectados à infraestrutura de rede da organização, mesmo que não estejam sob seu
controle. Revisar e atualizar o inventário semestralmente ou com mais frequência.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (19, '1.2', 3, NULL, 'G1', NULL, 'O órgão trata ativos institucionais não autorizados?', 'Estabelecer e manter um processo para lidar com ativos institucionais não autorizados,
optando por removê-los da rede, negar sua conexão remota ou colocá-los em quarentena.

Normas de referência: não identificada.'),
  (20, '1.3', 3, NULL, 'G2', NULL, 'O órgão usa ferramenta de descoberta ativa para identificação de ativos institucionais?', 'Identificar os ativos institucionais conectados à rede da organização por meio de uma
ferramenta de descoberta ativa, configurada para execução diária ou em intervalos menores.

Normas de referência: não identificada.'),
  (21, '1.4', 3, NULL, NULL, NULL, 'O órgão usa o protocolo de configuração dinâmica de host (Dynamic Host Configuration Protocol, DHCP) para atualizar o inventário de ativos institucionais?', 'GI2
Utilizar os registros (logs) de todos os servidores DHCP ou ferramentas de gerenciamento
de endereços IP para atualizar o inventário de ativos institucionais.

Normas de referência: não identificada.'),
  (22, '1.5', 3, NULL, 'G3', NULL, 'O órgão usa ferramenta de descoberta passiva para identificação de ativos institucionais?', 'Utilizar uma ferramenta de descoberta passiva para identificar ativos institucionais
conectados à rede da organização. Revisar as varreduras e atualizar o inventário de ativos
institucionais pelo menos semanalmente ou em intervalos menores, se necessário.

Normas de referência: não identificada.'),
  (23, '2.1', 4, NULL, 'G1', NULL, 'O órgão estabelece e mantém um inventário de soluções de software?', 'Estabelecer e manter um inventário detalhado de todas as soluções de software licenciadas
instaladas em ativos institucionais, em adição ao disposto no Capítulo II da IN GSI/PR nº
3/2021. Revisar e atualizar o inventário semestralmente ou com mais frequência.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (24, '2.2', 4, NULL, 'G1', NULL, 'O órgão mantém em seu ambiente computacional apenas soluções de software suportadas pelos seus fornecedores?', 'Assegurar que apenas soluções de software atualmente suportadas por seus fornecedores
sejam categorizadas como autorizadas no inventário de soluções de software da
organização. Se uma solução de software não for suportada, mas ainda assim necessária
para o cumprimento da missão da organização, deve-se documentar uma exceção
detalhando os controles compensatórios e a aceitação do risco residual. Para qualquer
solução de software sem suporte que não possua documentação de exceção, a mesma
deve ser categorizada como não autorizada. Revisar a lista de soluções de software
suportadas mensalmente, ou em intervalos menores.

Normas de referência: não identificada.'),
  (25, '2.3', 4, NULL, 'G1', NULL, 'O órgão trata o uso de soluções de software não autorizadas?', 'Assegurar que as soluções de software não autorizadas sejam removidas dos ativos
institucionais ou recebam uma exceção documentada. Revisar semestralmente ou em
intervalos menores.

Normas de referência: não identificada.'),
  (26, '2.4', 4, NULL, 'G2', NULL, 'O órgão utiliza ferramentas automatizadas de inventário de soluções de software?', 'Utilizar ferramentas de inventário de soluções de software, quando possível, para
automatizar a descoberta e documentação de soluções de software instaladas em toda a
organização.

Normas de referência: não identificada.'),
  (27, '2.5', 4, NULL, 'G2', NULL, 'O órgão possui uma lista de soluções de software autorizadas?', 'Elaborar lista de soluções de software autorizadas e implementar controles técnicos em
todos os ativos para garantir que apenas estas soluções sejam executadas. Reavaliar a lista
semestralmente ou em intervalos menores.

Normas de referência: não identificada.'),
  (28, '2.6', 4, NULL, 'G2', NULL, 'O órgão possui uma lista de bibliotecas de software autorizadas?', 'Elaborar lista de bibliotecas de software autorizadas e implementar controles técnicos para
assegurar que apenas bibliotecas autorizadas (tais como *.dll, *.ocx, *.so, etc) tenham
permissão para serem carregadas nos processos em execução. Impedir que bibliotecas não
autorizadas sejam carregadas nos processos. Reavaliar a lista semestralmente ou em
intervalos menores.

Normas de referência: não identificada.'),
  (29, '2.7', 4, NULL, 'G3', NULL, 'O órgão possui uma lista de scripts autorizados?', '27
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Elaborar lista de scripts autorizados e implementar controles técnicos, como assinaturas
digitais e controle de versão, para assegurar que apenas scripts autorizados e assinados
digitalmente (a exemplo de *.ps1, *.py e macros) tenham permissão para serem executados.
Bloquear a execução de scripts não autorizados. Reavaliar a lista semestralmente ou em
intervalos menores.

Normas de referência: não identificada.'),
  (30, '3.1', 5, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de gestão de dados?', 'Estabelecer e manter um processo de gestão de dados. No processo, tratar a criticidade, o
proprietário, o manuseio, os limites de retenção e os requisitos para descarte dos dados com
base em padrões de criticidade e retenção da organização. Revisar e atualizar a
documentação anualmente ou quando ocorrerem mudanças significativas na organização
que possam impactar esta medida.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II; *IN GSI/PR nº 5/2021, Capítulo IV, Seção VII; NC nº 20/IN01/DSIC/GSIPR, item 7; **IN GSI/PR nº 8/2025, arts. 4º, 5º e 6º.'),
  (31, '3.2', 5, NULL, 'G1', NULL, 'O órgão estabelece e mantém um inventário de dados?', 'Estabelecer e manter um inventário de dados - priorizando os dados críticos, sigilosos e com
restrição de acesso - com base no processo de gestão de dados. Realizar a revisão e
atualização periódica do inventário. O inventário de dados pessoais é objeto do Controle 19.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (32, '3.3', 5, NULL, 'G1', NULL, 'O órgão configura listas de controle de acesso a dados?', 'Configurar listas de controle de acesso a dados com base no princípio da necessidade de
saber do usuário. Aplicar listas de controle de acesso, também conhecidas como permissões
de acesso, a sistemas de arquivos locais e remotos, bancos de dados e aplicações.

Normas de referência: **IN GSI/PR nº 8/2025, art. 3º, VIII e XIII.'),
  (33, '3.4', 5, NULL, 'G1', NULL, 'O órgão aplica retenção de dados?', 'Reter os dados de acordo com o processo de gestão de dados e a legislação vigente. A
retenção deve incluir prazos mínimos e máximos.

Normas de referência: NC nº 20/IN01/DSIC/GSIPR, itens 6.2 e 6.4.'),
  (34, '3.5', 5, NULL, 'G1', NULL, 'O órgão descarta dados com segurança?', 'Descartar com segurança os dados, sejam eles armazenados em meio físico ou lógico,
conforme o processo de gestão de dados e a legislação vigente. Certificar-se de que o
método de descarte adotado seja compatível com a criticidade dos dados.
29
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: NC nº 20/IN01/DSIC/GSIPR, item 6.4.'),
  (35, '3.6', 5, NULL, 'G1', NULL, 'O órgão criptografa dados críticos em dispositivos de usuário final?', 'Criptografar os dados críticos para a organização em dispositivos de usuário final,
considerando a NC nº 09/IN01/DSIC/GSIPR.

Normas de referência: IN GSI/PR nº 3/2013; NC nº 09/IN01/DSIC/GSIPR.'),
  (36, '3.7', 5, NULL, 'G2', NULL, 'O órgão estabelece e mantém um esquema de classificação de dados?', 'Estabelecer e manter um esquema geral de classificação de dados baseado na criticidade
para a organização, com critérios para classificação específicos. Revisar e atualizar o
esquema de classificação anualmente ou quando ocorrerem mudanças significativas que
possam impactar esta medida.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (37, '3.8', 5, NULL, 'G2', NULL, 'O órgão documenta os fluxos de dados?', 'Documentar o fluxo de dados com base no processo de gestão de dados, garantindo
rastreabilidade e conformidade com normas e diretrizes. A documentação do fluxo de dados
deve ser revisada e atualizada anualmente ou sempre que houver mudanças significativas
que possam impactá-lo.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (38, '3.9', 5, NULL, 'G2', NULL, 'O órgão criptografa dados críticos em mídia removível?', 'Criptografar os dados críticos para a organização em mídias removíveis, considerando a NC
nº 09/IN01/DSIC/GSIPR.

Normas de referência: IN GSI/PR nº 3/2013; NC nº 09/IN01/DSIC/GSIPR.'),
  (39, '3.10', 5, NULL, 'G2', NULL, 'O órgão criptografa os dados críticos que estão em trânsito?', 'Criptografar os dados críticos para a organização que estão em trânsito, considerando a NC
nº 09/IN01/DSIC/GSIPR.

Normas de referência: NC nº 09/IN01/DSIC/GSIPR; IN GSI/PR nº 5/2021, Capítulo IV, Seção IV; *IN GSI/PR nº 5/2021, Capítulo IV, Seção IV; **IN GSI/PR nº 8/2025, art. 3º, IV e V'),
  (40, '3.11', 5, NULL, 'G2', NULL, 'O órgão criptografa os dados críticos que estão em repouso?', 'Criptografar os dados críticos para a organização e que estão em repouso nos servidores,
sistemas e banco de dados que os armazenam, considerando a NC nº
09/IN01/DSIC/GSIPR.

Normas de referência: NC nº 09/IN01/DSIC/GSIPR; IN GSI/PR nº 5/2021, Capítulo IV, Seção IV; *IN GSI/PR nº 5/2021, Capítulo IV, Seção IV; **IN GSI/PR nº 8/2025, art. 3º, IV e V.'),
  (41, '3.12', 5, NULL, 'G2', NULL, 'O órgão segmenta o processamento e o armazenamento de dados com base na criticidade?', 'Segmentar o processamento e armazenamento de dados com base na sua criticidade. Não
processar dados críticos para a organização em ativos institucionais destinados a dados de
menor criticidade.

Normas de referência: *IN GSI/PR nº 5/2021, Capítulo IV, Seção V; **IN GSI/PR nº 8/2025, art. 3º, I, II, III.'),
  (42, '3.13', 5, NULL, 'G3', NULL, 'O órgão implanta uma solução de prevenção contra perda de dados?', 'Implementar uma ferramenta automatizada, como uma solução de prevenção de perda de
dados (Data Loss Prevention, DLP) baseada em host, para identificar todos os dados críticos
processados, transmitidos ou armazenados por meio dos ativos institucionais.

Normas de referência: não identificada.'),
  (43, '3.14', 5, NULL, 'G3', NULL, 'O órgão registra o acesso aos dados críticos?', 'Registrar o acesso aos dados críticos para a organização, incluindo modificação e descarte.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.2, b; *IN GSI/PR nº 5/2021, Capítulo IV, Seção III; **IN GSI/PR nº 8/2025, art. 3º, IX.'),
  (44, '4.1', 6, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de configuração segura?', 'Estabelecer e manter um processo de configuração segura para os ativos institucionais
(dispositivos de usuário final, incluindo portáteis e móveis, dispositivos da IOT e não
computacionais, servidores) e soluções de software. Revisar e atualizar a documentação
anualmente ou quando ocorrerem mudanças significativas na organização que possam
impactar esta medida.

Normas de referência: não identificada.'),
  (45, '4.2', 6, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de configuração segura para a infraestrutura de rede?', 'Estabelecer e manter um processo de configuração segura para dispositivos de rede.
Revisar e atualizar a documentação anualmente ou quando ocorrerem mudanças
significativas na organização que possam impactar esta medida.

Normas de referência: não identificada.'),
  (46, '4.3', 6, NULL, 'G1', NULL, 'O órgão configura o bloqueio automático de sessão nos ativos institucionais?', 'Configurar o bloqueio automático de sessão, quando aplicável, nos ativos institucionais após
um período definido de inatividade.

Normas de referência: não identificada.'),
  (47, '4.4', 6, NULL, 'G1', NULL, 'O órgão implementa e gerencia um firewall nos servidores?', 'Implementar e gerenciar um firewall nos servidores, quando suportado.

Normas de referência: não identificada.'),
  (48, '4.5', 6, NULL, 'G1', NULL, 'O órgão implementa e gerencia um firewall em dispositivos do usuário final?', 'Implementar e gerenciar um firewall baseado em host ou uma ferramenta de filtragem de
porta nos dispositivos de usuário final, com uma regra de negação padrão que bloqueia todo
o tráfego, exceto os serviços e portas que são explicitamente permitidos.

Normas de referência: não identificada.'),
  (49, '4.6', 6, NULL, 'G1', NULL, 'O órgão gerencia com segurança os ativos institucionais e soluções de software?', 'Gerenciar com segurança os ativos institucionais e soluções de software. Exemplos de
implementações incluem gestão de configuração por meio de infraestrutura como código
com controle de versão (version controlled-infrastructure-as-code) e acesso a interfaces
administrativas por meio de protocolos de rede seguros.

Normas de referência: não identificada.'),
  (50, '4.7', 6, NULL, 'G1', NULL, 'O órgão gerencia contas padrão?', 'Gerenciar contas padrão nos ativos institucionais e soluções de software, como root,
administrador e outras contas de fornecedores pré-configuradas.

Normas de referência: não identificada.'),
  (51, '4.8', 6, NULL, 'G2', NULL, 'O órgão desinstala ou desativa serviços desnecessários?', 'Desinstalar ou desativar serviços desnecessários nos ativos institucionais e soluções de
software, como serviço de compartilhamento de arquivo não utilizado, módulo de aplicação
web ou função de serviço.

Normas de referência: não identificada.'),
  (52, '4.9', 6, NULL, 'G2', NULL, 'O órgão configura servidores Sistema de Nomes de Domínio (Domain Name System, DNS) confiáveis?', 'Configurar servidores DNS confiáveis nos ativos institucionais. Exemplos de implementações
incluem configurar a infraestrutura de rede para usar servidores DNS controlados pela
organização ou servidores DNS externos confiáveis.

Normas de referência: não identificada.'),
  (53, '4.10', 6, NULL, 'G2', NULL, 'O órgão aplica o recurso de bloqueio automático nos dispositivos portáteis de usuário final?', 'Aplicar o bloqueio automático dos dispositivos portáteis de usuário final após um número de
tentativas de autenticação com falha, com base no limite definido pela organização.

Normas de referência: não identificada.'),
  (54, '4.11', 6, NULL, 'G2', NULL, 'O órgão aplica o recurso de limpeza remota nos dispositivos portáteis de usuário final?', 'Assegurar que os dispositivos portáteis de usuário final de propriedade da organização
estejam preparados para limpeza remota e executá-la conforme previsto na política de
gestão de ativos institucionais, incluindo casos como dispositivos perdidos ou roubados, ou
quando um indivíduo não trabalha mais na organização.

Normas de referência: não identificada.'),
  (55, '4.12', 6, NULL, 'G3', NULL, 'O órgão separa os espaços de trabalho nos dispositivos móveis?', 'Certificar de que a separação de espaços de trabalho seja usada nos dispositivos móveis de
usuário final, ou seja, separar aplicações e dados institucionais de aplicações e dados de
uso pessoal nos dispositivos, quando suportado.

Normas de referência: não identificada.'),
  (56, '5.1', 7, NULL, 'G1', NULL, 'O órgão estabelece e mantém um inventário de contas?', 'Estabelecer e manter um inventário de todas as contas gerenciadas na organização. O
inventário deve incluir contas de usuário e de administrador, e conter minimamente o nome
do agente público, o nome do usuário, datas de início e término, além do departamento.
Validar se todas as contas ativas estão autorizadas, trimestralmente ou em intervalos
menores.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (57, '5.2', 7, NULL, 'G1', NULL, 'O órgão promove ações para evitar a reutilização de senhas?', 'Configurar os ativos institucionais para evitar ou desestimular a reutilização de senhas,
promovendo a adoção de senhas únicas para ativos diferentes.

Normas de referência: não identificada.'),
  (58, '5.3', 7, NULL, 'G1', NULL, 'O órgão desabilita ou exclui contas inativas?', 'Desabilitar ou excluir quaisquer contas inativas, conforme política de gestão de contas, após
um período de inatividade estabelecido pela organização.

Normas de referência: não identificada.'),
  (59, '5.4', 7, NULL, 'G1', NULL, 'O órgão limita os privilégios de administrador às contas de administrador dedicadas?', '35
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Limitar os privilégios de administrador às contas de administrador dedicadas. Realizar
atividades gerais de computação, como navegação na Internet, e-mail e uso do pacote de
produtividade, a partir da conta primária não privilegiada do usuário.

Normas de referência: não identificada.'),
  (60, '5.5', 7, NULL, 'G2', NULL, 'O órgão estabelece e mantém um inventário de contas de serviço?', 'Estabelecer e manter um inventário de contas de serviço. O inventário, no mínimo, deve
conter a unidade proprietária, data de revisão e propósito. Realizar revisões de contas de
serviço para validar se todas as contas ativas estão autorizadas, em uma programação
recorrente, no mínimo trimestralmente ou em intervalos menores.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (61, '5.6', 7, NULL, 'G2', NULL, 'O órgão centraliza a gestão de contas?', 'Centralizar a gestão de contas por meio de serviço de diretório ou de identidade.

Normas de referência: *IN GSI/PR nº 5/2021, art. 13, I, II e II; **IN GSI/PR nº 8/2025, art. 3º, XI.'),
  (62, '6.1', 8, NULL, 'G1', NULL, 'O órgão estabelece um processo de concessão de acesso?', 'Estabelecer e manter um processo, de preferência automatizado, para conceder acesso
físico e lógico aos ativos institucionais e soluções de software mediante novo ingresso de
agente público, concessão de direitos ou mudança de função de um usuário.

Normas de referência: não identificada.'),
  (63, '6.2', 8, NULL, 'G1', NULL, 'O órgão estabelece um processo de revogação de acesso?', 'Estabelecer e manter um processo, de preferência automatizado, para revogar o acesso aos
ativos institucionais e soluções de software, por meio da desativação de contas
imediatamente após seu encerramento, revogação de direitos ou mudança de função de um
usuário. Desativar contas, em vez de excluí-las, pode ser necessário para preservar as
trilhas de auditoria.

Normas de referência: não identificada.'),
  (64, '6.3', 8, NULL, 'G1', NULL, 'O órgão exige autenticação multifator (Multi-Factor Authentication, MFA) para soluções de software expostas externamente?', 'Exigir que todas as soluções de software da organização ou de terceiros expostas
externamente apliquem autenticação multifator, onde suportado. Aplicar autenticação
multifator por meio de um serviço de diretório ou provedor de Single Sign-On (SSO) é uma
forma de implementação desta medida.

Normas de referência: *IN GSI/PR nº 5/2021, art. 13, I, II e III; **IN GSI/PR nº 8/2025, art. 3º, VII.'),
  (65, '6.4', 8, NULL, 'G1', NULL, 'O órgão exige autenticação multifator (Multi-Factor Authentication, MFA) para acesso remoto à rede?', 'Exigir autenticação multifator para acesso remoto à rede.

Normas de referência: não identificada.'),
  (66, '6.5', 8, NULL, 'G1', NULL, 'O órgão exige autenticação multifator (Multi-Factor Authentication, MFA) para acesso administrativo?', 'Exigir autenticação multifator para todas as contas de acesso administrativo, em todos os
ativos institucionais e soluções de software, sejam gerenciados no site local ou por meio de
um provedor terceirizado.

Normas de referência: não identificada.'),
  (67, '6.6', 8, NULL, 'G2', NULL, 'O órgão estabelece e mantém um inventário de sistemas de autenticação e autorização?', 'Estabelecer e manter um inventário dos sistemas de autenticação e autorização da
organização, incluindo aqueles hospedados no site local ou em um provedor de serviços
remoto. Revisar e atualizar o inventário semestralmente ou em intervalos menores.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (68, '6.7', 8, NULL, 'G2', NULL, 'O órgão centraliza o controle de acesso?', 'Centralizar o controle de acesso para todos os ativos institucionais e soluções de software
por meio de um serviço de diretório ou provedor de Single Sign-On (SSO), quando
suportado.

Normas de referência: *IN GSI/PR nº 5/2021, art. 13, III; **IN GSI/PR nº 8/2025, art. 3º, XI.'),
  (69, '6.8', 8, NULL, 'G3', NULL, 'O órgão define e mantém o controle de acesso baseado em funções?', 'Definir e manter o controle de acesso baseado em funções, determinando e documentando
os direitos de acesso necessários para cada função dentro da organização para cumprir com
sucesso as funções atribuídas. Revisar os controles de acesso para validar se todos os
privilégios estão autorizados, em uma programação recorrente, uma vez por ano ou em
intervalos menores.

Normas de referência: **IN GSI/PR nº 8/2025, art. 3º, XII.'),
  (70, '7.1', 9, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de gestão de vulnerabilidade?', 'Estabelecer e manter um processo de gestão de vulnerabilidade para ativos institucionais e
soluções de software. Revisar e atualizar a documentação anualmente ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo III.'),
  (71, '7.2', 9, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de remediação?', 'Estabelecer e manter um processo de remediação, fundamentado na estratégia de
remediação institucional baseada em risco, com revisões semestrais ou em intervalos
menores.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo III.'),
  (72, '7.3', 9, NULL, 'G1', NULL, 'O órgão executa a gestão automatizada de atualizações do sistema operacional?', 'Realizar atualizações do sistema operacional por meio da gestão automatizada de
atualizações, mensalmente ou com mais frequência.

Normas de referência: não identificada.'),
  (73, '7.4', 9, NULL, 'G1', NULL, 'O órgão executa a gestão automatizada de atualizações de aplicações?', 'Realizar atualizações de aplicações por meio da gestão automatizada de atualizações,
mensalmente ou em intervalos menores.

Normas de referência: não identificada.'),
  (74, '7.5', 9, NULL, 'G2', NULL, 'O órgão realiza varreduras automatizadas de vulnerabilidades internas?', 'Realizar varreduras automatizadas de vulnerabilidade em ativos institucionais e soluções de
software internos, trimestralmente ou em intervalos menores. Realizar varreduras
autenticadas e não autenticadas.

Normas de referência: não identificada.'),
  (75, '7.6', 9, NULL, 'G2', NULL, 'O órgão realiza varreduras automatizadas de vulnerabilidades expostas externamente?', 'Executar varreduras de vulnerabilidade automatizadas nos ativos institucionais e soluções
de software expostos externamente. Executar varreduras mensalmente ou em intervalos
menores.

Normas de referência: não identificada.'),
  (76, '7.7', 9, NULL, 'G2', NULL, 'O órgão corrige vulnerabilidades detectadas?', 'Corrigir as vulnerabilidades detectadas por meio de processos e ferramentas, mensalmente
ou em intervalos menores, com base no processo de remediação.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo III.'),
  (77, '8.1', 10, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de gestão de logs de auditoria?', 'Estabelecer e manter um processo de gestão de logs de auditoria que defina os requisitos
de registro de logs da organização, considerando a NC nº 21/IN01/DSIC/GSIPR. No mínimo,
abordar a coleta, revisão e armazenamento dos logs de auditoria para os ativos institucionais
e soluções de software, considerando o tempo de retenção e os dados estritamente
necessários à segurança da informação. Revisar e atualizar a documentação anualmente ou
sempre que ocorrerem mudanças significativas na organização que possam impactar esta
medida.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR; *IN GSI/PR nº 5/2021, art. 13, IV, V e VI.'),
  (78, '8.2', 10, NULL, 'G1', NULL, 'O órgão coleta logs de auditoria?', 'Coletar logs de auditoria. Certificar-se de que o log, de acordo com o processo de gestão de
log de auditoria da organização, tenha sido habilitado em todos os ativos institucionais e
soluções de software em que esta funcionalidade estiver disponível.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.2; *IN GSI/PR nº 5/2021, art. 13, IV, V e VI.'),
  (79, '8.3', 10, NULL, 'G1', NULL, 'O órgão armazena adequadamente os logs de auditoria?', 'Assegurar que os logs possuam armazenamento seguro em conformidade com normas
internas e regulatórias, preservando sua integridade e proteção contra alterações. Além
disso, garantir acessibilidade e monitoramento contínuo, assegurando a disponibilidade dos
logs para auditorias e investigações, bem como a aderência aos normativos aplicáveis, em
atendimento aos requisitos de gerenciamento de registros de auditoria da organização.

Normas de referência: *IN GSI/PR nº 5/2021, art. 13, IV, V e VI.'),
  (80, '8.4', 10, NULL, 'G2', NULL, 'O órgão padroniza a sincronização de tempo?', 'Padronizar a sincronização de tempo. Configurar todos os ativos institucionais e soluções de
software com pelo menos duas fontes de sincronização de tempo, quando suportado.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.1.'),
  (81, '8.5', 10, NULL, 'G2', NULL, 'O órgão coleta logs de auditoria detalhados?', '42
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Configurar o log de auditoria detalhado para os ativos institucionais e soluções de software
que contenham dados críticos para a organização. Incluir a origem do evento, data, nome de
usuário, carimbo de data e hora, endereços de origem, endereços de destino e outros
elementos úteis que possam ajudar em uma investigação forense.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.3.'),
  (82, '8.6', 10, NULL, 'G2', NULL, 'O órgão coleta logs de auditoria de consulta do Sistema de Nomes de Domínio (Domain Name System, DNS)?', 'Habilitar o registro de log de consulta do servidor DNS inclusive para detectar pesquisas de
nomes de host para domínios maliciosos conhecidos, quando suportado.

Normas de referência: não identificada.'),
  (83, '8.7', 10, NULL, 'G2', NULL, 'O órgão coleta logs de auditoria de requisição de Uniform Resource Locator (URL)?', 'Coletar logs de auditoria de requisição de URL em ativos institucionais, quando suportado.

Normas de referência: não identificada.'),
  (84, '8.8', 10, NULL, 'G2', NULL, 'O órgão coleta logs de auditoria de linha de comando?', 'Habilitar o log de auditoria sobre ferramentas de linha de comando, tais como Microsoft
Powershell, Bash e demais terminais administrativos remotos.

Normas de referência: não identificada.'),
  (85, '8.9', 10, NULL, 'G2', NULL, 'O órgão centraliza os logs de auditoria?', 'Centralizar, sempre que possível, a coleta e retenção de logs de auditoria de acordo com um
processo de gerenciamento de logs de auditoria.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.8.'),
  (86, '8.10', 10, NULL, 'G2', NULL, 'O órgão retém os logs de auditoria?', 'Garantir a retenção dos logs de auditoria pelo período estabelecido pela organização.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.7; *IN GSI/PR nº 5/2021, art. 13, IV, V e VI.'),
  (87, '8.11', 10, NULL, 'G2', NULL, 'O órgão conduz revisões de logs de auditoria?', 'Realizar análises de logs de auditoria para detectar anomalias ou eventos anormais que
possam indicar uma ameaça potencial. Realizar revisões semanalmente ou em intervalos
menores.

Normas de referência: não identificada.'),
  (88, '8.12', 10, NULL, 'G3', NULL, 'O órgão coleta logs de provedores de serviços?', '43
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Coletar logs de provedores de serviços, quando suportado. Exemplos de implementações
incluem coleta de eventos de autenticação e autorização, eventos de criação e de descarte
de dados e eventos de gestão de usuários.

Normas de referência: *IN GSI/PR nº 5/2021, art. 13, IV, V e VI'),
  (89, '9.1', 11, NULL, 'G1', NULL, 'O órgão permite o uso apenas de navegadores e clientes de e-mail totalmente suportados por seus fornecedores?', 'Assegurar que apenas navegadores e clientes de e-mail totalmente suportados por seus
fornecedores tenham permissão para executar na organização, usando apenas a versão
mais recente.

Normas de referência: não identificada.'),
  (90, '9.2', 11, NULL, 'G1', NULL, 'O órgão usa serviços de filtragem de Sistema de Nomes de Domínio (Domain Name System, DNS?', 'Usar serviços de filtragem de DNS em todos os dispositivos do usuário final, incluindo ativos
remotos e locais, para bloquear o acesso a domínios maliciosos conhecidos.

Normas de referência: não identificada.'),
  (91, '9.3', 11, NULL, 'G2', NULL, 'O órgão mantém e aplica filtros de Uniform Resource Locator (URL) baseados em rede?', 'Aplicar e atualizar filtros de URL baseados em rede para limitar os ativos institucionais de se
conectarem a sites potencialmente maliciosos ou não aprovados.

Normas de referência: não identificada.'),
  (92, '9.4', 11, NULL, 'G2', NULL, 'O órgão restringe extensões desnecessárias ou não autorizadas de navegadores e clientes de e-mail?', 'Restringir, por meio de desinstalação ou desativação, quaisquer plug-ins, extensões e
aplicativos complementares não autorizados ou desnecessários de navegadores ou de
clientes de e-mail.

Normas de referência: não identificada.'),
  (93, '9.5', 11, NULL, 'G2', NULL, 'O órgão implementa o Domain-based Message Authentication, Reporting, and Conformance (DMARC)?', 'Implementar o protocolo DMARC por meio da implementação dos padrões Sender Policy
Framework (SPF) e DomainKeys Identified Mail (DKIM), objetivando diminuir a chance de emails forjados.

Normas de referência: não identificada.'),
  (94, '9.6', 11, NULL, 'G2', NULL, 'O órgão bloqueia tipos de arquivo desnecessários?', '45
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Bloquear tipos de arquivo desnecessários que tentem entrar no gateway de e-mail da
organização.

Normas de referência: não identificada.'),
  (95, '9.7', 11, NULL, 'G3', NULL, 'O órgão implementa e mantém proteções antimalware nos servidores de e-mail?', 'Implementar e manter proteção antimalware de servidores de e-mail, como varredura de
anexos ou sandbox.

Normas de referência: não identificada.'),
  (96, '10.1', 12, NULL, 'G1', NULL, 'O órgão instala e mantém um software antimalware?', 'Instalar e manter um software antimalware em todos os ativos institucioanais que
possibilitem esta instalação.

Normas de referência: não identificada.'),
  (97, '10.2', 12, NULL, NULL, NULL, 'O órgão configura atualizações automáticas de assinatura antimalware?', 'GI1
Configurar atualizações automáticas para as assinaturas antimalware em todos os ativos
institucionais que possibilitem esta configuração.

Normas de referência: não identificada.'),
  (98, '10.3', 12, NULL, 'G1', NULL, 'O órgão desabilita a execução e reprodução automática para mídias removíveis?', 'Configurar os dispositivos para a não execução e reprodução automática de mídias
removíveis.

Normas de referência: não identificada.'),
  (99, '10.4', 12, NULL, 'G2', NULL, 'O órgão configura a varredura antimalware automática de mídias removíveis?', 'Configurar o software antimalware para verificar automaticamente mídias removíveis.

Normas de referência: não identificada.'),
  (100, '10.5', 12, NULL, 'G2', NULL, 'O órgão habilita funções antiexploração (anti-exploit)?', 'Implantar recursos de proteção antiexploração nos ativos institucionais, sempre que
possível.

Normas de referência: não identificada.'),
  (101, '10.6', 12, NULL, 'G2', NULL, 'O órgão gerencia o software antimalware de forma centralizada?', 'Utilizar software antimalware gerenciado de forma centralizada.

Normas de referência: não identificada.'),
  (102, '10.7', 12, NULL, 'G2', NULL, 'O órgão utiliza software antimalware baseado em comportamento?', 'Utilizar software antimalware baseado em comportamento.

Normas de referência: não identificada.'),
  (103, '11.1', 13, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo de realização de cópias de segurança (backup)?', 'Estabelecer e manter um processo de realização de cópias de segurança (backups),
incluindo as atividades de recuperação de dados. Tal processo deve descrever em seu
escopo critérios de priorização para recuperação, bem como medidas para segurança dos
dados. Periodicamente, deve ser realizada uma revisão ou atualização deste processo,
48
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
assim como em casos específicos quando ocorrerem mudanças significativas que venham a
impactar esta medida.

Normas de referência: **IN GSI/PR nº 8/2025, art. 3º, VI.'),
  (104, '11.2', 13, NULL, 'G1', NULL, 'O órgão executa backups automatizados?', 'Estabelecer e manter procedimentos para que todos os dados dos ativos institucionais
tenham cópias de segurança (backups) realizadas automaticamente e de forma regular, de
acordo com a criticidade dos dados.

Normas de referência: não identificada.'),
  (105, '11.3', 13, NULL, 'G1', NULL, 'O órgão protege os dados de recuperação?', 'Estabelecer e manter procedimentos para proteger os dados de recuperação com controles
equivalentes aos dos dados originais. Considerar o uso de criptografia ou separação de
dados, conforme os requisitos.

Normas de referência: NC nº 20/IN01/DSIC/GSIPR, 6.2.4; IN GSI/PR nº 3/2013; NC nº 09/IN01/DSIC/GSIPR; **IN GSI/PR nº 8/2025, art. 3º, VI.'),
  (106, '11.4', 13, NULL, 'G1', NULL, 'O órgão estabelece e mantém uma instância isolada de dados de recuperação?', 'Criar e manter pelo menos uma instância isolada dos dados de recuperação. Alguns
exemplos deste tipo de implementação são o controle de versão de destinos de backup por
meio de sistemas ou serviços off-line (backup off-line, não acessível por meio de uma
conexão de rede), em nuvem, ou em datacenter separado do site local.

Normas de referência: não identificada.'),
  (107, '11.5', 13, NULL, 'G2', NULL, 'O órgão testa a recuperação dos dados?', 'Realizar o teste de integridade do backup regularmente, executando um processo de
restauração de dados para assegurar que o backup esteja funcionando corretamente
conforme política de backup.

Normas de referência: NC nº 20/IN01/DSIC/GSIPR, 6.3.9; **IN GSI/PR nº 8/2025, art. 3º, VI. ** A IN GSI/PR nº 8/2025 estabelece os requisitos mínimos de segurança da informação para tratamento de informação classificada em computação em nuvem, sendo uma norma de referência apenas para estas situações.'),
  (108, '12.1', 14, NULL, 'G1', NULL, 'O órgão mantém atualizada a infraestrutura de rede?', 'Estabelecer e manter procedimentos para assegurar que a infraestrutura de rede da
organização esteja sempre atualizada. Revisar as versões de software mensalmente, ou
50
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
com maior frequência, para verificar se ainda estão sendo suportados pelos seus
fornecedores.

Normas de referência: não identificada.'),
  (109, '12.2', 14, NULL, 'G2', NULL, 'O órgão estabelece e mantém uma arquitetura de rede segura?', 'Projetar e manter uma arquitetura de rede segura abordando, no mínimo, segmentação,
privilégio mínimo e disponibilidade. Exemplos de implementações incluem documentação,
políticas e componentes de projeto.

Normas de referência: *IN GSI/PR nº 5/2021, art. 15; **IN GSI/PR nº 8/2025, art. 3º, I, II, III.'),
  (110, '12.3', 14, NULL, 'G2', NULL, 'O órgão gerencia a infraestrutura de rede com segurança?', 'Gerenciar com segurança a infraestrutura de rede da organização. Exemplos de
implementações incluem a Infraestrutura como Código (Infrastructure as Code, IaC) com
controle de versão e o uso de protocolos de rede seguros.

Normas de referência: não identificada.'),
  (111, '12.4', 14, NULL, 'G2', NULL, 'O órgão elabora e mantém diagramas de arquitetura?', 'Elaborar e manter diagramas e demais documentações da arquitetura de rede da
organização. Revisar e atualizar as documentações anualmente ou quando ocorrerem
mudanças significativas que possam impactar esta medida.

Normas de referência: não identificada.'),
  (112, '12.5', 14, NULL, 'G2', NULL, 'O órgão centraliza a autenticação, a autorização e a auditoria (Authentication, Authorization, and Accounting, AAA) de rede?', 'Centralizar a autenticação, autorização e auditoria da rede.

Normas de referência: não identificada.'),
  (113, '12.6', 14, NULL, 'G2', NULL, 'O órgão utiliza protocolos seguros de comunicação e gerenciamento de rede?', 'Adotar protocolos de comunicação e gerenciamento de rede seguros.

Normas de referência: não identificada.'),
  (114, '12.7', 14, NULL, NULL, NULL, 'O órgão assegura que os dispositivos remotos utilizem uma Rede Privada Virtual (Virtual Private Network, VPN) e se conectam em uma infraestrutura de autenticação, autorização e auditoria (Authentication, Authorization, and Accounting, AAA)?', 'GI2
Exigir que os usuários que acessam a rede de forma remota utilizem uma VPN gerenciada
pela organização e realizem autenticação via serviços AAA antes de qualquer acesso.

Normas de referência: não identificada.'),
  (115, '12.8', 14, NULL, 'G3', NULL, 'O órgão utiliza e mantém recursos computacionais dedicados para todas as atividades administrativas de TI?', 'Estabelecer e manter recursos de computação dedicados, física ou logicamente separados,
para todas as tarefas administrativas de TI ou tarefas que exijam acesso administrativo. Os
recursos de computação devem ser segmentados da rede primária da organização e não
devem ter acesso à internet.

Normas de referência: não identificada.'),
  (116, '13.1', 15, NULL, 'G2', NULL, 'O órgão centraliza alertas de eventos de segurança?', 'Centralizar os alertas de eventos de segurança dos ativos institucionais e soluções de
software da organização para correlação e análise de registros. As boas práticas demandam
o uso de um Security Information and Event Management (SIEM), que inclui alertas de
correlação de eventos definidos pelo fornecedor. Uma plataforma de análise de log
configurada com aletas de correlação relevantes para a segurança também atende esta
medida.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 6.8; **IN GSI/PR nº 8/2025, art. 3º, X.'),
  (117, '13.2', 15, NULL, 'G2', NULL, 'O órgão implanta soluções de detecção de intrusão baseada em host?', 'Implantar soluções para detecção de intrusão baseada em host nos ativos institucionais,
quando apropriado ou suportado.

Normas de referência: não identificada.'),
  (118, '13.3', 15, NULL, 'G2', NULL, 'O órgão implanta soluções de detecção de intrusão de rede?', 'Implantar soluções para detecção de intrusão de rede nos ativos institucionais, quando
apropriado. Exemplos de implementações incluem o uso de um Network Intrusion Detection
System (NIDS) ou serviço de provedor de nuvem equivalente.
53
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: não identificada.'),
  (119, '13.4', 15, NULL, 'G2', NULL, 'O órgão realiza filtragem de tráfego entre os segmentos de rede?', 'Realizar a filtragem de tráfego entre os segmentos de rede, quando apropriado.

Normas de referência: não identificada.'),
  (120, '13.5', 15, NULL, 'G2', NULL, 'O órgão realiza o gerenciamento de controle de acesso para ativos remotos?', 'Gerenciar o controle de acesso em ativos institucionais que se conectam remotamente aos
recursos da organização. Determinar a quantidade de acesso aos recursos organizacionais
com base em: software antimalware instalados e atualizados, conformidade com o processo
de configuração segura dos ativos institucionais e garantia de que os sistemas operacionais
e demais aplicações estejam atualizados.

Normas de referência: não identificada.'),
  (121, '13.6', 15, NULL, 'G2', NULL, 'O órgão coleta logs de fluxo de tráfego de rede?', 'Realizar a coleta dos logs de fluxo de tráfego de rede com o objetivo de checar e alertar
sobre dispositivos de rede que estejam com comportamento suspeito relacionado às suas
necessidades de acesso para execução de suas funcionalidades.

Normas de referência: não identificada.'),
  (122, '13.7', 15, NULL, NULL, NULL, 'O órgão implanta soluções para prevenção de intrusão baseada em host?', 'GI3
Implantar uma solução de prevenção de intrusão baseada em host nos ativos institucionais,
quando suportado. Exemplos de implementações incluem o uso de um cliente Endpoint
Detection and Response (EDR) ou de um agente Instrusion Prevention System (IPS)
baseado em host.

Normas de referência: não identificada.'),
  (123, '13.8', 15, NULL, 'G3', NULL, 'O órgão implanta soluções para prevenção de intrusão de rede?', 'Implantar uma solução para prevenção de intrusão baseada em rede, quando suportado.
Exemplos de implementações incluem o uso de um sistema de prevenção de intrusão de
rede (Network Intrusion Prevention System, NIPS) ou serviço de provedor de nuvem
equivalente.

Normas de referência: não identificada.'),
  (124, '13.9', 15, NULL, 'G3', NULL, 'O órgão implanta controle de acesso em nível de porta?', 'Implantar o controle de acesso em nível de porta. Esta medida utiliza o protocolo 802.1x ou
soluções semelhantes como certificados, e pode incorporar a autenticação de usuário ou
dispositivo.
54
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: não identificada.'),
  (125, '13.10', 15, NULL, 'G3', NULL, 'O órgão realiza a filtragem da camada de aplicação?', 'Realizar a filtragem da camada de aplicação. Exemplos de implementações incluem um
proxy de filtragem, firewall da camada de aplicação ou gateway.

Normas de referência: não identificada.'),
  (126, '13.11', 15, NULL, 'G3', NULL, 'O órgão ajusta limites de alertas de eventos de segurança?', 'Ajustar periodicamente os limites dos alertas de eventos de segurança para assegurar a
eficácia na detecção de ameaças.

Normas de referência: não identificada. ** A IN GSI/PR nº 8/2025 estabelece os requisitos mínimos de segurança da informação para tratamento de informação classificada em computação em nuvem, sendo uma norma de referência apenas para estas situações.'),
  (127, '14.1', 16, NULL, 'G1', NULL, 'O órgão implementa um programa de conscientização em segurança da informação?', 'Estabelecer e manter um programa de conscientização em segurança da informação com o
objetivo de promover tal cultura na organização, conscientizar seus agentes públicos sobre
responsabilidades e procedimentos relacionados ao tema e sobre como interagir com ativos
institucionais de forma segura. Prever procedimentos de conscientização no ingresso dos
agentes públicos e de forma continuada, de acordo com a NC nº 18/IN01/DSIC/GSIPR.
Revisar e atualizar o conteúdo do programa anualmente ou quando ocorrerem mudanças
significativas na organização que possam impactar esta medida.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (128, '14.2', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos para reconhecer ataques de engenharia social?', '56
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Garantir que o programa de conscientização contemple conteúdo sobre como identificar
diferentes formas de ataques de engenharia social, como phishing, comprometimento de email institucional, golpes de telefone e chamadas realizadas por impostores.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (129, '14.3', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos nas melhores práticas de autenticação?', 'Garantir que o programa de conscientização contemple conteúdo sobre as melhores práticas
de autenticação. Exemplos de tópicos incluem autenticação multifator (Multi-Factor
Authentication, MFA), composição de senhas e gerenciamento de credenciais.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (130, '14.4', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos nas melhores práticas de tratamento de dados?', 'Garantir que o programa de conscientização contemple conteúdo sobre como identificar e
armazenar, transferir, arquivar e destruir adequadamente informações. Isto também inclui
conscientizar sobre práticas recomendadas de mesa e tela limpas (não deixar senhas
expostas nas mesas de trabalho e bloquear a tela da estação de trabalho ao se ausentar),
apagar quadros físicos e virtuais após reuniões e tratar dados e demais ativos institucionais
com segurança.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; NC nº 20/IN01/DSIC/GSIPR, item 4.7; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (131, '14.5', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos sobre as causas ocorrências não intencionais que podem expor dados?', 'Garantir que o programa de conscientização contemple conteúdo sobre ocorrências não
intencionais de exposição de dados, como entrega incorreta de dados pessoais, sigilosos ou
com alguma restrição de acesso, perda de dispositivos móveis ou publicação de dados não
intencional.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (132, '14.6', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos sobre como reconhecer e notificar incidentes de segurança da informação?', 'Garantir que o programa de conscientização contemple conteúdo que oriente os agentes
públicos para serem capazes de identificar os indicadores mais comuns de um incidente e
serem capazes de notificar tal incidente.
57
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (133, '14.7', 16, NULL, NULL, NULL, 'O órgão conscientiza os agentes públicos sobre como identificar e comunicar se os ativos institucionais estão sem atualizações de segurança?', 'GI1
Garantir que o programa de conscientização contemple conteúdo sobre verificar e notificar
desatualizações ou quaisquer falhas em ferramentas e processos automatizados.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (134, '14.8', 16, NULL, 'G1', NULL, 'O órgão conscientiza os agentes públicos sobre os perigos de se conectar e transmitir dados organizacionais em redes inseguras?', 'Garantir que o programa de conscientização contemple conteúdo sobre os riscos de se
conectar e transmitir dados em redes inseguras para atividades da organização. Se a
organização tiver agentes públicos em teletrabalho, é relevante incluir no programa de
conscientização recomendações sobre configuração segura da infraestrutura de rede
doméstica do agente público.

Normas de referência: NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (135, '14.9', 16, NULL, 'G2', NULL, 'O órgão implementa ações para capacitação sobre segurança da informação?', 'Incluir nos instrumentos de capacitação de pessoas da organização, a exemplo do Plano de
Desenvolvimento de Pessoas, as necessidades de treinamento em segurança da informação
para agentes públicos que atuem em funções específicas, de modo a atender suas
competências específicas, e promover a execução de tais instrumentos. Exemplos de
necessidades de capacitação incluem cursos de desenvolvimento de software seguro para
profissionais de TI, prevenção de vulnerabilidades para desenvolvedores de aplicações da
web, acesso e utilização dos registros gerados por provedores de serviço de nuvem e
treinamento avançado sobre engenharia social para funções de níveis estratégico da
organização. Considerar as NC nº 17/IN01/DSIC/GSIPR e NC nº 18/IN01/DSIC/GSIPR.

Normas de referência: NC nº 17/IN01/DSIC/GSIPR; NC nº 18/IN01/DSIC/GSIPR; *IN GSI/PR nº 5/2021, art. 13, VII e art. 16, I; Decreto nº 12.572/2025, art. 3º, IV, art. 4º, VI e art. 10, V; IN GSI/PR nº 1/2020, art. 19, II.'),
  (136, '15.1', 17, NULL, 'G1', NULL, 'O órgão estabelece e mantém o inventário de provedores de serviços?', 'Estabelecer e manter o inventário de provedores de serviços que mantêm dados críticos ou
são responsáveis por plataformas ou processos de TI relevantes para a organização. Este
inventário deve incluir as classificações dos provedores, conforme medida 15.3, e conter
seus contatos institucionais. Revisar e atualizar o inventário anualmente ou quando
ocorrerem mudanças significativas do provedor que venham impactar a organização de
forma significativa.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II'),
  (137, '15.2', 17, NULL, 'G2', NULL, 'O órgão estabelece e mantém uma política de gestão de provedores de serviços?', 'Estabelecer e manter uma política de gestão de provedores de serviços. Certifique-se de
que a política aborde o inventário, a categorização, a avaliação, o monitoramento e o
encerramento da operação dos provedores de serviços. Revisar e atualizar a política
anualmente ou quando ocorrerem mudanças significativas na organização que possam
afetar esta medida.

Normas de referência: IN SGD/ME nº 94/2022; *IN GSI/PR nº 5/2021; **IN GSI/PR nº 8/2025.'),
  (138, '15.3', 17, NULL, 'G2', NULL, 'O órgão categoriza provedores de serviços?', 'Categorizar os provedores de serviços considerando características tais como: criticidade
dos dados que trata, volume de dados, requisitos de disponibilidade, normas aplicáveis, risco
inerente e risco residual. Revisar e atualizar as categorizações anualmente ou quando
ocorrerem mudanças significativas na organização que possam afetar esta medida.

Normas de referência: *IN GSI/PR nº 5/2021, art. 3º, art. 11, III, IV, V, art. 17 e art. 18; Portaria SGD/MGI nº 5.950/2023.'),
  (139, '15.4', 17, NULL, 'G2', NULL, 'O órgão descreve os requisitos mínimos de segurança da informação nos contratos dos provedores de serviços?', 'Inserir cláusulas nos contratos dos provedores de serviços que contenham requisitos de
segurança da informação. Requisitos como segurança do software, resposta a incidentes de
60
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
segurança, criptografia, descarte de dados, entre outros, devem ser abordadas. Tais
requisitos mínimos devem ser concisos e estar de acordo com a política de gestão de
provedores de serviços da organização. Revisar os contratos de provedores de forma
periódica com o objetivo de atualizar e assegurar que os requisitos estão sendo cumpridos.

Normas de referência: IN SGD/ME nº 94/2022; Portaria SGD/MGI nº 5.950/2023; Portarias SGD/MGI nº 750/2023 e nº 6.679/2024; Portarias SGD/MGI nº 1.070/2023 e nº 6.680/2024; Portaria SGD/MGI nº 2.715/2023; Portaria SGD/MGI nº 370/2023; *IN GSI/PR nº 5/2021, arts. 16, II e III, 19, 22, 23 e 25; **IN GSI/PR nº 8/2025.'),
  (140, '15.5', 17, NULL, 'G3', NULL, 'O órgão avalia provedores de serviços?', 'Avaliar os provedores de serviços de acordo com a política de gestão de provedores de
serviços da organização. O escopo da avaliação pode variar de acordo com as
classificações, podendo ser realizada por meio da análise de relatórios de avaliação
padronizados, aplicação de questionários, processos rigorosos aplicáveis, entre outros. A
avaliação de provedores de serviço deve ser realizada de forma periódica e na medida em
que novos contratos forem estipulados ou renovados.

Normas de referência: IN SGD/ME nº 94/2022; Portaria SGD/MGI nº 5.950/2023; Portarias SGD/MGI nº 750/2023 e nº 6.679/2024; Portarias SGD/MGI nº 1.070/2023 e nº 6.680/2024; Portaria SGD/MGI nº 2.715/2023; Portaria SGD/MGI nº 370/2023; *IN GSI/PR nº 5/2021, art. 20; **IN GSI/PR nº 8/2025, arts. 7º, 8º, 9º e 10.'),
  (141, '15.6', 17, NULL, 'G3', NULL, 'O órgão monitora provedores de serviço?', 'Realizar o monitoramento dos provedores de acordo com a política de gestão de provedores
de serviços da organização. O monitoramento pode incluir a reavaliação periódica de
conformidade do provedor, avaliação de artefatos entregues pelo provedor e monitoramento
na dark web.

Normas de referência: IN SGD/ME nº 94/2022; Portarias SGD/MGI nº 750/2023 e nº 6.679/2024; Portarias SGD/MGI nº 1.070/2023 e nº 6.680/2024; Portaria SGD/MGI nº 2.715/2023; Portaria SGD/MGI nº 5.950/2023; Portaria SGD/MGI nº 370/2023.'),
  (142, '15.7', 17, NULL, 'G3', NULL, 'O órgão encerra de forma segura o contrato com o provedor de serviços?', 'Realizar de forma segura o encerramento de contrato de provedores e prestadores de
serviço. Algumas ações que podem ser utilizadas para encerrar os contratos ou desligar os
prestadores são: desativação de contas de usuário e serviço utilizados durante o contrato,
encerramento de fluxo de dados e descarte seguros de dados e informações corporativas
em sistemas dos provedores de serviço.

Normas de referência: IN SGD/ME nº 94/2022; Portaria SGD/MGI nº 5.950/2023; *IN GSI/PR nº 5/2021, art. 19, V e VI.'),
  (143, '16.1', 18, NULL, 'G2', NULL, 'O órgão estabelece e mantém um processo de desenvolvimento seguro de aplicações?', 'Estabelecer e manter um processo de desenvolvimento seguro de aplicações. O processo
deve abordar itens como: padrões de design de aplicações seguras, privacy by design,
práticas de codificação seguras, treinamento de desenvolvedor, gerenciamento de
vulnerabilidade, segurança de código de terceiros e procedimentos de teste de segurança de
aplicativo. Revisar e atualizar a documentação anualmente ou quando ocorrerem mudanças
institucionais significativas que possam impactar esta medida.

Normas de referência: não identificada.'),
  (144, '16.2', 18, NULL, 'G2', NULL, 'O órgão estabelece e mantém um processo para aceitar e tratar vulnerabilidades de software?', 'Estabelecer e manter um processo para receber e endereçar notificações de
vulnerabilidades de software, incluindo mecanismos para recebimento de notificações pela
Equipe de Prevenção, Tratamento e Resposta a Incidentes Cibernéticos (ETIR).
Recomenda-se que este processo esteja alinhado com processo de gestão de
vulnerabilidades organizacional e inclua itens como: critérios para aceitação de
vulnerabilidades identificadas e notificadas, equipe ou profissional responsável por analisar
os relatórios de vulnerabilidade e um processo de entrada, atribuição, correção e testes de
correção. Como parte deste processo, é importante rastrear as vulnerabilidades, classificar a
gravidade e atribuir métricas capazes de medir o tempo de identificação, análise e correção
das vulnerabilidades. Deve ser realizada uma revisão e alteração deste processo
periodicamente, em casos específicos ou quando ocorrerem mudanças na organização que
venham impactá-la de forma significativa.
64
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: não identificada.'),
  (145, '16.3', 18, NULL, 'G2', NULL, 'O órgão executa análise de causa raiz em vulnerabilidades de segurança?', 'Executar a análise de causa raiz em vulnerabilidades de segurança. A análise da causa raiz
é a tarefa capaz de avaliar os problemas subjacentes que criam vulnerabilidades no código
da aplicação, e permite que as equipes de desenvolvimento, para além de atuarem apenas
na vulnerabilidade, corrijam a causa raiz.

Normas de referência: não identificada.'),
  (146, '16.4', 18, NULL, 'G2', NULL, 'O órgão estabelece e gerencia um inventário de componentes de software de terceiros?', 'Estabelecer e manter um inventário atualizado de componentes de software de terceiros
usados no desenvolvimento e de componentes programados para uso futuro. Este inventário
deve incluir quaisquer riscos que cada componente de terceiros possa representar para a
organização. Deve ser realizada uma revisão e alteração deste inventário periodicamente,
com o objetivo de identificar quaisquer mudanças ou atualizações nesses componentes e
validar a compatibilidade destas.

Normas de referência: IN GSI/PR nº 3/2021, Capítulo II.'),
  (147, '16.5', 18, NULL, 'G2', NULL, 'O órgão usa componentes de software de terceiros atualizados e confiáveis?', 'Utilizar apenas componentes de terceiros atualizados e confiáveis. Quando possível,
escolher bibliotecas e estruturas pré-estabelecidas e comprovadas que forneçam a
segurança adequada. É importante adquirir tais componentes de fornecedores e fontes
confiáveis ou realizar a avaliação de vulnerabilidades do software antes de utilizá-las.

Normas de referência: não identificada.'),
  (148, '16.6', 18, NULL, 'G2', NULL, 'O órgão estabelece e mantém um sistema e processos para a classificação de severidade de vulnerabilidades de aplicações?', 'Estabelecer e manter um processo para a classificação do grau de severidade das
vulnerabilidades de aplicações, capaz de facilitar a priorização à medida que as
vulnerabilidades descobertas são corrigidas. Este processo deve incluir a definição de um
nível mínimo de aceitabilidade de segurança para a liberação de código ou aplicações. A
classificação da severidade deve trazer uma forma sistemática de triagem de
vulnerabilidades que venha a melhorar a gestão de riscos e assegurar que os bugs mais
graves sejam priorizados. Revisar o processo o e a classificação de vulnerabilidades
periodicamente.

Normas de referência: não identificada.'),
  (149, '16.7', 18, NULL, 'G2', NULL, 'O órgão usa modelos de configurações de proteção padrão para infraestrutura de aplicações?', 'Adotar configurações de segurança padronizadas para todos os componentes da
infraestrutura de aplicações, incluindo servidores, bancos de dados, servidores web,
contêineres, e serviços baseados em Plataforma como Serviço (Platform as a Service,
PaaS) e componentes de Software como Serviço (Software as a Service, SaaS). A
organização deve adotar configurações de padrões reconhecidos tais como o CIS
Benchmarks, NIST ou recomendações do fornecedor. Deve-se garantir que soluções de
software desenvolvidas internamente não alterem ou enfraqueçam essas configurações, e
quaisquer exceções devem ser formalmente justificadas, aprovadas e documentadas. A
conformidade com as configurações deverá ser verificada regularmente por auditorias ou
ferramentas automatizadas.

Normas de referência: não identificada.'),
  (150, '16.8', 18, NULL, 'G2', NULL, 'O órgão separa sistemas de produção e não produção?', 'Manter ambientes separados para sistemas de produção e não produção.

Normas de referência: não identificada.'),
  (151, '16.9', 18, NULL, 'G2', NULL, 'O órgão treina desenvolvedores em conceitos de segurança de aplicações e codificação segura?', 'Treinar todos os responsáveis pelo desenvolvimento de software sobre escrever código
seguro e sobre suas responsabilidades específicas. O treinamento deve incluir princípios
gerais de segurança e práticas padrão de segurança para aplicações. Deve ser realizado
pelo menos uma vez por ano e ser projetado de forma a promover a segurança dentro da
equipe de desenvolvimento e criar uma cultura de segurança entre os desenvolvedores.

Normas de referência: NC nº 17/IN01/DSIC/GSIPR; NC nº 18/IN01/DSIC/GSIPR; Decreto nº 12.572/2025, art. 3º, IV, art. 4º, VI e art. 10, V.'),
  (152, '16.10', 18, NULL, 'G2', NULL, 'O órgão aplica princípios de design seguro em arquiteturas de aplicações?', 'Aplicar princípios de design seguro em arquiteturas de aplicações. Os princípios de design
seguro incluem o conceito de privilégio mínimo e a aplicação de mediação para validar cada
operação que o usuário faz, promovendo o conceito de “nunca confiar nas entradas do
usuário”. Os exemplos incluem garantir que a verificação explícita de erros seja realizada e
documentada para todas as entradas, incluindo tamanho, tipo de dados e intervalos ou
formatos aceitáveis. O design seguro também significa minimizar a superfície de ataque da
infraestrutura da aplicação, como desligar portas e serviços desprotegidos, remover
programas e arquivos desnecessários, renomear ou remover contas padrão, entre outros.

Normas de referência: não identificada.'),
  (153, '16.11', 18, NULL, 'G2', NULL, 'O órgão reutiliza os módulos ou serviços validados quanto aos requisitos de segurança das aplicações?', 'Reutilizar módulos ou serviços validados quanto aos requisitos de segurança, como gestão
de identidade, criptografia e auditoria de logs. O uso de recursos nativos de sistemas
operacionais ou ambientes de desenvolvimento em funções críticas de segurança reduz a
carga de trabalho dos desenvolvedores e minimiza a probabilidade de erros de design ou de
implementação. Os sistemas operacionais modernos fornecem mecanismos eficazes para
identificação, autenticação, autorização, criação e manutenção de logs de auditoria,
disponibilizando tais mecanismos para as aplicações. Usar apenas algoritmos de criptografia
padronizados, atualmente aceitos e amplamente revisados.

Normas de referência: não identificada.'),
  (154, '16.12', 18, NULL, 'G3', NULL, 'O órgão implementa verificações de segurança em nível de código?', 'Utilizar ferramentas de análise estáticas e dinâmicas, Static Application Security Testing
(SAST) e Dynamic Application Security Testing (DAST), dentro do ciclo de vida da aplicação
para verificar se as práticas de codificação seguras estão sendo utilizadas na organização.

Normas de referência: não identificada.'),
  (155, '16.13', 18, NULL, 'G3', NULL, 'O órgão realiza teste de intrusão de aplicação (pentest)?', 'Realizar testes de intrusão em aplicações. Para aplicações críticas, o teste de intrusão
autenticado é mais adequado para localizar vulnerabilidades de codificação e de negócios
do que a varredura de código e o teste de segurança automatizados. O teste de intrusão
depende da habilidade do testador para manipular manualmente uma aplicação como um
usuário autenticado e não autenticado.

Normas de referência: Decreto nº 12.573/2025, art. 4º, IV, art. 4º, IX.'),
  (156, '16.14', 18, NULL, 'G3', NULL, 'O órgão realiza a modelagem de ameaças?', 'Realizar a modelagem de ameaças. A modelagem de ameaças é o processo de identificar e
abordar as falhas de design de segurança da aplicação em um projeto, antes que o código
seja criado. É conduzido por profissionais especialmente treinados que avaliam o design da
aplicação e medem os riscos de segurança para cada ponto de entrada e nível de acesso. O
objetivo é mapear a aplicação, a arquitetura e a infraestrutura de uma forma estruturada para
entender todos os pontos fracos.

Normas de referência: não identificada.'),
  (157, '17.1', 19, NULL, NULL, NULL, 'O órgão designou agente responsável, e respectivo substituo, para gerenciar a Equipe de Prevenção, Tratamento e Resposta a Incidentes Cibernéticos (ETIR)?', 'GI1
Designar formalmente o agente responsável, e respectivo substituto, entre servidores
públicos ocupantes de cargo efetivo ou militares de carreira da organização. Compete ao
agente responsável chefiar e gerenciar a Equipe de Prevenção, Tratamento e Resposta a
Incidentes Cibernéticos (ETIR), além de criar os procedimentos internos, distribuir tarefas
para a ETIR e ser a interface com o Centro de Prevenção, Tratamento e Resposta a
Incidentes Cibernéticos de Governo (CTIR Gov).

Normas de referência: IN GSI/PR nº 1/2020, art. 15, IV; NC n° 05/IN01/DSIC/GSIPR.'),
  (158, '17.2', 19, NULL, 'G1', NULL, 'O órgão estabelece e mantém informações de contato para notificar incidentes de segurança da informação?', 'Estabelecer e manter informações de contato para as partes que precisam ser informadas
sobre incidentes de segurança da informação, tais como equipe interna, provedores de
serviço, unidade jurídica, provedores de seguro de cibersegurança, áreas de comunicação
interna. A comunicação deve ocorrer entre a Equipe de Prevenção, Tratamento e Resposta
a Incidentes Cibernéticos (ETIR) e, no mínimo, o Centro de Prevenção, Tratamento e
Resposta a Incidentes Cibernéticos de Governo (CTIR Gov) e o Centro Integrado de
Segurança Cibernética do Governo Digital (CISC Gov.br). Verificar os contatos
periodicamente para garantir que as informações estejam atualizadas.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 8; NC n° 05/IN01/DSIC/GSIPR, 10.6.'),
  (159, '17.3', 19, NULL, 'G1', NULL, 'O órgão estabelece e mantém um processo institucional para notificar incidentes de segurança da informação?', 'Estabelecer e manter um processo institucional para que os agentes públicos e demais
pessoas possam notificar incidentes de segurança da informação. O processo deve incluir o
prazo e o mecanismo para a comunicação, o pessoal a quem comunicar e as informações
mínimas a serem comunicadas. É importante certificar-se de que o processo está
publicamente disponível para todos os agentes públicos da organização. Deve ser realizada
uma revisão periódica deste processo ou quando ocorrerem mudanças significativas na
organização que possam impactar esta medida.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, Anexo A, 6.'),
  (160, '17.4', 19, NULL, 'G2', NULL, 'O órgão estabelece e mantém um processo de gestão de incidentes de segurança da informação?', 'Estabelecer e manter um processo de gestão de incidentes de segurança da informação que
aborde as funções e responsabilidades, o plano de comunicação, o fluxo para o tratamento
dos incidentes, o adequado registro das evidências e os requisitos de conformidade,
considerando a NC nº 08/IN01/DSIC/GSIPR, a NC nº 21/IN01/DSIC/GSIPR e normas
correlatas. Realizar a revisão deste processo de forma periódica ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida.

Normas de referência: NC nº 08 /IN01/DSIC/GSIPR; NC nº 21/IN01/DSIC/GSIPR, 7 e 8; IN GSI/PR nº 1/2020, art. 19, X; *IN GSI/PR nº 5/2021, art. 13, IV, V e VI, art. 16, IV; Portaria GSI/PR nº 120/2022.'),
  (161, '17.5', 19, NULL, 'G2', NULL, 'O órgão atribui funções e responsabilidades para gestão de incidentes de segurança da informação?', 'Atribuir as principais funções e responsabilidades para a gestão de incidentes de segurança
da informação, incluindo equipe jurídica, TI, segurança da informação, instalações, relações
públicas, recursos humanos, equipe de tratamento de incidentes e de analistas. Realizar a
revisão deste processo de forma periódica ou quando ocorrerem mudanças significativas na
organização que possam impactar esta medida.

Normas de referência: NC nº 21/IN01/DSIC/GSIPR, 8 ; IN GSI/PR nº 1/2020, art. 19, VI, IX.'),
  (162, '17.6', 19, NULL, 'G2', NULL, 'O órgão define mecanismos de comunicação a ser realizado durante o tratamento de incidentes de segurança da informação?', 'Determinar quais mecanismos primários e secundários serão usados para notificar um
incidente de segurança da informação e para se comunicar durante um incidente. Os
mecanismos podem incluir ligações, mensagens, chats, e-mails, cartas, entre outros. Atentar
ao fato de que certos mecanismos, como e-mails, podem ser afetados durante um incidente
de segurança. Realizar a revisão desta medida de forma periódica ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida.

Normas de referência: NC nº 08 /IN01/DSIC/GSIPR.'),
  (163, '17.7', 19, NULL, 'G2', NULL, 'O órgão conduz exercícios de tratamento de incidentes de segurança da informação regularmente?', 'Planejar e conduzir exercícios e cenários rotineiros de tratamento de incidentes de
segurança da informação para a equipe envolvida, de forma a manter a conscientização e a
tranquilidade no caso de resposta a ameaças reais. Os exercícios devem testar os canais de
comunicação, tomada de decisão e recursos técnicos da equipe de resposta a incidentes,
contemplando a utilização das ferramentas e dados disponíveis. Realizar o exercício
semestralmente ou em intervalos menores.

Normas de referência: não identificada.'),
  (164, '17.8', 19, NULL, 'G2', NULL, 'O órgão realiza análises pós-incidente de segurança da informação?', 'Realizar análises pós-incidente de segurança da informação. As análises pós-incidente
ajudam a prevenir a recorrência do incidente por meio da identificação de lições aprendidas
e ações de acompanhamento.

Normas de referência: não identificada.'),
  (165, '17.9', 19, NULL, 'G3', NULL, 'O órgão estabelece a diferença entre evento e incidente de segurança da informação?', 'Estabelecer e manter critérios para a diferenciação entre evento e incidente de segurança da
informação. Os exemplos podem incluir: atividade anormal, vulnerabilidade de segurança,
ameaça de segurança, violação de dados, incidente de privacidade. Realizar a revisão desta
medida de forma periódica ou quando ocorrerem mudanças significativas na organização
que possam impactar esta medida.

Normas de referência: não identificada.'),
  (166, '18.1', 20, NULL, 'G2', NULL, 'O órgão elabora e mantém um programa de teste de intrusão (pentest)?', 'Estabelecer e manter um programa para testes de intrusão adequado ao tamanho, à
complexidade e à maturidade da organização. O programa de teste de intrusão deve levar
72
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
em consideração: o escopo do teste, como rede, aplicação web, Application Programming
Interface (API), controles de instalações físicas; frequência; limitações, como horários
aceitáveis e tipos de ataque excluídos; informações de contato; remediações, tais como o
encaminhamento das descobertas internamente; e lições aprendidas.

Normas de referência: Decreto nº 12.573/2025, art. 4º, IX.'),
  (167, '18.2', 20, NULL, 'G2', NULL, 'O órgão realiza testes de intrusão externos periódicos (pentest)?', 'Realizar testes de intrusão externos regularmente. O teste de intrusão externo deve ser
reconhecido pela organização e deve ser capaz de detectar informações exploráveis que
possam impactar a segurança dos ativos institucionais e soluções de software. Tal teste
deve ser realizado por profissionais qualificados.

Normas de referência: não identificada.'),
  (168, '18.3', 20, NULL, 'G2', NULL, 'O órgão corrige os resultados dos testes de intrusão (pentest)?', 'Corrigir as descobertas dos testes de intrusão com base no processo de correção de
vulnerabilidade da organização. Isso deve incluir a determinação de um cronograma e nível
de esforço com base no impacto e na priorização de cada descoberta identificada.

Normas de referência: não identificada.'),
  (169, '18.4', 20, NULL, 'G3', NULL, 'O órgão valida as medidas de segurança?', 'Validar as medidas de segurança após cada teste de intrusão. Se necessário, modificar os
conjuntos de regras e recursos para detectar as técnicas usadas durante o teste.

Normas de referência: não identificada.'),
  (170, '18.5', 20, NULL, 'G3', NULL, 'O órgão realiza testes de intrusão internos periódicos (pentest)?', 'Realizar testes de intrusão internos periódicos com base nos requisitos do programa
estabelecido pela medida 18.1. Realize o teste anualmente ou em intervalos menores.

Normas de referência: não identificada.'),
  (171, '19.1', 21, NULL, NULL, NULL, 'O órgão elabora e mantém processo para registrar as operações de tratamento de dados pessoais?', 'Estabelecer e manter processo documentado para registro das operações de tratamento de
dados pessoais, independentemente do meio em que os dados pessoais são tratados, a ser
amplamente divulgado na organização, que contemple o conteúdo disposto nas medidas
19.1 a 19.4 e estabeleça a periodicidade da atualização dos registros.

Normas de referência: Lei nº 13.709/2018, art. 37; Resolução CD/ANPD nº 15/2024, art. 8º.'),
  (172, '19.2', 21, NULL, NULL, NULL, 'O órgão inclui no registro das operações de tratamento a descrição do fluxo dos dados pessoais?', 'Assegurar que o registro das operações de tratamento de dados pessoais contemple a
descrição dos fluxos dos dados pessoais, a fonte (origem), as finalidades e hipóteses do
tratamento (e respectiva previsão legal, quando aplicável), os tempos de retenção, as
soluções de software que viabilizam o tratamento dos dados pessoais. A descrição do fluxo
de dados pessoais deve contemplar desde a coleta até o descarte, passando por todas as
etapas de uso dos dados pessoais. Atentar para o adequado registro das características dos
tratamentos de dados pessoais sensíveis.

Normas de referência: Lei nº 13.709/2018, art. 37; Resolução CD/ANPD nº 15/2024, art. 8º.'),
  (173, '19.3', 21, NULL, NULL, NULL, 'O órgão inclui no registro das operações de tratamento de dados pessoais os agentes, os compartilhamentos, as transferências internacionais e as abrangências geográficas do tratamento?', 'Assegurar que o registro das operações de tratamento de dados pessoais contemple, além
do indicado nas medidas 19.2 e 19.4: os agentes de tratamento (controladores, singulares
ou conjuntos, e operadores), os contratos, acordos ou instrumentos congêneres firmados
com os agentes de tratamento e as abrangências geográficas do tratamento. Incluir os
compartilhamentos de dados pessoais com terceiros e as transferências internacionais (com
respectivos tipos de dados pessoais, finalidades e hipóteses de tratamento, além de países
ou organismos internacionais para os quais os dados pessoais são transferidos).

Normas de referência: Lei nº 13.709/2018, art. 37; Resolução CD/ANPD nº 15/2024, art. 8º.'),
  (174, '19.4', 21, NULL, NULL, NULL, 'O órgão inclui no registro das operações de tratamento de dados pessoais os tipos de dados tratados e as categorias de titulares?', 'Assegurar que o registro das operações de tratamento de dados pessoais contemple, além
do indicado nas medidas 19.2 e 19.3: os tipos de dados pessoais tratados, sua natureza (se
76
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
sensíveis ou não) e respectiva classificação (cadastrais, financeiros, acadêmicos, dados de
saúde, biométricos, entre outros); as categorias de titulares de dados pessoais (clientes,
funcionários, agentes públicos, estudantes, fornecedores, entre outros). Incluir indicação
sobre tratamento de dados pessoais de vulneráveis, a exemplo de crianças, adolescentes e
idosos.

Normas de referência: Lei nº 13.709/2018, art. 37; Resolução CD/ANPD nº 15/2024, art. 8º.'),
  (175, '20.1', 22, NULL, NULL, NULL, 'O órgão implementa processo de gestão de incidentes com dados pessoais?', 'Estabelecer, manter e implementar um processo documentado de gestão de incidentes com
dados pessoais, contemplando ações para o tratamento dos incidentes, incluindo plano de
resposta a incidentes e remediação, nos termos da Lei nº 13.709/2018 e da Resolução
CD/ANPD nº 15/2024, que aborde funções e responsabilidades, principalmente acerca do
registro do incidente e sobre a eventual comunicação do incidente à ANPD e aos titulares de
dados pessoais. Realizar a revisão deste processo de forma periódica ou quando ocorrerem
mudanças significativas na organização que possam impactar esta medida. Este processo
pode ser incorporado ao gerenciamento de resposta a incidentes de segurança da
informação disposto no Controle 17 do PPSI.

Normas de referência: Lei nº 13.709/2018, arts. 48 e 50, § 2º, I, g; Resolução CD/ANPD nº 15/2024.'),
  (176, '20.2', 22, NULL, NULL, NULL, 'O órgão implementa programa de conscientização em privacidade e proteção de dados pessoais?', 'Estabelecer e manter um programa de conscientização em privacidade e proteção de dados
pessoais, com os objetivos de promover tal cultura na organização, sensibilizar seus agentes
públicos sobre responsabilidades e procedimentos relacionados ao tema e sobre como tratar
os dados pessoais de forma segura. Revisar e atualizar o conteúdo periodicamente ou
quando ocorrerem mudanças significativas na organização que possam impactar esta
medida, em especial como uma das medidas de resposta a incidentes com dados pessoais.

Normas de referência: Lei nº 13.709/2018, arts 6º, VII e VIII, e arts. 46, 47 e 50.'),
  (177, '20.3', 22, NULL, NULL, NULL, 'O órgão implementa ações para capacitação sobre privacidade e proteção de dados pessoais?', 'Incluir nos instrumentos de desenvolvimento de pessoas da organização, a exemplo do
Plano de Desenvolvimento de Pessoas, as necessidades de desenvolvimento em
privacidade e proteção de dados pessoais para agentes públicos que atuem em funções
específicas, de modo a atender suas competências específicas, e promover a execução de
tais instrumentos. Exemplos de necessidades de desenvolvimento incluem cursos de
adequação de contratos e instrumentos congêneres à Lei nº 13.709/2018 e elaboração de
RIPDs.

Normas de referência: Lei nº 13.709/2018, arts 6º, VII e VIII, e arts. 46, 47 e 50; Decreto nº 12.572/2025, art. 3º, IV, art. 4º, VI e art. 10, V.'),
  (178, '20.4', 22, NULL, NULL, NULL, 'O órgão possui um processo para promover a privacidade desde a fase de concepção do produto ou do serviço até a sua execução?', 'Estabelecer e manter um processo objetivando a privacidade desde a fase de concepção do
produto ou do serviço até a sua execução (privacy by design), contemplando o
desenvolvimento de novas iniciativas, ações, projetos ou programas que envolvam novas
operações de tratamento de dados pessoais. O processo deve promover a implementação
de medidas de segurança, técnicas e administrativas, incluindo as estabelecidas no PPSI.

Normas de referência: Lei nº 13.709/2018, art. 46, § 2º.'),
  (179, '21.1', 23, NULL, NULL, NULL, 'O órgão provê os meios necessários para que o encarregado exerça suas atividades e atribuições?', 'Disponibilizar ao encarregado pelo tratamento de dados pessoais os recursos necessários –
entre eles humanos, técnicos e administrativos –, para que preste assistência e orientação à
organização com autonomia técnica e evitando situações que possam configurar conflito de
interesse. Garantir ao encarregado o acesso direto aos responsáveis, inclusive de maior
nível hierárquico, pela tomada de decisões estratégicas sobre o tratamento de dados
pessoais. Observar o disposto no art. 41 da Lei nº 13.709/2018, na Resolução CD/ANPD nº
18/2024 e no art. 3º da IN SGD/ME nº 117/2020.

Normas de referência: Lei nº 13.709/2018, art. 41; Resolução CD/ANPD nº 18/2024, art. 10.'),
  (180, '21.2', 23, NULL, NULL, NULL, 'O órgão disponibiliza meios céleres, eficazes e adequados para viabilizar a comunicação dos titulares com o encarregado e o exercício de direitos?', 'Disponibilizar solução para que os titulares de dados pessoais, por meios céleres, eficazes e
adequados, possam realizar solicitações e reclamações ao encarregado e receber as
respectivas respostas.
80
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)

Normas de referência: Lei nº 13.709/2018, Capítulo III e art. 41; Resolução CD/ANPD nº 18/2024, art. 10, I.'),
  (181, '21.3', 23, NULL, NULL, NULL, 'O órgão possui processo para atendimento aos direitos dos titulares de dados pessoais?', 'Estabelecer um processo documentado para atendimento de requisição do titular de dados
pessoais ou de seu representante legalmente constituído. Recomenda-se que o processo
inclua a identificação dos papéis e responsabilidades das unidades da organização quanto
às medidas necessárias para o atendimento da solicitação, considerando principalmente as
atribuições do encarregado pelo tratamento de dados pessoais dispostas na Lei nº
13.709/2018 e na Resolução CD/ANPD nº 18/2024, e inclua prazos e requisitos para o
fornecimento das informações pertinentes e eventuais interações entre o encarregado e as
unidades objetivando atendimento dos direitos do titular. Sugere-se consignar no processo
que o requerimento será atendido sem custos para o titular e, a seu critério, as informações
e dados serão fornecidos por meio eletrônico, seguro e idôneo, ou sob forma impressa. A
organização deve ainda atentar para que o processo considere que os dados pessoais
referentes ao exercício regular de direitos não podem ser utilizados em prejuízo do titular.

Normas de referência: Lei nº 13.709/2018, Capítulo III e arts. 23, 41, 48 e 50; Resolução CD/ANPD nº 18/2024, art. 10, IV.'),
  (182, '21.4', 23, NULL, NULL, NULL, 'O órgão divulga publicamente e mantém atualizadas a identidade e as informações de contato do encarregado e de seu substituto?', 'Divulgar publicamente e manter atualizados, no mínimo, o nome completo e as informações
de contato do encarregado pelo tratamento de dados pessoais e de seu substituto – em local
de destaque e de fácil acesso no sítio eletrônico, de forma clara e objetiva –, viabilizando
também o exercício de direitos pelos titulares e o recebimento de comunicações da ANPD.

Normas de referência: Lei nº 13.709/2018, art. 41; Resolução CD/ANPD nº 18/2024, arts. 8º e 9º.'),
  (183, '21.5', 23, NULL, NULL, NULL, 'O órgão solicita assistência e orientação do encarregado quando realiza atividades e toma decisões estratégicas referentes ao tratamento de dados pessoais?', 'Solicitar assistência e orientação do encarregado quando realizar atividades e tomar
decisões estratégicas referentes ao tratamento de dados pessoais. Exemplos de
implementações desta medida incluem: elaborar e divulgar procedimento e tecnologia para
registro das solicitações ao encarregado; divulgar internamente o canal de contato com o
encarregado e sua atribuição quanto ao fornecimento de orientações ao controlador.

Normas de referência: Lei nº 13.709/2018, art. 41; Resolução CD/ANPD nº 18/2024, arts. 10, II, e 16.'),
  (184, '21.6', 23, NULL, NULL, NULL, 'O órgão possui processo para revisar, a pedido do titular, decisões tomadas com base em tratamento automatizado de dados pessoais?', '81
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Estabelecer um processo documentado para revisar, a pedido do titular ou do seu
representante legal, as decisões tomadas unicamente com base em tratamento
automatizado de dados pessoais que afetem os interesses do titular, inclusive aquelas
decisões que definam seu perfil pessoal, profissional, de consumo e de crédito ou os
aspectos de sua personalidade. O processo deve prever o fornecimento, quando solicitado,
de informações claras e adequadas acerca dos critérios e procedimentos utilizados para a
tomada de decisões automatizadas pela organização.

Normas de referência: Lei nº 13.709/2018, art. 20.'),
  (185, '22.1', 24, NULL, NULL, NULL, 'O órgão estabelece em contrato, convênio ou instrumento congênere os papéis e responsabilidades dos agentes de tratamento envolvidos?', 'Estabelecer e manter contratos, convênios e instrumentos congêneres com agentes de
tratamento de dados pessoais. Nas situações em que a organização realiza
compartilhamento restrito e específico de dados pessoais, formalizá-lo por meio do
documento de interoperabilidade, disposto no Decreto nº 10.046/2019. Recomenda-se que
referidos documentos contenham os papéis e responsabilidades dos agentes envolvidos,
além de cláusulas que objetivem garantir a adoção de medidas técnicas (ex.: criptografia,
controle de acesso, pseudonimização e testes de intrusão) e administrativas (ex.: termos de
responsabilidade, acordos de confidencialidade e termos de sigilo) adequadas para o
cumprimento dos princípios, dos direitos do titular e do regime de proteção de dados
pessoais previstos na Lei nº 13.709/2018, incluindo as resoluções da ANPD aplicáveis, a
exemplo da adoção das cláusulas-padrão contratuais estabelecidas na Resolução CD/ANPD
nº 19/2024 para as operações de tratamento que envolvam transferência internacional de
dados pessoais.

Normas de referência: Lei nº 13.709/2018, arts. 16, 33, 39, 42, 46, 47, 49, 50 e 52; Resolução CD/ANPD nº 19/2024, Anexo, arts. 2º, 17 e 27; IN SGD/ME nº 94/2022; Portarias SGD/MGI nº 5.950/2023, nº 750/2023, nº 6.679/2024, nº 1.070/2023, nº 6.680/2024, nº 2.715/2023 e nº 370/2023.'),
  (186, '22.2', 24, NULL, NULL, NULL, 'O órgão avalia se os agentes de tratamento aplicam medidas aptas a proteger os dados pessoais?', 'Avaliar se os agentes de tratamento aplicam as medidas técnicas e administrativas
estabelecidas em contrato, convênio ou instrumento congênere. O escopo da avaliação pode
variar de acordo com a complexidade do tratamento de dados pessoais e os riscos no
tratamento (tratamento de dados pessoais sensíveis; ocorrência de transferência
internacional de dados pessoais, considerando o Capítulo V da Lei nº 13.709/2018 e a
Resolução CD/ANPD nº 19/2024; tratamento de dados pessoais de crianças, adolescentes
ou idosos; entre outros), podendo ser realizado por meio da análise de relatórios de
avaliação padronizados e aplicação de questionários. A avaliação dos agentes de tratamento
83
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
deve ser realizada de forma periódica e na medida que contratos, acordos de cooperação ou
instrumentos congêneres forem firmados ou atualizados.

Normas de referência: Lei nº 13.709/2018, arts. 16, 33, 39, 42, 46, 47, 49, 50 e 52; Resolução CD/ANPD nº 19/2024, Anexo, arts. 2º, 17 e 27; IN SGD/ME nº 94/2022; Portarias SGD/MGI nº 5.950/2023, nº 750/2023, nº 6.679/2024, nº 1.070/2023, nº 6.680/2024, nº 2.715/2023 e nº 370/2023.'),
  (187, '22.3', 24, NULL, NULL, NULL, 'O órgão encerra de forma segura o contrato, acordo ou instrumento congênere com os agentes de tratamento de dados pessoais?', 'Realizar de forma segura o encerramento de contrato, acordo ou instrumento congênere,
considerando inclusive o disposto na Resolução CD/ANPD nº 19/2024. Algumas ações que
podem ser utilizadas para realizar este encerramento são: solicitar anonimização, devolução
ou descarte com segurança dos dados pessoais tratados; encerrar o fluxo de dados
pessoais.

Normas de referência: Lei nº 13.709/2018, arts. 15, 16, 39, 42, 46, 47, 49, 50; Resolução CD/ANPD nº 19/2024, Anexo, arts. 2º, 17 e 27; IN SGD/ME nº 94/2022; Portaria SGD/MGI nº 5.950/2023.'),
  (188, '22.4', 24, NULL, NULL, NULL, 'O órgão incluiu cláusulas protetivas de dados pessoais nos contratos, acordos de cooperação e instrumentos congêneres vigentes em que há tratamento de dados pessoais?', 'Revisar e adaptar os contratos, acordos de cooperação e instrumentos congêneres vigentes
em que há tratamento de dados pessoais, de modo a adequá-los à Lei nº 13.709/2018 e a
normas correlatas, considerando também as medidas deste Controle 22 e a Resolução
CD/ANPD nº 19/2024.

Normas de referência: Lei nº 13.709/2018, arts. 16, 33, 39, 42, 46, 47, 49, 50 e 52; Resolução CD/ANPD nº 19/2024, Anexo, arts. 2º, 17 e 27; IN SGD/ME nº 94/2022; Portarias SGD/MGI nº 5.950/2023, nº 750/2023, nº 6.679/2024, nº 1.070/2023, nº 6.680/2024, nº 2.715/2023 e nº 370/2023.'),
  (189, '23.1', 25, NULL, NULL, NULL, 'O órgão realiza tratamento de dados pessoais apenas para o atendimento de sua finalidade pública, na persecução do interesse público, com o objetivo de executar as competências legais ou cumprir as atribuições legais do serviço público?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, analisar e promover os ajustes para garantir que a organização realiza o
tratamento de dados pessoais para o atendimento de finalidade pública, na persecução do
interesse público, com o objetivo de executar as competências legais ou cumprir as
atribuições legais do serviço público.

Normas de referência: Lei nº 13.709/2018, arts. 7º, 11 e 23.'),
  (190, '23.2', 25, NULL, NULL, NULL, 'O órgão assegura a conformidade das operações às hipóteses de tratamento de dados pessoais (bases legais)?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, analisar o tratamento – quer seja de dado pessoal, dado pessoal sensível ou
ambos –, e garantir que a hipótese de tratamento (base legal), disposta no art. 7º ou no art.
11 da Lei nº 13.709/2018, esteja adequada ao caso concreto. Considerar na análise e
garantia da conformidade, principalmente, os requisitos da respectiva hipótese de tratamento
estabelecidos na Lei nº 13.709/2018, registrando as evidências da análise.

Normas de referência: Lei nº 13.709/2018, arts. 7º e 11.'),
  (191, '23.3', 25, NULL, NULL, NULL, 'O órgão elabora o Relatório de Impacto à Proteção de Dados Pessoais (RIPD) dos processos de tratamento de dados pessoais que podem gerar riscos às liberdades civis e aos direitos fundamentais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, avaliar se podem gerar riscos às liberdades civis e aos direitos fundamentais
dos titulares; em caso positivo, elaborar o RIPD contendo, no mínimo, o disposto na Lei nº
13.709/2018, art. 38, parágrafo único: a descrição dos tipos de dados pessoais coletados; a
metodologia aplicada para a coleta e o armazenamento; as medidas adotadas para garantir
a segurança das informações; e a análise do controlador quanto aos riscos à privacidade e
às salvaguardas implementadas para mitigá-los.

Normas de referência: Lei nº 13.709/2018, arts. 5º, XVII, 10, § 3º, 32 e 38.'),
  (192, '23.4', 25, NULL, NULL, NULL, 'O órgão, ao realizar estudos em saúde pública, mantém os dados pessoais em ambiente controlado e seguro?', 'Na hipótese de a organização ser órgão de pesquisa (conforme disposto no inciso XVIII do
art. 5º da Lei nº 13.709/2018), para cada uma das operações de tratamento de dados
pessoais registradas em decorrência do Controle 19, identificar a ocorrência de realização
de estudos em saúde pública. Para tais operações, promover a implementação de políticas e
processos internos, aplicando medidas técnicas para assegurar que os dados pessoais
sejam mantidos dentro da organização, em ambiente controlado e seguro, e considerando
86
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
os padrões éticos relacionados a estudos e pesquisas, conforme Lei nº 13.709/2018, art. 13.
Ademais, anonimizar ou pseudonimizar os dados sempre que possível, e impedir que a
divulgação dos resultados ou de qualquer excerto do estudo ou da pesquisa revele dados
pessoais.

Normas de referência: Lei nº 13.709/2018, art. 13.'),
  (193, '23.5', 25, NULL, NULL, NULL, 'O órgão avalia e aplica medidas para que o tratamento de dados pessoais de crianças e adolescentes ocorra no seu melhor interesse?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, avaliar e implementar medidas para garantir que o melhor interesse de
crianças e adolescentes ocorra quando do tratamento de seus dados pessoais, conforme Lei
nº 13.709/2018, art. 14, e Enunciado n° 1/2023 da ANPD.

Normas de referência: Lei nº 13.709/2018, art. 14; Enunciado n° 1/2023 da ANPD.'),
  (194, '23.6', 25, NULL, NULL, NULL, 'O órgão avalia e aplica medidas para anonimizar os dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, aplicar medidas de anonimização de dados pessoais quando necessário,
conforme disposto na Lei nº 13.709/2018 e normas complementares.

Normas de referência: Lei nº 13.709/2018, art. `7º`,11, 12, 13, 16 e 18.'),
  (195, '23.7', 25, NULL, NULL, NULL, 'O órgão assegura a conformidade do término do tratamento e da eliminação dos dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, implementar procedimentos para assegurar o término do tratamento dos
dados pessoais, conforme as situações previstas na Lei nº 13.709/2018, art. 15, e sua
posterior eliminação, em observância ao disposto no art. 16 quanto à retenção legalmente
obrigatória.

Normas de referência: Lei nº 13.709/2018, art. 15 e 16.'),
  (196, '24.1', 26, NULL, NULL, NULL, 'O órgão assegura a interoperabilidade dos dados pessoais necessários ao uso compartilhado?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, manter os dados pessoais em formato interoperável e estruturado para o uso
compartilhado, nos termos do art. 25 da Lei nº 13.709/2018, do Decreto nº 10.046/2019 e de
normas correlatas.

Normas de referência: Lei nº 13.709/2018, art. 25; Decreto nº 10.046/2019.'),
  (197, '24.2', 26, NULL, NULL, NULL, 'O órgão, ao realizar compartilhamento de dados pessoais com outros órgãos e entidades públicos, verifica se o compartilhamento atende a finalidades específicas de execução de políticas públicas e atribuições legais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, realizar análise dos compartilhamentos de dados pessoais e implementar
mecanismos para que as finalidades dos compartilhamentos atendam políticas públicas e
88
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
atribuições legais da organização, em conformidade com a Lei nº 13.709/2018, art. 26 e
normas correlatas.

Normas de referência: Lei nº 13.709/2018, art. 26; Decreto nº 10.046/2019.'),
  (198, '24.3', 26, NULL, NULL, NULL, 'O órgão informa a ANPD ao realizar o compartilhamento de dados pessoais com pessoas jurídicas de direito privado?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, efetuar análise dos compartilhamentos de dados pessoais realizados com
pessoas jurídicas de direito privado (controladores) e garantir a conformidade com a Lei nº
13.709/2018, art. 27.

Normas de referência: Lei nº 13.709/2018, art. 27.'),
  (199, '24.4', 26, NULL, NULL, NULL, 'O órgão comunica os agentes de tratamento, com os quais compartilhou dados pessoais, a correção, a eliminação, a anonimização ou o bloqueio dos referidos dados?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, estabelecer e manter procedimentos para comunicar os agentes de
tratamento, com os quais compartilhou dados pessoais, sobre correção, eliminação,
anonimização ou bloqueio dos referidos dados, objetivando que tais agentes repitam o
procedimento – exceto nos casos em que a comunicação seja comprovadamente impossível
ou implique esforço desproporcional.

Normas de referência: Lei nº 13.709/2018, art. 18, § 6º.'),
  (200, '24.5', 26, NULL, NULL, NULL, 'O órgão observa as regras aplicáveis ao realizar operações de transferência internacional de dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, identificar aquelas que envolvem transferências internacionais de dados
pessoais e promover os respectivos ajustes para conformidade ao disposto na Lei nº
13.709/2018 e aos procedimentos e regras estabelecidos na Resolução CD/ANPD nº
19/2024.

Normas de referência: Lei nº 13.709/2018, Capítulo V; Resolução CD/ANPD nº 19/2024.'),
  (201, '25.1', 27, NULL, NULL, NULL, 'O órgão realiza tratamento de dados pessoais para propósitos legítimos, específicos, explícitos e informados ao titular?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, analisar se o tratamento é realizado para propósitos legítimos (lícitos,
considerando a Lei nº 13.709/2018 e demais legislações aplicáveis), específicos (não devem
ser genéricos ou amplos), explícitos (devem ser claros e precisos, evitando qualquer
ambiguidade) e informados ao titular (apresentados aos titulares por meio de avisos de
privacidade, conforme disposto na medida 25.6).

Normas de referência: Lei nº 13.709/2018, art. 6º, I, IV e VI.'),
  (202, '25.2', 27, NULL, NULL, NULL, 'O órgão realiza o tratamento de dados pessoais de forma compatível com as finalidades informadas ao titular, de acordo com o contexto do tratamento?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, analisar e promover os ajustes para garantir que o tratamento de dados
90
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
pessoais seja compatível com as finalidades informadas ao titular, de acordo com o contexto
do tratamento.

Normas de referência: Lei nº 13.709/2018, art. 6º, I, II, IV e VI.'),
  (203, '25.3', 27, NULL, NULL, NULL, 'O órgão trata somente os dados pessoais necessários para atingir as finalidades?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, a organização deve analisar e promover os ajustes objetivando tratar apenas
os dados pessoais estritamente necessários para o cumprimento das finalidades informadas
ao titular, abrangendo os dados pertinentes, proporcionais e não excessivos em relação às
finalidades do tratamento de dados pessoais.

Normas de referência: Lei nº 13.709/2018, arts. 6º, III e 7º, III, 10, § 1º, 11, II, b) e 15, I.'),
  (204, '25.4', 27, NULL, NULL, NULL, 'O órgão assegura aos titulares consulta facilitada e gratuita sobre a forma e a duração do tratamento de seus dados, assim como o acesso aos seus dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, a organização deve garantir consulta facilitada e gratuita sobre a forma e a
duração do tratamento dos dados pessoais, em atendimento também à medida 25.6.
Ademais, garantir consulta facilitada do titular à integralidade de seus dados pessoais, seja
exercendo seu direito de acesso via solicitação ao encarregado (medidas 21.2 e 21.3) ou de
forma direta por meio de solução de software.

Normas de referência: Lei nº 13.709/2018, arts. 6º, IV, VI, 9º, 14, § 6º, 18, 19, 20, 23, I, e 33, VIII.'),
  (205, '25.5', 27, NULL, NULL, NULL, 'O órgão implementa medidas para garantir aos titulares a exatidão, clareza, relevância e atualização dos dados pessoais, de acordo com a necessidade e para cumprir a finalidade do tratamento?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, a organização deve analisar e promover os ajustes para garantir aos titulares
que os dados pessoais tratados sejam exatos, claros, relevantes e atualizados, de acordo
com a necessidade. Estabelecer processos documentados que possibilitem a revisão e
correção de dados pessoais incorretos, incompletos ou desatualizados. Oferecer aos
titulares mecanismos, tais como soluções de software, para retificar seus dados. Integrar
validações automáticas e manuais nos sistemas para melhorar a precisão dos dados
pessoais tratados.

Normas de referência: Lei nº 13.709/2018, arts. 6º, V, VII, 46, 47 e 49.'),
  (206, '25.6', 27, NULL, NULL, NULL, 'O órgão assegura aos titulares informações claras, precisas e facilmente acessíveis sobre os tratamentos de dados pessoais?', '91
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, a organização deve analisar a necessidade de elaborar avisos de
privacidade. Tais avisos devem conter informações claras, precisas e facilmente acessíveis
aos titulares sobre as operações de tratamento de dados pessoais realizadas, inclusive
atendendo à necessidade de as informações serem compreensíveis ao público-alvo,
eventualmente não familiarizado com as tecnologias da informação, internet ou jargões
jurídicos. Recomenda-se que os avisos de privacidade contemplem minimamente as
informações dispostas na Lei nº 13.709/2018, art. 9º e art. 23, I, além da Resolução
CD/ANPD nº 19/2024, Anexo, art. 17, § 2º; e, para o tratamento de dados pessoais
sensíveis, considerar a Lei nº 13.709/2018, art. 11, § 2º. Ademais, nas situações em que o
tratamento envolver dados pessoais de crianças e adolescentes, considerar a Lei nº
13.709/2018, art. 14, § 6º.

Normas de referência: Lei nº 13.709/2018, arts. 6º, VI, 9º, 14, § 6º, 18, 19, 20, 23, I, e 33, VIII.'),
  (207, '25.7', 27, NULL, NULL, NULL, 'O órgão implementa medidas técnicas e administrativas aptas a proteger os dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, a organização deve implementar medidas técnicas e administrativas para
proteger os dados pessoais contra acessos não autorizados; situações acidentais ou ilícitas
de destruição, perda, alteração, comunicação ou difusão; vazamentos e outros tipos de
incidentes (também em atendimento à medida 25.8).

Normas de referência: Lei nº 13.709/2018, arts. 6º, VII, 46, 47 e 49.'),
  (208, '25.8', 27, NULL, NULL, NULL, 'O órgão implementa medidas para prevenir a ocorrência de danos em virtude do tratamento de dados pessoais?', 'Para cada uma das operações de tratamento de dados pessoais registrada em decorrência
do Controle 19, a organização deve implementar mecanismos de mitigação de riscos e
medidas que previnam a ocorrência de danos no tratamento de dados pessoais (também em
razão da medida 0.17). Para os tratamentos que possam gerar riscos às liberdades civis e
aos direitos fundamentais, elaborar relatórios de impactos à proteção de dados pessoais
(RIPD), igualmente em atendimento à medida 23.3. Estabelecer procedimento ou
metodologia para assegurar a privacidade desde a fase de concepção do produto ou do
serviço até a sua execução, conforme previsto na medida 20.4.

Normas de referência: Lei nº 13.709/2018, art. 6º, V, VIII, e 46.'),
  (209, '25.9', 27, NULL, NULL, NULL, 'O órgão assegura que o tratamento de dados pessoais não seja realizado para fins discriminatórios ilícitos ou abusivos?', 'Para cada uma das operações de tratamento de dados pessoais registradas em decorrência
do Controle 19, analisar e promover ajustes para garantir que o tratamento de dados
92
Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)
pessoais não seja realizado para fins discriminatórios, ilícitos ou abusivos, inclusive nos
tratamentos automatizados de dados pessoais.

Normas de referência: Lei nº 13.709/2018, art. 6º, IX, e 20, § 2º.'),
  (210, '25.10', 27, NULL, NULL, NULL, 'O órgão adota medidas de responsabilização e prestação de contas, capazes de evidenciar o cumprimento das normas de proteção de dados pessoais?', 'Garantir que todas as medidas implementadas com o objetivo de assegurar a conformidade
às normas de proteção de dados pessoais sejam devidamente evidenciadas, de forma
sistemática e auditável, registrando inclusive a eficácia das medidas. Isto inclui o registro de
evidências tais como: o PGP; o registro das operações de tratamento e as respectivas ações
para conformidade; as solicitações formuladas pelos agentes públicos ao encarregado e
suas respectivas orientações; o atendimento aos direitos dos titulares; os RIPDs; as ações
de conscientização e de treinamento; o relatório anual contemplando indicadores que
sintetizem as ações adotadas para assegurar a conformidade às normas protetivas de dados
pessoais, incluindo controles e medidas do PPSI; entre outros.

Normas de referência: Lei nº 13.709/2018, art. 6º, X, e 50.');

SELECT setval(pg_get_serial_sequence('public.controle', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.controle));
SELECT setval(pg_get_serial_sequence('public.medida', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.medida));
