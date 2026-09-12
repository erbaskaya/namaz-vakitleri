ALT NAVIGASYON SAFE AREA DÜZELTMESİ

GitHub reposunda şu 2 dosyayı değiştirin:
1. App.tsx
2. package.json

Sonra mevcut Android APK GitHub Action'ınızı tekrar çalıştırın.

Bu düzeltme:
- Android 3 tuşlu sistem navigasyonunda alt menüyü yukarı taşır.
- Android gesture navigation ve iPhone home indicator alanını otomatik hesaba katar.
- Sabit piksel boşluk kullanmaz; cihazın gerçek safe-area değerini kullanır.
- Üst status bar için eski manuel padding kaldırılır.
