"use client";

import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/HesapAyarlari",
    title: "Hesap Ayarları",
  },
];

export default function HesapAyarlariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hesap Ayarları" items={BCrumb} />
      {children}
    </div>
  );
}
