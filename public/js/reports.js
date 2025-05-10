document.addEventListener('DOMContentLoaded', () => {
  function renderChart(canvasId, type, label, backgroundColor) {
    const canvas = document.getElementById(canvasId)
    if(!canvas){
        return
    }

    const ctx = canvas.getContext('2d')
    const labels = JSON.parse(canvas.dataset.labels || '[]')
    const values = JSON.parse(canvas.dataset.values || '[]')

    new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: values,
          backgroundColor: backgroundColor
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    })
  }

  renderChart('stockChart', 'bar', 'Stock Levels', '#60a5fa')
  renderChart('lowStockChart', 'doughnut', 'Stock Distribution', ['#10b981', '#fbbf24', '#ef4444'])
  renderChart('topSellingChart', 'bar', 'Top Sellers', '#3b82f6')
})

