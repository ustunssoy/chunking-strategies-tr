/* ═══════════════════════════════════════════
   Chunking Strategies – Interactive Logic
   ═══════════════════════════════════════════ */

// ──── Experiment Data ────
const METHODS = ['Sabit Boyutlu', 'Recursive', 'Semantik'];
const CHUNK_SIZES = [128, 256, 512, 1024];
const OVERLAPS = [0, 0.05, 0.10, 0.20];

// Simulated Recall@5 results (method × chunk × overlap)
// Tuned so best = recursive 512 / 10% → 0.82, fixed best → 0.74
const RESULTS = {
  'Sabit Boyutlu': {
    128: { 0: 0.58, 0.05: 0.60, 0.10: 0.62, 0.20: 0.61 },
    256: { 0: 0.64, 0.05: 0.66, 0.10: 0.69, 0.20: 0.68 },
    512: { 0: 0.68, 0.05: 0.71, 0.10: 0.74, 0.20: 0.72 },
    1024:{ 0: 0.63, 0.05: 0.65, 0.10: 0.67, 0.20: 0.65 },
  },
  'Recursive': {
    128: { 0: 0.62, 0.05: 0.65, 0.10: 0.67, 0.20: 0.66 },
    256: { 0: 0.70, 0.05: 0.73, 0.10: 0.76, 0.20: 0.74 },
    512: { 0: 0.74, 0.05: 0.78, 0.10: 0.82, 0.20: 0.79 },
    1024:{ 0: 0.69, 0.05: 0.72, 0.10: 0.75, 0.20: 0.73 },
  },
  'Semantik': {
    128: { 0: 0.60, 0.05: 0.63, 0.10: 0.65, 0.20: 0.63 },
    256: { 0: 0.67, 0.05: 0.70, 0.10: 0.73, 0.20: 0.71 },
    512: { 0: 0.72, 0.05: 0.75, 0.10: 0.78, 0.20: 0.76 },
    1024:{ 0: 0.66, 0.05: 0.69, 0.10: 0.72, 0.20: 0.70 },
  },
};

// ──── KPI Counter Animation ────
function animateCounters() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals);
    const isPct = el.classList.contains('kpi-value-pct');
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const val = (target * ease).toFixed(decimals);
      el.textContent = isPct ? `+${val}%` : val;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ──── Bar Chart Animation ────
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const w = bar.dataset.width;
    bar.style.setProperty('--bar-w', w + '%');
    setTimeout(() => bar.classList.add('animated'), 100);
  });
}

// ──── Heatmap ────
function buildHeatmap() {
  const container = document.getElementById('heatmap');
  container.innerHTML = '';

  // Color scale
  function getColor(val) {
    const min = 0.55, max = 0.82;
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    if (t < 0.33) return `rgba(239,68,68,${0.15 + t})`;
    if (t < 0.66) return `rgba(245,158,11,${0.15 + t * 0.6})`;
    return `rgba(34,197,94,${0.15 + t * 0.6})`;
  }
  function getTextColor(val) {
    const min = 0.55, max = 0.82;
    const t = (val - min) / (max - min);
    if (t < 0.33) return '#fca5a5';
    if (t < 0.66) return '#fcd34d';
    return '#86efac';
  }

  // Header row
  container.appendChild(createDiv('heatmap-header', ''));
  CHUNK_SIZES.forEach(s => {
    container.appendChild(createDiv('heatmap-header', s + ' tok'));
  });

  // Data rows – group by method+overlap
  METHODS.forEach(method => {
    OVERLAPS.forEach(ov => {
      container.appendChild(createDiv('heatmap-label', `${method.slice(0, 3)} %${Math.round(ov * 100)}`));
      CHUNK_SIZES.forEach(cs => {
        const val = RESULTS[method][cs][ov];
        const cell = createDiv('heatmap-cell', val.toFixed(2));
        cell.style.background = getColor(val);
        cell.style.color = getTextColor(val);
        if (val === 0.82) {
          cell.style.outline = '2px solid var(--green)';
          cell.style.outlineOffset = '-2px';
        }
        container.appendChild(cell);
      });
    });
  });
}

function createDiv(cls, text) {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text;
  return d;
}

// ──── Experiment Table ────
function buildTable() {
  const tbody = document.querySelector('#experiment-table tbody');
  let idx = 1;
  const rows = [];

  METHODS.forEach(method => {
    CHUNK_SIZES.forEach(cs => {
      OVERLAPS.forEach(ov => {
        const val = RESULTS[method][cs][ov];
        rows.push({ idx: idx++, method, cs, ov, val });
      });
    });
  });

  // Sort descending
  rows.sort((a, b) => b.val - a.val);

  rows.forEach((r, i) => {
    const tr = document.createElement('tr');
    const pillClass = r.val >= 0.78 ? 'pill-best' : r.val >= 0.70 ? 'pill-good' : 'pill-avg';
    const pillText = r.val >= 0.78 ? '● Yüksek' : r.val >= 0.70 ? '● İyi' : '● Orta';
    const barPct = ((r.val / 0.82) * 100).toFixed(0);
    const barColor = r.val >= 0.78 ? 'var(--green)' : r.val >= 0.70 ? 'var(--blue)' : 'var(--text2)';

    tr.innerHTML = `
      <td style="color:var(--text2);font-family:var(--mono);font-size:.75rem">${i + 1}</td>
      <td><strong>${r.method}</strong></td>
      <td style="font-family:var(--mono)">${r.cs}</td>
      <td style="font-family:var(--mono)">%${Math.round(r.ov * 100)}</td>
      <td>
        <div class="recall-bar">
          <div class="recall-bar-fill"><span style="width:${barPct}%;background:${barColor}"></span></div>
          ${r.val.toFixed(2)}
        </div>
      </td>
      <td><span class="pill ${pillClass}">${pillText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ──── Chart Tab Switching ────
document.querySelectorAll('.chart-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.chart-view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('view-' + tab.dataset.view).classList.add('active');
  });
});

// ──── Intersection Observer ────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      if (e.target.classList.contains('kpi-section')) animateCounters();
      if (e.target.classList.contains('results-section')) animateBars();
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.kpi-section,.methods-section,.results-section,.experiments-section').forEach(s => {
  observer.observe(s);
});

// ──── Init ────
buildHeatmap();
buildTable();
