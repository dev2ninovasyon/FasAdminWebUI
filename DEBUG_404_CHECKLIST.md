# 404 Error Debugging Checklist

## 🔴 Sorun
DataTransfer/Denetciler endpoint'i 404 dönüyor

## ✅ Çözüm Adımları

### 1. **Backend Kontrol**
- [ ] Backend (FasWebAPI) proje açıldı mı?
- [ ] `https://localhost:5001/api/DataTransfer/Denetciler` doğrudan tarayıcıda test et
- [ ] Backend program çalışıyor mu? (VS'de F5 ile başlat)
- [ ] DataTransferController.cs dosyası Denetciler method'unu içeriyor mu?

### 2. **Console Logging Kontrolü**
Browser console'unda şu yazmışsa sorun var:
```
❌ getOldDbDenetciler: HTTP error 404 ""
```

Console'da doğru şu görülmeli:
```
🌐 [API İstek ] http://localhost:5001/api/DataTransfer/Denetciler
📊 Response status: 200
✅ Veri başarıyla alındı, count: X
```

### 3. **Network Tab Kontrol** (Chrome DevTools)
1. F12 → Network tab aç
2. DenetciSecimi sayfasını yenile
3. DataTransfer/Denetciler isteğine bak:
   - Status: **200** olmalı (404 değil)
   - Headers → Response: denetçi verileri görmeli
   - Type: **fetch** olmalı

### 4. **API URL Doğrula**
`FasAdminWebUI/src/api/apiBase.ts` satır 1'de:
```typescript
export const url = "http://localhost:5001/api";  ✅ Bunu kullanın
// export const url = "https://betaapi.fasmart.app/api";  ❌ Şimdilik kapalı
```

### 5. **Route Doğrula** (Backend)
`FasWebAPI/Controllers/DataTransferController.cs`:
```csharp
[ApiController]
[Route("api/[controller]")]  ✅ Route: api/DataTransfer
public class DataTransferController : BaseApiController
{
    [AllowAnonymous]
    [HttpGet("Denetciler")]  ✅ Action: Denetciler
    public async Task<IActionResult> GetDenetciler()
```

Full Route: `api/DataTransfer/Denetciler` ✓

### 6. **CORS Kontrol**
Backend Program.cs'de CORS konfigürasyonu kontrol et:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

### 7. **Middleware Sırası Kontrol**
Backend Program.cs'de:
```csharp
app.UseRouting();
app.UseCors("AllowSpecificOrigin");  // CORS middleware
app.UseAuthentication();              // Auth middleware
app.UseAuthorization();               // AuthZ middleware
app.MapControllers();                 // Routes mapped son
```

---

## 🚀 Test Senaryosu

1. **Backend başlat:**
   ```bash
   cd c:\Users\Melisa\source\repos\FasWebAPI
   dotnet run
   ```
   http://localhost:5001 açılmalı

2. **Frontend başlat:**
   ```bash
   cd c:\Users\Melisa\FasAdminWebUI
   npm run dev
   ```
   http://localhost:3000 açılmalı

3. **Test et:**
   - http://localhost:3000/DenetciFirmaIslemleri/DenetciSecimi açıl
   - Console'da hata görmeme kontrol et
   - Denetçiler dropdown'u dolu olmalı

4. **Console Mesajları Gözlemle:**
   ```
   🚀 DenetciSecimFormu: Component mounted, fetching data...
   🌐 [API İstek ] http://localhost:5001/api/DataTransfer/Denetciler
   ✅ [API Yanıt ] http://localhost:5001/api/DataTransfer/Denetciler (150ms)
   ✅ getOldDbDenetciler: Veri başarıyla alındı, count: 5
   ```

---

## 📝 Production Deploy Etmek İçin

Localhost testler geçtikten sonra:

1. **API Base URL'sini geri değiştir:**
   ```typescript
   export const url = "https://betaapi.fasmart.app/api";
   ```

2. **Backend kodunu deploy et:**
   - FasWebAPI publish et veya production server'a deploy et
   - DataTransferController'ın deploy edildiğini doğrula

3. **Frontend deploy et:**
   - FasAdminWebUI build et ve production'a deploy et

---

## ❓ Hala Sorun Varsa

**Backend Hata Logu Kontrol Et:**
```
API: GET http://localhost:5001/api/DataTransfer/Denetciler
Response: 404 Not Found
```

Eğer 404 devam ederse:
- DataTransferController.cs dosyası proje dosyasında mı?
- Syntax error yok mu?
- `dotnet build` kommutu hata veriyor mu?

**CORS Hata:**
```
Access to fetch at 'http://localhost:5001/api/DataTransfer/Denetciler' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

Çözüm: Backend CORS policy'yi güncelle (AllowAnyOrigin veya frontend origin'ini ekle)
