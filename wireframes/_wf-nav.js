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
      { name: 'Онбординг — Додай СЕБЕ', file: 'onboarding-self.html', exists: false }
    ] },
    { section: 'ДОМІВКА', screens: [
      { name: 'Дашборд профілю', file: 'dashboard.html', exists: true, states: [
        { name: 'Порожній (холодний старт)', file: 'dashboard-empty.html', exists: true }
      ] }
    ] },
    { section: 'ПІД ПРОФІЛЕМ · Документи', screens: [
      { name: 'Додати документ', file: 'add-document.html', exists: false, states: [
        { name: 'Помилка сховища', file: 'add-document-error.html', exists: false }
      ] },
      { name: 'Документ — перегляд', file: 'document.html', exists: false, states: [
        { name: 'Завантаження (синк)', file: 'document-loading.html', exists: false }
      ] }
    ] },
    { section: 'НАСКРІЗНЕ', screens: [
      // ➕-вибір типу — overlay поверх Дашборда (§7), не окремий роут → не лінкуємо
      { name: 'Швидке додавання — вибір типу', overlay: true }
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
    title.textContent = 'Вайрфрейми · R1 «Додати документ»';
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

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('wfnav-tree');
    if (mount) render(mount);
  });
})();
