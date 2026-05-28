# Email Templates — Supabase Auth

Templates HTML pour les emails transactionnels de Supabase Auth.
Compatibles Gmail, Outlook, Apple Mail (inline styles, table layout, pas de CSS externe).

## Comment installer

### 1. Confirm signup (confirmation d'inscription)

1. Ouvre **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Clique sur l'onglet **"Confirm signup"**
3. Dans le champ **Subject** : `Confirme ton inscription sur trouver-un-associé`
4. Dans le champ **Body (HTML)** : copie-colle le contenu intégral de `confirm-signup.html`
5. Clique **Save**

### 2. Reset password (mot de passe oublié)

1. Même page, onglet **"Reset password"**
2. Dans le champ **Subject** : `Réinitialise ton mot de passe sur trouver-un-associé`
3. Dans le champ **Body (HTML)** : copie-colle le contenu intégral de `reset-password.html`
4. Clique **Save**

### 3. Autres templates

Laisser les templates suivants tels quels pour l'instant :
- Magic link
- Change email address
- Invite user

## Variables Supabase

Ces variables sont automatiquement remplacées par Supabase au moment de l'envoi :

| Variable | Description |
|---|---|
| `{{ .ConfirmationURL }}` | Lien d'action (confirmer email ou reset password) |
| `{{ .Email }}` | Adresse email du destinataire |
| `{{ .SiteURL }}` | URL du site configurée dans Supabase |

## Test

Après avoir collé les templates, teste en :
1. Créant un nouveau compte (inscription) → vérifie l'email de confirmation
2. Cliquant "Mot de passe oublié" sur auth.html → vérifie l'email de reset
