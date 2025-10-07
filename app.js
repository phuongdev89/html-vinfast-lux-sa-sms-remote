(function () {
  const $ = (sel) => document.querySelector(sel);
  const home = $('#home');
  const settings = $('#settings');
  const toSettings2 = $('#toSettingsBtn2');
  const toHome = $('#toHomeBtn');
  const form = $('#settingsForm');
  const phoneInput = $('#phone');
  const passInput = $('#pass');
  const btnCaiSo = $('#btnCaiSo');

  // Routing (two screens)
  function show(screen) {
    for (const el of document.querySelectorAll('.screen')) el.classList.remove('active');
    (screen === 'home' ? home : settings).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  toSettings2.addEventListener('click', () => show('settings'));
  toHome.addEventListener('click', () => show('home'));

  // Storage
  const KEY = 'carRemoteConfig';
  function loadCfg() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch { return {}; }
  }
  function saveCfg(cfg) {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  }
  function fillForm() {
    const cfg = loadCfg();
    if (cfg.phone) phoneInput.value = cfg.phone;
    if (cfg.pass) passInput.value = cfg.pass;
  }
  fillForm();

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = phoneInput.value.trim();
    const pass = passInput.value.trim();
    if (!phone || !pass) { alert('Vui lòng nhập đủ thông tin.'); return; }
    saveCfg({ phone, pass });
    alert('Đã lưu.');
    show('home');
  });

  // SMS deep link helper (works on iOS/Android)
  function smsHref(phone, body) {
    // iOS accepts "sms:NUMBER&body=..." (when in standalone/web it also accepts ?body=)
    // Android prefers "sms:NUMBER?body=..."
    // We'll use ? for default, and switch to & if ? already present or userAgent implies iOS.
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const sep = isiOS ? '&' : '?';
    const encBody = encodeURIComponent(body);
    const number = phone.replace(/\s+/g, '');
    return `sms:${number}${sep}body=${encBody}`;
  }

  function openSMS(cmd) {
    const { phone, pass } = loadCfg();
    if (!phone || !pass) {
      alert('Hãy cài đặt số điện thoại và mật khẩu trước (⚙️ Cài đặt).');
      show('settings');
      return;
    }
    const body = `#${pass},${cmd}&`;
    const href = smsHref(phone, body);
    window.location.href = href;
  }

  // Bind command buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      openSMS(btn.getAttribute('data-action'));
    });
  });

  // Setting action: cai so dt
  btnCaiSo.addEventListener('click', () => {
    const { phone, pass } = loadCfg();
    if (!phone || !pass) {
      alert('Hãy cài đặt số điện thoại và mật khẩu trước.');
      return;
    }
    const body = `#${pass},caisodt&`;
    const href = smsHref(phone, body);
    window.location.href = href;
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(console.error);
    });
  }
})();
