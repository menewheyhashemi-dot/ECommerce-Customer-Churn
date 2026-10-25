// ---------- Decide whether one customer has churned ----------
// The Churn field is usually 1 (churned) or 0 (stayed),
// but we also accept true / "Yes" in case the data is written that way.
function isChurned(row) {
  const value = String(row.Churn).trim().toLowerCase();
  return value === "1"  value === "true"  value === "yes";
}

// ---------- Count customers and churned customers per category ----------
const categoryStats = {}; // example: { Laptop: { total: 10, churned: 3 } }

data.forEach(function (row) {
  const category = row.PreferedOrderCat;

  // Create the counters the first time we see a category
  if (!categoryStats[category]) {
    categoryStats[category] = { total: 0, churned: 0 };
  }

  categoryStats[category].total++;
  if (isChurned(row)) {
    categoryStats[category].churned++;
  }
});

// ---------- Prepare labels and values for the chart ----------
const labels = Object.keys(categoryStats);
const churnRates = labels.map(function (category) {
  const stats = categoryStats[category];
  // Churn rate in percent = churned / total * 100, rounded to 1 decimal place
  return Math.round((stats.churned / stats.total) * 1000) / 10;
});

// ---------- Draw the bar chart ----------
const ctx = document.getElementById("churnChart").getContext("2d");

new Chart(ctx, {
  type: "bar",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Churn rate (%)",
        data: churnRates,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(30, 64, 175, 1)",
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false, // lets the chart fill its wrapper
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Churn rate (%)" }
      },
      x: {
        title: { display: true, text: "Preferred order category" }
      }
    },
    plugins: {
      // Show the number of customers in each category inside the tooltip
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const stats = categoryStats[context.label];
            return stats.churned + " of " + stats.total + " customers churned";
          }
        }
      }
    }
  }
});
