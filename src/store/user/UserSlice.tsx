import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  id?: number;
  denetciId?: number;
  denetciFirmaAdi?: string;
  denetlenenId?: number;
  denetlenenFirmaAdi?: string;
  denetimTuru?: string;
  bobimi?: boolean;
  tfrsmi?: boolean;
  enflasyonmu?: boolean;
  konsolidemi?: boolean;
  bddkmi?: boolean;
  yil?: number;
  rol?: string[];
  yetki?: string;
  unvan?: string;
  kullaniciAdi?: string;
  mail?: string;
  token?: string;
  refreshToken?: string;  // âœ… Güvenli token yenileme için
  formHazirlayanOnaylayan?: boolean;
  kurulumTamamlandi?: boolean;
  kurulumAdimi?: number;
  setupWizardProgress?: string;
  sonSecilenDenetlenenId?: number;
  sonSecilenYil?: number;
  sonSecilenDenetlenenFirmaAdi?: string;
  sonSecilenDenetimTuru?: string;
  sonSecilenBobimi?: boolean;
  sonSecilenTfrsmi?: boolean;
  sonSecilenEnflasyonmu?: boolean;
  sonSecilenKonsolidemi?: boolean;
  sonSecilenBddkmi?: boolean;
  turTamamlandi?: boolean;
}

const initialState: StateType = {
  id: 0,
  denetciId: 0,
  denetciFirmaAdi: "",
  denetlenenId: 0,
  denetlenenFirmaAdi: "",
  denetimTuru: "",
  bobimi: false,
  tfrsmi: false,
  enflasyonmu: false,
  konsolidemi: false,
  bddkmi: false,
  yil: 0,
  rol: undefined,
  yetki: undefined,
  unvan: "",
  kullaniciAdi: "",
  mail: "",
  token: "",
  refreshToken: "",  // âœ… Başlangıç değeri
  formHazirlayanOnaylayan: false,
  kurulumTamamlandi: false,
  kurulumAdimi: 0,
  setupWizardProgress: "",
  sonSecilenDenetlenenId: 0,
  sonSecilenYil: 0,
  sonSecilenDenetlenenFirmaAdi: "",
  sonSecilenDenetimTuru: "",
  sonSecilenBobimi: false,
  sonSecilenTfrsmi: false,
  sonSecilenEnflasyonmu: false,
  sonSecilenKonsolidemi: false,
  sonSecilenBddkmi: false,
  turTamamlandi: false,
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setId: (state: StateType, action) => {
      state.id = action.payload;
    },
    setDenetciId: (state: StateType, action) => {
      state.denetciId = action.payload;
    },
    setDenetciFirmaAdi: (state: StateType, action) => {
      state.denetciFirmaAdi = action.payload;
    },
    setDenetlenenId: (state: StateType, action) => {
      state.denetlenenId = action.payload;
    },
    setDenetlenenFirmaAdi: (state: StateType, action) => {
      state.denetlenenFirmaAdi = action.payload;
    },
    setDenetimTuru: (state: StateType, action) => {
      state.denetimTuru = action.payload;
    },
    setBobimi: (state: StateType, action) => {
      state.bobimi = action.payload;
    },
    setTfrsmi: (state: StateType, action) => {
      state.tfrsmi = action.payload;
    },
    setEnflasyonmu: (state: StateType, action) => {
      state.enflasyonmu = action.payload;
    },
    setKonsolidemi: (state: StateType, action) => {
      state.konsolidemi = action.payload;
    },
    setBddkmi: (state: StateType, action) => {
      state.bddkmi = action.payload;
    },
    setYil: (state: StateType, action) => {
      state.yil = action.payload;
    },
    setRol: (state: StateType, action) => {
      state.rol = action.payload;
    },
    setYetki: (state: StateType, action) => {
      state.yetki = action.payload;
    },
    setUnvan: (state: StateType, action) => {
      state.unvan = action.payload;
    },
    setKullaniciAdi: (state: StateType, action) => {
      state.kullaniciAdi = action.payload;
    },
    setMail: (state: StateType, action) => {
      state.mail = action.payload;
    },
    setToken: (state: StateType, action) => {
      state.token = action.payload;
    },
    setRefreshToken: (state: StateType, action) => {  // âœ… Yeni action
      state.refreshToken = action.payload;
    },
    setFormHazirlayanOnaylayan: (state: StateType, action) => {
      state.formHazirlayanOnaylayan = action.payload;
    },
    setKurulumTamamlandi: (state: StateType, action) => {
      state.kurulumTamamlandi = action.payload;
    },
    setKurulumAdimi: (state: StateType, action) => {
      state.kurulumAdimi = action.payload;
    },
    setSetupWizardProgress: (state: StateType, action) => {
      state.setupWizardProgress = action.payload;
    },
    setSonSecilenDenetlenenId: (state: StateType, action) => {
      state.sonSecilenDenetlenenId = action.payload;
    },
    setSonSecilenYil: (state: StateType, action) => {
      state.sonSecilenYil = action.payload;
    },
    setSonSecilenDenetlenenFirmaAdi: (state: StateType, action) => {
      state.sonSecilenDenetlenenFirmaAdi = action.payload;
    },
    setSonSecilenDenetimTuru: (state: StateType, action) => {
      state.sonSecilenDenetimTuru = action.payload;
    },
    setSonSecilenBobimi: (state: StateType, action) => {
      state.sonSecilenBobimi = action.payload;
    },
    setSonSecilenTfrsmi: (state: StateType, action) => {
      state.sonSecilenTfrsmi = action.payload;
    },
    setSonSecilenEnflasyonmu: (state: StateType, action) => {
      state.sonSecilenEnflasyonmu = action.payload;
    },
    setSonSecilenKonsolidemi: (state: StateType, action) => {
      state.sonSecilenKonsolidemi = action.payload;
    },
    setSonSecilenBddkmi: (state: StateType, action) => {
      state.sonSecilenBddkmi = action.payload;
    },
    setTurTamamlandi: (state: StateType, action) => {
      state.turTamamlandi = action.payload;
    },
    setDenetlenen: (state: StateType, action) => {
      state.denetlenenId = action.payload.id;
      state.denetlenenFirmaAdi = action.payload.adi;
      state.yil = action.payload.year;
      state.denetimTuru = action.payload.denetimTuru;
      state.bobimi = action.payload.bobimi;
      state.tfrsmi = action.payload.tfrsmi;
      state.enflasyonmu = action.payload.enflasyonmu;
      state.konsolidemi = action.payload.konsolidemi;
    },
    setUserData: (state: StateType, action) => {
      return { ...state, ...action.payload };
    },
    resetToNull: (state: StateType, action) => {
      if (action.payload === "" || action.payload === undefined) {
        state.id = undefined;
        state.denetciId = undefined;
        state.denetciFirmaAdi = undefined;
        state.denetlenenId = undefined;
        state.denetlenenFirmaAdi = undefined;
        state.denetimTuru = undefined;
        state.bobimi = undefined;
        state.tfrsmi = undefined;
        state.enflasyonmu = undefined;
        state.konsolidemi = undefined;
        state.bddkmi = undefined;
        state.yil = undefined;
        state.rol = undefined;
        state.yetki = undefined;
        state.unvan = undefined;
        state.kullaniciAdi = undefined;
        state.mail = undefined;
        state.token = undefined;
        state.refreshToken = undefined;  // âœ… Reset'e eklendi
        state.formHazirlayanOnaylayan = undefined;
        state.kurulumTamamlandi = undefined;
        state.kurulumAdimi = undefined;
        state.setupWizardProgress = undefined;
        state.sonSecilenDenetlenenId = undefined;
        state.sonSecilenYil = undefined;
        state.sonSecilenDenetlenenFirmaAdi = undefined;
        state.sonSecilenDenetimTuru = undefined;
        state.sonSecilenBobimi = undefined;
        state.sonSecilenTfrsmi = undefined;
        state.sonSecilenEnflasyonmu = undefined;
        state.sonSecilenKonsolidemi = undefined;
        state.sonSecilenBddkmi = undefined;
        state.turTamamlandi = undefined;
      }
    },
  },
});

export const {
  setId,
  setDenetciId,
  setDenetciFirmaAdi,
  setDenetlenenId,
  setDenetlenenFirmaAdi,
  setDenetimTuru,
  setBobimi,
  setTfrsmi,
  setEnflasyonmu,
  setKonsolidemi,
  setBddkmi,
  setYil,
  setRol,
  setYetki,
  setUnvan,
  setKullaniciAdi,
  setMail,
  setToken,
  setRefreshToken,  // âœ… Export'a eklendi
  resetToNull,
  setFormHazirlayanOnaylayan,
  setKurulumTamamlandi,
  setKurulumAdimi,
  setSetupWizardProgress,
  setSonSecilenDenetlenenId,
  setSonSecilenYil,
  setSonSecilenDenetlenenFirmaAdi,
  setSonSecilenDenetimTuru,
  setSonSecilenBobimi,
  setSonSecilenTfrsmi,
  setSonSecilenEnflasyonmu,
  setSonSecilenKonsolidemi,
  setSonSecilenBddkmi,
  setTurTamamlandi,
  setDenetlenen,
  setUserData
} = UserSlice.actions;

export default UserSlice.reducer;
