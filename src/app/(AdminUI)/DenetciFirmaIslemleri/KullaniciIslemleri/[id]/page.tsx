"use client";

import { use } from "react";
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
        title: "Kullanıcı İşlemleri",
    },
];

const Page = (props: { params: Promise<{ id: string }> }) => {
    const params = use(props.params);
    const denetciId = Number(params.id);
    usePageTitle("Denetçi Kullanıcı İşlemleri");

    return (
        <PageContainer
            title="Denetçi Kullanıcı İşlemleri"
            description="Denetçi firmaya ait kullanıcıları görüntüleyin, ekleyin ve düzenleyin"
        >
            <Breadcrumb title="Denetçi Kullanıcı İşlemleri" items={BCrumb} />
            <ParentCard title="Denetçi Firma Kullanıcı Yönetimi">
                <DenetciKullaniciYonetimi
                    initialDenetciId={Number.isFinite(denetciId) && denetciId > 0 ? denetciId : null}
                    showBackToFirms
                />
            </ParentCard>
        </PageContainer>
    );
};

export default Page;
