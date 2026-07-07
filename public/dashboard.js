const dashboardData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  income: [50000, 55000, 60000, 65000, 70000, 80000],
  expense: [30000, 35000, 40000, 42000, 45000, 50000],
  categories: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment'],
  categoryValues: [30, 20, 25, 15, 10],
};

function renderBarChart() {
  const container = document.getElementById('barChart');
  if (!container) return;

  const maxValue = Math.max(...dashboardData.income, ...dashboardData.expense);
  const bars = dashboardData.months
    .map((month, index) => {
      const incomeHeight = Math.round((dashboardData.income[index] / maxValue) * 100);
      const expenseHeight = Math.round((dashboardData.expense[index] / maxValue) * 100);
      return `
        <div class="bar-group">
          <div class="bar-stack">
            <div class="bar income" style="height: ${incomeHeight}%"></div>
            <div class="bar expense" style="height: ${expenseHeight}%"></div>
          </div>
          <span class="month-label">${month}</span>
        </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="bar-legend">
      <span><i class="legend-dot income"></i>Income</span>
      <span><i class="legend-dot expense"></i>Expense</span>
    </div>
    <div class="bar-chart">${bars}</div>`;
}

function renderPieChart() {
  const container = document.getElementById('pieChart');
  if (!container) return;

  const total = dashboardData.categoryValues.reduce((sum, value) => sum + value, 0);
  let startAngle = 0;

  const segments = dashboardData.categoryValues
    .map((value, index) => {
      const segmentAngle = (value / total) * 360;
      const endAngle = startAngle + segmentAngle;
      const color = ['#e67e22', '#800020', '#c0392b', '#d4af37', '#7f8c8d'][index % 5];
      const segment = `conic-gradient(${color} ${startAngle}deg ${endAngle}deg)`;
      startAngle = endAngle;
      return `<div class="pie-segment" style="background:${segment}"></div>`;
    })
    .join('');

  const legend = dashboardData.categories
    .map((label, index) => {
      const color = ['#e67e22', '#800020', '#c0392b', '#d4af37', '#7f8c8d'][index % 5];
      return `<li><span class="legend-dot" style="background:${color}"></span>${label}</li>`;
    })
    .join('');

  container.innerHTML = `
    <div class="pie-chart-wrapper">
      <div class="pie-chart-slice">${segments}</div>
    </div>
    <ul class="pie-legend">${legend}</ul>`;
}

if (typeof window.Chart === 'function') {
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: dashboardData.months,
      datasets: [
        { label: 'Income', data: dashboardData.income, backgroundColor: '#e67e22' },
        { label: 'Expense', data: dashboardData.expense, backgroundColor: '#800020' },
      ],
    },
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: dashboardData.categories,
      datasets: [{ data: dashboardData.categoryValues, backgroundColor: ['#e67e22', '#800020', '#c0392b', '#d4af37', '#7f8c8d'] }],
    },
  });
} else {
  renderBarChart();
  renderPieChart();
}

document.addEventListener('DOMContentLoaded', () => {
  // Protect page - redirect to login if not authenticated
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const logoutButton = document.getElementById('logout-button');

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'login.html';
    });
  }
});
