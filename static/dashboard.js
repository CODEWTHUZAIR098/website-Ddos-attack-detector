// static/js/dashboard.js

const ctx = document.getElementById('trafficChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: { labels: [], datasets: [{ label: 'Requests', data: [], backgroundColor: '#1565c0', borderRadius: 6 }] },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#607d9a' }, grid: { color: '#0d1b3e' } },
      y: { ticks: { color: '#607d9a' }, grid: { color: '#1e3a6a' }, beginAtZero: true }
    }
  }
});

async function fetchData() {
  try {
    const res = await fetch('/api');
    const json = await res.json();
    const traffic = json.traffic || {};
    const blocked = json.blocked || [];

    // Stats
    const ips = Object.keys(traffic);
    const totalReqs = Object.values(traffic).reduce((a, b) => a + b, 0);
    document.getElementById('stat-total').textContent = ips.length;
    document.getElementById('stat-active').textContent = totalReqs;
    document.getElementById('stat-blocked').textContent = blocked.length;

    // Chart
    chart.data.labels = ips;
    chart.data.datasets[0].data = Object.values(traffic);
    chart.data.datasets[0].backgroundColor = Object.values(traffic).map(v => v > 10 ? '#c62828' : '#1565c0');
    chart.update();

    // Traffic Table
    const tbody = document.getElementById('traffic-table');
    if (ips.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="no-data">No traffic data yet</td></tr>';
    } else {
      tbody.innerHTML = ips.map((ip, i) => {
        const count = traffic[ip];
        const isBlocked = blocked.includes(ip);
        const level = isBlocked ? '<span class="badge badge-blocked">Blocked</span>'
                    : count > 10   ? '<span class="badge badge-attack">Attack 🚨</span>'
                    :                '<span class="badge badge-safe">Safe ✅</span>';
        return `<tr><td>${i+1}</td><td>${ip}</td><td>${count}</td><td>${level}</td></tr>`;
      }).join('');
    }

    // Blocked Table
    const btbody = document.getElementById('blocked-table');
    if (blocked.length === 0) {
      btbody.innerHTML = '<tr><td colspan="3" class="no-data">No blocked IPs</td></tr>';
    } else {
      btbody.innerHTML = blocked.map((ip, i) =>
        `<tr><td>${i+1}</td><td>${ip}</td><td><span class="badge badge-blocked">Blocked</span></td></tr>`
      ).join('');
    }

    document.getElementById('last-refresh').textContent = 'Last refreshed: ' + new Date().toLocaleTimeString();
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

fetchData();
setInterval(fetchData, 3000);