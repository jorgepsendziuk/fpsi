"use client";

import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Você está offline
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Conecte-se à internet para continuar usando o FPSI.
      </Typography>
      <Button component={Link} href="/" variant="contained">
        Tentar novamente
      </Button>
    </Box>
  );
}
