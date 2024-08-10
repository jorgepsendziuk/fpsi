"use client";
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionSummary, AccordionDetails, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL="https://jfyetcjogzbuwcpsiglc.supabase.co";
export const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeWV0Y2pvZ3pidXdjcHNpZ2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0MjMyNDksImV4cCI6MjAzNDk5OTI0OX0.cwDSSyS6-pp4_e7Pe_LcWMtcOfzHYRa1ksTIorJ__qg"
export const supabaseBrowserClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: {
      schema: "public",
    },
  }
);

const MyAccordionPage = () => {
  const [controleData, setControleData] = useState([])
  const [medidaData, setMedidaData] = useState({});

  useEffect(() => {
    const fetchControleData = async () => {
      const { data, error } = await supabaseBrowserClient.from('controle').select('*')
      if (error) {console.error(error)} 
      else {setControleData(data)}
    }
    fetchControleData()
  }, [])
  
  const handleAccordionChange = async (panel) => {
    if (!medidaData[panel.id]) {
      const { data, error } = await supabaseBrowserClient
        .from('medida')
        .select('*')
        .eq('id_controle', panel)

      if (error) {
        console.error(error)
      } else {
        console.log("Medidas:", data); // Verifique o formato dos dados
        setMedidaData((prevState) => ({
          ...prevState,
          [panel]: data
        }))
      }
    }
  }

  return (
    <div>
      {controleData.map((controle) => (
        <Accordion key={controle.id} onChange={() => handleAccordionChange(controle.id)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{controle.nome}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Medida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {medidaData[controle.id] && medidaData[controle.id].map((medida) => (
                    <TableRow key={medida.id}>
                      <TableCell>{medida.id_medida}</TableCell>
                      <TableCell>{medida.medida}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}

export default MyAccordionPage