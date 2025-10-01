// ---------------- Helper Functions ----------------

// Get selected radio button value (Yes = 1, No = 0)
function getRadioValue(name) {
  const radios = document.getElementsByName(name);
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) return parseInt(radios[i].value);
  }
  return -1;
}

// ---------------- Chart.js Setup ----------------
let yieldChart1 = null; // Fertilizer vs Yield
let yieldChart2 = null; // Rainfall vs Yield

// Render Fertilizer vs Yield bar chart
function renderFertilizerGraph(labels, data, crop) {
  const ctx = document.getElementById("yieldChart").getContext("2d");
  if (yieldChart1) yieldChart1.destroy();

  yieldChart1 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Estimated Yield for ${crop} (tons/hectare)`,
          data: data,
          backgroundColor: "rgba(165, 220, 134, 0.7)",
          borderColor: "rgba(138, 199, 111, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Yield (tons/hectare)" },
        },
        x: { title: { display: true, text: "Fertilizer Used" } },
      },
    },
  });
}

// Render Rainfall vs Yield line chart
function renderRainfallGraph(rainfallValues, yields, crop) {
  const ctx2 = document.getElementById("yieldChartRainfall").getContext("2d");
  if (yieldChart2) yieldChart2.destroy();

  yieldChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      labels: rainfallValues,
      datasets: [
        {
          label: `Yield vs Rainfall for ${crop}`,
          data: yields,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Yield (tons/hectare)" },
        },
        x: { title: { display: true, text: "Rainfall (mm)" } },
      },
    },
  });
}

// ---------------- Main Functions ----------------
function onClickedEstimateYield() {
  console.log("Estimate Yield button clicked");

  // Read input values
  const fertilizer = getRadioValue("uiFertilizer");
  const irrigation = getRadioValue("uiIrrigation");
  const crop = $("#uiCrop").val();
  const region = $("#uiRegion").val();
  const soil = $("#uiSoil").val();
  const weather = $("#uiWeather").val();
  const rainfall = parseFloat($("#uiRainfall").val());
  const temperature = parseFloat($("#uiTemperature").val());
  const harvest_days = parseInt($("#uiHarvestDays").val());
  const estYield = $("#uiEstimatedYield");

  if (
    !crop ||
    !region ||
    !soil ||
    !weather ||
    isNaN(rainfall) ||
    isNaN(temperature) ||
    isNaN(harvest_days)
  ) {
    estYield.html("<h2>Please fill all fields correctly</h2>");
    return;
  }

  // Show chart containers
  $("#yieldChartContainer").show();
  $("#yieldChartRainfallContainer").show();

  // 1️⃣ AJAX for currently selected fertilizer to show yield
  $.ajax({
    url: "http://127.0.0.1:5000/predict_yield",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      fertilizer: fertilizer,
      irrigation: irrigation,
      crop: crop,
      region: region,
      soil: soil,
      weather: weather,
      rainfall: rainfall,
      temperature: temperature,
      harvest_days: harvest_days,
    }),
    success: function (data) {
      console.log(data);
      estYield.html("<h2>" + data.estimated_yield + " Tons/Hectare</h2>");
    },
    error: function (err) {
      console.error(err);
      estYield.html("<h2>Error estimating yield</h2>");
    },
  });

  // 2️⃣ Generate Fertilizer vs Yield chart (Yes / No)
  const fertilizerOptions = [1, 0];
  const fertLabels = ["Yes", "No"];
  let fertYields = [];
  const fertRequests = fertilizerOptions.map((fert) => {
    return $.ajax({
      url: "http://127.0.0.1:5000/predict_yield",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        fertilizer: fert,
        irrigation: irrigation,
        crop: crop,
        region: region,
        soil: soil,
        weather: weather,
        rainfall: rainfall,
        temperature: temperature,
        harvest_days: harvest_days,
      }),
    }).then((res) => {
      fertYields.push(res.estimated_yield);
    });
  });
  $.when.apply($, fertRequests).then(() => {
    renderFertilizerGraph(fertLabels, fertYields, crop);
  });

  // 3️⃣ Generate Rainfall vs Yield line chart (example: 50 to 500 mm)
  const rainfallValues = [];
  const rainfallYields = [];
  const rainfallRange = [50, 100, 200, 300, 400, 500]; // Example values
  const rainRequests = rainfallRange.map((rf) => {
    return $.ajax({
      url: "http://127.0.0.1:5000/predict_yield",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        fertilizer: fertilizer,
        irrigation: irrigation,
        crop: crop,
        region: region,
        soil: soil,
        weather: weather,
        rainfall: rf,
        temperature: temperature,
        harvest_days: harvest_days,
      }),
    }).then((res) => {
      rainfallValues.push(rf);
      rainfallYields.push(res.estimated_yield);
    });
  });
  $.when.apply($, rainRequests).then(() => {
    renderRainfallGraph(rainfallValues, rainfallYields, crop);
  });
}

// ---------------- Load crops and regions ----------------
function onPageLoad() {
  console.log("Document loaded");

  // Fetch crop names
  $.get("http://127.0.0.1:5000/get_crop_names", function (data) {
    if (data) {
      const uiCrop = $("#uiCrop");
      uiCrop.empty();
      uiCrop.append(new Option("Select Crop", ""));
      data.crops.forEach((c) => uiCrop.append(new Option(c, c)));
    }
  });

  // Hardcoded regions
  const regions = [
    "Region_North",
    "Region_South",
    "Region_East",
    "Region_West",
  ];
  const uiRegion = $("#uiRegion");
  uiRegion.empty();
  uiRegion.append(new Option("Select Region", ""));
  regions.forEach((r) => uiRegion.append(new Option(r, r)));

  // Hide charts initially
  $("#yieldChartContainer").hide();
  $("#yieldChartRainfallContainer").hide();
}

// ---------------- Initialize ----------------
window.onload = onPageLoad;
