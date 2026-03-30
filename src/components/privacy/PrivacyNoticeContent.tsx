import { Box, Divider, Typography } from "@mui/material";

/**
 * Texto do aviso da plataforma FPSI (não confundir com avisos gerados por cada cliente no portal).
 * Ao alterar de forma relevante, atualize FPSI_PRIVACY_NOTICE_VERSION em @/lib/privacy/constants.
 */
export function PrivacyNoticeContent() {
  return (
    <Box component="article" sx={{ "& h2": { mt: 4, mb: 1.5, fontSize: "1.25rem", fontWeight: 700 } }}>
      <Typography variant="body1" paragraph>
        Este aviso descreve como o <strong>FPSI</strong> (aplicação web em fpsi.com.br e ambientes associados) trata dados
        pessoais de <strong>usuários da plataforma</strong> (contas de acesso, administradores e colaboradores das
        organizações cliente). É aplicável ao uso do software; os textos de privacidade que sua organização publica no
        portal de titulares são documentos separados, por programa.
      </Typography>

      <Typography variant="h2" component="h2">
        Controlador
      </Typography>
      <Typography variant="body1" paragraph>
        O responsável pelo tratamento dos dados da conta e da operação da plataforma é a equipe / organização que mantém
        esta instância do FPSI. Em dúvidas sobre identificação do controlador na sua implantação, use o canal de contato
        indicado no rodapé ou na página Sobre.
      </Typography>

      <Typography variant="h2" component="h2">
        Dados que tratamos
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
          <li>
            <strong>Cadastro e conta:</strong> nome, e-mail, telefone (se informado), cargo e departamento (se
            configurados), foto de perfil opcional.
          </li>
          <li>
            <strong>Uso do sistema:</strong> registros necessários à operação (programas, diagnósticos, conformidade,
            políticas etc.) conforme as funcionalidades que você utiliza.
          </li>
          <li>
            <strong>Segurança e auditoria:</strong> logs técnicos e de atividade (ex.: ações relevantes, IP e user-agent
            quando aplicável à trilha de auditoria), conforme políticas do ambiente.
          </li>
        </Box>
      </Typography>

      <Typography variant="h2" component="h2">
        Finalidades e bases legais (LGPD)
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Box component="ul" sx={{ pl: 2.5, my: 0 }}>
          <li>
            <strong>Execução de contrato ou procedimentos preliminares:</strong> prover acesso, autenticação e recursos
            contratados ou em avaliação.
          </li>
          <li>
            <strong>Legítimo interesse:</strong> segurança, prevenção a fraude, melhoria técnica e suporte, sempre com
            balanceamento em relação à sua privacidade.
          </li>
          <li>
            <strong>Consentimento:</strong> quando exigido — por exemplo, para cookies não essenciais / analytics (veja
            abaixo).
          </li>
          <li>
            <strong>Obrigação legal:</strong> quando precisarmos atender ordens legais válidas.
          </li>
        </Box>
      </Typography>

      <Typography variant="h2" component="h2">
        Suboperadores e infraestrutura
      </Typography>
      <Typography variant="body1" paragraph>
        A aplicação pode utilizar provedores como hospedagem (ex.: Vercel), base de dados e autenticação (ex.: Supabase)
        e serviços de e-mail. Esses fornecedores tratam dados conforme seus contratos e políticas, na medida necessária
        para operar o serviço.
      </Typography>

      <Typography variant="h2" component="h2">
        Prazo de guarda
      </Typography>
      <Typography variant="body1" paragraph>
        Mantemos os dados pelo tempo necessário para cumprir as finalidades acima, respeitando prazos legais e políticas
        de retenção da sua organização quando aplicável (dados inseridos nos programas pertencem ao contexto de cada
        controlador cliente).
      </Typography>

      <Typography variant="h2" component="h2">
        Seus direitos
      </Typography>
      <Typography variant="body1" paragraph>
        Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização, eliminação
        quando cabível, portabilidade, informação sobre compartilhamentos e revogação de consentimento. Use o contato do
        controlador ou, quando disponível, as opções na área de perfil.
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h2" component="h2" id="cookies">
        Cookies e tecnologias similares
      </Typography>
      <Typography variant="body1" paragraph>
        Utilizamos cookies <strong>estritamente necessários</strong> para sessão autenticada e segurança (incluindo
        cookies do provedor de autenticação). Eles não podem ser desativados sem impedir o funcionamento do login.
      </Typography>
      <Typography variant="body1" paragraph>
        Cookies ou SDKs de <strong>medição agregada</strong> (por exemplo, Vercel Analytics) só são acionados se você
        aceitar a categoria correspondente no banner de cookies ou nas preferências. Você pode alterar sua escolha a
        qualquer momento pelo menu da sua conta (&quot;Privacidade e cookies&quot;) ou pelo link no banner, quando
        exibido.
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Última atualização do texto: 29 de março de 2026. Versão documental: 2026-03-29.
      </Typography>
    </Box>
  );
}
