"""Generate a source inventory; matches are review candidates, not violations."""
from pathlib import Path
import argparse
import re
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
RULES = {
    "HEX": re.compile(r"#[0-9a-fA-F]{3,8}\b"),
    "Boyut": re.compile(r"\bfontSize\s*[:=]|font-size\s*:"),
    "Font": re.compile(r"\bfontFamily\s*[:=]|font-family\s*:"),
    "MUI": re.compile(r"<Table\b"),
    "HOT": re.compile(r"<(?:CustomHotTable|HotTable)\b"),
    "HTML": re.compile(r"<table\b"),
    "Callback": re.compile(r"\bafterGetColHeader\b|\bafterRenderer\b"),
    "Kodlama": re.compile(r"\u00c3.|\u00c2.|\u00c4.|\u00c5.|\ufffd"),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default="docs/TASARIM-TARAMA-ENVANTERI.md")
    args = parser.parse_args()
    files = sorted(
        (p for p in (ROOT / "src").rglob("*")
         if p.suffix in {".ts", ".tsx", ".css"}
         and not re.search(r"\.(test|spec)\.", p.name)),
        key=lambda p: p.as_posix(),
    )
    rows = []
    totals = Counter()
    file_totals = Counter()
    for path in files:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
        hits = {name: [i for i, line in enumerate(lines, 1) if pattern.search(line)]
                for name, pattern in RULES.items()}
        if not any(hits.values()):
            continue
        for name, found in hits.items():
            totals[name] += len(found)
            file_totals[name] += bool(found)
        relative = path.relative_to(ROOT).as_posix()
        first = min(i for found in hits.values() for i in found)
        context = (
            "Tema tanımı" if relative.startswith("src/utils/theme/")
            else "Editör / belge; elle ayır"
            if "/Editor/" in relative or "Report" in path.name or "Html" in path.name
            else "Yedek; kullanımını doğrula" if ".backup." in path.name
            else "Sayfa adayı" if path.name == "page.tsx"
            else "Bileşen / yardımcı; import zincirini doğrula"
        )
        link = f"[{relative}:L{first}](<../{relative}#L{first}>)"
        rows.append("| " + " | ".join(
            [link, context] + [str(len(hits[name])) for name in RULES]
        ) + " |")
    content = [
        "# FasAdminWebUI tasarım kaynak envanteri",
        "",
        "Üretim: `python scripts/design-audit.py`. Sayılar çalışma ağacını esas alır.",
        "Tarama metin eşleşmesidir; AST, import erişilebilirliği veya görsel test değildir.",
        "Yorumlar, HTML rapor şablonları, tema paletleri ve kullanılmayan kopyalar da eşleşebilir.",
        "Her satır bir inceleme adayıdır; otomatik değiştirme veya ihlal kararı değildir.",
        "Kaynak değiştikçe ilk eşleşme satırları değişebilir. Tam liste bu komutla yenilenir.",
        "",
        f"Taranan kaynak: **{len(files)} dosya**; `page.tsx`: "
        f"**{sum(p.name == 'page.tsx' for p in files)}**; eşleşen kaynak: **{len(rows)}**.",
        "Kapsam: `src/**/*.ts`, `src/**/*.tsx`, `src/**/*.css`; test/spec dosyaları hariç.",
        "",
        "| İşaret | Dosya | Eşleşen satır | Anlamı |",
        "|---|---:|---:|---|",
    ]
    meanings = {
        "HEX": "Sabit hex renk; tema tanımında ve dışa aktarmada geçerli olabilir.",
        "Boyut": "Yerel fontSize/font-size tanımı; değerlerin farklı olduğu anlamına gelmez.",
        "Font": "Yerel font ailesi; tema fontuna atama da sayılır.",
        "MUI": "Table JSX açılışı; metin satırında birden fazla tablo tek sayılır.",
        "HOT": "HotTable/CustomHotTable JSX açılışı.",
        "HTML": "HTML table; ekranda veya rapor metninde olabilir.",
        "Callback": "afterGetColHeader/afterRenderer kullanımı veya tanımı.",
        "Kodlama": "Olası mojibake/replacement karakteri; anlamı elle kontrol edilir.",
    }
    for name in RULES:
        content.append(f"| {name} | {file_totals[name]} | {totals[name]} | {meanings[name]} |")
    content += [
        "",
        "## Dosya listesi",
        "",
        "İlk kaynak bağlantısı satır bulmaya yardımcı olur; sayı sütunları eşleşen satır adedidir.",
        "Aynı dosya birden fazla sütunda yer alabilir; sütunlar toplanarak benzersiz dosya sayısı bulunmaz.",
        "",
        "| Kaynak / ilk eşleşme | Bağlam | " + " | ".join(RULES) + " |",
        "|---|---|" + "---:|" * len(RULES),
        *rows,
        "",
    ]
    output = (ROOT / args.output).resolve()
    if not output.is_relative_to(ROOT):
        parser.error("Output must stay inside FasAdminWebUI.")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(content), encoding="utf-8")
    print(f"{len(files)} files scanned; {len(rows)} candidates; output: {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
