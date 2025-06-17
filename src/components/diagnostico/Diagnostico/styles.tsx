import { SxProps, Theme } from '@mui/material';

interface DiagnosticoStyles {
  accordion: SxProps<Theme>;
  accordionSummary: SxProps<Theme>;
  contentBox: SxProps<Theme>;
  titleSection: SxProps<Theme>;
  titleLabel: SxProps<Theme>;
  title: SxProps<Theme>;
  maturidadeSection: SxProps<Theme>;
  maturidadeLabel: SxProps<Theme>;
  maturidadeValue: SxProps<Theme>;
  scoreSection: SxProps<Theme>;
  scoreValue: SxProps<Theme>;
  scoreMaturidade: SxProps<Theme>;
  scoreLabel: SxProps<Theme>;
  controlesContainer: React.CSSProperties;
}

export const diagnosticoStyles: DiagnosticoStyles = {
  accordion: {
    width: '100%',
    color: 'black',
    mb: 2,
    border: '1px solid rgba(0, 0, 0, 0.12)',
  },
  accordionSummary: {
    padding: 1,
  },
  contentBox: {
    flexGrow: 1,
  },
  titleSection: {
    textAlign: 'left',
  },
  titleLabel: {
    fontWeight: '200',
  },
  title: {
    fontWeight: '800',
    padding: 0,
  },
  maturidadeSection: {
    textAlign: 'center',
  },
  maturidadeLabel: {
    fontWeight: '400',
  },
  maturidadeValue: {
    fontWeight: '800',
  },
  scoreSection: {
    textAlign: 'center',
  },
  scoreValue: {
    color: 'red',
    fontWeight: '800',
    padding: 0,
  },
  scoreMaturidade: {
    fontWeight: '800',
    padding: 0,
  },
  scoreLabel: {
    fontWeight: '800',
    padding: 0,
  },
  controlesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}; 