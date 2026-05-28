(function(){
const { createClient } = window.supabase || {};

async function initNav() {
  if (!createClient) return;
  const sb = createClient(
    'https://rdyrlculowoqtixgdumc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeXJsY3Vsb3dvcXRpeGdkdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njc3OTcsImV4cCI6MjA5MTM0Mzc5N30.RANwu2ouv0cn3G-UXxaxgEWD_GZFw7apogJg35vb_qo'
  );

  const { data: { session } } = await sb.auth.getSession();
  const navBtn = document.getElementById('navAuthBtn');
  if (!navBtn) return;

  if (session) {
    const prenom = session.user.user_metadata?.prenom || 'Mon compte';

    let profilHref = '/inscription.html';
    let profilComplete = false;
    try {
      const res = await fetch('/api/profils/me', {
        headers: { 'Authorization': 'Bearer ' + session.access_token }
      });
      if (res.ok) {
        const profil = await res.json();
        if (profil && profil.id) {
          if (profil.ville && profil.role && profil.pitch) {
            profilHref = '/profil.html?id=' + profil.id;
            profilComplete = true;
          }
        }
      }
    } catch(e) {}

    const badge = profilComplete ? '' : '<span style="background:#E11D2E;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:4px;white-space:nowrap">à compléter</span>';
    navBtn.innerHTML = `<span style="display:flex;align-items:center;gap:8px">
      <span style="width:28px;height:28px;border-radius:50%;background:var(--violet);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${prenom[0].toUpperCase()}</span>
      ${prenom}${badge}
    </span>`;
    navBtn.href = profilHref;

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
      logoutBtn.style.display = 'flex';
      logoutBtn.onclick = async () => {
        await sb.auth.signOut();
        window.location.reload();
      };
    }
  } else {
    navBtn.textContent = 'Se connecter';
    navBtn.href = '/auth.html';
  }
}

document.addEventListener('DOMContentLoaded', initNav);
})();
