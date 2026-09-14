# V10 Widget

Widget artık güvenilirlik için yalnızca sıradaki namazı ve vaktin saatini gösterir; geri sayım kaldırılmıştır.

# Vakit — Türkiye Namaz Vakitleri

**Vakit**, Android ve iOS için tek Expo / React Native kod tabanından çalışan modern bir namaz vakitleri uygulamasıdır.

Tasarım dili: **mavi + yeşil + turuncu**. Uygulama ve widget marka ibaresi: **by baskaya**.

## Hazır özellikler

- GPS ile otomatik konum algılama (yalnızca uygulama açıkken / foreground)
- Türkiye'nin 81 ili için çevrimdışı il listesi
- İl seçildiğinde merkez + ilçeler; ilçe listesi TurkiyeAPI'den alınır ve telefonda saklanır
- Yazdıkça filtrelenen il / ilçe araması
- Günlük 6 vakit: İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı
- Sıradaki vakit ve saniyelik canlı geri sayım
- Her vakit için ayrı bildirim aç/kapat
- Vaktinde veya 5 / 10 / 15 / 30 / 45 / 60 dakika önce hatırlatma
- Her vakit için sesli bildirim aç/kapat
- Yaklaşan günler için yerel bildirim planlama; uygulama kapalıyken de sistem bildirimi olarak çalışır
- iOS ana ekran / kilit ekranı widget altyapısı (`expo-widgets`)
- Android ana ekran widget altyapısı (`react-native-android-widget`)
- İçinde bulunulan yıla ait kandiller, Kadir Gecesi, Ramazan Bayramı ve Kurban Bayramı
- Dini günlerde Diyanet yıllık takvimini okuma + cihaz önbelleği + 2026-2028 yedek veri
- Vakit verisi ve konum verisi için cihaz önbelleği
- Hesap / üyelik / reklam takip sistemi yok

## Veri kaynakları

### Namaz vakitleri

Uygulama şu aşamada AlAdhan API'nin **Diyanet İşleri Başkanlığı hesaplama yöntemi (method 13)** adaptörünü kullanır:

- https://aladhan.com/prayer-times-api
- https://api.aladhan.com/v1/methods

> Önemli: AlAdhan, method 13'ü kendi servisinde `Diyanet İşleri Başkanlığı, Turkey (experimental)` olarak işaretliyor. Bu nedenle uygulama Diyanet'in resmî kapalı API'sini kullandığını iddia etmez. Mağaza yayını öncesinde örnek il/ilçelerde resmî Diyanet vakitleriyle karşılaştırma yapılması önerilir. `src/services/prayerService.ts` adaptör olarak ayrı tutulduğu için resmî/lisanslı bir veri kaynağı edinildiğinde ana uygulamayı değiştirmeden servis değiştirilebilir.

### İl / ilçe

- https://api.turkiyeapi.dev/v2
- Anahtar gerektirmez; uygulama ilçeleri ilk başarılı çağrıdan sonra cihazda saklar.

### Dini günler

- https://mobil.diyanet.gov.tr/mobile/dinigunler/dinigunler.html
- Diyanet sayfası erişilemezse son başarılı cihaz verisi; o da yoksa proje içindeki doğrulanmış 2026-2028 yedek listesi kullanılır.

## Kurulum

Expo SDK 57 için Node.js 22.13+ gerekir.

```bash
npm install
npx expo-doctor
```

Widget'lar native hedef oluşturduğu için **Expo Go yeterli değildir**. Development build kullanın:

```bash
# Android
npx expo prebuild --clean
npx expo run:android

# iOS (macOS + Xcode gerekir)
npx expo prebuild --clean
npx expo run:ios
```

EAS ile cihaz build'i:

```bash
npm install -g eas-cli
eas login
eas init

eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Mağaza öncesi değiştirilmesi gerekenler

1. `app.config.ts` içindeki `com.baskaya.vakit` bundle/package kimliğini kendi geliştirici hesabınızda kullanacağınız benzersiz kimlikle eşleştirin.
2. `eas init` ile kendi EAS `projectId` bilgisini projeye bağlayın.
3. Android exact-alarm kullanımının Google Play politikanıza uygunluğunu kontrol edin; gerekli değilse `SCHEDULE_EXACT_ALARM` iznini kaldırıp standart zamanlamaya bırakabilirsiniz.
4. İsterseniz telifsiz veya size ait bir ezan sesi eklenebilir. Bu sürüm telif riski oluşturmamak için telefonun varsayılan bildirim sesini kullanır.
5. Diyanet yöntemiyle hesaplanan vakitleri yayın öncesinde seçilmiş birkaç il/ilçede resmî vakitlerle doğrulayın.

## Proje yapısı

```text
App.tsx                          Ana uygulama durumu ve sekmeler
src/components/LocationPicker   İl / ilçe / GPS seçici
src/screens/HomeScreen           Vakitler + canlı geri sayım
src/screens/ReligiousDaysScreen  Bayramlar ve kandiller
src/screens/AlertsScreen         Bildirim / ses / süre ayarları
src/screens/SettingsScreen       Konum, widget, veri ve gizlilik
src/services/prayerService       Namaz vakti veri adaptörü
src/services/locationService     GPS + il/ilçe
src/services/religiousDaysService Diyanet dini günler
src/services/notificationService Yerel bildirim zamanlama
src/services/widgetService       iOS + Android widget güncelleme
src/widgets/                     Platform widget görünümleri
assets/                          Logo, ikon ve widget önizleme
```

## Logo

`assets/logo.svg`, `assets/icon.png` ve `assets/adaptive-icon.png` iki minareli cami + hilal temasını kullanır. Ana renkler mavi ve yeşil, vurgu rengi turuncudur.

---

**Vakit — by baskaya**

---

## GitHub'da tek tusla Android APK

Bu surumde `.github/workflows/build-apk.yml` hazirdir. Proje dosyalarini GitHub repository kokune yukledikten sonra:

**Actions -> Android APK Olustur -> Run workflow**

Workflow Expo hesabi veya `EXPO_TOKEN` istemeden standalone Android release APK derler ve **Vakit-by-Baskaya-APK** artifact'i olarak sunar. Ayrintili adimlar icin `GITHUB_TEK_TUS_APK.md` dosyasina bakin.
