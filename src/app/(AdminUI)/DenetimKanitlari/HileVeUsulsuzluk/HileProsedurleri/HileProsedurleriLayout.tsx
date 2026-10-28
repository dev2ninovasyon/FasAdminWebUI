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
    to: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri",
    title: "Hile Prosedürleri",
  },
];

export default function HileProsedurleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hile Prosedürleri" items={BCrumb} />
      {children}
    </div>
  );
}

