# Game Vault 999 — Style Guide

> **Domain:** gamevault999apk.com
> **Project:** Game Vault 999 — Sweepstakes Gaming Platform
> **Last Updated:** 2026-02-11

---

## Brand Identity

| Property       | Value                              |
| -------------- | ---------------------------------- |
| **Brand Name** | Game Vault 999                     |
| **Tagline**    | Play. Win. Cash Out.               |
| **Domain**     | gamevault999apk.com                |
| **Tone**       | Bold, trustworthy, high-energy     |
| **Audience**   | Mobile gamers, sweepstakes players |

---

## HTML Import Links

### Fonts — Google Fonts (Outfit)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Icons — Ionicons 7

```html
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
```

---

## Colors

### Core Palette

```css
:root {
  /* Backgrounds */
  --bg:           #0a0e1a;          /* Deep navy — page background       */
  --surface:      #111827;          /* Card / panel background            */
  --surface-2:    #1e293b;          /* Elevated surface / hover state     */
  --border:       rgba(255,255,255,0.08); /* Subtle dividers              */

  /* Text */
  --text:         #f1f5f9;          /* Primary text (light on dark)       */
  --text-muted:   #94a3b8;          /* Secondary / caption text           */

  /* Brand — Primary (Blue) */
  --primary:      #2563eb;          /* Buttons, links, accents            */
  --primary-light:#3b82f6;          /* Hover states, highlights           */

  /* Accent — Gold */
  --gold:         #f59e0b;          /* Brand accent "999", badges         */
  --gold-light:   #fbbf24;          /* Gold hover / glow                  */

  /* Semantic */
  --success:      #10b981;          /* Positive actions, deposits, live   */
  --success-light:#34d399;          /* Success hover                      */
  --warning:      #f59e0b;          /* Alerts, pending states             */
  --danger:       #ef4444;          /* Errors, destructive actions        */
  --purple:       #8b5cf6;          /* Withdraw accent                    */
}
```

### Gradient Presets

```css
/* Hero text gradient */
background: linear-gradient(135deg, var(--gold), #fb923c);

/* Primary button gradient */
background: linear-gradient(135deg, var(--primary), #1d4ed8);

/* Success / CTA button gradient */
background: linear-gradient(135deg, var(--success), #059669);

/* Featured badge gradient */
background: linear-gradient(135deg, var(--gold), #f97316);

/* Promo banner gradient */
background: linear-gradient(135deg, var(--primary), #7c3aed);

/* Download button gradient */
background: linear-gradient(135deg, #10b981, #059669);
```

---

## Typography

### Font Family

```css
--font: "Outfit", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
```

### Scale

| Token           | Size            | Weight | Usage                          |
| --------------- | --------------- | ------ | ------------------------------ |
| `headline-xl`   | clamp(30–50px)  | 800    | Hero headline                  |
| `headline-lg`   | 24px            | 700    | Section headings               |
| `headline-md`   | 20px            | 800    | Logo / brand name              |
| `body-lg`       | 17px            | 400    | Hero paragraph                 |
| `body`          | 14–15px         | 400–500| General body text              |
| `caption`       | 12–13px         | 500–600| Badges, metadata, stats        |
| `micro`         | 11px            | 700    | Game card badges, labels       |

### Font Weights

```css
--fw-300: 300;   /* Light         */
--fw-400: 400;   /* Regular       */
--fw-500: 500;   /* Medium        */
--fw-600: 600;   /* Semi Bold     */
--fw-700: 700;   /* Bold          */
--fw-800: 800;   /* Extra Bold    */
```

---

## Spacing & Layout

```css
--section-padding: 56px;      /* Vertical section spacing          */
--container-max:   1200px;     /* Max content width                 */
--container-pad:   20px;       /* Horizontal page padding           */
--card-gap:        16px;       /* Grid gap between cards            */
```

---

## Border Radius

```css
--radius:    16px;    /* Cards, panels, major containers   */
--radius-md: 14px;    /* Dashboard cards                   */
--radius-sm: 10px;    /* Buttons, inputs, small cards      */
--radius-xs: 8px;     /* Logo corners, tiny elements       */
--radius-badge: 6px;  /* Badges, tags                      */
--radius-pill: 100px; /* Pills, hero badge                 */
```

---

## Shadows

```css
--shadow:     0 4px 20px rgba(0,0,0,0.25);           /* Default elevation   */
--shadow-lg:  0 16px 40px rgba(0,0,0,0.35);          /* Hover card lift     */
--shadow-btn: 0 6px 20px rgba(37, 99, 235, 0.35);    /* Button glow (blue)  */
--shadow-suc: 0 6px 20px rgba(16, 185, 129, 0.3);    /* Button glow (green) */
```

---

## Transitions & Animations

```css
--transition:  0.2s ease;         /* Default micro-interaction        */
--transition-md: 0.3s ease;       /* Card hover lift                  */
--cubic-in:    cubic-bezier(0.51, 0.03, 0.64, 0.28);
--cubic-out:   cubic-bezier(0.05, 0.83, 0.52, 0.97);
```

### Named Animations

| Name             | Duration | Purpose                         |
| ---------------- | -------- | ------------------------------- |
| `fadeUp`         | 0.5s     | Entrance animation for sections |
| `livePulse`      | 2s       | Live-dot heartbeat              |
| `bannerShimmer`  | 3s       | Promo banner shine sweep        |
| `float`          | 3s       | Floating download badge         |
| `pulseGlow`      | 2s       | Download button glow pulse      |

---

## Component Patterns

### Buttons

| Variant       | Background                       | Text    | Radius   |
| ------------- | -------------------------------- | ------- | -------- |
| **Primary**   | `linear-gradient(primary)`       | `#fff`  | 10–12px  |
| **Success**   | `linear-gradient(success)`       | `#fff`  | 10–12px  |
| **Download**  | `linear-gradient(success)`       | `#fff`  | 14px     |
| **Ghost**     | `var(--surface)` + border        | `--text` | 10px    |
| **Pill Badge**| `rgba(primary, 0.12)` + border   | `--primary-light` | 100px |

### Cards

- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Radius: `var(--radius)` (16px)
- Hover: `translateY(-4px)` + `--shadow-lg`
- Featured cards: gold-tinted border `rgba(245,158,11,0.25)`

### Download Section

- Full-width section with gradient overlay background
- Centered content with floating APK icon
- Dual download buttons (Android APK + iOS)
- Animated glow effect on primary CTA
- Trust badges below buttons (file size, version, rating)

---

## Responsive Breakpoints

| Breakpoint | Target           | Key Adjustments                       |
| ---------- | ---------------- | ------------------------------------- |
| `≤ 768px`  | Tablets / phones | 2-col game grid, smaller hero, hide meta |
| `≤ 420px`  | Small phones     | Tighter spacing, hide payment labels  |

---

## SEO Conventions

| Tag                 | Pattern                                                    |
| ------------------- | ---------------------------------------------------------- |
| `<title>`           | `{Page} | Game Vault 999 APK Download`                     |
| `meta description`  | Under 160 chars, include "Game Vault 999" + page focus     |
| `canonical`         | `https://gamevault999apk.com/{path}`                       |
| `og:site_name`      | `Game Vault 999`                                           |
| `og:image`          | Game-specific GIF or site logo                             |
| Schema.org          | Organization + WebPage + WebSite graph on every page       |

---

## File & Folder Structure

```
/
├── index.html              # Homepage – game listing + download
├── sitemap.xml
├── robots.txt
├── vercel.json
├── api/
│   └── postback.js         # Ad network postback handler
├── assets/
│   ├── css/                # Shared stylesheets
│   ├── js/                 # Scripts (tracker, confetti, etc.)
│   ├── images/             # Logos, game GIFs, icons
│   └── font/               # Custom fonts (Gilroy)
├── dashboard/              # Analytics dashboard (noindex)
├── funds/                  # Deposit & withdraw pages (noindex)
├── pages/                  # Individual game sign-up pages
│   ├── game-vault.html
│   ├── firekirin.html
│   └── ...
└── favicon/
    └── icon.png
```

---

## Brand Assets

| Asset         | Location                        |
| ------------- | ------------------------------- |
| Logo (PNG)    | `/favicon/icon.png`             |
| Game GIFs     | `/assets/images/games/*.gif`    |
| Payment icons | External CDNs + `/assets/images/svg-export/` |
| QR codes      | `/assets/images/crypto_qr/`     |
