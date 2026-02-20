"use client";

import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/TemaAyarlari",
    title: "Tema AyarlarÄ±",
  },
];

export default function TemaAyarlariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Tema AyarlarÄ±" items={BCrumb} />
      {children}
    </div>
  );
}

