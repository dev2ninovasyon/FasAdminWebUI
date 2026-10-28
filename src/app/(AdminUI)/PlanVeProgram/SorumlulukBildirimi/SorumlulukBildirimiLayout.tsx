"use client";

import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/SorumlulukBildirimi",
    title: "Sorumluluk Bildirimi",
  },
];

export default function SorumlulukBildirimiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Sorumluluk Bildirimi" items={BCrumb}>
        <EkBelgeYukleButton formKodu="SorumlulukBildirimi" />
      </Breadcrumb>
      {children}
    </div>
  );
}

