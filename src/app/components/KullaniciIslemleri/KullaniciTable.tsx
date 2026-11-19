"use client";

import React from "react";
import DenetciKullaniciYonetimi from "./DenetciKullaniciYonetimi";

interface Props {
    denetciId: number | null;
}

const KullaniciTable = ({ denetciId }: Props) => {
    return <DenetciKullaniciYonetimi initialDenetciId={denetciId} hideFirmSelector />;
};

export default KullaniciTable;
