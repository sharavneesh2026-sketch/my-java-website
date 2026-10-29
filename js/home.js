// Builds the topic cards on the home page from window.TOPICS (see topics.js).
// Progress is stored in this browser only: { "<slug>": ["<programId>", ...] }.
(function () {
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem('java_progress') || '{}'); }
    catch (e) { return {}; }
  }

  var progress = loadProgress();
  var grid = document.getElementById('topicGrid');
  var chevron =
    '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="9 5 16 12 9 19"></polyline></svg>';

  window.TOPICS.forEach(function (t) {
    var done = (progress[t.slug] || []).length;
    var pct = t.count > 0 ? Math.min(100, Math.round((done / t.count) * 100)) : 0;

    var countText = t.count > 0 ? t.count + ' practice problems' : 'Programs coming soon';
    var statusText = 'Not started';
    var active = false;
    if (t.count > 0 && done > 0 && done < t.count) { statusText = done + ' of ' + t.count + ' done'; active = true; }
    if (t.count > 0 && done >= t.count) { statusText = 'Completed'; active = true; }

    var a = document.createElement('a');
    a.className = 'card';
    a.href = t.page;
    a.innerHTML =
      '<div class="card-top"><h2></h2>' + chevron + '</div>' +
      '<div class="count"></div>';

    a.querySelector('h2').textContent = t.name;
    a.querySelector('.count').textContent = countText;
    grid.appendChild(a);
  });
})();
