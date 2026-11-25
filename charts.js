/* =========================================
   1. CHURN DETECTION
========================================= */

function isChurned(row) {
  const value = String(row.Churn).trim().toLowerCase();

  return value === "1" ||
         value === "true" ||
         value === "yes";
}


/* =========================================
   2. KPI CALCULATIONS
========================================= */

const totalCustomers = data.length;

const churnedCustomers = data.filter(isChurned).length;
const retainedCustomers = totalCustomers - churnedCustomers;

const churnRate = totalCustomers > 0
  ? churnedCustomers / totalCustomers * 100
  : 0;

const retentionRate = totalCustomers > 0
  ? retainedCustomers / totalCustomers * 100
  : 0;

const cashbackValues = data
  .map(row => Number(row.CashbackAmount))
  .filter(value => Number.isFinite(value));

const averageCashback = cashbackValues.length > 0
  ? cashbackValues.reduce((sum, value) => sum + value, 0) /
    cashbackValues.length
  : null;


/* =========================================
   3. DISPLAY KPI VALUES
========================================= */

document.getElementById("totalCustomers").textContent =
  totalCustomers.toLocaleString();

document.getElementById("churnRate").textContent =
  churnRate.toFixed(1) + "%";

document.getElementById("retentionRate").textContent =
  retentionRate.toFixed(1) + "%";

document.getElementById("averageCashback").textContent =
  averageCashback !== null
    ? averageCashback.toFixed(2)
    : "N/A";


/* =========================================
   4. CATEGORY STATISTICS
========================================= */

const categoryStats = {};

data.forEach(row => {

  const category = String(row.PreferedOrderCat || "Unknown").trim();

  if (!categoryStats[category]) {
    categoryStats[category] = {
      total: 0,
      churned: 0
    };
  }

  categoryStats[category].total++;

  if (isChurned(row)) {
    categoryStats[category].churned++;
  }

});

const labels = Object.keys(categoryStats);

const churnedByCategory = labels.map(
  category => categoryStats[category].churned
);


/* =========================================
   5. CHART COLORS
========================================= */

const chartColors = [
  "#3B82F6",
  "#F59E0B",
  "#22D3E6",
  "#A78BFA",
  "#34D399",
  "#94A3B8"
];


/* =========================================
   6. CHURN RATE TREND - BAR CHART
========================================= */

// Group customers by Tenure

const tenureStats = {};

data.forEach(row => {

  const tenure = Number(row.Tenure);

  if (row.Tenure === null ||
      row.Tenure === undefined ||
      row.Tenure === "" ||
      !Number.isFinite(tenure)) {
    return;
  }

  if (!tenureStats[tenure]) {
    tenureStats[tenure] = {
      total: 0,
      churned: 0
    };
  }

  tenureStats[tenure].total++;

  if (isChurned(row)) {
    tenureStats[tenure].churned++;
  }

});

const tenureLabels = Object.keys(tenureStats)
  .map(Number)
  .sort((a, b) => a - b);

const tenureChurnRates = tenureLabels.map(tenure => {

  const stats = tenureStats[tenure];

  return stats.total > 0
    ? (stats.churned / stats.total) * 100
    : 0;

});

const trendCanvas = document.getElementById("churnTrendChart");

if (trendCanvas) {

  new Chart(trendCanvas, {

    type: "bar",

    data: {

      labels: tenureLabels,

      datasets: [{

        label: "Churn Rate (%)",

        data: tenureChurnRates,

        backgroundColor: "#22D3E6",

        borderColor: "#22D3E6",

        borderWidth: 1,

        borderRadius: 6,

        maxBarThickness: 35

      }]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {
          labels: {
            color: "#F1F5F9"
          }
        },

        tooltip: {

          callbacks: {

            label: context =>
              "Churn Rate: " + context.parsed.y.toFixed(1) + "%"

          }

        }

      },

      scales: {

        x: {

          title: {
            display: true,
            text: "Customer Tenure (Months)",
            color: "#94A3B8"
          },

          ticks: {
            color: "#94A3B8"
          },

          grid: {
            display: false
          }

        },

        y: {

          beginAtZero: true,

          max: 100,

          title: {
            display: true,
            text: "Churn Rate (%)",
            color: "#94A3B8"
          },

          ticks: {
            color: "#94A3B8",
            callback: value => value + "%"
          },

          grid: {
            color: "#233653"
          }

        }

      }

    }

  });

}


/* =========================================
   7. CENTER TEXT PLUGIN
========================================= */

const centerTextPlugin = {

  id: "centerText",

  afterDraw(chart) {

    const meta = chart.getDatasetMeta(0);

    if (!meta.data.length) return;

    const ctx = chart.ctx;
    const x = meta.data[0].x;
    const y = meta.data[0].y;

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#F1F5F9";
    ctx.font = "bold 28px Segoe UI";
    ctx.fillText(churnRate.toFixed(1) + "%", x, y - 8);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "13px Segoe UI";
    ctx.fillText("Overall Churn", x, y + 20);

    ctx.restore();

  }

};


/* =========================================
   8. DOUGHNUT CHART
========================================= */

const categoryCanvas = document.getElementById("churnChart");

if (categoryCanvas) {

  new Chart(categoryCanvas, {

    type: "doughnut",

    plugins: [centerTextPlugin],

    data: {

      labels: labels,

      datasets: [{

        label: "Churned Customers",

        data: churnedByCategory,

        backgroundColor: chartColors,

        borderColor: "#101f38",

        borderWidth: 3,

        hoverOffset: 10

      }]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      cutout: "62%",

      plugins: {

        legend: {

          position: "right",

          labels: {

            color: "#F1F5F9",
            padding: 18,
            usePointStyle: true,
            pointStyle: "circle"

          }

        },

        tooltip: {

          backgroundColor: "#142541",

          titleColor: "#22D3E6",

          bodyColor: "#F1F5F9",

          callbacks: {

            afterLabel(context) {

              const stats = categoryStats[context.label];

              const rate = stats.total > 0
                ? (stats.churned / stats.total * 100).toFixed(1)
                : "0.0";

              return stats.churned + " of " +
                stats.total + " customers churned (" +
                rate + "%)";

            }

          }

        }

      }

    }

  });

}