# Liderakademi Android başlangıç projesi

Bu ZIP, Liderakademi için ilk çalışan arayüz prototipini ve Android/Capacitor yapılandırmasını içerir.

## İçerik
- Öğrenci alanı ve eğitim paketlerini görüntüleme
- Ayrı yönetici girişi (`lideradmin`)
- İlk açılışta yönetici şifresini kullanıcının belirlemesi
- Eğitim paketi ekleme/silme
- Küçük fotoğraf/video dosyalarını cihazda yerel test için saklama (8 MB sınırı)
- WhatsApp bilgi alma bağlantısı: 0545 514 0698
- Capacitor Android yapılandırması

## Önemli sınırlar
Bu sürüm bir prototiptir. Veriler yalnızca aynı cihaz/tarayıcı depolamasında tutulur. Uygulama verileri sunucuya aktarmaz ve farklı cihazlarla eşitlemez. Yerel yönetici şifresi üretim ortamı için yeterli bir güvenlik sistemi değildir. Gerçek kullanım öncesinde sunucu tabanlı kimlik doğrulama, yedekleme ve medya depolama eklenmelidir.

## APK üretimi
APK oluşturmak için Node.js ve Android Studio/Android SDK bulunan bir bilgisayar gerekir:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio içinde Build > Build Bundle(s) / APK(s) > Build APK(s) seçilir.

Bu ZIP tek başına APK değildir; kaynak proje dosyalarıdır.
