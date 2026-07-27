"use client";

import React from "react";
import {
  PrivacyTip as PrivacyTipIcon,
  Backup as BackupIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  Group as GroupIcon,
  BugReport as BugReportIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Cloud as CloudIcon,
  Assignment as AssignmentIcon,
  AccountTree as AccountTreeIcon,
  Gavel as GavelIcon,
  Public as PublicIcon,
  Campaign as CampaignIcon,
  Cookie as CookieIcon,
  VerifiedUser as VerifiedIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import type { PoliticaCatalogMeta } from "./politicasCatalog";

const ICONS: Record<PoliticaCatalogMeta["iconKey"], React.ReactNode> = {
  privacy: <PrivacyTipIcon />,
  backup: <BackupIcon />,
  lock: <LockIcon />,
  shield: <ShieldIcon />,
  group: <GroupIcon />,
  bug: <BugReportIcon />,
  inventory: <InventoryIcon />,
  history: <HistoryIcon />,
  cloud: <CloudIcon />,
  assignment: <AssignmentIcon />,
  accountTree: <AccountTreeIcon />,
  gavel: <GavelIcon />,
  public: <PublicIcon />,
  campaign: <CampaignIcon />,
  cookie: <CookieIcon />,
  verified: <VerifiedIcon />,
  description: <DescriptionIcon />,
};

export function PoliticaTipoIcon({ iconKey }: { iconKey: PoliticaCatalogMeta["iconKey"] }) {
  return <>{ICONS[iconKey] ?? <AssignmentIcon />}</>;
}
