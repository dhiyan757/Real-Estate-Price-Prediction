
const API_BASE = "http://127.0.0.1:5000";

const form = document.getElementById("valuationForm");
const locationInput = document.getElementById("location");
const locationOptions = document.getElementById("locationOptions");
const areaInput = document.getElementById("total_sqft");
const areaSlider = document.getElementById("areaSlider");
const bhkInput = document.getElementById("bhk");
const bathInput = document.getElementById("bath");
const apiDot = document.getElementById("apiDot");
const apiStatus = document.getElementById("apiStatus");
const formError = document.getElementById("formError");
const estimateButton = document.getElementById("estimateButton");
const buttonText = document.getElementById("buttonText");

let supportedLocations = [];

// Display an error below the form.
function showError(message) {
    formError.textContent = message;
    formError.classList.add("visible");
}

function clearError() {
    formError.textContent = "";
    formError.classList.remove("visible");
}

// Update the backend connection indicator.
function setApiStatus(online, message) {
    apiDot.classList.toggle("online", online);
    apiDot.classList.toggle("offline", !online);
    apiStatus.textContent = message;
}

// Fetch the locations known to the trained model.
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE}/get_location_names`);

        if (!response.ok) {
            throw new Error("Could not retrieve locations.");
        }

        const data = await response.json();

        if (!Array.isArray(data.locations)) {
            throw new Error("The location response has an unexpected format.");
        }

        supportedLocations = data.locations;

        locationOptions.replaceChildren();

        supportedLocations.forEach((location) => {
            const option = document.createElement("option");
            option.value = location;
            locationOptions.appendChild(option);
        });

        setApiStatus(true, "Valuation engine connected");
    } catch (error) {
        setApiStatus(false, "Backend unavailable");
        console.error("Location loading error:", error);
    }
}

// Keep the text input and slider synchronized.
areaInput.addEventListener("input", () => {
    const value = Number(areaInput.value);

    if (
        Number.isFinite(value) &&
        value >= Number(areaSlider.min) &&
        value <= Number(areaSlider.max)
    ) {
        areaSlider.value = String(value);
    }
    clearError();
});

areaSlider.addEventListener("input", () => {
    areaInput.value = areaSlider.value;
    clearError();
});

// Area preset buttons.
document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => {
        const area = button.dataset.area;
        areaInput.value = area;
        areaSlider.value = area;
        clearError();
    });
});

// Configure the BHK and bathroom selector buttons.
function setupChoiceGroup(groupId, hiddenInputId) {
    const group = document.getElementById(groupId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const buttons = group.querySelectorAll(".choice");

    buttons.forEach((button) => {
        button.setAttribute("aria-pressed", String(
            button.classList.contains("active")
        ));

        button.addEventListener("click", () => {
            buttons.forEach((item) => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
            hiddenInput.value = button.dataset.value;
            clearError();
        });
    });
}

setupChoiceGroup("bhkChoices", "bhk");
setupChoiceGroup("bathChoices", "bath");

locationInput.addEventListener("input", clearError);

// Check whether the selected location is returned by the model.
function findSupportedLocation(inputValue) {
    const normalized = inputValue.trim().toLowerCase();

    return supportedLocations.find(
        (location) => location.toLowerCase() === normalized
    );
}

// Handle form submission and make the prediction request.
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const location = findSupportedLocation(locationInput.value);
    const area = Number(areaInput.value);
    const bhk = Number(bhkInput.value);
    const bath = Number(bathInput.value);

    if (!location) {
        showError(
            "Please select a location from the suggestions supported by the model."
        );
        locationInput.focus();
        return;
    }

    if (!Number.isFinite(area) || area < 100 || area > 50000) {
        showError("Enter a property area between 100 and 50,000 sq ft.");
        areaInput.focus();
        return;
    }

    if (!Number.isInteger(bhk) || bhk < 1 || bhk > 5) {
        showError("Please select a valid BHK configuration.");
        return;
    }

    if (!Number.isInteger(bath) || bath < 1 || bath > 5) {
        showError("Please select a valid number of bathrooms.");
        return;
    }

    estimateButton.disabled = true;
    buttonText.textContent = "Calculating valuation...";

    try {
        const body = new URLSearchParams({
            total_sqft: String(area),
            location: location,
            bhk: String(bhk),
            bath: String(bath)
        });

        const response = await fetch(`${API_BASE}/predict_home_price`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: body.toString()
        });

        if (!response.ok) {
            throw new Error(
                `The prediction request failed (HTTP ${response.status}).`
            );
        }

        const data = await response.json();
        const estimatedPrice = Number(data.estimated_price);

        if (!Number.isFinite(estimatedPrice) || estimatedPrice < 0) {
            throw new Error("The model returned an invalid estimated price.");
        }

        const valuation = {
            location: location,
            total_sqft: area,
            bhk: bhk,
            bath: bath,
            estimated_price: estimatedPrice
        };

        // Store the current result for the next page only.
        sessionStorage.setItem(
            "dhiyansRealEstateLastValuation",
            JSON.stringify(valuation)
        );

        window.location.href = "results.html";
    } catch (error) {
        console.error("Prediction error:", error);

        showError(
            "Unable to calculate the valuation. Check that the Flask server " +
            "is running at " + API_BASE + " and try again."
        );
    } finally {
        estimateButton.disabled = false;
        buttonText.textContent = "Calculate property value";
    }
});

// Load locations and check backend availability when the page opens.
loadLocations();
