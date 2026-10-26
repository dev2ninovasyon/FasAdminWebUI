# Katkı Rehberi
## Veritabanı Değişiklik Kuralı (Zorunlu)

Bu kural repoya katkı veren herkes — geliştiriciler ve AI ajanları — için geçerlidir.

- Hiçbir ortamın (canlı, beta, staging, yerel) veritabanına elle müdahale edilmez: SQL istemcisi/Workbench ile `UPDATE/INSERT/DELETE/ALTER` çalıştırılmaz, `.sql` betiği uygulanmaz, tablolar elle düzenlenmez.
- Şema ve veri değişiklikleri yalnızca ilgili backend'in **EF Core migration**'larıyla yapılır (`FasWebAPI/Migrations/`, `Fasymmbackend/FasYmmWebAPI/Migrations/` vb.): `migrationBuilder.InsertData/UpdateData/DeleteData`, gerekirse migration içinde `migrationBuilder.Sql(...)`.
- Her migration diğer kod değişiklikleri gibi pull request ile incelenir; veritabanına EF Core tarafından uygulanır.
- Uygulama verisine ihtiyaç duyulursa API uç noktaları kullanılır; veritabanına doğrudan sorgu atılmaz.
