document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('reportChart')
  if (!canvas) {
    console.error("❌ reportChart canvas not found")
    return
  }

  const ctx = canvas.getContext('2d')

  // Parse chart data passed from Handlebars
  const chartLabels = JSON.parse(document.getElementById('reportChart').dataset.labels || '[]')
  const chartValues = JSON.parse(document.getElementById('reportChart').dataset.values || '[]')

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Inventory Events',
        data: chartValues,
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
})
