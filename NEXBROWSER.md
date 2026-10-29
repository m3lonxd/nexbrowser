# NexBrowser

NexBrowser, [Zen Browser](https://github.com/zen-browser/desktop) tabanlı (o da Firefox tabanlı)
bir tarayıcıdır. Kaynak kodu Mozilla Public License 2.0 (MPL-2.0) ile lisanslıdır; bkz. `LICENSE`.

## Zen'den farkları

- Ad, logo, ikonlar ve uygulama kimliği NexBrowser (`nexbrowser`), profil klasörü `~/.config/nexbrowser` (eski kurulumlarda `~/.nexbrowser`; Zen'in `~/.config/zen` klasörüne dokunmaz). Güncelleyici kapalı; Zen güncelleme sunucusuna bağlanmaz.
- Otomatik güncelleme ve bağış bağlantıları kapalı.
- Yerel hesap sistemi: açılışta hesap seçimi, her hesap ayrı Firefox profili; ana şifreli hesapta pencere şifre girilmeden açılmaz (`NexAccountGate`).

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
