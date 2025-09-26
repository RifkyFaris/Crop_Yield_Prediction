// Get radio button value
function getRadioValue(name) {
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return parseInt(radios[i].value);
    }
    return -1;
}

// Called when Estimate Yield button clicked
function onClickedEstimateYield() {
    console.log("Estimate Yield button clicked");

    var fertilizer = getRadioValue("uiFertilizer");
    var irrigation = getRadioValue("uiIrrigation");
    var crop = $("#uiCrop").val();
    var region = $("#uiRegion").val();
    var soil = $("#uiSoil").val();
    var weather = $("#uiWeather").val();
    var rainfall = parseFloat($("#uiRainfall").val());
    var temperature = parseFloat($("#uiTemperature").val());
    var harvest_days = parseInt($("#uiHarvestDays").val());
    var estYield = $("#uiEstimatedYield");

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
            harvest_days: harvest_days
        }),
        success: function(data, status) {
            console.log(data);
            estYield.html("<h2>" + data.estimated_yield + " Tons/Hectare</h2>");
        },
        error: function(err) {
            console.error(err);
            estYield.html("<h2>Error estimating yield</h2>");
        }
    });
}

// Load crops and regions when page loads
function onPageLoad() {
    console.log("Document loaded");

    // Fetch crop names from server
    $.get("http://127.0.0.1:5000/get_crop_names", function(data, status) {
        if (data) {
            var crops = data.crops;
            var uiCrop = $("#uiCrop");
            uiCrop.empty();
            uiCrop.append(new Option("Select Crop", ""));
            for (var i in crops) {
                uiCrop.append(new Option(crops[i], crops[i]));
            }
        }
    });

    // Hardcoded regions
    var regions = ["Region_North", "Region_South", "Region_East", "Region_West"];
    var uiRegion = $("#uiRegion");
    uiRegion.empty();
    uiRegion.append(new Option("Select Region", ""));
    for (var i in regions) {
        uiRegion.append(new Option(regions[i], regions[i]));
    }
}

window.onload = onPageLoad;
