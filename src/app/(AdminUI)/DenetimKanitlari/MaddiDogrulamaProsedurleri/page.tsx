"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { setMaddiDogrulamaItems } from "@/store/dynamicMenu/DynamicMenuSlice";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import MaddiDogrulamaListe from "@/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaListe";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
    title: "Maddi Doğrulama Prosedürleri",
  },
];

const removeTurkishChars = (str: string | undefined | null) => {
  if (!str) return "";
  return str
    .replace(/\s/g, "")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/İ/g, "I").replace(/Ö/g, "O").replace(/Ü/g, "U")
    .replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C");
};

const Page = () => {
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.userReducer);
  const dynamicMenu = useSelector((state: AppState) => state.dynamicMenu);

  // Sayfa ilk açıldığında veriyi yükle
  useEffect(() => {
    const loadMaddiDogrulamaData = async () => {
      try {
        const data = await getMaddiDogrulama(user.denetimTuru || "",
          user.denetlenenId || 0,
          user.yil || 0
        );

        // Veriyi dönüştür ve store'a kaydet
        const transformedData = data?.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: "MaddiDogrulama",
          href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`,
          children: item.children?.map((child: any) => ({
            id: child.id,
            name: child.name,
            parentName: item.name,
            category: "MaddiDogrulama",
            href: `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}/${removeTurkishChars(child.name)}?title=${encodeURIComponent(child.name)}`,
          })) || [],
        })) || [];

        dispatch(setMaddiDogrulamaItems(transformedData));
      } catch (error) {
        console.log("Maddi Doğrulama verileri yüklenirken hata oluştu:", error);
      }
    };

    // Veri henüz yüklenmemişse yükle
    if (dynamicMenu.maddiDogrulamaItems.length === 0) {
      loadMaddiDogrulamaData();
    }
  }, [user.token, user.denetimTuru, user.denetlenenId, user.yil, dispatch]);

  return (
    <>
      <Breadcrumb title="Maddi Doğrulama Prosedürleri" items={BCrumb} />
      <PageContainer
        title="Maddi Doğrulama Prosedürleri"
        description="Bu sayfa Maddi Doğrulama Prosedürleri ile ilgilidir."
      >
        <Box>
          <MaddiDogrulamaListe onViewModeChange={setViewMode} />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;


