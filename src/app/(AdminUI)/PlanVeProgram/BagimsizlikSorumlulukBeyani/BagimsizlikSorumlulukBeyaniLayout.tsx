"use client";

import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/BagimsizlikSorumlulukBeyani",
    title: "Bağımsızlık Sorumluluk Beyanı",
  },
];

export default function BagimsizlikSorumlulukBeyaniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Bağımsızlık Sorumluluk Beyanı" items={BCrumb}>
        <EkBelgeYukleButton formKodu="BagimsizlikSorumlulukBeyani" />
      </Breadcrumb>
      {children}
    </div>
  );
}

