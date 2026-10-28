import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar",
    title: "Diğer Kanıtlar",
  },
];

export default function DigerKanitlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Diğer Kanıtlar" items={BCrumb} />
      {children}
    </div>
  );
}

