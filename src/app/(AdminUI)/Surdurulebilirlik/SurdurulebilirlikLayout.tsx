"use client";

import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Surdurulebilirlik",
    title: "Sürdürülebilirlik",
  },
  
];

export default function SurdurulebilirlikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Sürdürülebilirlik" items={BCrumb} />
      {children}
    </div>
  );
}

