# NexBrowser

NexBrowser, [Zen Browser](https://github.com/zen-browser/desktop) tabanlı (o da Firefox tabanlı)
bir tarayıcıdır. Kaynak kodu Mozilla Public License 2.0 (MPL-2.0) ile lisanslıdır; bkz. `LICENSE`.

## Zen'den farkları

- Ad, logo, ikonlar ve uygulama kimliği NexBrowser (`nexbrowser`), profil klasörü `~/.nexbrowser` (Zen'in `~/.config/zen` klasörüne dokunmaz). Güncelleyici kapalı; Zen güncelleme sunucusuna bağlanmaz.
- Otomatik güncelleme ve bağış bağlantıları kapalı.
- Planlanan: şifreli yerel hesap sistemi (her hesap ayrı Firefox profili).

## Marka varlıkları

Logolar `branding-src/` altındaki SVG'lerden üretilir:

```bash
node branding-src/generate.mjs                       # ikon, ico, icns, about logoları
python3 branding-src/wordmark.py <Inter.ttc>         # yazı logosu (fontTools gerekir)
```

## Derleme (Debian)

```bash
npm install
npm run init                     # Firefox kaynağını indirir, yamaları uygular, bağımlılıkları kurar
npx surfer ci --brand release    # NexBrowser markasını seçer
npm run build
npm start
```
