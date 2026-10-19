# Formation GM / GIGN — mise en ligne (≈ 30 min)
## 1. Supabase (base de données, gratuit)
1. Crée un compte sur supabase.com → « New project » (note le mot de passe de la base).
2. Menu **SQL Editor** → colle tout `supabase/schema.sql` → **Run**.
3. Menu **Project Settings → API** : copie **Project URL** et la clé **service_role** (SECRÈTE : ne la partage jamais).
4. Menu **Authentication → Users → Add user** : crée TON compte admin (email + mot de passe fort, coche « Auto confirm »). Désactive les inscriptions publiques : **Authentication → Sign In / Providers → désactive « Allow new users to sign up »**.
5. SQL Editor : `insert into admins values ('ton-email@exemple.com');` → Run. (Seuls les emails de cette table accèdent à /admin.)
## 2. GitHub puis Vercel
1. Mets ce dossier dans un dépôt GitHub (github.com → New repository → « uploading an existing file »).
2. vercel.com → **Add New Project** → importe le dépôt.
3. Avant « Deploy », ajoute les **Environment Variables** de `.env.example` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **Deploy** → tu obtiens un lien `xxx.vercel.app` à partager sur Discord.
## 3. À personnaliser
Date exacte (textes dans `app/page.tsx`), responsables, logo, lien Discord, capacités : places des sessions et de la finale se règlent depuis `/admin`.
## 4. À tester AVANT de partager
S'inscrire (2 fois avec le même pseudo = refus), tester sur téléphone, se connecter à /admin, passer une capacité à 1 puis vérifier la liste d'attente.
## Limites connues
Pas de page « informations » détaillée ; modifier une inscription = annuler puis se réinscrire ; aucune donnée de démonstration. Code non exécuté dans l'environnement de création (pas d'accès réseau) : corrige-moi toute erreur au premier `npm run build`.
