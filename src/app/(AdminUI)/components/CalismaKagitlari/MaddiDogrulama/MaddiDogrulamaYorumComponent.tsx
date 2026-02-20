"use client";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";

const YorumEditor = dynamic(
  () => import("@/app/(AdminUI)/components/Editor/YorumEditor"),
  { ssr: false }
);

interface MaddiDogrulamaYorumComponentProps {
  parentName: string;
  childName: string;
  isReport?: boolean;
}

const isHtmlEmpty = (content?: string | null) => {
  if (!content) return true;

  const text = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  if (text === "") return true;
  if (text === "Yorum bulunmamaktadır.") return true;

  const normalized = content.replace(/\s/g, "").toLowerCase();
  if (normalized === "<p></p>") return true;
  if (normalized === "<p><br></p>") return true;
  if (normalized === "<p>&nbsp;</p>") return true;

  return false;
};

const MaddiDogrulamaYorumComponent: React.FC<MaddiDogrulamaYorumComponentProps> = ({
  parentName,
  childName,
  isReport,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const belgeAdi = useMemo(
    () => `MaddiDogrulamaProsedurleri/${parentName}/${childName}`,
    [parentName, childName]
  );

  // raporda: ilk başta yüklenmedi kabul et
  const [loaded, setLoaded] = useState<boolean>(!isReport);
  const [hasContent, setHasContent] = useState<boolean>(!isReport);

  // raporda: veri gelene kadar hiçbir şey gösterme
  if (isReport && !loaded) {
    return (
      <Box sx={{ display: "none" }}>
        <YorumEditor
          denetlenenId={user.denetlenenId || 0}
          yil={user.yil || 0}
          belgeAdi={belgeAdi}
          isReport={isReport}
          // @ts-ignore
          onDataLoad={(content: string) => {
            const empty = isHtmlEmpty(content);
            setLoaded(true);
            setHasContent(!empty);
          }}
        />
      </Box>
    );
  }

  // raporda: yüklendi ama içerik yoksa komple gizle
  if (isReport && loaded && !hasContent) return null;

  return (
    <Box sx={{ width: "100%", marginY: isReport ? 0 : 3 }}>
      {isReport && hasContent && (
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "primary.main", mt: 2, mb: 1 }}
        >
          Yorum & Notlar:
        </Typography>
      )}

      <YorumEditor
        denetlenenId={user.denetlenenId || 0}
        yil={user.yil || 0}
        belgeAdi={belgeAdi}
        isReport={isReport}
        // @ts-ignore
        onDataLoad={(content: string) => {
          const empty = isHtmlEmpty(content);
          setLoaded(true);
          setHasContent(!empty);
         // console.log("YorumEditor onDataLoad geldi", { belgeAdi, content });

        }}
      />
    </Box>
  );
};

export default MaddiDogrulamaYorumComponent;

