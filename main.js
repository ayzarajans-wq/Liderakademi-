import './style.css';

const app = document.querySelector('#app');
const WA = '905455140698';

function renderHome() {
  app.innerHTML = `
    <header class="top"><div class="brandmark">LA</div><div><div class="brand">LİDERAKADEMİ</div><small>Mesleki Eğitim</small></div></header>
    <main>
      <section class="hero">
        <span class="eyebrow">MESLEKİ EĞİTİM • KARİYER • GELİŞİM</span>
        <h1>Geleceğine<br><em>yön ver.</em></h1>
        <p>Eğitim paketlerini incele, sana uygun eğitim hakkında bilgi al.</p>
        <a class="primary" href="https://wa.me/${WA}?text=${encodeURIComponent('Merhaba, Liderakademi eğitimleri hakkında bilgi almak istiyorum.')}" target="_blank" rel="noreferrer">WhatsApp'tan Bilgi Al</a>
      </section>
      <section class="actions">
        <button class="tile" id="student"><span>🎓</span><b>Öğrenci Girişi</b><small>Eğitim bilgilerine ulaş</small></button>
        <button class="tile" id="admin"><span>⚙️</span><b>Yönetici Girişi</b><small>Eğitim paketlerini yönet</small></button>
      </section>
      <section class="info"><h2>Liderakademi</h2><p>Mesleki eğitim yolculuğunda yanında.</p><p class="muted">Bu ilk test sürümüdür. Yönetici hesabı ve eğitim içerikleri cihaz üzerinde saklanır.</p></section>
    </main>`;
  document.querySelector('#student').onclick = () => renderStudent();
  document.querySelector('#admin').onclick = () => renderAdmin();
}

function renderStudent() {
  app.innerHTML = `<header class="top"><button class="back" id="back">←</button><div><div class="brand">ÖĞRENCİ ALANI</div><small>Liderakademi</small></div></header>
  <main><h1 class="page-title">Eğitim paketleri</h1><div id="packages"></div>
  <a class="primary wide" href="https://wa.me/${WA}?text=${encodeURIComponent('Merhaba, eğitim paketleri hakkında bilgi almak istiyorum.')}" target="_blank" rel="noreferrer">WhatsApp'tan Bilgi Al</a></main>`;
  document.querySelector('#back').onclick = renderHome;
  const list = JSON.parse(localStorage.getItem('la_packages') || '[]');
  const holder = document.querySelector('#packages');
  holder.innerHTML = list.length ? list.map(p => `<article class="package"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p>${p.media ? `<small>Ek dosya: ${escapeHtml(p.mediaName || 'Medya')}</small>` : ''}</article>`).join('') : '<div class="empty">Henüz yayınlanmış eğitim paketi bulunmuyor.</div>';
}

function renderAdmin() {
  const hasPassword = Boolean(localStorage.getItem('la_admin_hash'));
  app.innerHTML = `<header class="top"><button class="back" id="back">←</button><div><div class="brand">YÖNETİCİ PANELİ</div><small>Güvenli giriş</small></div></header>
  <main><section class="panel"><h1 class="page-title">${hasPassword ? 'Yönetici girişi' : 'İlk kurulum'}</h1>
  <p>${hasPassword ? 'Yönetici şifrenizi girin.' : 'İlk kullanım için kendinize bir yönetici şifresi belirleyin.'}</p>
  <label>Kullanıcı adı</label><input id="username" value="lideradmin" autocomplete="username" ${hasPassword ? '' : 'readonly'} />
  <label>${hasPassword ? 'Şifre' : 'Yeni şifre'}</label><input id="password" type="password" autocomplete="${hasPassword ? 'current-password' : 'new-password'}" placeholder="En az 8 karakter" />
  <button class="primary wide" id="login">${hasPassword ? 'Giriş yap' : 'Şifreyi oluştur'}</button><p id="error" class="error"></p>
  <p class="muted">Not: Bu başlangıç sürümü tek cihazda yerel test içindir. Gerçek kullanıcı hesapları ve çevrim içi veri senkronizasyonu için sunucu altyapısı gerekir.</p></section></main>`;
  document.querySelector('#back').onclick = renderHome;
  document.querySelector('#login').onclick = async () => {
    const username = document.querySelector('#username').value.trim();
    const password = document.querySelector('#password').value;
    const error = document.querySelector('#error');
    if (username !== 'lideradmin') { error.textContent = 'Kullanıcı adı hatalı.'; return; }
    if (!hasPassword) {
      if (password.length < 8) { error.textContent = 'Şifre en az 8 karakter olmalı.'; return; }
      localStorage.setItem('la_admin_hash', await hash(password));
      renderDashboard();
    } else if (localStorage.getItem('la_admin_hash') === await hash(password)) {
      renderDashboard();
    } else error.textContent = 'Şifre hatalı.';
  };
}

function renderDashboard() {
  app.innerHTML = `<header class="top"><div><div class="brand">YÖNETİCİ PANELİ</div><small>Hoş geldiniz, lideradmin</small></div><button class="back" id="logout">Çıkış</button></header>
  <main><h1 class="page-title">Eğitim paketi ekle</h1><section class="panel">
  <label>Eğitim adı</label><input id="title" placeholder="Örn. Elektrik-Elektronik" />
  <label>Açıklama</label><textarea id="description" rows="4" placeholder="Eğitim hakkında kısa bilgi"></textarea>
  <label>Fotoğraf veya video (isteğe bağlı)</label><input id="media" type="file" accept="image/*,video/*" />
  <button class="primary wide" id="save">Paketi kaydet</button><p id="status" class="muted"></p></section>
  <h2>Mevcut paketler</h2><div id="list"></div></main>`;
  document.querySelector('#logout').onclick = renderHome;
  const refresh = () => {
    const list = JSON.parse(localStorage.getItem('la_packages') || '[]');
    document.querySelector('#list').innerHTML = list.length ? list.map((p,i) => `<article class="package"><div class="row"><h3>${escapeHtml(p.title)}</h3><button class="delete" data-i="${i}">Sil</button></div><p>${escapeHtml(p.description)}</p></article>`).join('') : '<div class="empty">Henüz paket eklenmedi.</div>';
    document.querySelectorAll('.delete').forEach(b => b.onclick = () => {
      const items = JSON.parse(localStorage.getItem('la_packages') || '[]'); items.splice(Number(b.dataset.i),1);
      localStorage.setItem('la_packages', JSON.stringify(items)); refresh();
    });
  };
  document.querySelector('#save').onclick = async () => {
    const title = document.querySelector('#title').value.trim();
    const description = document.querySelector('#description').value.trim();
    const file = document.querySelector('#media').files[0];
    const status = document.querySelector('#status');
    if (!title) { status.textContent = 'Lütfen eğitim adını yazın.'; return; }
    // This prototype keeps small media files locally; large videos should use cloud storage.
    let media = '', mediaName = '';
    if (file) {
      if (file.size > 8 * 1024 * 1024) { status.textContent = 'Test sürümünde dosya en fazla 8 MB olabilir.'; return; }
      media = await new Promise((resolve,reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
      mediaName = file.name;
    }
    const items = JSON.parse(localStorage.getItem('la_packages') || '[]');
    items.push({title, description, media, mediaName});
    localStorage.setItem('la_packages', JSON.stringify(items));
    document.querySelector('#title').value = ''; document.querySelector('#description').value = ''; document.querySelector('#media').value = '';
    status.textContent = 'Paket bu cihazda kaydedildi.'; refresh();
  };
  refresh();
}

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
renderHome();
