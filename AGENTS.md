# Veritabanına Elle Müdahale Yasağı (Zorunlu)

Bu kural tüm AI ajanları (Claude, Codex, Copilot vb.) ve alt ajanlar için geçerlidir; hiçbir gerekçeyle istisna yapılmaz.

1. **Veritabanına doğrudan bağlanma:** Hiçbir ortamın (canlı, beta, staging, yerel) veritabanına MySQL/MariaDB istemcisi, Workbench, ODBC, `mysql2` veya benzeri betiklerle bağlanıp sorgu çalıştırma. Salt okunur sorgular da dahildir.
2. **Elle SQL yok:** `.sql` dosyası çalıştırma, tek seferlik `UPDATE/INSERT/DELETE/ALTER` betiği yazma ya da kullanıcıya "şu SQL'i çalıştırın" diye elle uygulanacak betik önerme.
3. **Her şey EF Core ile:** Şema ve veri değişiklikleri yalnızca ilgili backend'in EF Core migration'larıyla yapılır (`FasWebAPI/Migrations/`, `Fasymmbackend/FasYmmWebAPI/Migrations/` vb.): `migrationBuilder.InsertData/UpdateData/DeleteData`, gerekirse migration içinde `migrationBuilder.Sql(...)`. Migration'ları EF Core uygular; elle `dotnet ef database update` da çalıştırılmaz.
4. **Veri okuma ihtiyacı** uygulamanın API uç noktaları üzerinden karşılanır.
5. **Dikkat:** FasWebAPI `appsettings.Development.json` canlı veritabanına bağlıdır ve Development ortamı açılışta bekleyen migration'ları otomatik uygular. Eklenen her migration bir sonraki backend açılışında canlıya yazılır; migration eklemeden önce kullanıcıdan açık onay al.
