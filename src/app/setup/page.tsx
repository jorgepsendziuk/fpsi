import { Container, Typography, Paper } from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { SetupWizard } from "@/components/setup/SetupWizard";

export const metadata = {
  title: "Implantação guiada — FPSI",
  description: "Assistente para configurar variáveis de ambiente, Supabase e migrações do FPSI.",
};

export default function SetupPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          <RocketLaunchIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Implantação guiada
        </Typography>
        <Typography color="text.secondary" paragraph>
          Siga os passos para clonar o código, configurar o Supabase e aplicar as migrações. Se faltar{" "}
          <code>.env.local</code>, o sistema usa a instância de referência até você definir a sua.
        </Typography>
        <SetupWizard />
      </Paper>
    </Container>
  );
}
