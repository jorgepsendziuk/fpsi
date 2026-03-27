import React from "react";
import { Stack, Typography, Link as MuiLink } from "@mui/material";
import type { PortalPublicData } from "@/lib/portal/portalPublicTypes";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Typography variant="h6" component="h2" fontWeight="bold">
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  );
}

export function PoliticaPrivacidadeContent({ data }: { data: PortalPublicData }) {
  const org = data.nome_fantasia || data.razao_social || data.nome || "esta organização";
  const dpo = [data.dpo_nome, data.dpo_email].filter(Boolean).join(" — ");
  return (
    <>
      <P>
        Esta Política de Privacidade descreve como <strong>{org}</strong> trata dados pessoais no contexto dos serviços
        relacionados ao programa de privacidade e segurança da informação aqui divulgado, em conformidade com a Lei nº
        13.709/2018 (LGPD).
      </P>
      <Section title="1. Controlador e contato">
        <P>
          O tratamento de dados pessoais é realizado em nome de <strong>{org}</strong>
          {data.cnpj != null && data.cnpj !== "" ? (
            <>
              , inscrita no CNPJ <strong>{String(data.cnpj)}</strong>
            </>
          ) : null}
          .
        </P>
        <P>
          Canais de contato:{" "}
          {data.atendimento_email ? (
            <MuiLink href={`mailto:${data.atendimento_email}`}>{data.atendimento_email}</MuiLink>
          ) : (
            "—"
          )}
          {data.atendimento_fone ? ` · Telefone: ${data.atendimento_fone}` : ""}
          {data.atendimento_site ? (
            <>
              {" "}
              · Site:{" "}
              <MuiLink href={data.atendimento_site} target="_blank" rel="noopener noreferrer">
                {data.atendimento_site}
              </MuiLink>
            </>
          ) : null}
        </P>
        <P>
          Encarregado de dados (DPO), quando indicado: {dpo || "—"}
        </P>
      </Section>
      <Section title="2. Quais dados podemos tratar">
        <P>
          Dependendo da interação, podem ser tratados identificação e contato (nome, e-mail, telefone, documento quando
          necessário), dados fornecidos em formulários (descrições de pedidos, mensagens) e registros técnicos mínimos
          (data/hora, protocolo) para prevenção a fraudes e comprovação de atendimento.
        </P>
      </Section>
      <Section title="3. Finalidades e bases legais (LGPD)">
        <P>
          Tratamos dados para: atender solicitações de titulares (exercício de direitos do art. 18); cumprir obrigações
          legais e regulatórias; registrar pedidos e comunicações; proteger a segurança da informação; e, quando aplicável,
          com base em legítimo interesse ou consentimento, conforme cada hipótese concreta.
        </P>
      </Section>
      <Section title="4. Compartilhamento">
        <P>
          Os dados podem ser acessados por prestadores que atuem sob contrato e obrigações de confidencialidade, e
          autoridades quando exigido por lei. Não vendemos dados pessoais.
        </P>
      </Section>
      <Section title="5. Prazos e armazenamento">
        <P>
          Conservamos informações pelo tempo necessário para cumprir as finalidades descritas, respeitados prazos legais e
          o regime de retenção aplicável à organização.
        </P>
      </Section>
      <Section title="6. Seus direitos">
        <P>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação,
          informação sobre compartilhamentos, revogação de consentimento e oposição, nos termos do art. 18 da LGPD, pelo
          canal de requisições deste portal.
        </P>
      </Section>
      <Section title="7. Segurança">
        <P>
          Adotamos medidas técnicas e administrativas aptas a proteger dados pessoais contra acessos não autorizados e
          incidentes, de acordo com o estado da técnica e o contexto do tratamento.
        </P>
      </Section>
      <Section title="8. Atualizações">
        <P>
          Esta política pode ser atualizada para refletir mudanças legislativas ou nos serviços. Recomendamos consulta
          periódica a esta página.
        </P>
      </Section>
    </>
  );
}

export function AvisoPortalTitularContent({ data }: { data: PortalPublicData }) {
  const org = data.nome_fantasia || data.razao_social || data.nome || "esta organização";
  return (
    <>
      <P>
        Este <strong>Portal de Privacidade e Segurança da Informação</strong> é um canal público mantido por{" "}
        <strong>{org}</strong> para facilitar o exercício de direitos do titular de dados pessoais e o contato sobre
        privacidade e segurança da informação, em linha com a LGPD.
      </P>
      <Section title="O que você pode fazer por aqui">
        <P>
          • Enviar <strong>requisições de direitos</strong> (art. 18), como acesso, correção, exclusão, portabilidade,
          revogação de consentimento, informação sobre compartilhamento e oposição, conforme o caso.
        </P>
        <P>
          • <strong>Acompanhar</strong> o status de um pedido com protocolo e/ou dados informados no formulário de
          consulta.
        </P>
        <P>
          • Utilizar os canais de <strong>reporte</strong> (vulnerabilidade ou incidente) e <strong>contato</strong>{" "}
          quando disponíveis neste portal.
        </P>
      </Section>
      <Section title="Natureza do atendimento">
        <P>
          As respostas observam prazos e hipóteses legais. Em alguns casos poderá ser necessário confirmar sua identidade.
          Pedidos manifestamente infundados ou excessivos podem ser tratados conforme a LGPD.
        </P>
      </Section>
      <Section title="Relação com outros documentos">
        <P>
          Este aviso complementa a Política de Privacidade e demais documentos publicados pela organização. Em caso de
          dúvida, utilize os canais de contato e o encarregado (DPO), quando indicado neste portal.
        </P>
      </Section>
    </>
  );
}

export function CookiesContent({ data }: { data: PortalPublicData }) {
  const org = data.nome_fantasia || data.razao_social || data.nome || "esta organização";
  return (
    <>
      <P>
        A seguir, informações sobre o uso de cookies e tecnologias similares nos serviços web relacionados a{" "}
        <strong>{org}</strong> e a este portal público.
      </P>
      <Section title="O que são cookies">
        <P>
          Cookies são pequenos arquivos armazenados no seu navegador que ajudam o site a funcionar, lembrar preferências
          ou gerar estatísticas agregadas de uso.
        </P>
      </Section>
      <Section title="Cookies necessários">
        <P>
          Utilizamos cookies estritamente necessários para segurança, sessão, preferências de idioma ou tema, e
          funcionamento básico do portal. Sem eles, alguns recursos podem não operar corretamente.
        </P>
      </Section>
      <Section title="Cookies de desempenho e analytics (se aplicável)">
        <P>
          Quando ativados, cookies de medição podem coletar dados agregados sobre visitas (por exemplo, páginas
          acessadas e tempo no site). Quando o uso depender de consentimento, será solicitado de forma destacada.
        </P>
      </Section>
      <Section title="Como gerenciar">
        <P>
          Você pode bloquear ou remover cookies nas configurações do seu navegador. Isso pode afetar a experiência no
          site.
        </P>
      </Section>
      <Section title="Mais informações">
        <P>
          Para detalhes sobre tratamento de dados pessoais, consulte também a Política de Privacidade deste portal.
        </P>
      </Section>
    </>
  );
}

export function DeclaracaoSegurancaContent({ data }: { data: PortalPublicData }) {
  const org = data.nome_fantasia || data.razao_social || data.nome || "esta organização";
  return (
    <>
      <P>
        Esta declaração resume o compromisso de <strong>{org}</strong> com a segurança da informação no contexto dos
        serviços divulgados neste portal. Não substitui políticas internas completas nem certificações específicas.
      </P>
      <Section title="Diretrizes">
        <P>
          • Adoção de controles alinhados às boas práticas de segurança da informação e privacidade aplicáveis ao
          negócio.
        </P>
        <P>• Gestão de acessos, conscientização e tratamento de incidentes conforme maturidade e risco.</P>
        <P>• Revisão contínua de medidas técnicas e organizacionais.</P>
      </Section>
      <Section title="Reporte responsável">
        <P>
          Se você identificar possível vulnerabilidade ou incidente relacionado a estes serviços, utilize o canal de
          reporte disponível no portal principal, com o máximo de detalhes possível para análise.
        </P>
      </Section>
    </>
  );
}
