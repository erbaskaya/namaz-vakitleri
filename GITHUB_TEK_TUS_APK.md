# GitHub'da tek tusla APK olusturma

Bu proje GitHub Actions uzerinde Expo hesabi veya EXPO_TOKEN gerektirmeden kurulabilir Android APK uretecek sekilde hazirlanmistir.

## Bir defalik yapilacaklar

1. GitHub'da yeni ve bos bir repository olusturun.
2. Bu proje klasorunun **icindeki tum dosyalari** repository'nin kok dizinine yukleyin.
   - `.github` klasorunun da yuklendiginden emin olun.
   - ZIP dosyasini GitHub'a tek dosya olarak koymayin; once bilgisayarinizda acin.
3. Repository'de **Actions** sekmesine girin.
4. Soldan **Android APK Olustur** secin.
5. Sag taraftan **Run workflow** > **Run workflow** butonuna basin.
6. Calisma yesil tik ile tamamlaninca calisma sayfasinin altindaki **Artifacts** bolumune inin.
7. **Vakit-by-Baskaya-APK** paketini indirin.
8. Indirdiginiz ZIP'in icindeki `Vakit-by-Baskaya.apk` dosyasini Android telefona kurun.

## Sonraki APK'lar

Kodda bir degisiklik yaptiktan sonra yeni APK almak icin yalnizca:

**Actions > Android APK Olustur > Run workflow**

demeniz yeterlidir.

## Magaza surumu hakkinda

Bu workflow test ve dogrudan telefon kurulumu icin standalone **release** APK uretir. Expo tarafindan uretilen Android native proje release yapisini kullanir; varsayilan Expo bare template'i release build'i debug keystore ile imzalar. Bu nedenle APK telefona kurulabilir, ancak Google Play Store'a gonderilecek kalici production paketi icin daha sonra size ait release keystore / Play App Signing veya EAS Build kurulmasi gerekir.

Workflow dosyasi: `.github/workflows/build-apk.yml`
