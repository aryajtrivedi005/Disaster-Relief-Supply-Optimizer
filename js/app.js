/**
 * Disaster Relief Supply Optimizer - Minimalist Application Controller
 * Line-by-line metrics, standardized 40px controls, clean state management.
 */

import { 
  solve01Knapsack, 
  solveFractionalKnapsack, 
  compareKnapsackModels,
  DisasterPriorityQueue, 
  solveGreedyIntervalScheduling,
  runEmpiricalBenchmarks 
} from './algorithms.js';

import { visualizer } from './visualizer.js';
import { sound } from './sound.js';
import { PRESET_SCENARIOS } from './scenarios.js';

class DisasterOptimizerApp {
  constructor() {
    this.currentScenarioId = 'himalayan';
    this.activeTab = 'knapsack';
    this.soundEnabled = true;

    // Module 1: Knapsack State
    this.items = [];
    this.capacity = 35;
    this.knapsackMode = '01'; // '01', 'fractional', 'compare'
    this.result01 = null;
    this.resultFractional = null;
    this.stepIndex = 0;
    this.isPlaying = false;
    this.playTimer = null;
    this.playSpeed = 200; // ms per step

    // Module 2: Priority Queue / Triage State
    this.heapType = 'max'; // 'max' (urgency) or 'min' (deadline)
    this.pq = new DisasterPriorityQueue(this.heapType);
    this.dispatchedCount = 0;
    this.totalCasualtiesRescued = 0;

    // Module 3: Route Greedy Scheduler State
    this.missions = [];
    this.routeStrategy = 'EFT'; // 'EFT', 'EST', 'DURATION'
    this.schedulingResult = null;

    // Module 4: Benchmark State
    this.benchmarkData = null;
  }

  init() {
    this.loadScenario(this.currentScenarioId);
    this.setupEventListeners();
    this.renderActiveTab();
    this.updateGlobalMetrics();
  }

  // ==========================================================================
  // SCENARIO & GLOBAL METRICS
  // ==========================================================================

  loadScenario(scenarioId) {
    const scenario = PRESET_SCENARIOS[scenarioId];
    if (!scenario) return;

    this.currentScenarioId = scenarioId;
    this.items = JSON.parse(JSON.stringify(scenario.items));
    this.capacity = scenario.vehicle.capacity;
    this.missions = JSON.parse(JSON.stringify(scenario.missions));

    // Reset Priority Queue and load scenario distress calls
    this.pq = new DisasterPriorityQueue(this.heapType);
    scenario.distressCalls.forEach(call => {
      this.pq.insert(JSON.parse(JSON.stringify(call)));
    });

    const scenarioNameElem = document.getElementById('currentScenarioName');
    const vehicleBadgeElem = document.getElementById('currentVehicleBadge');

    if (scenarioNameElem) scenarioNameElem.textContent = scenario.name;
    if (vehicleBadgeElem) vehicleBadgeElem.textContent = `${scenario.vehicle.type} (${scenario.vehicle.capacity} ${scenario.vehicle.capacityUnit})`;

    const capSlider = document.getElementById('capacitySlider');
    const capInput = document.getElementById('capacityInput');
    const capDisplay = document.getElementById('capacityValDisplay');

    if (capSlider) capSlider.value = this.capacity;
    if (capInput) capInput.value = this.capacity;
    if (capDisplay) capDisplay.textContent = `${this.capacity} kg`;

    this.recalculateAll();
    sound.alert();
  }

  recalculateAll() {
    this.runKnapsackCalculation();
    this.runRouteCalculation();
    this.renderActiveTab();
    this.updateGlobalMetrics();
  }

  updateGlobalMetrics() {
    const cargoUtilElem = document.getElementById('metricCargoUtil');
    if (cargoUtilElem && this.result01) {
      cargoUtilElem.textContent = `${this.result01.totalWeight} / ${this.capacity} kg`;
    }

    const pendingCallsElem = document.getElementById('metricPendingCalls');
    if (pendingCallsElem) {
      pendingCallsElem.textContent = `${this.pq.size()} Calls`;
    }

    const rescuedElem = document.getElementById('metricRescued');
    if (rescuedElem) {
      rescuedElem.textContent = `${this.dispatchedCount} Teams (${this.totalCasualtiesRescued} Souls)`;
    }

    const missionsElem = document.getElementById('metricActiveMissions');
    if (missionsElem && this.schedulingResult) {
      missionsElem.textContent = `${this.schedulingResult.selectedCount} / ${this.missions.length}`;
    }
  }

  // ==========================================================================
  // MODULE 1: KNAPSACK SOLVER
  // ==========================================================================

  runKnapsackCalculation() {
    this.stopPlayback();
    this.result01 = solve01Knapsack(this.items, this.capacity);
    this.resultFractional = solveFractionalKnapsack(this.items, this.capacity);
    this.stepIndex = this.result01.steps.length - 1;
    this.renderKnapsackModule();
  }

  renderKnapsackModule() {
    // 1. Left Panel: Candidate Pool Mini List
    const miniList = document.getElementById('knapsackMiniItemList');
    const countBadge = document.getElementById('cargoItemsCountBadge');
    if (countBadge) countBadge.textContent = `${this.items.length} items`;

    if (miniList) {
      miniList.innerHTML = this.items.map((item, idx) => {
        const isSelected01 = this.result01?.selectedItems.some(it => it.id === item.id);
        const density = (item.value / item.weight).toFixed(1);

        return `
          <div class="p-2 rounded-md border border-slate-200 bg-white flex items-center justify-between text-xs">
            <div class="truncate">
              <span class="font-semibold text-slate-900">${item.name}</span>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                ${item.weight}kg • ${item.value}pts • <span class="text-blue-700 font-bold">${density} v/w</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              ${isSelected01 ? `
                <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[9.5px] font-bold">
                  0/1
                </span>
              ` : `
                <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-400 font-mono text-[9.5px]">
                  Skip
                </span>
              `}
              <button class="text-slate-400 hover:text-rose-600 p-0.5" onclick="window.app.deleteItem('${item.id}')" title="Delete">
                &times;
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Center Panel: Visualizer Canvas
    if (this.knapsackMode === '01') {
      const activeStep = this.result01.steps[this.stepIndex];
      visualizer.renderDPTable('knapsackVisualizerContainer', this.result01, activeStep);
    } else if (this.knapsackMode === 'fractional') {
      visualizer.renderFractionalManifest('knapsackVisualizerContainer', this.resultFractional);
    } else if (this.knapsackMode === 'compare') {
      this.renderDualComparisonView();
    }

    // 3. Right Panel: Line-by-Line Metrics
    const metricsContainer = document.getElementById('knapsackRightMetricsContainer');
    if (metricsContainer && this.result01 && this.resultFractional) {
      const unusedWeight = this.capacity - this.result01.totalWeight;
      const efficiency = ((this.result01.totalWeight / this.capacity) * 100).toFixed(1);

      metricsContainer.innerHTML = `
        <div class="kv-row">
          <span class="kv-label">Hold Capacity</span>
          <span class="kv-val">${this.capacity} kg</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">0/1 DP Max Yield</span>
          <span class="kv-val text-emerald-700 font-bold">${this.result01.maxVal} pts</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Fractional Yield</span>
          <span class="kv-val text-blue-700 font-bold">${this.resultFractional.maxVal} pts</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Weight Packed</span>
          <span class="kv-val">${this.result01.totalWeight} kg</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Unused Capacity</span>
          <span class="kv-val text-amber-700">${unusedWeight} kg</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Volume Efficiency</span>
          <span class="kv-val">${efficiency}%</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">DP Operations</span>
          <span class="kv-val">${this.result01.operations} cells</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Execution Time</span>
          <span class="kv-val">${this.result01.elapsedMs.toFixed(3)} ms</span>
        </div>
      `;
    }

    // 4. Right Panel: Step Decisions Log
    const traceLog = document.getElementById('knapsackStepTraceLog');
    if (traceLog && this.result01) {
      const recent = this.result01.steps.slice(Math.max(0, this.stepIndex - 5), this.stepIndex + 1).reverse();
      traceLog.innerHTML = recent.map(st => `
        <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
          <div class="flex justify-between font-bold text-slate-800">
            <span>[i=${st.itemIndex}, w=${st.capacityCol}k]</span>
            <span class="${st.decision === 'take' ? 'text-emerald-700' : 'text-slate-500'} font-bold">
              ${st.decision === 'take' ? 'TAKE' : 'SKIP'}
            </span>
          </div>
          <div class="text-[10px] text-slate-600 truncate">${st.itemName} (${st.itemWeight}kg, ${st.itemValue}p)</div>
        </div>
      `).join('') || `<div class="p-2 text-center text-slate-400 italic">No decisions logged.</div>`;
    }

    this.updatePlaybackControls();
  }

  renderDualComparisonView() {
    const container = document.getElementById('knapsackVisualizerContainer');
    if (!container || !this.result01 || !this.resultFractional) return;

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="mini-card p-4 space-y-2">
          <div class="flex justify-between border-b border-slate-100 pb-1.5 font-bold">
            <span class="text-emerald-800">0/1 Knapsack (DP)</span>
            <span class="font-mono text-emerald-700">${this.result01.maxVal} pts</span>
          </div>
          <div class="space-y-1">
            ${this.result01.selectedItems.map(it => `
              <div class="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                <span class="font-medium text-slate-900">${it.name}</span>
                <span class="font-mono text-slate-600">${it.weight}kg | ${it.value}p</span>
              </div>
            `).join('')}
          </div>
          <div class="pt-2 border-t border-slate-100 flex justify-between font-mono text-[11px]">
            <span>Packed: ${this.result01.totalWeight} / ${this.capacity} kg</span>
            <span class="text-amber-700">Unused: ${this.capacity - this.result01.totalWeight} kg</span>
          </div>
        </div>

        <div class="mini-card p-4 space-y-2">
          <div class="flex justify-between border-b border-slate-100 pb-1.5 font-bold">
            <span class="text-blue-800">Fractional (Greedy)</span>
            <span class="font-mono text-blue-700">${this.resultFractional.maxVal} pts</span>
          </div>
          <div class="space-y-1">
            ${this.resultFractional.takenItems.map(it => `
              <div class="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                <span class="font-medium text-slate-900">${it.name} <span class="text-blue-700 font-mono">(${it.percentage}%)</span></span>
                <span class="font-mono text-slate-600">${it.weightTaken}kg | ${it.valueTaken}p</span>
              </div>
            `).join('')}
          </div>
          <div class="pt-2 border-t border-slate-100 flex justify-between font-mono text-[11px]">
            <span>Packed: ${this.resultFractional.totalWeight} / ${this.capacity} kg</span>
            <span class="text-emerald-700">100% Full</span>
          </div>
        </div>
      </div>
    `;
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (!this.result01) return;
    this.isPlaying = true;
    if (this.stepIndex >= this.result01.steps.length - 1) this.stepIndex = 0;

    const playBtn = document.getElementById('btnPlayKnapsack');
    if (playBtn) playBtn.textContent = 'Pause';

    this.playTimer = setInterval(() => {
      if (this.stepIndex < this.result01.steps.length - 1) {
        this.stepIndex++;
        sound.swap(320 + (this.stepIndex % 8) * 35);
        this.renderKnapsackModule();
      } else {
        this.stopPlayback();
        sound.success();
      }
    }, this.playSpeed);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    const playBtn = document.getElementById('btnPlayKnapsack');
    if (playBtn) playBtn.textContent = 'Play Trace';
  }

  stepForward() {
    if (!this.result01 || this.stepIndex >= this.result01.steps.length - 1) return;
    this.stepIndex++;
    sound.click();
    this.renderKnapsackModule();
  }

  stepBackward() {
    if (!this.result01 || this.stepIndex <= 0) return;
    this.stepIndex--;
    sound.click();
    this.renderKnapsackModule();
  }

  jumpToEnd() {
    if (!this.result01) return;
    this.stepIndex = this.result01.steps.length - 1;
    sound.success();
    this.renderKnapsackModule();
  }

  updatePlaybackControls() {
    const stepLabel = document.getElementById('knapsackStepCounter');
    if (stepLabel && this.result01) {
      stepLabel.textContent = `Step ${this.stepIndex + 1} / ${this.result01.steps.length}`;
    }
  }

  // ==========================================================================
  // MODULE 2: PRIORITY QUEUE DISPATCH
  // ==========================================================================

  setHeapType(type) {
    if (this.heapType === type) return;
    this.heapType = type;
    const oldCalls = [...this.pq.heap];
    this.pq = new DisasterPriorityQueue(this.heapType);
    oldCalls.forEach(call => this.pq.insert(call));
    sound.click();
    this.renderTriageModule();
  }

  insertDistressCall(distressCall) {
    const trace = this.pq.insert(distressCall);
    sound.alert();
    this.renderTriageModule({ activeIndex: trace[trace.length - 1]?.index, action: 'insert' });
    this.renderTriageLog(trace, 'INSERT');
    this.updateGlobalMetrics();
  }

  dispatchNextEmergency() {
    if (this.pq.isEmpty()) {
      alert('Triage queue is empty.');
      return;
    }

    const { extracted, trace } = this.pq.extract();
    this.dispatchedCount++;
    this.totalCasualtiesRescued += extracted.casualties || 0;

    sound.dispatch();
    this.renderTriageModule({ activeIndex: 0, action: 'swap' });
    this.renderTriageLog(trace, 'DISPATCH', extracted);
    this.updateGlobalMetrics();
  }

  renderTriageModule(highlightInfo = null) {
    visualizer.renderHeapVisualizer('heapSvgCanvas', 'heapArrayContainer', this.pq, highlightInfo);

    const countBadge = document.getElementById('triageQueueCountBadge');
    if (countBadge) countBadge.textContent = `${this.pq.size()} Calls`;

    // Next Target Peek
    const rootPeek = this.pq.peek();
    const nextCard = document.getElementById('nextPriorityIncidentCard');
    if (nextCard) {
      if (rootPeek) {
        nextCard.innerHTML = `
          <div class="space-y-1 text-xs">
            <div class="kv-row"><span class="kv-label">Location</span><span class="kv-val text-slate-900 truncate max-w-[150px]">${rootPeek.location}</span></div>
            <div class="kv-row"><span class="kv-label">Priority Score</span><span class="kv-val text-rose-600 font-bold">${rootPeek.urgencyScore} / 100</span></div>
            <div class="kv-row"><span class="kv-label">Casualties</span><span class="kv-val">${rootPeek.casualties}</span></div>
            <div class="kv-row"><span class="kv-label">ETA Deadline</span><span class="kv-val">${rootPeek.deadlineMin} min</span></div>
            <div class="kv-row"><span class="kv-label">Needed Aid</span><span class="kv-val truncate max-w-[150px]">${rootPeek.suppliesNeeded}</span></div>
          </div>
        `;
      } else {
        nextCard.innerHTML = `<div class="text-xs text-slate-400 italic p-1">No emergency calls queued.</div>`;
      }
    }

    // Right Metrics
    const metricsContainer = document.getElementById('triageRightMetricsContainer');
    if (metricsContainer) {
      metricsContainer.innerHTML = `
        <div class="kv-row">
          <span class="kv-label">Heap Discipline</span>
          <span class="kv-val">${this.heapType.toUpperCase()}-Heap</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Queued Incidents</span>
          <span class="kv-val">${this.pq.size()}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Teams Dispatched</span>
          <span class="kv-val text-emerald-700">${this.dispatchedCount}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Casualties Rescued</span>
          <span class="kv-val text-blue-700">${this.totalCasualtiesRescued} Souls</span>
        </div>
      `;
    }
  }

  renderTriageLog(trace, op, item = null) {
    const log = document.getElementById('triageExecutionLog');
    if (!log) return;

    let html = `
      <div class="p-2 rounded bg-slate-50 border border-slate-200">
        <div class="flex justify-between font-bold text-[10.5px]">
          <span class="${op === 'DISPATCH' ? 'text-rose-600' : 'text-blue-700'}">${op === 'DISPATCH' ? `DISPATCH: ${item?.location}` : 'CALL QUEUED'}</span>
          <span class="text-slate-400 font-normal">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="mt-1 space-y-0.5 text-[10px] text-slate-600">
    `;

    trace.forEach(st => {
      html += `<div>• ${st.message}</div>`;
    });

    html += `</div></div>`;
    log.innerHTML = html + log.innerHTML;
  }

  // ==========================================================================
  // MODULE 3: GREEDY ROUTE SCHEDULER
  // ==========================================================================

  setRouteStrategy(strategy) {
    this.routeStrategy = strategy;
    sound.click();
    this.runRouteCalculation();
  }

  runRouteCalculation() {
    this.schedulingResult = solveGreedyIntervalScheduling(this.missions, this.routeStrategy);
    this.renderRouteModule();
    this.updateGlobalMetrics();
  }

  renderRouteModule() {
    if (!this.schedulingResult) return;

    // 1. Left Panel: Mini List
    const miniList = document.getElementById('routeMiniMissionList');
    const countBadge = document.getElementById('routeMissionsCountBadge');
    if (countBadge) countBadge.textContent = `${this.missions.length} flights`;

    if (miniList) {
      miniList.innerHTML = this.missions.map(m => {
        const isSelected = this.schedulingResult.selected.some(s => s.id === m.id);
        const fh = h => `${h < 10 ? '0' : ''}${h}:00`;

        return `
          <div class="p-2 rounded-md border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300">
            <div class="truncate">
              <span class="font-semibold text-slate-900">${m.name}</span>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">${fh(m.start)}–${fh(m.end)} • ${m.zone}</div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              ${isSelected ? `
                <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono text-[9.5px] font-bold">Dispatched</span>
              ` : `
                <span class="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-mono text-[9.5px] font-bold">Clash</span>
              `}
              <button class="text-slate-400 hover:text-rose-600 p-0.5" onclick="window.app.deleteMission('${m.id}')" title="Delete">&times;</button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Center Panel: Gantt
    visualizer.renderIntervalGantt('ganttChartContainer', this.schedulingResult);

    // 3. Right Panel: Metrics
    const stratElem = document.getElementById('metricRouteStrat');
    if (stratElem) stratElem.textContent = this.routeStrategy === 'EFT' ? 'EFT (Optimal)' : this.routeStrategy === 'EST' ? 'EST (Suboptimal)' : 'Duration (Suboptimal)';

    const metricsContainer = document.getElementById('routeRightMetricsContainer');
    if (metricsContainer) {
      metricsContainer.innerHTML = `
        <div class="kv-row">
          <span class="kv-label">Total Evaluated</span>
          <span class="kv-val">${this.schedulingResult.totalCount} missions</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Approved Convoys</span>
          <span class="kv-val text-emerald-700 font-bold">${this.schedulingResult.selectedCount}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Clashes Rejected</span>
          <span class="kv-val text-rose-600 font-bold">${this.schedulingResult.rejected.length}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Corridor Throughput</span>
          <span class="kv-val">${this.schedulingResult.utilizationRate}%</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">Corridor Horizon</span>
          <span class="kv-val">05:00 - 21:00</span>
        </div>
      `;
    }

    // 4. Right Panel: Decision Log
    const decisionLog = document.getElementById('routeDecisionLog');
    if (decisionLog) {
      decisionLog.innerHTML = this.schedulingResult.steps.map(st => `
        <div class="p-1.5 rounded bg-slate-50 border border-slate-200">
          <div class="flex justify-between font-bold text-[10.5px]">
            <span>${st.mission.name} (${st.mission.start}:00-${st.mission.end}:00)</span>
            <span class="${st.status === 'ACCEPTED' ? 'text-emerald-700' : 'text-rose-600'}">${st.status}</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5 truncate">${st.decision}</div>
        </div>
      `).join('');
    }
  }

  // ==========================================================================
  // MODULE 4: BIG-O BENCHMARK
  // ==========================================================================

  runBenchmarks() {
    const btn = document.getElementById('btnRunBenchmark');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Running N=10 to 1000...';
    }

    setTimeout(() => {
      this.benchmarkData = runEmpiricalBenchmarks([10, 50, 100, 250, 500, 1000]);
      visualizer.renderBenchmarkChart('benchmarkCanvas', this.benchmarkData);
      this.renderBenchmarkTable();
      sound.success();

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Run Benchmark Suite';
      }
    }, 50);
  }

  renderBenchmarkTable() {
    const tbody = document.getElementById('benchmarkTableBody');
    if (!tbody || !this.benchmarkData) return;

    const sizes = this.benchmarkData.knapsackFractional.map(d => d.n);
    tbody.innerHTML = sizes.map((n, idx) => {
      const k01 = this.benchmarkData.knapsack01[idx];
      const kFrac = this.benchmarkData.knapsackFractional[idx];
      const heap = this.benchmarkData.heapOperations[idx];
      const greedy = this.benchmarkData.greedyScheduling[idx];

      return `
        <tr>
          <td class="font-bold text-slate-900">N = ${n}</td>
          <td class="text-center text-amber-700 font-bold">${k01.timeMs} ms</td>
          <td class="text-center text-blue-700 font-bold">${kFrac.timeMs} ms</td>
          <td class="text-center text-rose-700 font-bold">${heap.timeMs} ms</td>
          <td class="text-center text-emerald-700 font-bold">${greedy.timeMs} ms</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // NAVIGATION & ACTIONS
  // ==========================================================================

  switchTab(tabName) {
    this.activeTab = tabName;
    sound.click();

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === tabName) {
        btn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'bg-transparent');
      } else {
        btn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.add('text-slate-600', 'bg-transparent');
      }
    });

    document.querySelectorAll('.tab-content-panel').forEach(panel => {
      if (panel.id === `tabContent-${tabName}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    this.renderActiveTab();
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'knapsack':
        this.renderKnapsackModule();
        break;
      case 'triage':
        this.renderTriageModule();
        break;
      case 'route':
        this.renderRouteModule();
        break;
      case 'classroom':
        if (!this.benchmarkData) {
          this.runBenchmarks();
        } else {
          visualizer.renderBenchmarkChart('benchmarkCanvas', this.benchmarkData);
        }
        break;
    }
  }

  deleteItem(id) {
    this.items = this.items.filter(it => it.id !== id);
    this.recalculateAll();
  }

  deleteMission(id) {
    this.missions = this.missions.filter(m => m.id !== id);
    this.runRouteCalculation();
  }

  toggleSound() {
    this.soundEnabled = sound.toggleSound();
    const btn = document.getElementById('btnToggleSound');
    if (btn) {
      btn.innerHTML = this.soundEnabled 
        ? `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`
        : `<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>`;
    }
  }

  exportMissionReport() {
    const reportText = `
========================================================================
DISASTER RELIEF SUPPLY OPTIMIZER - MISSION DEBRIEF REPORT
Timestamp: ${new Date().toLocaleString()}
Scenario: ${PRESET_SCENARIOS[this.currentScenarioId].name}
========================================================================

1. CARGO KNAPSACK MANIFEST
Capacity: ${this.capacity} kg
0/1 DP Max Yield: ${this.result01.maxVal} pts | Weight: ${this.result01.totalWeight} kg
Fractional Yield: ${this.resultFractional.maxVal} pts (100% full)
Packed Items:
${this.result01.selectedItems.map(it => `  * ${it.name} (${it.weight}kg, ${it.value}pts)`).join('\n')}

2. PRIORITY QUEUE STATUS
Heap Mode: ${this.heapType.toUpperCase()}-Heap
Pending Incidents: ${this.pq.size()}
Teams Dispatched: ${this.dispatchedCount}
Rescued Souls: ${this.totalCasualtiesRescued}

3. CONVOY INTERVAL SCHEDULE
Strategy: ${this.routeStrategy} (EFT is Optimal)
Evaluated: ${this.schedulingResult.totalCount} | Dispatched: ${this.schedulingResult.selectedCount} (${this.schedulingResult.utilizationRate}%)
Clashes Blocked: ${this.schedulingResult.rejected.length}
Approved Schedule:
${this.schedulingResult.selected.map(m => `  * ${m.name}: ${m.start}:00 - ${m.end}:00 [${m.zone}]`).join('\n')}
========================================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relief_Report_${this.currentScenarioId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sound.success();
  }

  setupEventListeners() {
    const scenarioSelect = document.getElementById('scenarioSelector');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', e => this.loadScenario(e.target.value));
    }

    const capSlider = document.getElementById('capacitySlider');
    const capInput = document.getElementById('capacityInput');
    const capDisplay = document.getElementById('capacityValDisplay');

    if (capSlider && capInput) {
      capSlider.addEventListener('input', e => {
        this.capacity = parseInt(e.target.value, 10) || 1;
        capInput.value = this.capacity;
        if (capDisplay) capDisplay.textContent = `${this.capacity} kg`;
        this.runKnapsackCalculation();
      });
      capInput.addEventListener('change', e => {
        this.capacity = parseInt(e.target.value, 10) || 1;
        capSlider.value = this.capacity;
        if (capDisplay) capDisplay.textContent = `${this.capacity} kg`;
        this.runKnapsackCalculation();
      });
    }

    // Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab-target')));
    });

    // Knapsack Modes
    document.querySelectorAll('.knapsack-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.knapsackMode = btn.getAttribute('data-knapsack-mode');
        document.querySelectorAll('.knapsack-mode-btn').forEach(b => {
          b.classList.remove('bg-slate-900', 'text-white');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('bg-slate-900', 'text-white');
        btn.classList.remove('btn-secondary');
        sound.click();
        this.renderKnapsackModule();
      });
    });

    // Add Cargo Form
    const formAddCargo = document.getElementById('formAddCargoDirect');
    if (formAddCargo) {
      formAddCargo.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('quickItemName').value.trim();
        const weight = parseInt(document.getElementById('quickItemWeight').value, 10);
        const value = parseInt(document.getElementById('quickItemValue').value, 10);
        const category = document.getElementById('quickItemCategory').value;

        if (name && weight > 0 && value > 0) {
          this.items.push({ id: `cust_${Date.now()}`, name, weight, value, category, icon: 'box' });
          formAddCargo.reset();
          sound.success();
          this.recalculateAll();
        }
      });
    }

    // Knapsack Playback
    document.getElementById('btnPlayKnapsack')?.addEventListener('click', () => this.togglePlayback());
    document.getElementById('btnNextKnapsack')?.addEventListener('click', () => this.stepForward());
    document.getElementById('btnPrevKnapsack')?.addEventListener('click', () => this.stepBackward());
    document.getElementById('btnEndKnapsack')?.addEventListener('click', () => this.jumpToEnd());

    // Triage Action Buttons
    document.getElementById('btnDispatchTriage')?.addEventListener('click', () => this.dispatchNextEmergency());
    document.getElementById('btnAddRandomDistress')?.addEventListener('click', () => {
      const z = ['Sector 4 Clinic', 'Monastery Ridge', 'Flooded Shelter', 'Bridge Washout', 'Alpine Overhang'];
      const score = Math.floor(Math.random() * 45) + 55;
      this.insertDistressCall({
        id: `dc_${Date.now()}`,
        location: z[Math.floor(Math.random() * z.length)],
        urgencyScore: score,
        severity: score >= 85 ? 'Critical' : score >= 70 ? 'High' : 'Medium',
        casualties: Math.floor(Math.random() * 20) + 1,
        deadlineMin: Math.floor(Math.random() * 90) + 15,
        suppliesNeeded: 'Trauma Packs & Oxygen',
        status: 'Pending'
      });
    });

    const btnMax = document.getElementById('btnMaxHeap');
    const btnMin = document.getElementById('btnMinHeap');
    btnMax?.addEventListener('click', () => {
      btnMax.classList.add('bg-slate-900', 'text-white');
      btnMax.classList.remove('btn-secondary');
      btnMin.classList.remove('bg-slate-900', 'text-white');
      btnMin.classList.add('btn-secondary');
      this.setHeapType('max');
    });
    btnMin?.addEventListener('click', () => {
      btnMin.classList.add('bg-slate-900', 'text-white');
      btnMin.classList.remove('btn-secondary');
      btnMax.classList.remove('bg-slate-900', 'text-white');
      btnMax.classList.add('btn-secondary');
      this.setHeapType('min');
    });

    // Add Distress Form
    const formAddDistress = document.getElementById('formAddDistressDirect');
    if (formAddDistress) {
      formAddDistress.addEventListener('submit', e => {
        e.preventDefault();
        const loc = document.getElementById('quickDistressLocation').value.trim();
        const urg = parseInt(document.getElementById('quickDistressUrgency').value, 10);
        const cas = parseInt(document.getElementById('quickDistressCasualties').value, 10) || 0;
        const ddl = parseInt(document.getElementById('quickDistressDeadline').value, 10) || 45;
        const sup = document.getElementById('quickDistressSupplies').value.trim() || 'Aid';

        if (loc && urg > 0) {
          this.insertDistressCall({
            id: `dc_${Date.now()}`,
            location: loc,
            urgencyScore: urg,
            severity: urg >= 90 ? 'Critical' : urg >= 75 ? 'High' : 'Medium',
            casualties: cas,
            deadlineMin: ddl,
            suppliesNeeded: sup,
            status: 'Pending'
          });
          formAddDistress.reset();
        }
      });
    }

    // Route Strategy Buttons
    document.querySelectorAll('.route-strat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const strat = btn.getAttribute('data-route-strategy');
        document.querySelectorAll('.route-strat-btn').forEach(b => {
          b.classList.remove('bg-emerald-50', 'text-emerald-900', 'border-emerald-300');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('bg-emerald-50', 'text-emerald-900', 'border-emerald-300');
        btn.classList.remove('btn-secondary');
        this.setRouteStrategy(strat);
      });
    });

    // Add Mission Form
    const formAddMission = document.getElementById('formAddMissionDirect');
    if (formAddMission) {
      formAddMission.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('quickMissionName').value.trim();
        const start = parseInt(document.getElementById('quickMissionStart').value, 10);
        const end = parseInt(document.getElementById('quickMissionEnd').value, 10);
        const zone = document.getElementById('quickMissionZone').value.trim() || 'Sector A';
        const type = document.getElementById('quickMissionType').value;

        if (name && end > start) {
          this.missions.push({ id: `mis_${Date.now()}`, name, start, end, zone, convoyType: type, priority: 'High' });
          formAddMission.reset();
          sound.success();
          this.runRouteCalculation();
        } else {
          alert('End hour must be greater than start hour.');
        }
      });
    }

    // General Buttons
    document.getElementById('btnToggleSound')?.addEventListener('click', () => this.toggleSound());
    document.getElementById('btnExportReport')?.addEventListener('click', () => this.exportMissionReport());
    document.getElementById('btnRunBenchmark')?.addEventListener('click', () => this.runBenchmarks());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new DisasterOptimizerApp();
  window.app.init();
});
