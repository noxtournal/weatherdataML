# Weather Vault

Interactive demo of a Random Forest model trained on 12 years of NOAA daily
records from JFK International Airport, forecasting air temperature.

Live charts, a "pick a date" forecast explorer, and a walkthrough of the
pipeline — all built from real numbers pulled out of the project's training
notebooks (MAE 3.62°F / RMSE 4.64°F on the 2024–2026 held-out set).

## Files

- `index.html` — page structure
- `style.css` — all styling
- `script.js` — charts (Chart.js) + the date explorer
- `data.js` — the actual model output (feature importances, backtest
  predictions, 2027 forecast) as a plain JS object, regenerated from the
  notebooks — no build step, no API calls
