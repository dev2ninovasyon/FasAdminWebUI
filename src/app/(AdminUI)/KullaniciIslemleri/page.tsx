"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciKullaniciYonetimi from "@/app/components/KullaniciIslemleri/DenetciKullaniciYonetimi";

const BCrumb = [
    {
        to: "/Anasayfa",
        title: "Admin Menü",
    },
    {
        to: "/DenetciFirmaIslemleri",
        title: "Denetçi Firma İşlemleri",
    },
    {
        title: "Denetçi Kullanıcı İşlemleri",
    },
];

const UserOperationsPage = () => {
    usePageTitle("Denetçi Kullanıcı İşlemleri");

    return (
        <PageContainer
            title="Denetçi Kullanıcı İşlemleri"
            description="Denetçi firmalara ait kullanıcıları görüntüleyin, ekleyin ve düzenleyin"
        >
            <Breadcrumb title="Denetçi Kullanıcı İşlemleri" items={BCrumb} />
            <ParentCard title="Denetçi Firma Kullanıcı Yönetimi">
                <DenetciKullaniciYonetimi />
            </ParentCard>
        </PageContainer>
    );
};

export default UserOperationsPage;
