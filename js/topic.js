// Builds the program cards on a topic page from the <script class="program-src"> blocks,
// and wires up the Copy buttons and the search box.
// A program can have one code block, or several (one per file, each with a data-file name).
(function () {
  var slug = document.body.getAttribute('data-slug');
  var list = document.getElementById('programList');
  var search = document.getElementById('search');
  var resultCount = document.getElementById('resultCount');
  var noMatch = document.getElementById('noMatch');
  var sources = Array.prototype.slice.call(document.querySelectorAll('script.program-src'));

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem('java_progress') || '{}'); }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem('java_progress', JSON.stringify(p)); } catch (e) {}
  }
  function markDone(num) {
    var p = loadProgress();
    var arr = p[slug] || [];
    if (arr.indexOf(String(num)) === -1) { arr.push(String(num)); }
    p[slug] = arr;
    saveProgress(p);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  // Group the code blocks by program number (keeps the order they appear in).
  var groups = [];
  var byNum = {};
  sources.forEach(function (src) {
    var num = src.getAttribute('data-num');
    if (!byNum[num]) {
      byNum[num] = {
        num: num,
        title: src.getAttribute('data-title'),
        note: src.getAttribute('data-note') || '',
        files: []
      };
      groups.push(byNum[num]);
    }
    byNum[num].files.push({ name: src.getAttribute('data-file') || '', code: src.textContent });
  });

  var done = loadProgress()[slug] || [];
  var cards = [];

  function makeCopyButton(art, num, code, codeEl, label) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', label);
    var timer;
    btn.addEventListener('click', function () {
      copyText(code).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('ok');
        art.classList.add('copied-before');
        markDone(num);
      }, function () {
        btn.textContent = 'Press Ctrl+C';
        var range = document.createRange();
        range.selectNodeContents(codeEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.textContent = 'Copy';
        btn.classList.remove('ok');
      }, 1800);
    });
    return btn;
  }

  groups.forEach(function (g) {
    var multi = g.files.length > 1;

    var art = document.createElement('article');
    art.className = 'program';
    art.id = 'p' + g.num;

    var head = document.createElement('div');
    head.className = 'program-head';

    var badge = document.createElement('span');
    badge.className = 'num';
    badge.textContent = g.num;

    var h2 = document.createElement('h2');
    h2.textContent = g.title;

    head.appendChild(badge);
    head.appendChild(h2);
    art.appendChild(head);

    if (g.note) {
      var note = document.createElement('p');
      note.className = 'note';
      note.textContent = g.note;
      art.appendChild(note);
    }

    g.files.forEach(function (f, idx) {
      var pre = document.createElement('pre');
      var codeEl = document.createElement('code');
      codeEl.textContent = f.code;
      pre.appendChild(codeEl);

      if (f.name) {
        var bar = document.createElement('div');
        bar.className = 'file-bar';
        var nm = document.createElement('span');
        nm.className = 'fname';
        nm.textContent = f.name;
        bar.appendChild(nm);
        if (multi) {
          bar.appendChild(makeCopyButton(art, g.num, f.code, codeEl,
            'Copy ' + f.name + ' for program ' + g.num));
        }
        art.appendChild(bar);
      }

      // Single-file programs keep the Copy button in the program header.
      if (!multi && idx === 0) {
        head.appendChild(makeCopyButton(art, g.num, f.code, codeEl, 'Copy code for program ' + g.num));
      }

      art.appendChild(pre);
    });

    list.appendChild(art);

    if (done.indexOf(String(g.num)) !== -1) { art.classList.add('copied-before'); }

    cards.push({ el: art, text: (g.num + ' ' + g.title).toLowerCase() });
  });

  function applyFilter() {
    var q = search.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var match = !q || c.text.indexOf(q) !== -1;
      c.el.hidden = !match;
      if (match) { shown++; }
    });
    resultCount.textContent = shown + ' of ' + cards.length + ' programs';
    noMatch.hidden = shown !== 0;
  }

  search.addEventListener('input', applyFilter);
  applyFilter();
})();
