/**
 * Catálogo da Academia LGPD (conteúdo da plataforma).
 * Gabarito fica em `gabarito.ts` e só é importado por rotas de API.
 * Versão muda quando o texto obrigatório de uma trilha muda.
 */

export const EDU_VERSAO = "2026.11";

export const EDU_DISCLAIMER =
  "Material de conscientização e boas práticas. Não é parecer jurídico e não substitui a orientação do Encarregado (DPO) nem o texto da lei.";

export type EduPergunta = {
  id: string;
  enunciado: string;
  opcoes: [string, string, string, string];
};

export type EduModulo = {
  id: string;
  ordem: number;
  titulo: string;
  minutos: number;
  artigos: string[];
  resumo: string;
  paragrafos: string[];
  /** Módulos 1 e 2 abertos na página pública; os demais pedem convite do programa. */
  previewPublico: boolean;
  perguntas: EduPergunta[];
};

export type EduCartilha = {
  id: string;
  titulo: string;
  publico: string;
  resumo: string;
  itens: string[];
};

export type EduTrilha = {
  id: string;
  titulo: string;
  publico: string;
  moduloIds: string[];
  cartilhaIds: string[];
  notaMinima: number;
  prazoDias: number;
  reciclagemMeses: number;
  obrigatoria: boolean;
  exigeNossaCasa: boolean;
};

export type EduCenario = {
  id: string;
  titulo: string;
  situacao: string;
  opcoes: [string, string, string];
  recomendado: string;
  artigos: string[];
};

export type EduGlossario = { termo: string; definicao: string };

const q = (
  moduloId: string,
  n: number,
  enunciado: string,
  opcoes: [string, string, string, string]
): EduPergunta => ({ id: `${moduloId}-q${n}`, enunciado, opcoes });

export const MODULOS: EduModulo[] = [
  {
    id: "por-que-importa",
    ordem: 1,
    titulo: "Por que privacidade importa",
    minutos: 8,
    artigos: ["Art. 1º", "Art. 2º"],
    resumo: "Dados pessoais são de pessoas. O cuidado evita dano ao titular, sanção e perda de confiança.",
    previewPublico: true,
    paragrafos: [
      "A LGPD existe para proteger a pessoa natural. Um cadastro, um e-mail ou um número de telefone não é só um registro operacional: identifica alguém e pode ser usado para prejudicar essa pessoa.",
      "Incidentes e uso fora da finalidade geram dano reputacional, retrabalho e, nos casos graves, comunicação à ANPD e aos titulares. O programa de privacidade organiza esse cuidado no dia a dia, não só na hora da auditoria.",
      "Conscientização (PPSI Controle 14 e art. 41, §2º, III) é parte do programa: cada colaborador precisa saber o que fazer com os dados que passa pelas suas mãos.",
    ],
    perguntas: [
      q("por-que-importa", 1, "O foco principal da LGPD é:", [
        "A pessoa natural a quem os dados se referem",
        "O faturamento da empresa controladora",
        "O fornecedor de nuvem",
        "Apenas dados de órgãos públicos",
      ]),
      q("por-que-importa", 2, "Um vazamento de planilha de clientes importa porque:", [
        "Pode causar dano aos titulares e obrigação de resposta",
        "Só importa se a planilha tiver mais de um milhão de linhas",
        "Não importa se o arquivo estava no e-mail corporativo",
        "Só o departamento jurídico pode se preocupar com isso",
      ]),
      q("por-que-importa", 3, "Conscientização de colaboradores serve para:", [
        "Orientar a prática diária e produzir evidência de orientação",
        "Substituir o registro das operações de tratamento",
        "Eliminar a necessidade de Encarregado",
        "Publicar a base de clientes na internet",
      ]),
    ],
  },
  {
    id: "conceitos",
    ordem: 2,
    titulo: "Conceitos essenciais",
    minutos: 10,
    artigos: ["Art. 5º"],
    resumo: "Dado pessoal, dado sensível, titular, controlador, operador e tratamento.",
    previewPublico: true,
    paragrafos: [
      "Dado pessoal é informação relacionada a pessoa natural identificada ou identificável. Nome com CPF, e-mail corporativo que identifica a pessoa, foto, localização e identificadores online entram nessa conta. Dado anonimizado, quando a identificação não é mais razoável, segue outro regime.",
      "Dado pessoal sensível (origem racial, saúde, biometria, opinião política, dado de criança, entre outros do art. 5º, II) exige cuidado reforçado e base legal própria, em geral o art. 11.",
      "Titular é a pessoa. Controlador decide por que e como tratar. Operador trata em nome do controlador. Tratamento é toda operação: coletar, armazenar, classificar, compartilhar, eliminar.",
    ],
    perguntas: [
      q("conceitos", 1, "Quem é o titular?", [
        "A pessoa natural a quem os dados se referem",
        "Sempre o diretor da empresa",
        "O operador de nuvem",
        "A ANPD",
      ]),
      q("conceitos", 2, "O operador, na LGPD:", [
        "Trata dados pessoais em nome do controlador",
        "Pode usar a base para uma campanha própria sem contrato",
        "É sinônimo de titular",
        "Não precisa de instruções documentadas",
      ]),
      q("conceitos", 3, "Qual exemplo é dado pessoal sensível?", [
        "Dado de saúde de um colaborador",
        "Nome da empresa fornecedora (pessoa jurídica)",
        "O CEP de uma cidade, sem identificar morador",
        "Um manual interno sem nomes",
      ]),
    ],
  },
  {
    id: "principios",
    ordem: 3,
    titulo: "Princípios na prática",
    minutos: 10,
    artigos: ["Art. 6º"],
    resumo: "Finalidade, adequação, necessidade, transparência, segurança e responsabilização.",
    previewPublico: false,
    paragrafos: [
      "Só se trata dado para uma finalidade legítima, específica e informada. Guardar “por via das dúvidas” ou reaproveitar uma base de clientes para um produto novo sem revisar a finalidade quebra adequação e necessidade.",
      "Necessidade significa coletar o mínimo para aquela finalidade. Transparência significa o titular conseguir entender o que acontece, em linguagem clara, no aviso e no canal do Encarregado.",
      "Segurança e prevenção pedem medidas proporcionais ao risco. Responsabilização pede que a organização consiga demonstrar o que fez: políticas, registros, treinamentos e evidências.",
    ],
    perguntas: [
      q("principios", 1, "Um colega pede a planilha inteira de clientes para um brinde de fim de ano. O adequado é:", [
        "Questionar a finalidade e compartilhar só o estritamente necessário, se houver base",
        "Enviar a base completa porque o pedido veio de um colega",
        "Publicar a lista num grupo de WhatsApp para ser mais rápido",
        "Pedir ao titular que assine um termo em branco",
      ]),
      q("principios", 2, "O princípio da necessidade pede:", [
        "Limitar a coleta ao mínimo compatível com a finalidade",
        "Guardar todo histórico para sempre",
        "Copiar dados sensíveis para a área de trabalho pessoal",
        "Evitar qualquer registro de tratamento",
      ]),
      q("principios", 3, "Transparência, no dia a dia, aparece quando:", [
        "O titular entende a finalidade e sabe como falar com o Encarregado",
        "A política fica só no computador do jurídico",
        "O aviso usa apenas siglas internas",
        "O canal de direitos não é divulgado",
      ]),
    ],
  },
  {
    id: "bases-legais",
    ordem: 4,
    titulo: "Bases legais",
    minutos: 12,
    artigos: ["Art. 7º", "Art. 11"],
    resumo: "Consentimento não é a única base. A base tem de existir antes do tratamento e ser a adequada.",
    previewPublico: false,
    paragrafos: [
      "Cada tratamento precisa de uma hipótese do art. 7º (ou do art. 11, se for sensível). Consentimento é uma delas, não a padrão. Contrato, obrigação legal, legítimo interesse, execução de políticas públicas e proteção da vida são exemplos de outras hipóteses.",
      "Consentimento precisa ser livre, informado e inequívoco, e o titular pode revogar. Não se usa consentimento para disfarçar uma obrigação legal ou uma condição abusiva de serviço.",
      "Legítimo interesse exige balanceamento: a finalidade legítima não pode prevalecer sobre direitos e liberdades do titular. Na dúvida, o Encarregado orienta antes de iniciar o tratamento. A base fica registrada no ROPA.",
    ],
    perguntas: [
      q("bases-legais", 1, "É correto pedir consentimento quando:", [
        "A hipótese realmente é consentimento e o titular pode recusar sem punição indevida",
        "A empresa já é obrigada por lei a tratar aquele dado",
        "O objetivo é impedir o titular de revogar depois",
        "Não existe outra forma de encher um cadastro de marketing comprado",
      ]),
      q("bases-legais", 2, "Dado pessoal sensível, em regra, apoia-se no:", [
        "Art. 11, com hipóteses mais restritas",
        "Art. 7º, sem qualquer diferença",
        "Apenas no contrato com o fornecedor de software",
        "Num aviso de cookie genérico",
      ]),
      q("bases-legais", 3, "Onde a base legal do processo deve ficar registrada?", [
        "No registro das operações de tratamento (ROPA)",
        "Somente na assinatura de e-mail do comercial",
        "Num grupo privado de mensagens",
        "Não precisa registrar",
      ]),
    ],
  },
  {
    id: "direitos",
    ordem: 5,
    titulo: "Direitos do titular e o canal",
    minutos: 10,
    artigos: ["Art. 18", "Art. 41"],
    resumo: "Acesso, correção, eliminação, portabilidade e os demais direitos do art. 18 passam pelo canal oficial.",
    previewPublico: false,
    paragrafos: [
      "O titular pode pedir confirmação e acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre compartilhamentos, e revogar consentimento, entre outros direitos do art. 18. Há prazos e exceções (por exemplo, guarda exigida por lei).",
      "O pedido deve entrar pelo canal informado pela organização, de preferência o portal do titular, para haver protocolo e acompanhamento. Um pedido recebido no WhatsApp pessoal de um gerente deve ser encaminhado ao canal, não “resolvido” à parte.",
      "O Encarregado é o ponto de contato com titulares e com a ANPD. Colaboradores não inventam a resposta jurídica: registram, encaminham e não apagam evidência por conta própria.",
    ],
    perguntas: [
      q("direitos", 1, "Um cliente pede exclusão pelo WhatsApp pessoal do gerente. O primeiro passo é:", [
        "Encaminhar ao canal oficial do titular e ao Encarregado, sem apagar nada por conta própria",
        "Apagar o cadastro na hora, sem registro",
        "Ignorar, porque WhatsApp não é canal formal",
        "Publicar o pedido no mural da empresa",
      ]),
      q("direitos", 2, "O art. 18 trata, entre outros, de:", [
        "Direitos do titular, como acesso e correção",
        "Apenas da multa máxima da ANPD",
        "Do desenho de servidores",
        "Da eleição do conselho de administração",
      ]),
      q("direitos", 3, "Quem orienta colaboradores sobre práticas de proteção de dados, segundo o art. 41?", [
        "O Encarregado",
        "Qualquer estagiário, sem registro",
        "Somente a ANPD, caso a caso",
        "O titular, no lugar da organização",
      ]),
    ],
  },
  {
    id: "incidentes",
    ordem: 6,
    titulo: "Segurança e incidentes",
    minutos: 10,
    artigos: ["Art. 46", "Art. 48"],
    resumo: "Senha, phishing e vazamento: reporte cedo. Não tente resolver sozinho.",
    previewPublico: false,
    paragrafos: [
      "Medidas de segurança devem ser proporcionais ao risco: senha única e longa, trava de tela, cuidado com anexos e links, e nada de planilha de clientes em e-mail pessoal ou pendrive sem controle.",
      "Phishing pede urgência falsa, PIX, senha ou “RH” pedindo dados. Não clique. Confirme por um canal que você já conhece e avise a segurança ou o Encarregado.",
      "Se algo vazou ou pode ter vazado, registre o incidente no programa e avise o Encarregado imediatamente. Não avise titulares por conta própria e não apague logs para “limpar” o problema. A comunicação à ANPD e aos titulares, quando cabível, segue o art. 48 e a avaliação de risco.",
    ],
    perguntas: [
      q("incidentes", 1, "Chegou um e-mail pedindo a senha com urgência. Você deve:", [
        "Não informar a senha, confirmar por outro canal e reportar",
        "Responder com a senha se o remetente parecer interno",
        "Encaminhar o e-mail para toda a empresa com o anexo aberto",
        "Pagar o boleto indicado para evitar bloqueio",
      ]),
      q("incidentes", 2, "Ao suspeitar de vazamento, a conduta esperada é:", [
        "Registrar o incidente e avisar o Encarregado, preservando evidências",
        "Apagar os logs para reduzir o volume de dados",
        "Avisar a imprensa antes do Encarregado",
        "Esperar o fim do mês para ver se alguém reclama",
      ]),
      q("incidentes", 3, "Planilha com dados de titulares deve circular:", [
        "Só com quem precisa, no ambiente autorizado, pela finalidade registrada",
        "No grupo de WhatsApp da equipe, para agilizar",
        "No e-mail pessoal, como cópia de segurança",
        "Num link público sem senha",
      ]),
    ],
  },
  {
    id: "terceiros",
    ordem: 7,
    titulo: "Terceiros e nuvem",
    minutos: 10,
    artigos: ["Art. 39", "Art. 42"],
    resumo: "Fornecedor que trata dado pessoal é operador: contrato, instrução e revisão.",
    previewPublico: false,
    paragrafos: [
      "Contratar um sistema, uma agência ou uma nuvem que trate dados pessoais em nome da organização cria um operador. O operador segue as instruções do controlador. Uso para finalidade própria do fornecedor não é permitido.",
      "O contrato precisa prever o tratamento, as medidas de segurança e a ajuda em incidentes e direitos dos titulares. Cláusula genérica de “confidencialidade” não substitui isso.",
      "Antes de comprar ou ligar uma integração, confirme quais dados saem, para qual finalidade, por quanto tempo e se há transferência internacional. Gestor que aprova o fornecedor também responde pelo encaixe no programa.",
    ],
    perguntas: [
      q("terceiros", 1, "Um fornecedor pode usar a base de clientes na campanha dele?", [
        "Não. O operador segue as instruções do controlador",
        "Sim, se o sistema já estiver pago",
        "Sim, se os dados estiverem na nuvem",
        "Sim, desde que não cobre taxa extra",
      ]),
      q("terceiros", 2, "Antes de contratar um SaaS que recebe dados de titulares, o gestor deve:", [
        "Saber finalidade, dados envolvidos, prazos e cláusulas de proteção",
        "Aceitar o clique padrão sem ler",
        "Pedir para o time colar a base num formulário público de teste",
        "Dispensar o Encarregado porque é só software",
      ]),
      q("terceiros", 3, "A responsabilidade do controlador em relação ao operador:", [
        "Permanece: o controlador responde pelos tratamentos que determina",
        "Desaparece no momento da assinatura",
        "Passa integralmente ao titular",
        "Só existe se houver incidente de ransomware",
      ]),
    ],
  },
  {
    id: "ia",
    ordem: 8,
    titulo: "IA e automação",
    minutos: 8,
    artigos: ["Art. 20"],
    resumo: "Não cole prompt com dados de titulares em ferramenta pública. Decisão automatizada tem direitos.",
    previewPublico: false,
    paragrafos: [
      "Colar currículo, prontuário, conversa de cliente ou base de leads num chat de IA público é tratamento e, muitas vezes, compartilhamento com um operador que a organização não contratou para isso.",
      "Ferramenta de IA usada no trabalho deve estar no inventário, com finalidade, dados de entrada e quem aprova o uso. Dado pessoal sensível não entra em experimento.",
      "Decisão automatizada que afeta o titular pode gerar pedido de revisão (art. 20). O time que opera o modelo não esconde a lógica de quem precisa explicar o resultado ao titular. Na dúvida, fale com o Encarregado antes de ligar o piloto.",
    ],
    perguntas: [
      q("ia", 1, "Pode colar a planilha de clientes num chat de IA gratuito?", [
        "Não, salvo ferramenta aprovada e finalidade registrada",
        "Sim, se for para ganhar tempo",
        "Sim, se apagar a coluna de CPF",
        "Sim, se o chat prometer não treinar o modelo",
      ]),
      q("ia", 2, "Uma decisão automatizada que recusa um titular pode exigir:", [
        "Informação e revisão, nos termos do art. 20",
        "Silêncio, para proteger o modelo",
        "Publicação do prompt na internet",
        "Nada, porque IA não trata dado pessoal",
      ]),
      q("ia", 3, "O lugar certo para registrar um sistema de IA que trata dados é:", [
        "O inventário do programa, com finalidade e dados de entrada",
        "Apenas a memória de quem fez o piloto",
        "Um ticket antigo já encerrado",
        "O grupo de mensagens do time",
      ]),
    ],
  },
];

export const CARTILHAS: EduCartilha[] = [
  {
    id: "lgpd-10-min",
    titulo: "LGPD em 10 minutos",
    publico: "Qualquer pessoa",
    resumo: "O mínimo para não errar o básico no primeiro dia.",
    itens: [
      "Dado pessoal identifica alguém. Trate com a mesma seriedade de um documento de identidade.",
      "Use o dado só para a finalidade do seu processo. Na dúvida, pergunte ao Encarregado.",
      "Não leve base de titulares para e-mail pessoal, pendrive ou grupo de mensagem.",
      "Pedido de titular e suspeita de incidente vão para o canal oficial, no mesmo dia.",
    ],
  },
  {
    id: "checklist-colaborador",
    titulo: "Checklist do colaborador",
    publico: "Colaboradores",
    resumo: "Antes de enviar, imprimir ou salvar.",
    itens: [
      "Este dado é necessário para a tarefa de hoje?",
      "Quem vai receber precisa dele para a mesma finalidade?",
      "O canal é o corporativo e o arquivo tem o mínimo de colunas?",
      "Se eu errar o destinatário, sei a quem avisar agora?",
    ],
  },
  {
    id: "phishing",
    titulo: "Phishing e engenharia social",
    publico: "Colaboradores",
    resumo: "Urgência, segredo e pedido de senha são sinais de golpe.",
    itens: [
      "A empresa não pede senha por e-mail, SMS ou mensagem.",
      "Desconfie de PIX, boleto e “RH” com anexo inesperado.",
      "Confirme por telefone ou canal já conhecido, não pelo link da mensagem.",
      "Reporte mesmo se você não clicou. Aviso rápido protege o resto do time.",
    ],
  },
  {
    id: "whatsapp-email",
    titulo: "E-mail, grupos e WhatsApp",
    publico: "Colaboradores",
    resumo: "Mensagem rápida também é tratamento.",
    itens: [
      "Grupo de mensagem não é arquivo oficial de dados de titulares.",
      "Evite CPF, saúde, endereço e documentos em conversa informal.",
      "Não use WhatsApp pessoal para pedido de direito do titular: encaminhe ao canal.",
      "Ao sair de um grupo de projeto, não leve o histórico com dados para o aparelho pessoal.",
    ],
  },
  {
    id: "trabalho-remoto",
    titulo: "Trabalho remoto e dispositivo pessoal",
    publico: "Colaboradores",
    resumo: "Casa e viagem não mudam a regra de acesso.",
    itens: [
      "Tela bloqueada ao se afastar. Nada de planilha aberta em café ou transporte.",
      "Wi-Fi público pede a rede autorizada pela organização, não um atalho.",
      "Familiar não usa o equipamento com acesso a sistemas de titulares.",
      "Impressão em casa só se a política permitir, e o papel volta ou é destruído.",
    ],
  },
  {
    id: "descarte",
    titulo: "Descarte de papel e mídias",
    publico: "Colaboradores",
    resumo: "Jogar fora também é tratamento (eliminação).",
    itens: [
      "Papel com dado pessoal vai para destruição, não para o lixo comum.",
      "Não doe computador ou celular sem o procedimento de apagamento da TI.",
      "Caderno de reunião com nomes e telefones segue a mesma regra do papel.",
      "Na dúvida se o prazo de guarda acabou, pergunte. Não elimine prova de incidente.",
    ],
  },
  {
    id: "privacy-by-design",
    titulo: "Privacidade ao comprar ou criar sistema",
    publico: "Gestores e TI",
    resumo: "A decisão de compra já é decisão de tratamento.",
    itens: [
      "Descreva quais dados entram, para quê, quem acessa e por quanto tempo.",
      "Prefira o produto que não exige dado além da finalidade.",
      "Exija cláusula de operador, incidente e apoio a direitos do titular.",
      "Piloto com dado real só depois do encaixe no inventário e, se o risco for alto, do RIPD.",
    ],
  },
  {
    id: "direitos-titular",
    titulo: "Como exercer seus direitos",
    publico: "Titulares",
    resumo: "Cartilha curta para quem é titular, não para quem opera o sistema.",
    itens: [
      "Você pode pedir acesso, correção, informação sobre compartilhamento e, quando couber, exclusão ou portabilidade.",
      "Use o canal publicado pela organização (portal do titular), não a rede pessoal de um funcionário.",
      "Guarde o número de protocolo.",
      "O Encarregado é a pessoa de contato indicada pela organização.",
    ],
  },
];

export const TRILHAS: EduTrilha[] = [
  {
    id: "onboarding",
    titulo: "Onboarding LGPD",
    publico: "Todo colaborador novo",
    moduloIds: ["por-que-importa", "conceitos", "principios", "bases-legais", "direitos", "incidentes"],
    cartilhaIds: ["lgpd-10-min", "checklist-colaborador", "phishing"],
    notaMinima: 70,
    prazoDias: 30,
    reciclagemMeses: 12,
    obrigatoria: true,
    exigeNossaCasa: true,
  },
  {
    id: "gestores",
    titulo: "Gestores",
    publico: "Quem aprova acesso, contrato ou compartilhamento",
    moduloIds: ["principios", "bases-legais", "direitos", "terceiros", "incidentes"],
    cartilhaIds: ["privacy-by-design", "checklist-colaborador"],
    notaMinima: 70,
    prazoDias: 45,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
  {
    id: "rh",
    titulo: "RH",
    publico: "Admissão, folha, benefícios e desligamento",
    moduloIds: ["conceitos", "bases-legais", "direitos", "incidentes"],
    cartilhaIds: ["checklist-colaborador", "descarte"],
    notaMinima: 70,
    prazoDias: 30,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
  {
    id: "comercial",
    titulo: "Comercial e marketing",
    publico: "Leads, CRM e cookies",
    moduloIds: ["principios", "bases-legais", "direitos"],
    cartilhaIds: ["whatsapp-email", "lgpd-10-min"],
    notaMinima: 70,
    prazoDias: 30,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
  {
    id: "ti",
    titulo: "TI e desenvolvimento",
    publico: "Sistemas, acessos, logs e operadores",
    moduloIds: ["conceitos", "incidentes", "terceiros", "ia"],
    cartilhaIds: ["privacy-by-design", "trabalho-remoto"],
    notaMinima: 70,
    prazoDias: 45,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
  {
    id: "atendimento",
    titulo: "Atendimento",
    publico: "Quem fala com o titular",
    moduloIds: ["conceitos", "direitos", "incidentes"],
    cartilhaIds: ["direitos-titular", "whatsapp-email"],
    notaMinima: 70,
    prazoDias: 30,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
  {
    id: "juridico",
    titulo: "Jurídico e compliance",
    publico: "Quem apoia o Encarregado",
    moduloIds: ["por-que-importa", "conceitos", "principios", "bases-legais", "direitos", "incidentes", "terceiros", "ia"],
    cartilhaIds: ["privacy-by-design", "direitos-titular"],
    notaMinima: 70,
    prazoDias: 60,
    reciclagemMeses: 12,
    obrigatoria: false,
    exigeNossaCasa: true,
  },
];

export const CENARIOS: EduCenario[] = [
  {
    id: "planilha-errada",
    titulo: "Planilha para o destinatário errado",
    situacao: "Você enviou uma planilha de clientes para um parceiro que não estava no processo.",
    opcoes: [
      "Apagar o e-mail enviado e não comentar",
      "Registrar o incidente e avisar o Encarregado agora",
      "Pedir ao parceiro que guarde a planilha para a próxima campanha",
    ],
    recomendado: "Registrar o incidente e avisar o Encarregado agora",
    artigos: ["Art. 48", "Art. 6º, VII e VIII"],
  },
  {
    id: "copia-evento",
    titulo: "Cópia da base para um evento",
    situacao: "O marketing pede “só uma cópia” da base inteira para um sorteio.",
    opcoes: [
      "Exportar tudo, porque o evento é da própria empresa",
      "Recusar a base inteira e levar ao Encarregado a finalidade e o mínimo necessário",
      "Subir a planilha num link público com senha no mesmo e-mail",
    ],
    recomendado: "Recusar a base inteira e levar ao Encarregado a finalidade e o mínimo necessário",
    artigos: ["Art. 6º, I e III"],
  },
  {
    id: "whatsapp-exclusao",
    titulo: "Exclusão pelo WhatsApp do gerente",
    situacao: "Um titular pede exclusão no WhatsApp pessoal do gestor.",
    opcoes: [
      "Apagar o cadastro e responder que já foi feito",
      "Encaminhar ao canal oficial, sem eliminar evidência por conta própria",
      "Ignorar, porque a mensagem não veio do e-mail corporativo",
    ],
    recomendado: "Encaminhar ao canal oficial, sem eliminar evidência por conta própria",
    artigos: ["Art. 18", "Art. 41"],
  },
  {
    id: "grupo-interno",
    titulo: "Suspeita em grupo interno",
    situacao: "Alguém colou uma lista de CPF num grupo interno “só para destravar um atendimento”.",
    opcoes: [
      "Deixar, porque o grupo é de funcionários",
      "Pedir para parar, não encaminhar e registrar incidente com o Encarregado",
      "Salvar a lista no celular para consultar depois",
    ],
    recomendado: "Pedir para parar, não encaminhar e registrar incidente com o Encarregado",
    artigos: ["Art. 46", "Art. 6º, VII"],
  },
];

export const GLOSSARIO: EduGlossario[] = [
  { termo: "Titular", definicao: "Pessoa natural a quem os dados pessoais se referem." },
  { termo: "Controlador", definicao: "Quem decide as finalidades e os meios do tratamento." },
  { termo: "Operador", definicao: "Quem trata dados pessoais em nome do controlador." },
  { termo: "Tratamento", definicao: "Toda operação com dado pessoal: coleta, armazenamento, compartilhamento, eliminação." },
  { termo: "Dado pessoal", definicao: "Informação relacionada a pessoa natural identificada ou identificável." },
  { termo: "Dado sensível", definicao: "Dado pessoal sobre origem, saúde, biometria, opinião política e os demais casos do art. 5º, II." },
  { termo: "Encarregado (DPO)", definicao: "Pessoa indicada para orientar, receber titulares e ser canal com a ANPD." },
  { termo: "ROPA", definicao: "Registro das operações de tratamento (art. 37)." },
  { termo: "RIPD", definicao: "Relatório de impacto à proteção de dados pessoais, quando o risco o exige." },
  { termo: "ANPD", definicao: "Autoridade Nacional de Proteção de Dados." },
];

export function moduloPorId(id: string): EduModulo | undefined {
  return MODULOS.find((m) => m.id === id);
}

export function trilhaPorId(id: string): EduTrilha | undefined {
  return TRILHAS.find((t) => t.id === id);
}

export function cartilhaPorId(id: string): EduCartilha | undefined {
  return CARTILHAS.find((c) => c.id === id);
}

export function modulosDaTrilha(trilhaId: string): EduModulo[] {
  const trilha = trilhaPorId(trilhaId);
  if (!trilha) return [];
  return trilha.moduloIds
    .map((id) => moduloPorId(id))
    .filter((m): m is EduModulo => Boolean(m));
}

export function cargaHorariaMinutos(trilhaId: string): number {
  return modulosDaTrilha(trilhaId).reduce((s, m) => s + m.minutos, 0);
}

export function todasPerguntas(): EduPergunta[] {
  return MODULOS.flatMap((m) => m.perguntas);
}

/** Card semanal estável para o ano, sem revelar o gabarito. */
export function perguntaDaSemana(date = new Date()): EduPergunta {
  const perguntas = todasPerguntas();
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.floor((date.getTime() - start) / (7 * 24 * 60 * 60 * 1000));
  const idx = ((week % perguntas.length) + perguntas.length) % perguntas.length;
  return perguntas[idx];
}

/** Ordem estável de exibição. `ordem[i]` é o índice original da opção mostrada na posição i. */
export function ordemExibicao(perguntaId: string): [number, number, number, number] {
  const order = [0, 1, 2, 3];
  let seed = 2166136261;
  for (const ch of perguntaId) {
    seed ^= ch.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order as [number, number, number, number];
}

export function opcoesParaExibir(pergunta: EduPergunta): string[] {
  return ordemExibicao(pergunta.id).map((idx) => pergunta.opcoes[idx]);
}

export function personalizarItens(
  itens: string[],
  vars: { orgao?: string; dpo?: string; canal?: string }
): string[] {
  const orgao = vars.orgao?.trim() || "a organização";
  const dpo = vars.dpo?.trim() || "o Encarregado";
  const canal = vars.canal?.trim() || "o canal oficial do titular";
  return itens.map((item) =>
    item
      .replaceAll("a organização", orgao)
      .replaceAll("o Encarregado", dpo)
      .replaceAll("o canal oficial do titular", canal)
      .replaceAll("canal oficial", canal)
  );
}
