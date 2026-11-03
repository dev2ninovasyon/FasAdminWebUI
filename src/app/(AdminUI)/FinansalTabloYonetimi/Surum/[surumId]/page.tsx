"use client";

import { useParams } from "next/navigation";
import FinansalTabloYonetimi from "../../FinansalTabloYonetimiSayfasi";

export default function SurumDuzenlemeSayfasi() {
  const { surumId } = useParams<{ surumId: string }>();
  const id = Number(surumId);
  return <FinansalTabloYonetimi editorSurumId={Number.isSafeInteger(id) && id > 0 ? id : -1} />;
}
