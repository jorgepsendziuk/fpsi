import { NextResponse } from "next/server";
import { supabaseBrowserClient } from "@utils/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const programaId = searchParams.get("programaId");

  if (!programaId) {
    return NextResponse.json({ error: "programaId is required" }, { status: 400 });
  }

  try {
    // Busca diagnósticos
    const { data: diagnosticos } = await supabaseBrowserClient
      .from("diagnostico")
      .select("*");

    // Busca controles do programa específico
    const { data: controles } = await supabaseBrowserClient
      .from("controle")
      .select("*")
      .eq("programa", programaId);

    // Busca medidas
    const { data: medidas } = await supabaseBrowserClient
      .from("medida")
      .select("*");

    // Processa os dados no mesmo formato do relatório
    const reportData: any[] = [];
    
    if (diagnosticos && controles && medidas) {
      diagnosticos.forEach((diagnostico: any) => {
        const diagnosticoControles = controles.filter(
          (controle: any) => controle.diagnostico === diagnostico.id
        );

        diagnosticoControles.forEach((controle: any) => {
          const controleMedidas = medidas.filter(
            (medida: any) => medida.id_controle === controle.id
          );

          controleMedidas.forEach((medida: any) => {
            reportData.push({
              diagnostico: diagnostico.descricao,
              controle: controle.nome,
              medida: medida.medida,
              status: medida.status_medida?.toString() || "Não definido",
              responsavel: medida.responsavel?.toString() || "Não definido",
              previsao: medida.previsao_fim || "Não definido",
            });
          });
        });
      });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
} 