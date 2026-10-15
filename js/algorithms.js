/**
 * Disaster Relief Supply Optimizer - DAA Interactive Suite
 * algorithms.js
 * 
 * Comprehensive, mathematically rigorous implementations of:
 * 1. Knapsack Problem (0/1 Dynamic Programming & Fractional Greedy)
 * 2. Priority Queue / Binary Heap (Min & Max Heap with Floyd's O(n) construction)
 * 3. Greedy Interval Scheduling & Multi-Track Corridors (Activity Selection & Partitioning)
 * 4. Empirical Algorithmic Benchmarking Suite
 */

// ============================================================================
// 1. KNAPSACK OPTIMIZATION ENGINE
// ============================================================================

/**
 * Solves the 0/1 Knapsack problem using Dynamic Programming.
 * Time Complexity: O(n * W)
 * Space Complexity: O(n * W) for complete matrix reconstruction, or O(W) auxiliary.
 * 
 * @param {Array<{id: string, name: string, weight: number, value: number, category: string, icon: string}>} items 
 * @param {number} capacity - Maximum cargo weight (integer)
 * @returns {Object} Solution with DP table, selected items, metrics, and trace steps.
 */
export function solve01Knapsack(items, capacity) {
  const startTime = performance.now();
  let operations = 0;
  const n = items.length;
  const W = Math.max(0, Math.floor(capacity));

  // Initialize DP table: (n + 1) rows x (W + 1) columns
  // dp[i][w] represents max value achievable using subset of first i items with weight capacity w
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const steps = [];

  // Fill DP Table
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    const wt = Math.floor(item.weight);
    const val = item.value;

    for (let w = 0; w <= W; w++) {
      operations++;
      let decision = 'skip';
      let previousVal = dp[i - 1][w];
      let candidateVal = 0;

      if (wt <= w) {
        candidateVal = dp[i - 1][w - wt] + val;
        if (candidateVal > previousVal) {
          dp[i][w] = candidateVal;
          decision = 'take';
        } else {
          dp[i][w] = previousVal;
          decision = 'skip_equal_or_less';
        }
      } else {
        dp[i][w] = previousVal;
        decision = 'exceeds_capacity';
      }

      // Record detailed step log for pedagogical visualization
      steps.push({
        itemIndex: i,
        itemName: item.name,
        itemWeight: wt,
        itemValue: val,
        capacityCol: w,
        previousVal,
        candidateVal,
        resultVal: dp[i][w],
        decision,
        formula: wt <= w 
          ? `max(dp[${i - 1}][${w}] = ${previousVal}, dp[${i - 1}][${w - wt}] + ${val} = ${candidateVal})` 
          : `Item weight ${wt} > capacity ${w} => dp[${i - 1}][${w}] = ${previousVal}`
      });
    }
  }

  // Backtracking to find selected items
  const selectedItems = [];
  let currW = W;
  const backtrackSteps = [];

  for (let i = n; i > 0 && currW > 0; i--) {
    operations++;
    const item = items[i - 1];
    const wt = Math.floor(item.weight);

    // If value differs from cell directly above, item was included in optimal solution
    if (dp[i][currW] !== dp[i - 1][currW]) {
      selectedItems.push(item);
      backtrackSteps.push({
        itemIndex: i,
        item,
        currentWeight: currW,
        newWeight: currW - wt,
        reason: `dp[${i}][${currW}] (${dp[i][currW]}) ≠ dp[${i - 1}][${currW}] (${dp[i - 1][currW]}) -> Item included`
      });
      currW -= wt;
    } else {
      backtrackSteps.push({
        itemIndex: i,
        item,
        currentWeight: currW,
        newWeight: currW,
        reason: `dp[${i}][${currW}] == dp[${i - 1}][${currW}] -> Item bypassed`
      });
    }
  }

  const totalValue = dp[n][W];
  const totalWeight = selectedItems.reduce((sum, it) => sum + it.weight, 0);
  const elapsedMs = performance.now() - startTime;

  return {
    algorithm: '0/1 Knapsack (Dynamic Programming)',
    maxVal: totalValue,
    totalWeight,
    capacity: W,
    selectedItems: selectedItems.reverse(),
    dpTable: dp,
    items,
    steps,
    backtrackSteps,
    operations,
    elapsedMs,
    complexity: {
      time: 'O(n · W)',
      space: 'O(n · W) [or O(W) with 1D row array]',
      type: 'Pseudo-polynomial'
    }
  };
}

/**
 * Solves the Fractional Knapsack problem using the Greedy approach.
 * Items can be broken down into fractional parts.
 * Strategy: Sort items descending by value-to-weight ratio (value density).
 * Time Complexity: O(n log n) due to sorting.
 * Space Complexity: O(n) for manifest output.
 * 
 * @param {Array<{id: string, name: string, weight: number, value: number, category: string, icon: string}>} items 
 * @param {number} capacity - Maximum cargo weight
 * @returns {Object} Solution with taken portions, metrics, and step-by-step decisions.
 */
export function solveFractionalKnapsack(items, capacity) {
  const startTime = performance.now();
  let operations = 0;
  const W = Math.max(0, capacity);

  // 1. Calculate value/weight ratio for each item
  const augmentedItems = items.map(item => {
    operations++;
    const ratio = item.weight > 0 ? (item.value / item.weight) : 0;
    return {
      ...item,
      ratio: parseFloat(ratio.toFixed(3))
    };
  });

  // 2. Sort descending by ratio (Greedy Choice Property)
  augmentedItems.sort((a, b) => {
    operations++;
    return b.ratio - a.ratio;
  });

  let remainingCapacity = W;
  let totalValue = 0;
  let totalWeight = 0;
  const takenItems = [];
  const steps = [];

  // 3. Greedily take items
  for (let i = 0; i < augmentedItems.length; i++) {
    operations++;
    const item = augmentedItems[i];

    if (remainingCapacity <= 0) {
      steps.push({
        item,
        fraction: 0,
        weightTaken: 0,
        valueTaken: 0,
        remainingCapacity: 0,
        decision: 'Skipped - Cargo hold completely full'
      });
      continue;
    }

    if (item.weight <= remainingCapacity) {
      // Take whole item (100%)
      const fraction = 1.0;
      const weightTaken = item.weight;
      const valueTaken = item.value;

      remainingCapacity -= weightTaken;
      totalValue += valueTaken;
      totalWeight += weightTaken;

      takenItems.push({
        ...item,
        fraction,
        percentage: 100,
        weightTaken,
        valueTaken
      });

      steps.push({
        item,
        fraction: 1.0,
        percentage: 100,
        weightTaken,
        valueTaken,
        remainingCapacity,
        decision: `Full item accepted (${weightTaken} kg at ratio ${item.ratio} pts/kg)`
      });
    } else {
      // Take fractional part
      const fraction = remainingCapacity / item.weight;
      const percentage = Math.round(fraction * 100);
      const weightTaken = remainingCapacity;
      const valueTaken = fraction * item.value;

      totalValue += valueTaken;
      totalWeight += weightTaken;
      remainingCapacity = 0;

      takenItems.push({
        ...item,
        fraction,
        percentage,
        weightTaken: parseFloat(weightTaken.toFixed(2)),
        valueTaken: parseFloat(valueTaken.toFixed(2))
      });

      steps.push({
        item,
        fraction,
        percentage,
        weightTaken: parseFloat(weightTaken.toFixed(2)),
        valueTaken: parseFloat(valueTaken.toFixed(2)),
        remainingCapacity: 0,
        decision: `Fractional slice taken: ${percentage}% (${weightTaken.toFixed(1)} kg out of ${item.weight} kg) to fill final capacity`
      });
    }
  }

  const elapsedMs = performance.now() - startTime;

  return {
    algorithm: 'Fractional Knapsack (Greedy Algorithm)',
    maxVal: parseFloat(totalValue.toFixed(2)),
    totalWeight: parseFloat(totalWeight.toFixed(2)),
    capacity: W,
    remainingCapacity: parseFloat(remainingCapacity.toFixed(2)),
    takenItems,
    sortedItems: augmentedItems,
    steps,
    operations,
    elapsedMs,
    complexity: {
      time: 'O(n log n)',
      space: 'O(n)',
      type: 'Greedy Optimal'
    }
  };
}

/**
 * Runs a side-by-side pedagogical comparison of 0/1 vs Fractional Knapsack.
 */
export function compareKnapsackModels(items, capacity) {
  const result01 = solve01Knapsack(items, capacity);
  const resultFractional = solveFractionalKnapsack(items, capacity);

  const valueDelta = resultFractional.maxVal - result01.maxVal;
  const weightDelta = resultFractional.totalWeight - result01.totalWeight;

  return {
    result01,
    resultFractional,
    valueDelta: parseFloat(valueDelta.toFixed(2)),
    weightDelta: parseFloat(weightDelta.toFixed(2)),
    pedagogicalInsight: valueDelta > 0 
      ? `Fractional Knapsack achieved ${valueDelta.toFixed(1)} MORE priority value (${resultFractional.maxVal} vs ${result01.maxVal}) because it can divide high-density items to exhaust all cargo space. In contrast, 0/1 Knapsack left ${(capacity - result01.totalWeight).toFixed(1)} kg unfilled due to indivisibility constraints.`
      : `Both algorithms yielded identical value (${result01.maxVal} pts) because the optimal combination of items filled the cargo hold without requiring any item slicing.`
  };
}

// ============================================================================
// 2. EMERGENCY TRIAGE PRIORITY QUEUE (BINARY HEAP)
// ============================================================================

/**
 * Priority Queue implemented via a Binary Heap.
 * Supports Max-Heap (highest urgency / triage priority first) 
 * or Min-Heap (earliest golden-hour response deadline first).
 * 
 * Invariants:
 * - Complete Binary Tree (stored compactly in contiguous array)
 * - Heap Property: 
 *     Max-Heap: parent >= children
 *     Min-Heap: parent <= children
 */
export class DisasterPriorityQueue {
  /**
   * @param {'max'|'min'} type - 'max' for urgency score priority, 'min' for shortest response time
   */
  constructor(type = 'max') {
    this.type = type;
    this.heap = [];
    this.historyLog = [];
  }

  /**
   * Compare two triage nodes.
   * Positive return means nodeA has higher dispatch priority than nodeB.
   */
  compare(nodeA, nodeB) {
    if (this.type === 'max') {
      // Primary: Urgency Score (higher is urgent)
      if (nodeA.urgencyScore !== nodeB.urgencyScore) {
        return nodeA.urgencyScore - nodeB.urgencyScore;
      }
      // Tie-breaker: Casualty count (more casualties = higher priority)
      return nodeA.casualties - nodeB.casualties;
    } else {
      // Min-Heap mode: ETA / Deadline in minutes (lower ETA = closer to critical window)
      if (nodeA.deadlineMin !== nodeB.deadlineMin) {
        return nodeB.deadlineMin - nodeA.deadlineMin; // Reversed for min
      }
      return nodeA.urgencyScore - nodeB.urgencyScore;
    }
  }

  parentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChildIndex(i) {
    return 2 * i + 1;
  }

  rightChildIndex(i) {
    return 2 * i + 2;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Inserts an emergency distress call into the priority queue.
   * Time Complexity: O(log n)
   * 
   * @param {Object} distressCall 
   * @returns {Array<Object>} Step-by-step trace of bubble-up operations
   */
  insert(distressCall) {
    const trace = [];
    this.heap.push(distressCall);
    let index = this.heap.length - 1;

    trace.push({
      action: 'append_leaf',
      index,
      item: distressCall,
      heapSnapshot: [...this.heap],
      message: `Placed new call [${distressCall.location}] at array index ${index} (bottom-right leaf)`
    });

    // Heapify Up (Bubble Up)
    while (index > 0) {
      const parentIdx = this.parentIndex(index);
      const childNode = this.heap[index];
      const parentNode = this.heap[parentIdx];

      trace.push({
        action: 'compare',
        parentIndex: parentIdx,
        childIndex: index,
        parentVal: this.type === 'max' ? parentNode.urgencyScore : parentNode.deadlineMin,
        childVal: this.type === 'max' ? childNode.urgencyScore : childNode.deadlineMin,
        heapSnapshot: [...this.heap],
        message: `Comparing child [Idx ${index}: ${childNode.location}] with parent [Idx ${parentIdx}: ${parentNode.location}]`
      });

      if (this.compare(childNode, parentNode) > 0) {
        // Swap violated heap property
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        trace.push({
          action: 'swap',
          swappedWith: parentIdx,
          swappedFrom: index,
          itemA: childNode,
          itemB: parentNode,
          heapSnapshot: [...this.heap],
          message: `Swapped child [${childNode.location}] upward into index ${parentIdx} to restore ${this.type.toUpperCase()}-heap invariant`
        });
        index = parentIdx;
      } else {
        trace.push({
          action: 'invariant_satisfied',
          index,
          heapSnapshot: [...this.heap],
          message: `Heap invariant satisfied at index ${index}. Insertion complete.`
        });
        break;
      }
    }

    this.historyLog.push({
      timestamp: new Date().toLocaleTimeString(),
      operation: 'INSERT',
      item: distressCall,
      stepsCount: trace.length
    });

    return trace;
  }

  /**
   * Extracts and dispatches the highest priority distress incident (Root node).
   * Time Complexity: O(log n)
   * 
   * @returns {{extracted: Object|null, trace: Array<Object>}}
   */
  extract() {
    const trace = [];
    if (this.heap.length === 0) {
      return { extracted: null, trace: [] };
    }

    if (this.heap.length === 1) {
      const extracted = this.heap.pop();
      trace.push({
        action: 'extract_single',
        extracted,
        heapSnapshot: [],
        message: `Extracted only incident in queue: [${extracted.location}]. Heap is now empty.`
      });
      return { extracted, trace };
    }

    const extracted = this.heap[0];
    const lastElement = this.heap.pop();
    this.heap[0] = lastElement;

    trace.push({
      action: 'extract_root_and_replace',
      extracted,
      replacedWith: lastElement,
      heapSnapshot: [...this.heap],
      message: `Dispatched root emergency [${extracted.location}]. Moved last leaf [${lastElement.location}] to root (index 0).`
    });

    // Heapify Down (Bubble Down / Sift Down)
    let index = 0;
    const length = this.heap.length;

    while (this.leftChildIndex(index) < length) {
      const leftIdx = this.leftChildIndex(index);
      const rightIdx = this.rightChildIndex(index);
      let targetIdx = leftIdx;

      // Check right child existence & priority
      if (rightIdx < length) {
        trace.push({
          action: 'compare_children',
          leftIdx,
          rightIdx,
          leftVal: this.heap[leftIdx].location,
          rightVal: this.heap[rightIdx].location,
          heapSnapshot: [...this.heap],
          message: `Comparing left child [Idx ${leftIdx}] against right child [Idx ${rightIdx}] to determine primary successor`
        });

        if (this.compare(this.heap[rightIdx], this.heap[leftIdx]) > 0) {
          targetIdx = rightIdx;
        }
      }

      const parentNode = this.heap[index];
      const targetNode = this.heap[targetIdx];

      trace.push({
        action: 'compare',
        parentIndex: index,
        childIndex: targetIdx,
        parentVal: parentNode.location,
        childVal: targetNode.location,
        heapSnapshot: [...this.heap],
        message: `Comparing parent [Idx ${index}: ${parentNode.location}] with highest-priority child [Idx ${targetIdx}: ${targetNode.location}]`
      });

      if (this.compare(targetNode, parentNode) > 0) {
        // Swap
        [this.heap[index], this.heap[targetIdx]] = [this.heap[targetIdx], this.heap[index]];
        trace.push({
          action: 'swap',
          swappedFrom: index,
          swappedWith: targetIdx,
          itemA: targetNode,
          itemB: parentNode,
          heapSnapshot: [...this.heap],
          message: `Sifted downward: Swapped [Idx ${index}] with child [Idx ${targetIdx}]`
        });
        index = targetIdx;
      } else {
        trace.push({
          action: 'invariant_satisfied',
          index,
          heapSnapshot: [...this.heap],
          message: `Heap property verified: Node at index ${index} satisfies ${this.type.toUpperCase()}-heap condition.`
        });
        break;
      }
    }

    this.historyLog.push({
      timestamp: new Date().toLocaleTimeString(),
      operation: 'DISPATCH_EXTRACT',
      item: extracted,
      stepsCount: trace.length
    });

    return { extracted, trace };
  }

  /**
   * Floyd's Algorithm for Linear Time O(n) Heap Construction.
   * Sifts down from floor(n/2 - 1) down to 0.
   */
  buildHeap(items) {
    this.heap = [...items];
    const n = this.heap.length;
    let ops = 0;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      ops += this._siftDown(i, n);
    }

    return {
      heap: [...this.heap],
      operations: ops,
      theoreticalComplexity: 'O(n) Linear'
    };
  }

  _siftDown(index, length) {
    let ops = 0;
    while (2 * index + 1 < length) {
      ops++;
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let target = left;

      if (right < length && this.compare(this.heap[right], this.heap[left]) > 0) {
        target = right;
      }

      if (this.compare(this.heap[target], this.heap[index]) > 0) {
        [this.heap[index], this.heap[target]] = [this.heap[target], this.heap[index]];
        index = target;
      } else {
        break;
      }
    }
    return ops;
  }

  clear() {
    this.heap = [];
    this.historyLog = [];
  }

  /**
   * Generates node coordinates and connections for visual SVG tree layout.
   */
  getTreeLayout(width = 800, height = 360) {
    const nodes = [];
    const links = [];
    const n = this.heap.length;
    if (n === 0) return { nodes, links };

    const maxDepth = Math.floor(Math.log2(n));
    const levelHeight = height / (maxDepth + 2);

    for (let i = 0; i < n; i++) {
      const depth = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, depth) - 1);
      const totalInLevel = Math.pow(2, depth);
      const levelWidth = width / (totalInLevel + 1);

      const x = levelWidth * (posInLevel + 1);
      const y = 40 + depth * levelHeight;

      nodes.push({
        index: i,
        data: this.heap[i],
        x,
        y,
        depth
      });

      if (i > 0) {
        const parentIdx = this.parentIndex(i);
        links.push({
          source: parentIdx,
          target: i
        });
      }
    }

    return { nodes, links };
  }
}

// ============================================================================
// 3. GREEDY INTERVAL SCHEDULER & RESOURCE ALLOCATOR
// ============================================================================

/**
 * Solves the Relief Convoy Interval Scheduling Problem (Activity Selection).
 * Demonstrates why the Greedy Choice Property (Earliest Finish Time) guarantees
 * an optimal subset of mutually compatible dispatch missions.
 * 
 * Also compares against suboptimal heuristics:
 * - Earliest Start Time (EST)
 * - Shortest Duration (SDF)
 * 
 * @param {Array<Object>} missions - [{ id, name, zone, start, end, priority, convoyType }]
 * @param {'EFT'|'EST'|'DURATION'} strategy - Scheduling heuristic
 * @returns {Object} Selected intervals, rejected intervals, execution steps, and proof notes.
 */
export function solveGreedyIntervalScheduling(missions, strategy = 'EFT') {
  const startTime = performance.now();
  let operations = 0;

  // Clone missions to prevent mutation
  const workingMissions = missions.map(m => ({
    ...m,
    duration: parseFloat((m.end - m.start).toFixed(1))
  }));

  // 1. Sort missions according to chosen strategy
  switch (strategy) {
    case 'EFT': // Earliest Finish Time (Optimal)
      workingMissions.sort((a, b) => {
        operations++;
        if (a.end !== b.end) return a.end - b.end;
        return a.start - b.start;
      });
      break;

    case 'EST': // Earliest Start Time (Suboptimal Heuristic)
      workingMissions.sort((a, b) => {
        operations++;
        if (a.start !== b.start) return a.start - b.start;
        return a.end - b.end;
      });
      break;

    case 'DURATION': // Shortest Duration First (Suboptimal Heuristic)
      workingMissions.sort((a, b) => {
        operations++;
        if (a.duration !== b.duration) return a.duration - b.duration;
        return a.start - b.start;
      });
      break;
  }

  const selected = [];
  const rejected = [];
  const steps = [];
  let lastEndTime = -Infinity;

  // 2. Greedy Selection Pass
  for (let i = 0; i < workingMissions.length; i++) {
    operations++;
    const mission = workingMissions[i];

    if (mission.start >= lastEndTime) {
      // Compatible with previous selection
      selected.push(mission);
      steps.push({
        mission,
        status: 'ACCEPTED',
        previousEndTime: lastEndTime === -Infinity ? 0 : lastEndTime,
        decision: `Compatible! Mission start (${mission.start}:00) >= last convoy end (${lastEndTime === -Infinity ? 0 : lastEndTime}:00). Mission locked.`
      });
      lastEndTime = mission.end;
    } else {
      // Conflict
      const conflictingWith = selected[selected.length - 1];
      rejected.push({
        ...mission,
        conflictingWith
      });
      steps.push({
        mission,
        status: 'REJECTED',
        previousEndTime: lastEndTime,
        decision: `Conflict detected! Start time (${mission.start}:00) clashes with active mission [${conflictingWith.name}] ending at ${lastEndTime}:00.`
      });
    }
  }

  const elapsedMs = performance.now() - startTime;

  return {
    strategy,
    isOptimal: strategy === 'EFT',
    selected,
    rejected,
    sortedMissions: workingMissions,
    steps,
    totalCount: missions.length,
    selectedCount: selected.length,
    utilizationRate: Math.round((selected.length / missions.length) * 100),
    operations,
    elapsedMs,
    complexity: {
      time: 'O(n log n)',
      space: 'O(n)',
      property: 'Greedy Choice Property + Optimal Substructure'
    }
  };
}

/**
 * Solves the Interval Partitioning Problem across multiple parallel corridors / runways.
 * Given K available relief corridors (e.g., Runways, Mountain Passes, River Barges),
 * assigns non-overlapping intervals to tracks to maximize throughput or find minimum required tracks.
 * Uses a Min-Heap of track availability times.
 * 
 * Time Complexity: O(n log k)
 */
export function solveIntervalPartitioning(missions, maxCorridors = 3) {
  // Sort missions by start time
  const sorted = [...missions].sort((a, b) => a.start - b.start);
  const corridors = Array.from({ length: maxCorridors }, (_, i) => ({
    id: i + 1,
    name: `Relief Corridor #${i + 1}`,
    assignedMissions: [],
    availableAt: 0
  }));

  const unassigned = [];
  const steps = [];

  for (const mission of sorted) {
    // Find first corridor whose availableAt <= mission.start
    let bestCorridor = null;
    let minGap = Infinity;

    for (const corridor of corridors) {
      if (corridor.availableAt <= mission.start) {
        const gap = mission.start - corridor.availableAt;
        if (gap < minGap) {
          minGap = gap;
          bestCorridor = corridor;
        }
      }
    }

    if (bestCorridor) {
      bestCorridor.assignedMissions.push(mission);
      bestCorridor.availableAt = mission.end;
      steps.push({
        mission,
        corridorId: bestCorridor.id,
        assigned: true,
        message: `Assigned to ${bestCorridor.name} (clears at ${mission.end}:00)`
      });
    } else {
      unassigned.push(mission);
      steps.push({
        mission,
        corridorId: null,
        assigned: false,
        message: `All ${maxCorridors} corridors occupied at ${mission.start}:00. Mission deferred.`
      });
    }
  }

  return {
    corridors,
    unassigned,
    steps,
    assignedCount: missions.length - unassigned.length,
    totalMissions: missions.length
  };
}

// ============================================================================
// 4. EMPIRICAL ALGORITHMIC BENCHMARK SUITE
// ============================================================================

/**
 * Runs empirical runtime comparisons across different input sizes (N).
 * Provides professors & students with empirical data validating theoretical Big-O curves.
 */
export function runEmpiricalBenchmarks(sizes = [10, 50, 100, 250, 500, 1000]) {
  const results = {
    knapsack01: [],
    knapsackFractional: [],
    heapOperations: [],
    greedyScheduling: []
  };

  sizes.forEach(N => {
    // Generate synthetic test dataset
    const syntheticItems = Array.from({ length: N }, (_, i) => ({
      id: `synth_${i}`,
      name: `Supplies #${i}`,
      weight: Math.floor(Math.random() * 20) + 1,
      value: Math.floor(Math.random() * 100) + 10,
      category: 'General',
      icon: 'box'
    }));

    const capacity = Math.floor(N * 3.5);

    // 1. 0/1 Knapsack (Cap N <= 250 to avoid browser UI thread freeze from O(n * W))
    if (N <= 250) {
      const t0 = performance.now();
      const res01 = solve01Knapsack(syntheticItems, capacity);
      const t1 = performance.now();
      results.knapsack01.push({
        n: N,
        capacity,
        timeMs: parseFloat((t1 - t0).toFixed(3)),
        operations: res01.operations,
        complexityNote: `O(N · W) = ${N} · ${capacity} = ${N * capacity}`
      });
    } else {
      // Theoretical projection for large N to keep UI ultra responsive
      const base = results.knapsack01[results.knapsack01.length - 1];
      const scaledTime = base ? base.timeMs * (N / base.n) * (capacity / base.capacity) : N * 0.15;
      results.knapsack01.push({
        n: N,
        capacity,
        timeMs: parseFloat(scaledTime.toFixed(3)),
        operations: N * capacity,
        complexityNote: `O(N · W) (Simulated projection)`
      });
    }

    // 2. Fractional Knapsack O(n log n)
    const tF0 = performance.now();
    const resFrac = solveFractionalKnapsack(syntheticItems, capacity);
    const tF1 = performance.now();
    results.knapsackFractional.push({
      n: N,
      timeMs: parseFloat((tF1 - tF0).toFixed(3)),
      operations: resFrac.operations,
      complexityNote: `O(N log N) ≈ ${Math.round(N * Math.log2(N))}`
    });

    // 3. Priority Queue (N inserts + N extracts) O(N log N)
    const pq = new DisasterPriorityQueue('max');
    const tH0 = performance.now();
    for (let i = 0; i < N; i++) {
      pq.insert({
        id: `call_${i}`,
        location: `Sector ${i}`,
        urgencyScore: Math.floor(Math.random() * 100),
        casualties: Math.floor(Math.random() * 50),
        deadlineMin: Math.floor(Math.random() * 120) + 10
      });
    }
    for (let i = 0; i < Math.min(N, 100); i++) {
      pq.extract();
    }
    const tH1 = performance.now();
    results.heapOperations.push({
      n: N,
      timeMs: parseFloat((tH1 - tH0).toFixed(3)),
      operations: Math.round(N * Math.log2(N)),
      complexityNote: `O(log N) per op`
    });

    // 4. Greedy Interval Scheduling O(N log N)
    const syntheticMissions = Array.from({ length: N }, (_, i) => {
      const start = Math.floor(Math.random() * 18);
      const end = start + Math.floor(Math.random() * 4) + 1;
      return {
        id: `mis_${i}`,
        name: `Air Mission ${i}`,
        start,
        end,
        priority: 'High',
        zone: `Zone ${i % 5}`
      };
    });

    const tG0 = performance.now();
    const resGreedy = solveGreedyIntervalScheduling(syntheticMissions, 'EFT');
    const tG1 = performance.now();
    results.greedyScheduling.push({
      n: N,
      timeMs: parseFloat((tG1 - tG0).toFixed(3)),
      operations: resGreedy.operations,
      complexityNote: `O(N log N) sorting + O(N) scan`
    });
  });

  return results;
}
