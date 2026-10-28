"use client";

import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/HileVeUsulsuzluk",
    title: "Hile Ve Usulsüzlük",
  },
  {
    to: "/DenetimKanitlari/HileVeUsulsuzluk/MuhasebeHatalariVeHile",
    title: "Muhasebe Hataları Ve Hileye İlişkin Çalışmalar",
  },
];

export default function MuhasebeHatalariVeHileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb
        title="Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
        items={BCrumb}
      />
      {children}
    </div>
  );
}

