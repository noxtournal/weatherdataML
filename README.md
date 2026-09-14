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

## Run locally

No build tools needed. From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new repo (e.g. `weather-vault`) and push these files to `main`.
2. In the repo, go to **Settings → Pages**.
3. Under **Source**, choose the `main` branch and `/ (root)` folder, then save.
4. Your site will be live at `https://<your-username>.github.io/weather-vault/`
   after a minute or two.
5. Update the "Source on GitHub" link in `index.html` (search for
   `id="repo-link"`) to point at this repo.

## Regenerating data.js

If you retrain the model or pull fresh NOAA data, rerun the same
load → clean → feature-engineer → train → predict pipeline from
`weatherdataNOAA.ipynb`, then dump the results (MAE, RMSE, feature
importances, backtest predictions, future forecast) into `data.js` as
`const WEATHER_DATA = {...};`. The page reads everything from that one
object — no other code needs to change.
