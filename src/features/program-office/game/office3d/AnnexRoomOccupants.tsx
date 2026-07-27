"use client";

import type { OfficeCommitteeSlot } from "../OfficeExperienceContext";
import { useOfficeExperience } from "../OfficeExperienceContext";
import type { Responsavel } from "@/lib/types/types";
import { sheetForCommitteeMember, sheetForSectorPerson } from "../officePersonSheets";
import { firstNameHeadTag, HeadTagLabel } from "./HeadTagLabel";
import { PlumbobIndicator } from "./PlumbobIndicator";
import { SeatedPerson } from "./SeatedPerson";

type DeptProps = {
  people: Responsavel[];
  deptName: string;
  max?: number;
  ringRadius?: number;
};

/** Mini-anel de ocupantes visível na ala do anexo (preview). */
export function AnnexDeptOccupants({ people, deptName, max = 3, ringRadius = 0.52 }: DeptProps) {
  const show = people.slice(0, max);
  if (show.length === 0) {
    return (
      <group>
        <HeadTagLabel text="Vazio" color="#9e9e9e" y={0.95} fontSize={0.042} />
        <PlumbobIndicator
          position={[0, 0.82, 0]}
          color="#bdbdbd"
          emissive="#757575"
          emissiveIntensity={0.18}
          opacity={0.4}
          hoverSheet={{
            title: deptName,
            subtitle: "Sem responsáveis",
            rows: [{ label: "Estado", value: "Nenhuma pessoa alocada neste departamento." }],
          }}
        />
      </group>
    );
  }

  const n = show.length;
  return (
    <>
      {show.map((p, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(ang) * ringRadius;
        const z = Math.sin(ang) * ringRadius;
        const nome = (p.nome && p.nome.trim()) || `#${p.id}`;
        const facingY = Math.atan2(-x, -z);
        return (
          <group key={p.id} position={[x, 0, z]} scale={0.88}>
            <SeatedPerson
              facingY={facingY}
              colorSeed={`annex-p-${p.id}`}
              headTag={firstNameHeadTag(nome)}
              sheet={sheetForSectorPerson(p, deptName)}
            />
          </group>
        );
      })}
    </>
  );
}

type ComProps = {
  slot: OfficeCommitteeSlot;
  max?: number;
  ringRadius?: number;
};

export function AnnexCommitteeOccupants({ slot, max = 4, ringRadius = 0.48 }: ComProps) {
  const ctx = useOfficeExperience();
  const ids = slot.memberIds.slice(0, max);

  if (ids.length === 0) {
    return (
      <group>
        <HeadTagLabel text="Sem membros" color="#9e9e9e" y={0.95} fontSize={0.038} />
        <PlumbobIndicator
          position={[0, 0.82, 0]}
          color="#bdbdbd"
          emissive="#757575"
          emissiveIntensity={0.18}
          opacity={0.4}
          hoverSheet={{
            title: slot.title,
            subtitle: "Sem membros",
            rows: [
              { label: "Comité", value: slot.title },
              { label: "Estado", value: "Cadastre membros na estrutura de governança." },
            ],
          }}
        />
      </group>
    );
  }

  const n = ids.length;
  return (
    <>
      {ids.map((id, i) => {
        const a = (i / n) * Math.PI * 2;
        const px = Math.sin(a) * ringRadius;
        const pz = Math.cos(a) * ringRadius;
        const nome = ctx.nomePorResponsavelId.get(id)?.trim() || `#${id}`;
        const resp = ctx.responsaveis.find((x) => x.id === id);
        const cargoSetor = [resp?.cargo?.trim(), resp?.departamento?.trim()].filter(Boolean).join(" · ");
        const facingY = Math.atan2(-px, -pz);
        return (
          <group key={id} position={[px, 0, pz]} scale={0.86}>
            <SeatedPerson
              facingY={facingY}
              colorSeed={`annex-m-${id}`}
              headTag={firstNameHeadTag(nome)}
              sheet={sheetForCommitteeMember(nome, slot.title, slot.subtitle, cargoSetor)}
            />
          </group>
        );
      })}
    </>
  );
}
