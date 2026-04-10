const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const supabase = createClient(
  'https://rdyrlculowoqtixgdumc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeXJsY3Vsb3dvcXRpeGdkdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njc3OTcsImV4cCI6MjA5MTM0Mzc5N30.RANwu2ouv0cn3G-UXxaxgEWD_GZFw7apogJg35vb_qo'
);

app.get('/api/profils', async (req, res) => {
  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
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
  const { prenom, nom, email, ville, role, pitch, intention, competences, secteurs, disponibilite, linkedin, equity, temps_plein } = req.body;
  if (!prenom || !email || !intention) return res.status(400).json({ error: 'Champs obligatoires manquants' });
  const { data, error } = await supabase
    .from('profils')
    .insert([{ prenom, nom: nom||null, ville: ville||null, role: role||null, pitch: pitch||null, intention, competences: competences||[], secteurs: secteurs||[], disponibilite: disponibilite||null, linkedin: linkedin||null, equity: equity||false, temps_plein: temps_plein!==false }])
    .select().single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true, profil: data });
});


app.post('/api/projets', async (req, res) => {
  const { titre, secteur, ville, stade, pitch_court, description, profils_recherches, competences_recherchees, equity } = req.body;
  if (!titre || !pitch_court) return res.status(400).json({ error: 'Champs obligatoires manquants' });
  const { data, error } = await supabase
    .from('projets')
    .insert([{ titre, secteur: secteur||null, ville: ville||null, stade: stade||null, pitch_court, description: description||null, profils_recherches: profils_recherches||[], competences_recherchees: competences_recherchees||[], equity: equity||true }])
    .select().single();
  if (error) return res.status(500).json({ error });
  res.json({ success: true, projet: data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
