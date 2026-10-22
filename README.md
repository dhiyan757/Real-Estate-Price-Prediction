# 🏡 Bangalore Real Estate Price Prediction App

An end-to-end Machine Learning web application that predicts real estate prices in Bangalore, India based on location, total square footage, number of bedrooms (BHK), and bathrooms.

---

## ✨ Features

- **Interactive Machine Learning Model**: Uses a trained Linear Regression model to estimate home prices accurately.
- **Flask REST API Backend**: Serves location data and dynamic price predictions over HTTP endpoints.
- **Modern Glassmorphism UI**: High-performance, responsive frontend with dynamic location search, range sliders, and quick preset buttons.
- **Dual Currency Valuation**: Displays estimated valuation in **Lakhs (L)** and automatically converts to **Crores (Cr)** for properties $\ge 100$ Lakhs.

---

## 🛠️ Tech Stack

- **Machine Learning & Data Science**: Python, Pandas, NumPy, Scikit-Learn, Jupyter Notebook
- **Backend**: Flask, REST API, JSON, Pickle
- **Frontend**: HTML5, CSS3 (Glassmorphism & Flexbox/Grid), Vanilla JavaScript (Async/Await Fetch API)

---

## 📁 Repository Structure

```text
real_estate_price_prediction_model/
├── client/
│   ├── index.html            # Web application structure
│   ├── style.css             # Glassmorphism UI styling
│   └── app.js                # Async API communication & DOM manipulation
├── model/
│   └── RealEstatePricePred.ipynb  # Data cleaning, feature engineering & model training notebook
├── server/
│   ├── server.py             # Flask application & HTTP route definitions
│   ├── util.py               # Feature vectorization & model inference logic
│   └── artifacts/            # Model persistence files
│       ├── banglore_home_prices_model.pickle
│       └── columns.json
└── README.md