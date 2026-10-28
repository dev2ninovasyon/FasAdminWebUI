"use client";

import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/GorevTebligi",
    title: "Görev Tebliği",
  },
];

export default function GorevTebligiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Görev Tebliği" items={BCrumb}>
        <EkBelgeYukleButton formKodu="GorevTebligi" />
      </Breadcrumb>
      {children}
    </div>
  );
}

