# Dağıtım

Uygulama kendi IIS sunucumuzda (10.10.76.3) çalışır. Netlify, Vercel veya GitHub Actions dağıtımı kullanılmaz.

Kod değişiklikleri güncel `main` dalından açılan bir dalda hazırlanır ve pull request ile `main` dalına alınır. Sunucu, `main` dalını GitHub'dan kendisi çekip derler:

```powershell
# Sunucuda (yönetici PowerShell):
C:\deploy\guncelle.ps1                      # tüm uygulamalar
C:\deploy\guncelle.ps1 -Uygulama FasAdminWebUI   # yalnızca bu uygulama
```

Güncelleme sırasında arayüzde üstte uyarı şeridi gösterilir (`SistemGuncellemeUyarisi` bileşeni, sunucudaki `/sistem-durumu/durum.json` dosyasını okur).

Derleme ve kopyalama adımları bu repodaki `deploy/sunucu-guncelle.ps1` dosyasındadır. Sunucu düzeni ve kurallar: FasWebAPI deposundaki `deploy/sunucu/README.md`.
