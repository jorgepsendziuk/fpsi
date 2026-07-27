'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import { Montserrat } from 'next/font/google';
import { supabaseBrowserClient } from '@utils/supabase/client';
import { FPSI_PRIVACY_NOTICE_VERSION } from '@/lib/privacy/constants';
import { HeroAtmosphere } from '@/components/landing/HeroAtmosphere';
import { landing } from '@/components/landing/landingTokens';

const brandFont = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const ff = brandFont.style.fontFamily;

const DEMO_EMAIL = 'demo@fpsi.com.br';
const DEMO_PASSWORD = 'FPSI@D3m0';
const DEMO_DESTINATION = '/dashboard';
/** Mantém a intro de loading visível ~1s mesmo se o auth for rápido. */
const MIN_SCENE_MS = 1100;

const STEPS = [
  'Preparando ambiente',
  'Carregando dados de exemplo',
  'Abrindo o painel',
] as const;

const EXPLORE = [
  'Dashboard',
  'Diagnóstico',
  'Plano de Trabalho',
  'ROPA',
  'Mapeamento de Dados',
  'Portal do Titular',
  'Indicadores',
  'Assistente IA',
] as const;

async function prepareDemoSession() {
  fetch('/api/profiles/verify', { method: 'POST' }).catch(() => {});
  await fetch('/api/profiles/privacy-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ version: FPSI_PRIVACY_NOTICE_VERSION }),
  }).catch(() => {});
}

export default function DemoLoginPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'welcome'>('loading');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const startedAt = Date.now();

    const stepTimers = [
      window.setTimeout(() => { if (!cancelled) setStep(1); }, 380),
      window.setTimeout(() => { if (!cancelled) setStep(2); }, 820),
    ];

    const enterDemo = async () => {
      try {
        const { data: existing } = await supabaseBrowserClient.auth.getSession();
        if (existing?.session?.user?.email === DEMO_EMAIL) {
          await prepareDemoSession();
        } else {
          const { data, error: authError } = await supabaseBrowserClient.auth.signInWithPassword({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
          });

          if (cancelled) return;

          if (authError) {
            setError(authError.message || 'Não foi possível abrir a demonstração.');
            return;
          }

          if (!data?.session) {
            setError('Não foi possível abrir a demonstração.');
            return;
          }

          await supabaseBrowserClient.auth.setSession(data.session);
          await prepareDemoSession();
        }

        if (cancelled) return;

        const wait = Math.max(0, MIN_SCENE_MS - (Date.now() - startedAt));
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        if (cancelled) return;

        setReady(true);
        setStep(2);
        // Breve beat com barra “pronta” antes das boas-vindas
        await new Promise((r) => setTimeout(r, 280));
        if (cancelled) return;
        setPhase('welcome');
      } catch {
        if (!cancelled) setError('Não foi possível abrir a demonstração.');
      }
    };

    void enterDemo();

    return () => {
      cancelled = true;
      stepTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <Box
      className={brandFont.className}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: landing.heroText,
        '@supports (height: 100dvh)': {
          minHeight: '100dvh',
        },
        '@keyframes demoRise': {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes demoFade': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes demoPulse': {
          '0%, 100%': { opacity: 0.35, transform: 'scale(0.96)' },
          '50%': { opacity: 0.7, transform: 'scale(1.04)' },
        },
        '@keyframes demoBar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      }}
    >
      <HeroAtmosphere />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${landing.lock}22 0%, transparent 68%)`,
          animation: 'demoPulse 4.5s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Box
        component="header"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: { xs: 2.5, md: 4 },
          pt: { xs: 2.5, md: 3 },
          animation: 'demoFade 0.7s ease both',
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            textDecoration: 'none',
            color: landing.heroText,
          }}
        >
          <Image
            src="/logo_p.png"
            alt="FPSI"
            width={36}
            height={36}
            priority
            style={{ objectFit: 'contain' }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 900,
                fontSize: '1.15rem',
                letterSpacing: '-0.03em',
              }}
            >
              FPSI
            </Typography>
            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 500,
                fontSize: '0.62rem',
                color: landing.heroMuted,
                letterSpacing: '0.04em',
              }}
            >
              Demonstração
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          pb: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        {phase === 'welcome' && !error ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: 440,
              animation: 'demoRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontFamily: ff,
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '2.45rem' },
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                mb: 1.25,
              }}
            >
              Bem-vindo ao FPSI
            </Typography>

            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 500,
                fontSize: { xs: '0.98rem', md: '1.05rem' },
                color: landing.heroMuted,
                lineHeight: 1.5,
                mb: 2.75,
              }}
            >
              Este ambiente contém uma organização fictícia totalmente preenchida.
            </Typography>

            <Typography
              sx={{
                fontFamily: ff,
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: landing.lock,
                mb: 1.5,
                textAlign: 'left',
              }}
            >
              Explore
            </Typography>

            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                gap: 1,
                mb: 3.25,
                textAlign: 'left',
              }}
            >
              {EXPLORE.map((item) => (
                <Box
                  component="li"
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.85,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 18, color: landing.shield, flexShrink: 0 }} />
                  <Typography
                    sx={{
                      fontFamily: ff,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: landing.heroText,
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={() => router.replace(DEMO_DESTINATION)}
              sx={{
                fontFamily: ff,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '1.1rem',
                py: 1.55,
                borderRadius: 1.5,
                bgcolor: landing.blue,
                color: '#fff',
                boxShadow: '0 8px 28px rgba(21,101,192,0.45)',
                mb: 1.5,
                '&:hover': { bgcolor: '#0D47A1', boxShadow: '0 10px 32px rgba(21,101,192,0.55)' },
              }}
            >
              Entrar na demonstração
            </Button>

            <Button
              component={Link}
              href="/register"
              variant="text"
              fullWidth
              sx={{
                fontFamily: ff,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: landing.heroMuted,
                '&:hover': { color: landing.heroText, bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              Prefere criar o seu programa?
            </Button>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: { xs: 3.5, md: 4.5 },
                animation: 'demoRise 0.85s cubic-bezier(0.22, 1, 0.36, 1) both',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 72, md: 88 },
                  height: { xs: 72, md: 88 },
                  mb: 2.25,
                  filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))',
                }}
              >
                <Image
                  src="/logo_p.png"
                  alt=""
                  fill
                  priority
                  sizes="88px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontFamily: ff,
                  fontWeight: 900,
                  fontSize: { xs: '3rem', sm: '3.6rem', md: '4.25rem' },
                  letterSpacing: '-0.06em',
                  lineHeight: 0.92,
                  mb: 1.25,
                }}
              >
                FPSI
              </Typography>

              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  color: landing.lock,
                  letterSpacing: '0.04em',
                  mb: 2,
                }}
              >
                Demonstração
              </Typography>

              <Typography
                sx={{
                  fontFamily: ff,
                  fontWeight: 500,
                  fontSize: { xs: '1.02rem', md: '1.12rem' },
                  color: landing.heroMuted,
                  maxWidth: 400,
                  lineHeight: 1.5,
                }}
              >
                {error
                  ? 'Algo impediu a entrada. Tente de novo em instantes.'
                  : 'Programa completo com dados fictícios — sem cadastro.'}
              </Typography>
            </Box>

            {error ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  animation: 'demoRise 0.6s ease both',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: ff,
                    fontSize: '0.9rem',
                    color: '#FF8A80',
                    maxWidth: 360,
                  }}
                >
                  {error}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setError('');
                      startedRef.current = false;
                      window.location.reload();
                    }}
                    sx={{
                      fontFamily: ff,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2.75,
                      py: 1.15,
                      borderRadius: 1.5,
                      bgcolor: landing.blue,
                      color: '#fff',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0D47A1', boxShadow: 'none' },
                    }}
                  >
                    Tentar novamente
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/')}
                    sx={{
                      fontFamily: ff,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1.15,
                      borderRadius: 1.5,
                      color: landing.heroText,
                      borderColor: 'rgba(255,255,255,0.35)',
                      '&:hover': {
                        borderColor: landing.heroText,
                        bgcolor: 'rgba(255,255,255,0.06)',
                      },
                    }}
                  >
                    Voltar ao início
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  animation: 'demoRise 1s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 3,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '42%',
                      borderRadius: 999,
                      background: `linear-gradient(90deg, transparent, ${landing.lock}, ${landing.blueBright})`,
                      animation: ready ? 'none' : 'demoBar 1.35s ease-in-out infinite',
                      opacity: ready ? 0 : 1,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  {ready ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: landing.shield,
                        animation: 'demoFade 0.35s ease both',
                      }}
                    />
                  ) : null}
                </Box>

                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    m: 0,
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.1,
                  }}
                >
                  {STEPS.map((label, i) => {
                    const active = i === step;
                    const done = i < step || ready;
                    return (
                      <Box
                        component="li"
                        key={label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          justifyContent: 'flex-start',
                          opacity: done || active ? 1 : 0.38,
                          transition: 'opacity 0.35s ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            flexShrink: 0,
                            bgcolor: done
                              ? landing.shield
                              : active
                                ? landing.lock
                                : 'rgba(255,255,255,0.28)',
                            boxShadow: active ? `0 0 0 4px ${landing.lock}33` : 'none',
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: ff,
                            fontWeight: active || done ? 600 : 500,
                            fontSize: '0.95rem',
                            color: active || done ? landing.heroText : landing.heroMuted,
                            textAlign: 'left',
                          }}
                        >
                          {label}
                          {active && !ready ? '…' : ''}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      <Box
        component="footer"
        sx={{
          position: 'relative',
          zIndex: 2,
          px: 3,
          pb: 2.5,
          display: 'flex',
          justifyContent: 'center',
          animation: 'demoFade 1s 0.35s ease both',
        }}
      >
        <Typography
          component={Link}
          href="/privacidade"
          sx={{
            fontFamily: ff,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(244,248,252,0.45)',
            textDecoration: 'none',
            '&:hover': { color: landing.heroMuted },
          }}
        >
          Privacidade e cookies
        </Typography>
      </Box>
    </Box>
  );
}
