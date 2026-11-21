"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

/** A cultura passou a ser a aba Divulgar do hub de educação. */
export default function CulturaRedirectPage() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    const id = String(params?.id || "");
    if (id) router.replace(`/programas/${id}/educacao?aba=divulgar`);
  }, [params, router]);
  return (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress size={28} />
    </Box>
  );
}
