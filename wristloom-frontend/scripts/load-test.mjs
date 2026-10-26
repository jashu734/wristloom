// ============================================================
// Wristloom — Automated Concurrency & Load Testing Script
// Layer 15: Scaling & Capacity (15-Layer SaaS Playbook, p. 32-33)
// Simulates concurrent users ramping against critical endpoints
// ============================================================

const TARGET_HOST = process.env.LOAD_TEST_TARGET || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '50', 10);

const ENDPOINTS = [
  { name: 'Liveness Check', path: '/api/health/live' },
  { name: 'Deep Health Check', path: '/api/health' },
  { name: 'Catalog Shop', path: '/api/products' },
  { name: 'Technicians Roster', path: '/api/technicians' },
];

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

async function benchmarkEndpoint(endpoint) {
  const url = `${TARGET_HOST}${endpoint.path}`;
  const latencies = [];
  let successful = 0;
  let failed = 0;

  const startBatchTime = Date.now();

  const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      queue.pop();
      const reqStart = Date.now();
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Wristloom-LoadTest/1.0' } });
        const latency = Date.now() - reqStart;
        latencies.push(latency);
        if (res.ok) {
          successful++;
        } else {
          failed++;
        }
      } catch (err) {
        latencies.push(Date.now() - reqStart);
        failed++;
      }
    }
  });

  await Promise.all(workers);
  const totalDurationSeconds = (Date.now() - startBatchTime) / 1000;
  latencies.sort((a, b) => a - b);

  return {
    endpoint: endpoint.name,
    path: endpoint.path,
    totalRequests: TOTAL_REQUESTS,
    successful,
    failed,
    requestsPerSecond: (TOTAL_REQUESTS / totalDurationSeconds).toFixed(1),
    p50: calculatePercentile(latencies, 50),
    p95: calculatePercentile(latencies, 95),
    p99: calculatePercentile(latencies, 99),
    min: latencies[0] || 0,
    max: latencies[latencies.length - 1] || 0,
  };
}

async function runLoadTest() {
  console.log('====================================================');
  console.log(`WRISTLOOM SCALING BENCHMARK & LOAD TEST`);
  console.log(`Target: ${TARGET_HOST}`);
  console.log(`Concurrency: ${CONCURRENCY} workers | Requests per endpoint: ${TOTAL_REQUESTS}`);
  console.log('====================================================\n');

  const results = [];
  for (const ep of ENDPOINTS) {
    process.stdout.write(`Benchmarking ${ep.name} (${ep.path})... `);
    const result = await benchmarkEndpoint(ep);
    console.log(`done in ${result.p50}ms (p50)`);
    results.push(result);
  }

  console.log('\n====================================================');
  console.log('BENCHMARK SUMMARY RESULTS');
  console.log('====================================================');
  console.table(results);
}

runLoadTest().catch((err) => {
  console.error('Load test runner failed:', err);
  process.exit(1);
});
