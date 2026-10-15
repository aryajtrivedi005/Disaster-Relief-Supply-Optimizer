/**
 * Disaster Relief Supply Optimizer - Minimalist Visualizer Engine
 * Clean, concise visualizations for:
 * 1. Knapsack DP Table & Backtracking Path
 * 2. Fractional Greedy Density Manifest
 * 3. Priority Queue Binary Heap SVG & Synchronized Array
 * 4. Relief Convoy Gantt Timeline
 * 5. Big-O Benchmark Canvas Chart
 */

export class DAAVisualizer {
  constructor() {
    this.animationTimer = null;
    this.isPlaying = false;
  }

  // ==========================================================================
  // 1. KNAPSACK DP TABLE
  // ==========================================================================

  renderDPTable(containerId, result01, activeStep = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { dpTable, items, capacity, selectedItems } = result01;
    const n = items.length;
    const W = capacity;

    const optimalCellKeys = new Set();
    let currW = W;
    for (let i = n; i > 0 && currW > 0; i--) {
      if (dpTable[i][currW] !== dpTable[i - 1][currW]) {
        optimalCellKeys.add(`${i},${currW}`);
        currW -= Math.floor(items[i - 1].weight);
      }
    }

    let html = `
      <div class="overflow-x-auto max-h-[460px] relative border border-slate-200 rounded-md bg-white">
        <table class="w-full text-xs text-left border-collapse font-mono" id="dpTableElement">
          <thead class="sticky top-0 bg-slate-50 z-20 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="p-2 border-r border-slate-200 text-center font-bold">i \\ w</th>
              <th class="p-2 border-r border-slate-200 min-w-[120px] font-sans font-bold">Item Added</th>
              <th class="p-2 border-r border-slate-200 text-center font-bold">Wt</th>
              <th class="p-2 border-r border-slate-200 text-center font-bold">Val</th>
    `;

    for (let w = 0; w <= W; w++) {
      html += `<th class="p-1.5 text-center border-r border-slate-200 min-w-[38px] ${w === W ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600'}">${w}k</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i <= n; i++) {
      const item = i > 0 ? items[i - 1] : null;
      const isSelected = item && selectedItems.some(it => it.id === item.id);
      const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

      html += `
        <tr class="border-b border-slate-200/80 ${rowBg}">
          <td class="p-1.5 text-center font-bold border-r border-slate-200 bg-slate-100/60 text-slate-800">${i}</td>
          <td class="p-1.5 border-r border-slate-200 font-sans truncate max-w-[130px] ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-700'}">
            ${item ? item.name : '<span class="text-slate-400 italic">Base [0]</span>'}
          </td>
          <td class="p-1.5 text-center border-r border-slate-200 text-slate-600">${item ? item.weight : '-'}</td>
          <td class="p-1.5 text-center border-r border-slate-200 text-slate-600">${item ? item.value : '-'}</td>
      `;

      for (let w = 0; w <= W; w++) {
        const val = dpTable[i][w];
        const isOptimal = optimalCellKeys.has(`${i},${w}`);
        const isCurrentActive = activeStep && activeStep.itemIndex === i && activeStep.capacityCol === w;

        let cellClasses = 'p-1.5 text-center border-r border-slate-200 select-none ';
        if (isCurrentActive) {
          cellClasses += 'bg-amber-100 text-amber-950 font-bold ring-2 ring-amber-400 scale-105 z-10';
        } else if (isOptimal) {
          cellClasses += 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300';
        } else if (val > 0) {
          cellClasses += 'text-slate-800';
        } else {
          cellClasses += 'text-slate-300';
        }

        html += `
          <td class="${cellClasses}" 
              data-row="${i}" 
              data-col="${w}" 
              data-val="${val}">
            ${val}
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += `</tbody></table></div>`;

    // Compact single-line formula display without hover prompt
    html += `
      <div id="dpEquationInspector" class="mt-2.5 p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 font-mono">
          <span class="text-slate-500 font-sans font-semibold">Formula:</span>
          <code class="text-blue-700 font-bold">dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i)</code>
        </div>
        <div class="text-slate-500 font-mono text-[11px]" id="dpInspectionDetails">
          Recurrence Matrix Solution
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // ==========================================================================
  // 2. FRACTIONAL KNAPSACK MANIFEST
  // ==========================================================================

  renderFractionalManifest(containerId, fractionalResult) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { takenItems, sortedItems, capacity, totalWeight, maxVal } = fractionalResult;

    let html = `
      <div class="space-y-3">
        <!-- Hold Bar -->
        <div class="p-3 rounded-md border border-slate-200 bg-white">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
            <span>Cargo Volume Utilization</span>
            <span class="font-mono text-blue-700 font-bold">${totalWeight} / ${capacity} kg (${Math.round((totalWeight / capacity) * 100)}%)</span>
          </div>
          <div class="h-6 w-full bg-slate-100 rounded-md overflow-hidden flex border border-slate-200">
    `;

    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500'];

    takenItems.forEach((item, idx) => {
      const widthPct = (item.weightTaken / capacity) * 100;
      const color = colors[idx % colors.length];
      html += `
        <div class="${color} h-full flex items-center justify-center text-[10px] font-bold text-white px-1 truncate"
             style="width: ${widthPct}%"
             title="${item.name}: ${item.weightTaken}kg (${item.percentage}%)">
          ${widthPct > 8 ? `${item.percentage}%` : ''}
        </div>
      `;
    });

    const unfilledPct = ((capacity - totalWeight) / capacity) * 100;
    if (unfilledPct > 0) {
      html += `<div class="bg-slate-100 h-full text-[10px] text-slate-400 flex items-center justify-center font-mono" style="width: ${unfilledPct}%">Empty</div>`;
    }

    html += `
          </div>
        </div>

        <!-- Sorted Items Table -->
        <div class="border border-slate-200 rounded-md overflow-hidden bg-white">
          <table class="w-full text-xs text-left border-collapse table-minimal">
            <thead>
              <tr>
                <th class="w-12 text-center">Rank</th>
                <th>Item Description</th>
                <th class="text-center">Weight</th>
                <th class="text-center">Value</th>
                <th class="text-center">Density (v/w)</th>
                <th class="text-right">Allocation</th>
              </tr>
            </thead>
            <tbody>
    `;

    sortedItems.forEach((item, idx) => {
      const taken = takenItems.find(t => t.id === item.id);
      const isTaken = taken && taken.percentage > 0;
      const isPartial = taken && taken.percentage < 100 && taken.percentage > 0;

      html += `
        <tr>
          <td class="text-center font-mono font-bold text-slate-500">#${idx + 1}</td>
          <td class="font-semibold text-slate-900">${item.name}</td>
          <td class="text-center font-mono text-slate-600">${item.weight} kg</td>
          <td class="text-center font-mono text-slate-600">${item.value} pts</td>
          <td class="text-center font-mono font-bold text-blue-700">${item.ratio} pts/kg</td>
          <td class="text-right">
            ${isPartial ? `
              <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-semibold text-[10px]">
                ${taken.percentage}% (${taken.weightTaken}kg)
              </span>
            ` : isTaken ? `
              <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold text-[10px]">
                100% (${item.weight}kg)
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">
                0% (Full)
              </span>
            `}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div></div>`;
    container.innerHTML = html;
  }

  // ==========================================================================
  // 3. PRIORITY QUEUE HEAP VISUALIZER
  // ==========================================================================

  renderHeapVisualizer(svgContainerId, arrayContainerId, pq, highlightInfo = null) {
    const svgElem = document.getElementById(svgContainerId);
    const arrayElem = document.getElementById(arrayContainerId);
    if (!svgElem || !arrayElem) return;

    const width = 800;
    const height = 340;
    svgElem.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgElem.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const { nodes, links } = pq.getTreeLayout(width, height);

    let svgContent = `
      <defs>
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.08" />
        </filter>
      </defs>
    `;

    if (nodes.length === 0) {
      svgContent += `
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="13">
          Heap is empty. Incoming disaster calls will render here.
        </text>
      `;
      svgElem.innerHTML = svgContent;
      arrayElem.innerHTML = `<div class="p-3 text-center text-xs text-slate-400 italic">No triage calls currently queued.</div>`;
      return;
    }

    // Connector edges
    links.forEach(link => {
      const s = nodes.find(n => n.index === link.source);
      const t = nodes.find(n => n.index === link.target);
      if (s && t) {
        svgContent += `
          <line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" />
        `;
      }
    });

    // Nodes
    nodes.forEach(node => {
      const isRoot = node.index === 0;
      const data = node.data;
      const isHighlighted = highlightInfo && (highlightInfo.activeIndex === node.index || highlightInfo.swappedWith === node.index);
      const isSwapping = highlightInfo && highlightInfo.action === 'swap' && (highlightInfo.activeIndex === node.index || highlightInfo.swappedWith === node.index);

      let strokeColor = '#2563eb';
      if (data.severity === 'Critical' || data.urgencyScore >= 90) strokeColor = '#e11d48';
      else if (data.severity === 'High' || data.urgencyScore >= 75) strokeColor = '#d97706';
      else if (data.severity === 'Medium' || data.urgencyScore >= 50) strokeColor = '#2563eb';
      else strokeColor = '#059669';

      const circleFill = isSwapping ? '#fef3c7' : isHighlighted ? '#eff6ff' : '#ffffff';
      const radius = 22;

      svgContent += `
        <g class="cursor-pointer" data-node-idx="${node.index}">
          ${(isRoot || isHighlighted) ? `
            <circle cx="${node.x}" cy="${node.y}" r="${radius + 5}" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,2" />
          ` : ''}

          <circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${circleFill}" stroke="${strokeColor}" stroke-width="2.5" filter="url(#nodeShadow)" />

          <text x="${node.x}" y="${node.y + 4}" text-anchor="middle" fill="#0f172a" font-family="monospace" font-weight="700" font-size="12">
            ${pq.type === 'max' ? data.urgencyScore : `${data.deadlineMin}m`}
          </text>

          <circle cx="${node.x + 16}" cy="${node.y - 16}" r="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
          <text x="${node.x + 16}" y="${node.y - 13}" text-anchor="middle" fill="#64748b" font-size="8.5" font-family="monospace" font-weight="bold">
            ${node.index}
          </text>

          <rect x="${node.x - 50}" y="${node.y + radius + 4}" width="100" height="17" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
          <text x="${node.x}" y="${node.y + radius + 15}" text-anchor="middle" fill="#1e293b" font-family="sans-serif" font-size="9" font-weight="600">
            ${data.location.length > 15 ? data.location.slice(0, 14) + '…' : data.location}
          </text>
        </g>
      `;
    });

    svgElem.innerHTML = svgContent;

    // Synchronized Array Representation
    let arrayHtml = `<div class="overflow-x-auto pb-1"><div class="flex items-center gap-1.5 min-w-max">`;

    pq.heap.forEach((item, idx) => {
      const isRoot = idx === 0;
      const isHighlighted = highlightInfo && (highlightInfo.activeIndex === idx || highlightInfo.swappedWith === idx);
      const parentIdx = Math.floor((idx - 1) / 2);

      let borderStyle = 'border-slate-200 bg-white text-slate-800';
      if (isHighlighted) borderStyle = 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-300';
      else if (isRoot) borderStyle = 'border-rose-300 bg-rose-50 text-rose-950 font-semibold';

      arrayHtml += `
        <div class="flex flex-col items-center">
          <div class="w-18 p-1.5 rounded-md border ${borderStyle} text-center relative shadow-sm">
            <span class="text-[9px] font-mono text-slate-400 block font-bold">[${idx}]</span>
            <div class="text-xs font-bold font-mono mt-0.5 ${item.urgencyScore >= 90 ? 'text-rose-600' : 'text-blue-700'}">
              ${pq.type === 'max' ? `${item.urgencyScore}p` : `${item.deadlineMin}m`}
            </div>
            <div class="text-[9.5px] truncate text-slate-600 mt-0.5 max-w-[70px]" title="${item.location}">
              ${item.location}
            </div>
          </div>
          <div class="text-[8.5px] font-mono text-slate-400 mt-0.5">
            ${idx > 0 ? `P:${parentIdx}` : 'ROOT'}
          </div>
        </div>
      `;
    });

    arrayHtml += `</div></div>`;
    arrayElem.innerHTML = arrayHtml;
  }

  // ==========================================================================
  // 4. GREEDY GANTT TIMELINE
  // ==========================================================================

  renderIntervalGantt(containerId, schedulingResult, minHour = 5, maxHour = 21) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { sortedMissions, selected, rejected } = schedulingResult;
    const totalHours = maxHour - minHour;

    let html = `
      <div class="space-y-3">
        <!-- Time Axis -->
        <div class="relative pt-4 pb-2 border-b border-slate-200">
          <div class="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
    `;

    for (let h = minHour; h <= maxHour; h += 2) {
      const fh = h < 10 ? `0${h}:00` : `${h}:00`;
      html += `<span>${fh}</span>`;
    }

    html += `</div></div>`;

    // Horizontal Track Bars
    html += `<div class="space-y-2 max-h-[360px] overflow-y-auto pr-1">`;

    sortedMissions.forEach((mission, idx) => {
      const isSelected = selected.some(s => s.id === mission.id);
      const rejectedItem = rejected.find(r => r.id === mission.id);

      const leftPct = Math.max(0, ((mission.start - minHour) / totalHours) * 100);
      const widthPct = Math.min(100 - leftPct, ((mission.end - mission.start) / totalHours) * 100);

      let barClasses = 'h-8 rounded-md flex items-center justify-between px-2.5 text-xs font-semibold shadow-sm ';
      if (isSelected) {
        barClasses += 'bg-emerald-600 text-white';
      } else {
        barClasses += 'bg-rose-50 text-rose-700 border border-rose-300 opacity-80 line-through';
      }

      html += `
        <div class="relative h-9 flex items-center">
          <div class="absolute inset-y-0 flex items-center text-[10px] text-slate-400 font-mono left-0.5">
            #${idx + 1}
          </div>
          <div class="absolute" style="left: ${leftPct}%; width: ${widthPct}%; min-width: 70px;">
            <div class="${barClasses}" title="${mission.name} (${mission.start}:00-${mission.end}:00) | ${isSelected ? 'ACCEPTED' : 'CONFLICT'}">
              <span class="truncate font-sans text-[11px]">${mission.name}</span>
              <span class="font-mono text-[9.5px] ml-1 flex-shrink-0">${isSelected ? '✓ DISPATCH' : '✕ CLASH'}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  }

  // ==========================================================================
  // 5. CANVAS BENCHMARK CHART
  // ==========================================================================

  renderBenchmarkChart(canvasId, benchmarkData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 320;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 25, bottom: 40, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allTimes = [
      ...benchmarkData.knapsack01.map(d => d.timeMs),
      ...benchmarkData.knapsackFractional.map(d => d.timeMs),
      ...benchmarkData.heapOperations.map(d => d.timeMs),
      ...benchmarkData.greedyScheduling.map(d => d.timeMs)
    ];
    const maxTime = Math.max(...allTimes, 1.0) * 1.15;
    const sizes = benchmarkData.knapsackFractional.map(d => d.n);

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = (maxTime * (1 - i / 4)).toFixed(2);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${val}ms`, 8, y + 3);
    }

    sizes.forEach((n, idx) => {
      const x = padding.left + (chartW / (sizes.length - 1)) * idx;
      ctx.fillText(`N=${n}`, x - 12, height - 12);
    });

    const plot = (data, color) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((pt, idx) => {
        const x = padding.left + (chartW / (sizes.length - 1)) * idx;
        const y = padding.top + chartH - (pt.timeMs / maxTime) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      data.forEach((pt, idx) => {
        const x = padding.left + (chartW / (sizes.length - 1)) * idx;
        const y = padding.top + chartH - (pt.timeMs / maxTime) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    plot(benchmarkData.knapsack01, '#d97706');
    plot(benchmarkData.knapsackFractional, '#2563eb');
    plot(benchmarkData.heapOperations, '#e11d48');
    plot(benchmarkData.greedyScheduling, '#059669');
  }
}

export const visualizer = new DAAVisualizer();
