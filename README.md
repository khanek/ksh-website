# Krystian Hanek - Personal Portfolio Website

Minimalistyczna, dwujęzyczna strona portfolio z możliwością druku do PDF.

## Technologie

- **Astro** - Generator stron statycznych
- **CSS** - Własne style z dark/light mode
- **Netlify** - Hosting z darmowym SSL

## Funkcjonalności

- ✅ Dwujęzyczność (EN/PL)
- ✅ Dark/Light mode z przełącznikiem
- ✅ Responsywny design
- ✅ Print-to-PDF z dedykowanymi stylami
- ✅ Minimalistyczny design

## Instalacja i uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev

# Zbuduj dla produkcji
npm run build

# Podgląd builda
npm run preview
```

## Deployment na Netlify

1. **Przygotuj repozytorium Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Połącz z Netlify:**
   - Zaloguj się do [Netlify](https://app.netlify.com)
   - Kliknij "Add new site" → "Import an existing project"
   - Wybierz swoje repozytorium Git
   - Ustaw:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Kliknij "Deploy site"

3. **Konfiguracja własnej domeny:**
   - W panelu Netlify przejdź do "Domain settings"
   - Kliknij "Add custom domain"
   - Wprowadź swoją domenę
   - Skonfiguruj DNS zgodnie z instrukcjami Netlify
   - SSL zostanie automatycznie skonfigurowany przez Netlify (Let's Encrypt)

## Struktura projektu

```
├── src/
│   ├── components/     # Komponenty Astro
│   ├── layouts/        # Layouty stron
│   ├── pages/          # Strony (EN i PL)
│   ├── styles/         # Style CSS
│   └── i18n/           # Tłumaczenia
├── public/             # Pliki statyczne (CV PDF)
└── astro.config.mjs    # Konfiguracja Astro
```

## Dostosowanie treści

Treść strony znajduje się w plikach:
- `src/i18n/en.json` - Wersja angielska
- `src/i18n/pl.json` - Wersja polska

## Print to PDF

Strona zawiera dedykowane style dla druku (`@media print`), które:
- Ukrywają nawigację i elementy interaktywne
- Formatują treść na format A4
- Optymalizują layout dla druku

Użyj przycisku "Print as CV" lub `Ctrl+P` / `Cmd+P` w przeglądarce.
