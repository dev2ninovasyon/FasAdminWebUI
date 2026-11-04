import test from "node:test";
import assert from "node:assert/strict";
import { surumTutarlariKarsilastir } from "../src/app/(AdminUI)/FinansalTabloYonetimi/BirlesikTaslak/[id]/surumTutarFarki.ts";

const hucre = (satir, deger, kapsam = 1, sutun = null) => ({
  eslesmeAnahtari: satir, yataySutunAnahtari: sutun,
  kapsam, donusumTipi: 1, deger, hazirMi: deger != null, hata: null,
});

test("alt sürüm farkında sıfır, eksik değer ve kapsam ayrılır", () => {
  const guncel = [hucre("aynı", 0), hucre("değişen", 105), hucre("yeni", 7),
    hucre("eksik", null), hucre("konsolide", null, 2, "C")];
  const onceki = [hucre("aynı", 0), hucre("değişen", 100), hucre("yeni", null),
    hucre("eksik", 3), hucre("konsolide", null, 2, "C")];

  const fark = surumTutarlariKarsilastir(guncel, onceki);

  assert.equal(fark.karsilastirilan, 2);
  assert.equal(fark.tekTarafli, 2);
  assert.deepEqual(fark.farklilar, [{ hucre: { satir: "değişen", sutun: null, kapsam: 1 },
    onceki: 100, guncel: 105 }]);
});

test("aynı satırın münferit ve konsolide hücreleri karışmaz", () => {
  const fark = surumTutarlariKarsilastir(
    [hucre("sermaye", 20, 1, "C"), hucre("sermaye", 30, 2, "C")],
    [hucre("sermaye", 20, 1, "C"), hucre("sermaye", 25, 2, "C")]);

  assert.equal(fark.karsilastirilan, 2);
  assert.deepEqual(fark.farklilar.map((x) => x.hucre.kapsam), [2]);
});
