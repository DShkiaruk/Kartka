/* _wf-nav.js — РИШТУВАННЯ навігації між екранами вайрфреймів (НЕ продукт Kartka).
   Дерево: розділ → екран → його РЕАЛЬНІ стани, з відступом (вкладеність).

   Стани беруться СТРОГО зі _screens.md (матриця екран × стан) — лише ті, що мають ✓:
     • Дашборд профілю   → Порожній
     • Додати документ   → Помилка
     • Документ-перегляд → Завантаження
   Де в матриці «—» — гілки-стану НЕМАЄ (не плодимо неіснуючих сторінок).
   Розділи/екрани — зі sitemap.md, нічого не вигадано.

   Файли за конвенцією §6: <назва>.html / <назва>-<стан>.html.
   exists:false — сторінки ще нема → показуємо disabled («ще нема»), не ведемо на 404.
   Активний вузол — за іменем файлу поточної сторінки.
   Скоуп дерева поки — R1 «Додати документ» (єдиний опрацьований flow у _screens.md). */

(function () {
  var TREE = [
    { section: 'ВХІД / ОНБОРДИНГ', screens: [
      { name: 'Онбординг — Додай СЕБЕ', file: 'onboarding.html', exists: true }
    ] },
    { section: 'ДОМІВКА', screens: [
      { name: 'Дашборд профілю', file: 'dashboard.html', exists: true, states: [
        { name: 'Порожній (холодний старт)', file: 'dashboard-empty.html', exists: true }
      ] }
    ] },
    { section: 'ПІД ПРОФІЛЕМ · Документи', screens: [
      { name: 'Додати документ', file: 'add-document.html', exists: true, states: [
        { name: 'Помилка сховища', file: 'add-document-error.html', exists: true }
      ] },
      { name: 'Документ — перегляд', file: 'document-view.html', exists: true, states: [
        { name: 'Завантаження (синк)', file: 'document-view-loading.html', exists: true },
        { name: 'Дозаповнити тип (overlay §7, under-flow)', file: 'document-edit-type.html', exists: true }
      ] }
    ] },
    { section: 'ПІД ПРОФІЛЕМ · Ліки (R3)', screens: [
      { name: 'Ліки — список', file: 'medications.html', exists: true, states: [
        { name: 'Порожній (нема ліків)', file: 'medications-empty.html', exists: true },
        { name: 'Завантаження (спільний патерн)', file: 'medications-loading.html', exists: true },
        { name: 'Помилка завантаження (спільний)', file: 'medications-error.html', exists: true }
      ] },
      { name: 'Додати / редагувати ліки', file: 'medication-add.html', exists: true, states: [
        { name: 'Помилка збереження', file: 'medication-add-error.html', exists: true },
        { name: 'Розклад — пікер типу (інтерактивний)', file: 'medication-schedule.html', exists: true }
      ] },
      { name: 'Ліки — деталь (+ журнал)', file: 'medication-detail.html', exists: true, states: [
        { name: 'Журнал порожній', file: 'medication-detail-empty.html', exists: true }
      ] }
    ] },
    { section: 'ПРОЄКЦІЇ · R2', screens: [
      { name: 'Анамнез-PDF — перегляд', file: 'anamnesis.html', exists: true, states: [
        { name: 'Генерація', file: 'anamnesis-loading.html', exists: true },
        { name: 'Помилка генерації', file: 'anamnesis-error.html', exists: true },
        { name: 'Неповна картина', file: 'anamnesis-incomplete.html', exists: true },
        { name: 'Офлайн без кешу', file: 'anamnesis-offline.html', exists: true },
        { name: 'Обсяг/мова (overlay §7, under-flow)', file: 'anamnesis-config.html', exists: true }
      ] }
    ] },
    { section: 'ПРОЄКЦІЇ · R5', screens: [
      { name: 'Екстрена картка — перегляд', file: 'emergency-card.html', exists: true, states: [
        { name: 'Порожня (deadempty)', file: 'emergency-card-deadempty.html', exists: true }
      ] },
      { name: 'Базова картка — редагування', file: 'edit-base-card.html', exists: true }
    ] },
    { section: 'НАСКРІЗНЕ', screens: [
      // ➕-вибір типу — overlay поверх Дашборда (§7); окрема сторінка лише як референс структури
      { name: 'Швидке додавання (overlay §7)', file: 'quick-add.html', exists: true }
    ] }
  ];

  var here = (location.pathname.split('/').pop() || '').toLowerCase();

  function makeLi(item, level) {
    var li = document.createElement('li');
    li.className = 'lvl-' + level;
    var el;
    if (item.overlay) {
      el = document.createElement('span');
      el.className = 'wfnav-overlay';
      el.textContent = item.name + ' — overlay (§7)';
    } else if (item.exists) {
      el = document.createElement('a');
      el.href = item.file;
      el.textContent = item.name;
      if (item.file.toLowerCase() === here) el.className = 'active';
    } else {
      el = document.createElement('span');
      el.className = 'wfnav-planned';
      el.textContent = item.name;
    }
    li.appendChild(el);
    return li;
  }

  function render(mount) {
    var title = document.createElement('div');
    title.className = 'wfnav-title';
    title.textContent = 'Вайрфрейми · MVP (R1·R2·R5) + R3';
    mount.appendChild(title);

    TREE.forEach(function (sec) {
      var sh = document.createElement('div');
      sh.className = 'wfnav-section';
      sh.textContent = sec.section;
      mount.appendChild(sh);

      var ul = document.createElement('ul');
      sec.screens.forEach(function (scr) {
        ul.appendChild(makeLi(scr, 'screen'));
        (scr.states || []).forEach(function (st) {
          ul.appendChild(makeLi(st, 'state'));
        });
      });
      mount.appendChild(ul);
    });
  }

  // Перемикач поверхні (Мобілка/Десктоп) — риштування: міняє ШИРИНУ .app-контейнера
  // (не веде на інший файл, не в'юпорт). Десктоп-розкладку вмикає @container у css.
  function mountSurfaceToggle() {
    var stage = document.querySelector('.wfnav-stage');
    if (!stage) return;
    var bar = stage.querySelector('.wfnav-compare');
    if (!bar) {                       // сторінки без compare-bar теж дістають перемикач
      bar = document.createElement('div');
      bar.className = 'wfnav-compare';
      stage.insertBefore(bar, stage.firstChild);
    }
    var wrap = document.createElement('span');
    wrap.className = 'wfnav-surface';
    var lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = 'Поверхня:';
    wrap.appendChild(lbl);

    var mob = document.createElement('button');  mob.type = 'button';  mob.textContent = 'Мобілка';
    var desk = document.createElement('button'); desk.type = 'button'; desk.textContent = 'Десктоп';
    function set(isDesktop) {
      stage.classList.toggle('surface-desktop', isDesktop);
      mob.className = isDesktop ? '' : 'cur';
      desk.className = isDesktop ? 'cur' : '';
    }
    mob.addEventListener('click', function () { set(false); });
    desk.addEventListener('click', function () { set(true); });
    wrap.appendChild(mob);
    wrap.appendChild(desk);
    bar.appendChild(wrap);
    set(false);                       // дефолт — мобілка
  }

  // Обгортає .app у .app-frame — контейнер для @container (сам контейнер не стилізує себе).
  function frameApp() {
    var stage = document.querySelector('.wfnav-stage');
    if (!stage) return;
    var app = stage.querySelector(':scope > .app');
    if (!app || (app.parentElement && app.parentElement.classList.contains('app-frame'))) return;
    var frame = document.createElement('div');
    frame.className = 'app-frame';
    stage.insertBefore(frame, app);
    frame.appendChild(app);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('wfnav-tree');
    if (mount) render(mount);
    frameApp();
    mountSurfaceToggle();
  });
})();
