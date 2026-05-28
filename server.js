const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const supabase = createClient(
  'https://rdyrlculowoqtixgdumc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeXJsY3Vsb3dvcXRpeGdkdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njc3OTcsImV4cCI6MjA5MTM0Mzc5N30.RANwu2ouv0cn3G-UXxaxgEWD_GZFw7apogJg35vb_qo'
);


async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Session invalide' });
  req.user = user;
  next();
}

app.get('/api/profils', async (req, res) => {
  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/api/profils/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .eq('user_id', req.user.id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'profil not found' });
    return res.status(500).json({ error });
  }
  res.json(data);
});

app.patch('/api/profils/me', requireAuth, async (req, res) => {
  const updates = req.body;
  delete updates.id;
  delete updates.user_id;
  delete updates.created_at;
  delete updates.email;
  const { data, error } = await supabase
    .from('profils')
    .update(updates)
    .eq('user_id', req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true, profil: data });
});

app.get('/api/profils/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/api/projets', async (req, res) => {
  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.get('/api/projets/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});


app.post('/api/inscription', async (req, res) => {
  const { prenom, nom, ville, role, pitch, intention, competences, secteurs, disponibilite, linkedin, equity, temps_plein, user_id } = req.body;
  if (!prenom || !intention) return res.status(400).json({ error: 'Champs obligatoires manquants' });
  const { data, error } = await supabase
    .from('profils')
    .insert([{ prenom, nom: nom||null, ville: ville||null, role: role||null, pitch: pitch||null, intention, competences: competences||[], secteurs: secteurs||[], disponibilite: disponibilite||null, linkedin: linkedin||null, equity: equity||false, temps_plein: temps_plein!==false, user_id: user_id||null }])
    .select().single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true, profil: data });
});


app.post('/api/projets', requireAuth, async (req, res) => {
  const { titre, secteur, ville, stade, pitch_court, description, profils_recherches, competences_recherchees, equity } = req.body;
  if (!titre || !pitch_court) return res.status(400).json({ error: 'Champs obligatoires manquants' });
  const { data, error } = await supabase
    .from('projets')
    .insert([{ titre, secteur: secteur||null, ville: ville||null, stade: stade||null, pitch_court, description: description||null, profils_recherches: profils_recherches||[], competences_recherchees: competences_recherchees||[], equity: equity||true, user_id: req.user?.id || null }])
    .select().single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true, projet: data });
});


// --- Exprimer intérêt ---
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/interets', requireAuth, async (req, res) => {
  const { projetId, message } = req.body;
  if (!projetId) return res.status(400).json({ error: 'projetId requis' });

  // Récupérer le projet
  const { data: projet, error: errProjet } = await supabase
    .from('projets')
    .select('*')
    .eq('id', projetId)
    .single();
  if (errProjet || !projet) return res.status(404).json({ error: 'Projet introuvable' });

  // Récupérer le profil du porteur de projet via user_id
  const { data: porteur, error: errPorteur } = await supabase
    .from('profils')
    .select('*')
    .eq('user_id', projet.user_id)
    .single();
  if (errPorteur || !porteur) return res.status(404).json({ error: 'Porteur de projet introuvable' });

  // Récupérer le profil de l'utilisateur intéressé
  const { data: interesse, error: errInteresse } = await supabase
    .from('profils')
    .select('*')
    .eq('user_id', req.user.id)
    .single();
  if (errInteresse || !interesse) return res.status(404).json({ error: 'Complète ton profil avant d\'exprimer ton intérêt' });

  // Envoyer l'email via Resend
  const htmlBody = `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="background:#1A1247;padding:12px 24px;border-radius:12px 12px 0 0;text-align:center">
        <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:#fff">Trouver un Associé — French Tech Bordeaux</span>
      </div>
      <div style="background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:32px 24px">
        <h2 style="font-size:20px;color:#0E0830;margin:0 0 8px">Quelqu'un s'intéresse à ton projet !</h2>
        <p style="font-size:14px;color:#7A7A8E;margin:0 0 24px">Une personne a exprimé son intérêt pour <strong style="color:#0E0830">${projet.titre}</strong>.</p>
        <div style="background:#FBFAF7;border-radius:10px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 6px;font-size:14px"><strong style="color:#0E0830">Prénom :</strong> ${interesse.prenom || '—'}</p>
          <p style="margin:0 0 6px;font-size:14px"><strong style="color:#0E0830">Ville :</strong> ${interesse.ville || '—'}</p>
          <p style="margin:0;font-size:14px"><strong style="color:#0E0830">Rôle :</strong> ${interesse.role || '—'}</p>
        </div>
        ${message ? `<div style="background:#E6EEFC;border-radius:10px;padding:20px;margin-bottom:24px"><p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1F60E8">Message :</p><p style="margin:0;font-size:14px;color:#0E0830;line-height:1.6">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}
        <p style="font-size:13px;color:#7A7A8E;margin:0">Réponds directement à cet email pour entrer en contact.</p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: 'Trouver un Associé <noreply@trouver-un-associe.com>',
      to: porteur.email || req.user.email,
      replyTo: req.user.email,
      subject: `Quelqu'un est intéressé par ton projet "${projet.titre}" sur trouver-un-associé`,
      html: htmlBody
    });
  } catch (emailErr) {
    console.error('Resend error:', emailErr);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }

  res.json({ ok: true });
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
