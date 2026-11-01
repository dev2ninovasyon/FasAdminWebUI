# Veritabanına Elle Müdahale Yasağı (Zorunlu)

Bu kural tüm AI ajanları (Claude, Codex, Copilot vb.) ve alt ajanlar için geçerlidir; hiçbir gerekçeyle istisna yapılmaz.

1. **Veritabanına doğrudan bağlanma:** Hiçbir ortamın (canlı, beta, staging, yerel) veritabanına MySQL/MariaDB istemcisi, Workbench, ODBC, `mysql2` veya benzeri betiklerle bağlanıp sorgu çalıştırma. Salt okunur sorgular da dahildir.
2. **Elle SQL yok:** `.sql` dosyası çalıştırma, tek seferlik `UPDATE/INSERT/DELETE/ALTER` betiği yazma ya da kullanıcıya "şu SQL'i çalıştırın" diye elle uygulanacak betik önerme.
3. **Her şey EF Core ile:** Şema ve veri değişiklikleri yalnızca ilgili backend'in EF Core migration'larıyla yapılır (`FasWebAPI/Migrations/`, `Fasymmbackend/FasYmmWebAPI/Migrations/` vb.): `migrationBuilder.InsertData/UpdateData/DeleteData`, gerekirse migration içinde `migrationBuilder.Sql(...)`. Migration'ları EF Core uygular; elle `dotnet ef database update` da çalıştırılmaz.
4. **Veri okuma ihtiyacı** uygulamanın API uç noktaları üzerinden karşılanır.
5. **Dikkat:** FasWebAPI `appsettings.Development.json` canlı veritabanına bağlıdır ve Development ortamı açılışta bekleyen migration'ları otomatik uygular. Eklenen her migration bir sonraki backend açılışında canlıya yazılır; migration eklemeden önce kullanıcıdan açık onay al.


<!-- BEGIN:surumleme-kurallari -->
# Otomatik Sürümleme ve Commit Kuralı (Zorunlu)

Bu repoda sürüm numarası elle tutulmaz. `main` dalına yapılan her push'ta GitHub Actions commit mesajlarını
Conventional Commits biçimine göre analiz eder; uygun olduğunda `vX.Y.Z` git etiketi ve GitHub Sürümü otomatik
oluşturulur. `package.json`/`.csproj` sürümü, sürüm dosyası veya `chore(release)` commit'i üretilmez.

## Commit mesajı biçimi

```
<tip>(<kapsam>): <kısa açıklama>

<isteğe bağlı gövde>

BREAKING CHANGE: <kırıcı değişikliğin açıklaması>
```

- Özet satırı emir kipiyle, Türkçe ve 72 karakteri geçmeyecek şekilde yazılır.
- `kapsam` isteğe bağlıdır; değişen alanı belirtir (`auth`, `fatura`, `deploy`, `ui` vb.).
- Bir PR tek bir mantıksal değişiklik içerir. PR içinde farklı tipler varsa en yüksek sürüm etkisi geçerlidir.

## Tip → sürüm etkisi

| Tip | Sürüm etkisi | Ne zaman |
|---|---|---|
| `feat` | minor (`1.2.0` → `1.3.0`) | Yeni kullanıcı işlevi |
| `fix` | patch (`1.2.0` → `1.2.1`) | Hata düzeltme |
| `perf` | patch | Performans iyileştirmesi |
| `refactor` | patch | Davranışı değiştirmeyen kod yeniden düzenlemesi |
| `feat!`, `fix!` veya `BREAKING CHANGE:` | major (`1.2.0` → `2.0.0`) | Kırıcı değişiklik |
| `chore`, `docs`, `test`, `ci`, `build`, `style` | sürüm yok | Yalnız dağıtım/altyapı |

- `chore` tipini "her şeyi toplayan çöp kutusu" olarak kullanma. Kullanıcıyı etkileyen değişiklik `feat` veya `fix` olmalıdır.
- Kırıcı değişiklikte `!` işareti **ve** `BREAKING CHANGE:` notu birlikte kullanılır; notta geçiş yolu açıklanır.
- Commit mesajı yalnızca tip önekiyle başlar; `[FAS-123]`, `WIP`, `update` gibi serbest metinle başlayan commit'ler sürüm üretmez.
- Merge commit'leri (`Merge pull request ...`) analiz dışıdır; sürümü taşıyan commit'ler dal üzerindeki Conventional Commits mesajlarıdır.

## Sürümün tek kaynağı

- Okunabilir sürüm: `vX.Y.Z` git etiketi (GitHub Sürüm notlarıyla birlikte).
- Gerçek kimlik: commit SHA. PR numarası sürüm değildir; GitHub Sürüm notlarında changelog satırı olarak görünür.
- AI ajanları sürüm numarasını tahmin etmez, `package.json`/`.csproj` içindeki sürümü elle değiştirmez, tag oluşturmaz veya push etmez.
- Sürüm yalnızca `main`'e merge sonrası `.github/workflows/surum.yml` tarafından üretilir. Gerekirse `Actions → Surum → Run workflow` ile elle tetiklenir.

## Yayın doğrulama

- API: `GET /api/health` → `version`, `commit`, `builtAt` alanları.
- UI: Netlify deploy kaydındaki commit SHA'sı ile GitHub Sürümü karşılaştırılır.
<!-- END:surumleme-kurallari -->
