# NOXLY - Éjszakai Élet Alkalmazás

Egy modern React alkalmazás, amely segíti a felhasználókat abban, hogy kedvezményesen élvezhessék a város éjszakai életét.

## Funkciók

- Kuponok és akciók megtekintése
- Új helyek felfedezése kedvezményes áron
- 1+1 ital akciók
- VIP kedvezmények
- Előregisztráció várólistára

## Technológiai verem

- React + TypeScript
- Supabase (Authentikáció és adatbázis)
- Tailwind CSS
- shadcn/ui komponensek

## Supabase Authentikáció

Az alkalmazás Supabase authentikációt használ a felhasználókezeléshez, szerepköralapú hozzáféréssel.

### Szerepkörök

- **user**: Alap felhasználó, hozzáfér az alkalmazás alapvető funkcióihoz
- **admin**: Adminisztrátor, hozzáfér az admin vezérlőpulthoz

### Admin hozzáférés

1. Regisztráljon egy új felhasználót
2. A `/test-admin` oldalon adhat magának admin jogot (csak teszteléshez)
3. Frissítse az oldalt
4. Az "Admin" menüpont meg fog jelenni a felhasználói menüben

### Fontos fájlok

- `src/contexts/AuthContext.tsx`: Authentikációs kontextus
- `src/components/AdminRoute.tsx`: Admin oldalak védelme
- `src/pages/Admin.tsx`: Admin vezérlőpult
- `src/pages/Login.tsx`: Bejelentkezés/Regisztráció oldal
- `src/integrations/supabase/client.ts`: Supabase kliens

## Fejlesztés indítása

1. Klónozza a repository-t
2. Telepítse a függőségeket: `npm install`
3. Indítsa el a fejlesztői szervert: `npm run dev`

## Adatbázis séma

A Supabase adatbázisban létrehozott táblák:

### profiles
- `id`: UUID (auth.users.id hivatkozás)
- `first_name`: TEXT
- `last_name`: TEXT
- `avatar_url`: TEXT
- `role`: TEXT (alapértelmezett: 'user', értékek: 'user' vagy 'admin')
- `registration_date`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

## Biztonság

- Row Level Security (RLS) engedélyezve minden táblán
- A felhasználók csak a saját profiljukat érhetik el
- Az admin felhasználók hozzáférhetnek minden profilhoz