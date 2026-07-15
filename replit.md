# Clark VPN

Application VPN professionnelle multi-protocoles.

## Structure du projet

| Dossier | Description |
|---|---|
| `mobile-app/` | Application React Native (Expo) — UI principale |
| `backend/` | API Node.js/Express avec Prisma + PostgreSQL |
| `admin-panel/` | Tableau de bord admin Vite/React |

## Stack technique

- **Mobile** : React Native 0.86 + Expo 57, NativeWind (Tailwind), Zustand, React Navigation
- **Backend** : Express 5, Prisma 7, PostgreSQL, JWT, bcryptjs
- **Admin** : Vite 8, React 19, React Router 7, Tailwind CSS 4, Axios

## Lancer l'application mobile

```bash
cd mobile-app
npm install
npx expo start
```

Scan le QR code avec l'app **Expo Go** sur Android/iOS.

## Lancer le backend

Prérequis : PostgreSQL + fichier `backend/.env` :
```
DATABASE_URL="postgresql://user:pass@localhost:5432/clarkvpn"
JWT_SECRET="votre_secret_jwt"
PORT=3000
```

```bash
cd backend
npm install
npx prisma migrate dev
npx tsx src/index.ts
```

## Lancer l'admin panel

```bash
cd admin-panel
npm install
npm run dev
```

## Design system mobile (v2)

- **Couleur primaire** : Teal `#00838F` (identique à HTTP Injector)
- **Background** : `#090D14`
- **Surface** : `#0F1624`
- **Thème** : `mobile-app/src/theme/index.ts`

## Screens mobiles

| Screen | Description |
|---|---|
| `HomeScreen` | Connexion, stats temps réel, sélection serveur |
| `ConfigScreen` | Gestion profils VPN (V2Ray, SSH, VLess, HTTP Inject…) |
| `ServerListScreen` | Liste serveurs avec ping et charge |
| `LogScreen` | Journal terminal de connexion |
| `ToolsScreen` | Ping, DNS Lookup, vérification IP |
| `SettingsScreen` | Kill Switch, obfuscation, reconnexion auto… |

## User preferences

- Langue de l'interface : Français
- Comparaison design cible : HTTP Injector + DarkTunnel
