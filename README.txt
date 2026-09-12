VAKIT BUILD FIX V3

GitHub reposunda şu 3 dosyayı değiştirin:
1) app.config.ts
2) package.json
3) .github/workflows/build-apk.yml

Önemli:
- package.json içinden expo-dev-client kaldırıldı. Standalone APK için gerekli değil ve WorkManager çakışmasına katkı sağlıyordu.
- app.config.ts artık TypeScript tip sözdizimi kullanmıyor; Expo config parser'ında "Unexpected token {" hatasını önler.
- Workflow, build başlamadan önce "npx expo config --type public" ile config'i ayrıca doğrular.
