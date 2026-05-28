(function(){
var _cc = (window.supabase || {}).createClient;

/* === MOBILE NAV CSS === */
var s = document.createElement('style');
s.textContent =
'.nav-burger{display:none;width:36px;height:36px;border:none;background:none;cursor:pointer;padding:4px;flex-shrink:0;align-items:center;justify-content:center}' +
'.nav-drawer-overlay{display:none;position:fixed;inset:0;background:rgba(14,8,48,.45);z-index:998;opacity:0;transition:opacity .25s}' +
'.nav-drawer-overlay.show{display:block;opacity:1}' +
'.nav-drawer{position:fixed;top:0;right:0;bottom:0;width:min(80vw,320px);background:var(--c-white,#fff);z-index:999;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(14,8,48,.12)}' +
'.nav-drawer.open{transform:translateX(0)}' +
'.nav-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1.5px solid rgba(14,8,48,.08)}' +
'.nav-drawer-title{font-family:var(--f-display,"Sora",sans-serif);font-weight:400;font-size:16px;color:var(--c-navy-ink,#0E0830)}' +
'.nav-drawer-x{width:32px;height:32px;border-radius:50%;background:var(--c-bg,#FBFAF7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--c-mute,#7A7A8E)}' +
'.nav-drawer-body{flex:1;padding:24px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}' +
'.nav-drawer-link{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;font-family:var(--f-body,"Inter",sans-serif);font-size:15px;font-weight:500;color:var(--c-navy-ink,#0E0830);text-decoration:none;transition:background .15s}' +
'.nav-drawer-link:hover{background:var(--c-bg,#FBFAF7)}' +
'.nav-drawer-sep{height:1px;background:rgba(14,8,48,.08);margin:8px 0}' +
'.nav-drawer-cta{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border-radius:999px;border:1.5px solid var(--c-navy-ink,#0E0830);font-family:var(--f-body,"Inter",sans-serif);font-size:14px;font-weight:600;color:var(--c-navy-ink,#0E0830);text-decoration:none;margin-top:8px;transition:all .2s;background:var(--c-white,#fff)}' +
'.nav-drawer-cta:hover{background:var(--c-navy-ink,#0E0830);color:var(--c-white,#fff)}' +
'.nav-drawer-logout{align-items:center;justify-content:center;padding:12px 20px;font-family:var(--f-body,"Inter",sans-serif);font-size:14px;font-weight:500;color:var(--c-mute,#7A7A8E);cursor:pointer;border:none;background:none;margin-top:auto;width:100%;display:none}' +
'.nav-drawer-logout:hover{color:var(--c-red,#E11D2E)}' +
'@media(max-width:760px){' +
  '.nav-burger{display:flex}' +
  '#navLogoutBtn{display:none !important}' +
  '.nav-badge-text{display:none !important}' +
  '.nav-badge-dot{display:block !important}' +
  '.nav-prenom-text{display:none !important}' +
'}';
document.head.appendChild(s);

/* === DRAWER DOM === */
var overlay = document.createElement('div');
overlay.className = 'nav-drawer-overlay';
document.body.appendChild(overlay);

var drawer = document.createElement('div');
drawer.className = 'nav-drawer';
drawer.setAttribute('role','dialog');
drawer.setAttribute('aria-modal','true');
drawer.innerHTML =
  '<div class="nav-drawer-head">' +
    '<span class="nav-drawer-title">Menu</span>' +
    '<button class="nav-drawer-x" aria-label="Fermer">&times;</button>' +
  '</div>' +
  '<div class="nav-drawer-body">' +
    '<a href="/" class="nav-drawer-link">Accueil</a>' +
    '<a href="/explorer.html" class="nav-drawer-link">Projets</a>' +
    '<a href="/profils.html" class="nav-drawer-link">Profils</a>' +
    '<div class="nav-drawer-sep"></div>' +
    '<a href="/auth.html?redirect=/deposer.html" class="nav-drawer-cta">+ D\u00e9poser un projet</a>' +
    '<button class="nav-drawer-logout" id="drawerLogout">D\u00e9connexion</button>' +
  '</div>';
document.body.appendChild(drawer);

function openDrawer(){drawer.classList.add('open');overlay.classList.add('show');document.body.style.overflow='hidden'}
function closeDrawer(){drawer.classList.remove('open');overlay.classList.remove('show');document.body.style.overflow=''}
overlay.onclick = closeDrawer;
drawer.querySelector('.nav-drawer-x').onclick = closeDrawer;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer()});

/* === INIT NAV === */
async function initNav() {
  if (!_cc) return;
  var sb = _cc(
    'https://rdyrlculowoqtixgdumc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeXJsY3Vsb3dvcXRpeGdkdW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3Njc3OTcsImV4cCI6MjA5MTM0Mzc5N30.RANwu2ouv0cn3G-UXxaxgEWD_GZFw7apogJg35vb_qo'
  );

  var { data: { session } } = await sb.auth.getSession();
  var navBtn = document.getElementById('navAuthBtn');
  if (!navBtn) return;

  /* Inject burger */
  var navRight = navBtn.parentElement;
  var burger = document.createElement('button');
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label','Menu');
  burger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  burger.onclick = openDrawer;
  navRight.appendChild(burger);

  if (session) {
    var prenom = session.user.user_metadata?.prenom || 'Mon compte';

    var profilHref = '/inscription.html';
    var profilComplete = false;
    try {
      var res = await fetch('/api/profils/me', {
        headers: { 'Authorization': 'Bearer ' + session.access_token }
      });
      if (res.ok) {
        var profil = await res.json();
        if (profil && profil.id) {
          if (profil.ville && profil.role && profil.pitch) {
            profilHref = '/profil.html?id=' + profil.id;
            profilComplete = true;
          }
        }
      }
    } catch(e) {}

    var dot = profilComplete ? '' : '<span class="nav-badge-dot" style="position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#E11D2E;border:1.5px solid white;display:none"></span>';
    var badge = profilComplete ? '' : '<span class="nav-badge-text" style="background:#E11D2E;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;margin-left:4px;white-space:nowrap">\u00e0 compl\u00e9ter</span>';
    navBtn.innerHTML = '<span style="display:flex;align-items:center;gap:8px">' +
      '<span style="position:relative;width:28px;height:28px;border-radius:50%;background:var(--violet,#1A1247);color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">' + prenom[0].toUpperCase() + dot + '</span>' +
      '<span class="nav-prenom-text">' + prenom + '</span>' + badge +
    '</span>';
    navBtn.href = profilHref;

    /* Drawer logout */
    var dl = document.getElementById('drawerLogout');
    if (dl) {
      dl.style.display = 'flex';
      dl.onclick = async function(){ await sb.auth.signOut(); window.location.reload(); };
    }
    /* Desktop logout */
    var lb = document.getElementById('navLogoutBtn');
    if (lb) {
      lb.style.display = 'flex';
      lb.onclick = async function(){ await sb.auth.signOut(); window.location.reload(); };
    }
  } else {
    navBtn.textContent = 'Se connecter';
    navBtn.href = '/auth.html';
  }
}

document.addEventListener('DOMContentLoaded', initNav);
})();
