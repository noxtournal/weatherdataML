(function () {
  const D = WEATHER_DATA;

  // ---------- hero console ----------
  document.getElementById('record-span').textContent =
    `${D.date_range[0]} → ${D.date_range[1]}  (${D.n_records.toLocaleString()} days)`;

  const lastActual = D.test_actual_vs_pred[D.test_actual_vs_pred.length - 1];
  document.getElementById('live-reading').textContent =
    `${lastActual.actual.toFixed(1)}°F  —  ${lastActual.date}`;

  // count-up for record count
  const countEl = document.querySelector('[data-count]');
  if (countEl) {
    const target = parseInt(countEl.dataset.count, 10);
    let start = null;
    const dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      countEl.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.getElementById('stat-mae').textContent = D.mae.toFixed(2) + '°F';
  document.getElementById('stat-rmse').textContent = D.rmse.toFixed(2) + '°F';

  // ---------- shared chart styling ----------
  const gridColor = 'rgba(255,255,255,0.06)';
  const tickColor = '#8d8d93';
  Chart.defaults.font.family = "'Space Mono', monospace";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = tickColor;

  // ---------- feature importance chart ----------
  const impCtx = document.getElementById('importance-chart');
  const impSorted = [...D.feature_importance].sort((a, b) => a.value - b.value);
  new Chart(impCtx, {
    type: 'bar',
    data: {
      labels: impSorted.map(f => f.name),
      datasets: [{
        data: impSorted.map(f => f.value),
        backgroundColor: impSorted.map((f, i) =>
          i >= impSorted.length - 2 ? '#e2593f' : 'rgba(91,155,217,0.55)'),
        borderRadius: 2,
        barThickness: 16
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `importance: ${(ctx.raw * 100).toFixed(1)}%`
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { callback: v => (v * 100).toFixed(0) + '%' } },
        y: { grid: { display: false } }
      }
    }
  });

  // ---------- backtest chart (actual vs predicted) ----------
  // thin to keep it legible — every 4th day
  const thinned = D.test_actual_vs_pred.filter((_, i) => i % 4 === 0);
  const backCtx = document.getElementById('backtest-chart');
  new Chart(backCtx, {
    type: 'line',
    data: {
      labels: thinned.map(d => d.date),
      datasets: [
        {
          label: 'Actual',
          data: thinned.map(d => d.actual),
          borderColor: '#5b9bd9',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.15
        },
        {
          label: 'Predicted',
          data: thinned.map(d => d.predicted),
          borderColor: '#e2593f',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.15
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 8, autoSkip: true }
        },
        y: {
          grid: { color: gridColor },
          ticks: { callback: v => v + '°' }
        }
      }
    }
  });

  // ---------- date explorer ----------
  // build a unified lookup: date -> { predicted, actual|null }
  const lookup = new Map();
  D.test_actual_vs_pred.forEach(d => lookup.set(d.date, { predicted: d.predicted, actual: d.actual }));
  D.future_forecast.forEach(d => {
    if (!lookup.has(d.date)) lookup.set(d.date, { predicted: d.temp, actual: null });
  });

  const allDates = Array.from(lookup.keys()).sort();
  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];

  const picker = document.getElementById('date-picker');
  const slider = document.getElementById('date-slider');
  const badge = document.getElementById('readout-badge');
  const tempEl = document.getElementById('readout-temp');
  const actualWrap = document.getElementById('readout-actual-wrap');
  const actualEl = document.getElementById('readout-actual');
  const deltaEl = document.getElementById('readout-delta');

  picker.min = minDate;
  picker.max = maxDate;
  slider.min = 0;
  slider.max = allDates.length - 1;

  function nearestDate(target) {
    if (lookup.has(target)) return target;
    // find closest available date
    let best = allDates[0], bestDiff = Infinity;
    const t = new Date(target).getTime();
    for (const d of allDates) {
      const diff = Math.abs(new Date(d).getTime() - t);
      if (diff < bestDiff) { bestDiff = diff; best = d; }
    }
    return best;
  }

  function render(dateStr) {
    const resolved = nearestDate(dateStr);
    const entry = lookup.get(resolved);
    const idx = allDates.indexOf(resolved);

    picker.value = resolved;
    slider.value = idx;

    tempEl.textContent = entry.predicted.toFixed(1) + '°F';

    if (entry.actual !== null && entry.actual !== undefined) {
      badge.textContent = 'backtested';
      badge.className = 'backtest';
      actualWrap.style.display = 'flex';
      actualEl.textContent = entry.actual.toFixed(1) + '°F';
      const delta = entry.predicted - entry.actual;
      deltaEl.textContent = `off by ${Math.abs(delta).toFixed(1)}°F ${delta >= 0 ? '(over)' : '(under)'}`;
    } else {
      badge.textContent = 'forward forecast';
      badge.className = 'forecast';
      actualWrap.style.display = 'flex';
      actualEl.textContent = 'no record yet';
      deltaEl.textContent = '';
    }
  }

  picker.addEventListener('change', () => render(picker.value));
  slider.addEventListener('input', () => render(allDates[parseInt(slider.value, 10)]));

  render(nearestDate('2025-07-04'));

})();
