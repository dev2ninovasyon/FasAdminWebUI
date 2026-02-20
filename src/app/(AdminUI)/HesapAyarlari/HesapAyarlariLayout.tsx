"use client";

import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/HesapAyarlari",
    title: "Hesap AyarlarÄ±",
  },
];

export default function HesapAyarlariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hesap AyarlarÄ±" items={BCrumb} />
      {children}
    </div>
  );
}

