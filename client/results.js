
const API_BASE = "http://127.0.0.1:5000";

const STORAGE_KEY = "dhiyansRealEstateLastValuation";

const priceValue = document.getElementById("priceValue");
const croreValue = document.getElementById("croreValue");
const pricePerSqft = document.getElementById("pricePerSqft");
const resultArea = document.getElementById("resultArea");
const resultLocation = document.getElementById("resultLocation");
const resultBhk = document.getElementById("resultBhk");
const resultBath = document.getElementById("resultBath");
const resultAreaDetail = document.getElementById("resultAreaDetail");
const newEstimateButton = document.getElementById("newEstimateButton");

// Format values using the Indian numbering system.
function formatIndianNumber(value, decimals = 2) {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Format a number as Indian rupees.
function formatRupees(value) {
    return "₹" + formatIndianNumber(value, 2);
}

// Display the stored prediction and property details.
function renderResults() {
    const savedData = sessionStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        // No valuation was submitted in this browser session.
        window.location.replace("index.html");
        return;
    }

    let valuation;

    try {
        valuation = JSON.parse(savedData);
    } catch (error) {
        console.error("Could not read the saved valuation:", error);
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.replace("index.html");
        return;
    }

    const price = Number(valuation.estimated_price);
    const area = Number(valuation.total_sqft);
    const bhk = Number(valuation.bhk);
    const bath = Number(valuation.bath);
    const location = String(valuation.location || "");

    if (
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isFinite(area) ||
        area <= 0 ||
        !Number.isFinite(bhk) ||
        !Number.isFinite(bath) ||
        !location.trim()
    ) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.replace("index.html");
        return;
    }

    // The backend returns the estimated price in lakhs.
    priceValue.textContent = formatIndianNumber(price);

    // One crore equals 100 lakhs.
    if (price >= 100) {
        croreValue.textContent =
            "Approximately ₹" + formatIndianNumber(price / 100) + " crore";
    } else {
        croreValue.textContent =
            "Equivalent to ₹" +
            formatIndianNumber(price * 100000) +
            " in estimated total value";
    }

    // Convert lakhs to rupees before dividing by square feet.
    const pricePerSquareFoot = (price * 100000) / area;

    pricePerSqft.textContent = formatRupees(pricePerSquareFoot);
    resultArea.textContent = formatIndianNumber(area, 0) + " sq ft";
    resultAreaDetail.textContent = formatIndianNumber(area, 0) + " sq ft";

    resultLocation.textContent = location;
    resultBhk.textContent = bhk + (bhk === 1 ? " BHK" : " BHK");
    resultBath.textContent = bath + (bath === 1 ? " bathroom" : " bathrooms");
}

// Start a completely new estimate.
newEstimateButton.addEventListener("click", () => {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = "index.html";
});

renderResults();
