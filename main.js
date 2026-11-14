import './style.css';

const app = document.querySelector('#app');
const DB_NAME = 'liderakademi-db';
const STORE = 'packages';
const WA_NUMBER = '905455140698';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getPackages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function savePackage(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(item);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
}
async function deletePackage(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
}
function getAdminHash() { return localStorage.getItem('lider_admin_hash'); }
async function hash(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function shell(content) {
  app.innerHTML = `<header class="top"><div class="brand"><span class="mark">L</span><div><b>Liderakademi</b><small>Mesleki Eğitim</small></div></div><a class="wa" href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noreferrer">WhatsApp</a></header><main>${content}</main><footer>Liderakademi · Eğitim Sertifikaları</footer>`;
}
function loginScreen() {
  shell(`<section class="hero"><p class="eyebrow">MESLEKİ EĞİTİM</p><h1>Bilgi ve eğitim<br><em>bir adım uzağında.</em></h1><p class="muted">Eğitim paketlerini incelemek için öğrenci girişi yapabilir veya yönetici panelini açabilirsin.</p></section>
  <section class="panel"><h2>Öğrenci girişi</h2><label>Ad Soyad<input id="studentName" placeholder="Adınızı yazın"></label><button id="studentBtn">Eğitimleri görüntüle</button></section>
  <section class="panel admin-panel"><h2>Yönetici girişi</h2><p class="muted">Yönetici kullanıcı adı: <b>lideradmin</b></p><label>Kullanıcı adı<input id="adminUser" value="lideradmin"></label><label>Şifre<input id="adminPass" type="password" placeholder="Yönetici şifresi"></label><button class="secondary" id="adminBtn">Yönetici paneline gir</button><p class="tiny" id="setupNote"></p></section>`);
  document.querySelector('#studentBtn').onclick = () => {
    const name = document.querySelector('#studentName').value.trim();
    if (!name) return alert('Lütfen adınızı yazın.');
    localStorage.setItem('lider_student_name', name);
    studentScreen();
  };
  const note = document.querySelector('#setupNote');
  if (!getAdminHash()) note.textContent = 'İlk girişte kullanıcı adı lideradmin ve belirleyeceğiniz yeni şifre ile kurulum yapılır.';
  document.querySelector('#adminBtn').onclick = async () => {
    const user = document.querySelector('#adminUser').value.trim();
    const pass = document.querySelector('#adminPass').value;
    if (user !== 'lideradmin') return alert('Yönetici kullanıcı adı hatalı.');
    if (pass.length < 6) return alert('Şifre en az 6 karakter olmalı.');
    if (!getAdminHash()) {
      const confirmPass = prompt('İlk kurulum: Bu şifre yönetici şifreniz olacak. Onaylamak için şifreyi tekrar yazın:');
      if (confirmPass !== pass) return alert('Şifreler eşleşmedi.');
      localStorage.setItem('lider_admin_hash', await hash(pass));
      alert('Yönetici şifresi bu cihazda oluşturuldu.');
      adminScreen();
      return;
    }
    if (await hash(pass) !== getAdminHash()) return alert('Şifre hatalı.');
    adminScreen();
  };
}
async function studentScreen() {
  const name = localStorage.getItem('lider_student_name') || 'Öğrenci';
  const items = await getPackages();
  shell(`<div class="pagehead"><div><p class="eyebrow">ÖĞRENCİ ALANI</p><h1>Merhaba, ${escapeHtml(name)}</h1><p class="muted">Eğitim paketlerimiz</p></div><button class="small secondary" id="logout">Çıkış</button></div>
  <div class="cards">${items.length ? items.map(item => `<article class="course">${item.media ? (item.mediaType.startsWith('video/') ? `<video controls src="${item.media}"></video>` : `<img src="${item.media}" alt="">`) : '<div class="placeholder">L</div>'}<div class="coursebody"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${item.price ? `<b class="price">${escapeHtml(item.price)}</b>` : ''}<a class="buttonlink" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Merhaba, '+item.title+' eğitimi hakkında bilgi almak istiyorum.')}" target="_blank">WhatsApp'tan bilgi al</a></div></article>`).join('') : '<div class="empty">Henüz eğitim paketi eklenmemiş. Bilgi almak için WhatsApp üzerinden bize ulaşabilirsiniz.</div>'}</div>`);
  document.querySelector('#logout').onclick = loginScreen;
}
async function adminScreen() {
  const items = await getPackages();
  shell(`<div class="pagehead"><div><p class="eyebrow">YÖNETİM</p><h1>Yönetici paneli</h1><p class="muted">Eğitim paketlerini buradan ekleyip düzenleyebilirsin.</p></div><button class="small secondary" id="logout">Çıkış</button></div>
  <section class="panel"><h2>Yeni eğitim paketi ekle</h2><form id="courseForm"><label>Eğitim adı<input id="title" required placeholder="Örn. Elektrik-Elektronik"></label><label>Açıklama<textarea id="description" rows="3" placeholder="Eğitim hakkında kısa bilgi"></textarea></label><label>Ücret (isteğe bağlı)<input id="price" placeholder="Örn. Bilgi için arayınız"></label><label>Fotoğraf veya video<input id="media" type="file" accept="image/*,video/*"></label><button type="submit">Paketi kaydet</button></form><p class="tiny">Eklediğin içerikler bu cihazda saklanır.</p></section>
  <section class="panel"><h2>Mevcut paketler (${items.length})</h2><div class="manage-list">${items.map(x => `<div class="manage-item"><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.description || '')}</small></div><button class="danger small" data-delete="${x.id}">Sil</button></div>`).join('') || '<p class="muted">Henüz paket yok.</p>'}</div></section>`);
  document.querySelector('#logout').onclick = loginScreen;
  document.querySelector('#courseForm').onsubmit = async e => {
    e.preventDefault();
    const file = document.querySelector('#media').files[0];
    let media = '', mediaType = '';
    if (file) {
      if (file.size > 80 * 1024 * 1024) return alert('Dosya 80 MB sınırını aşıyor.');
      media = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      mediaType = file.type;
    }
    await savePackage({ id: crypto.randomUUID(), title: document.querySelector('#title').value.trim(), description: document.querySelector('#description').value.trim(), price: document.querySelector('#price').value.trim(), media, mediaType });
    adminScreen();
  };
  document.querySelectorAll('[data-delete]').forEach(btn => btn.onclick = async () => {
    if (confirm('Bu eğitim paketini silmek istiyor musun?')) { await deletePackage(btn.dataset.delete); adminScreen(); }
  });
}
loginScreen();
