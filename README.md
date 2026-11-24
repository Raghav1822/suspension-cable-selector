# Spanwise — Suspension Cable Material Selector

A lightweight browser-based engineering screening tool and MATLAB script for comparing galvanized suspension-bridge wire grades. Enter a cable load, effective length and screening safety factor to compare required metallic area, estimated cable mass, elastic elongation, cost and embodied carbon. The tool ranks grades across eight equally weighted criteria.

## Run the web app

Open `index.html` in a browser. The app is static and has no build step or runtime dependencies. GitHub Pages deployment is configured in `.github/workflows/pages.yml`.

## Run the MATLAB version

Open `cable_material_selector.m` in MATLAB and run it. Change the project basis at the top of the script to match the study.

## Scope and assumptions

The shortlist uses 1570, 1770, 1860 and 1960 MPa galvanized steel wire grades, all modeled at 7850 kg/m³ and 200 GPa. Indicative proof strengths, fatigue and corrosion ratings, unit costs and emissions factors are assumptions for relative screening—not manufacturer-certified values, quotations or a formal life-cycle assessment. The same assumed corrosion rating is used for each galvanized grade.

Required area is calculated from ultimate tensile strength divided by the user-entered factor, following `σ_allow = UTS / N`. The comparison does not account for code-specific resistance factors, wire packing, voids, cable sag, geometric effects, construction, connections, redundancy, fatigue spectra or corrosion protection details. It is not suitable for final design or safety decisions; validate material properties and all design checks with qualified bridge engineers and suppliers.

The fit score normalizes each of eight criteria against the current shortlist and gives each criterion equal weight. For criteria where all candidates share the same value, each receives neutral utility. As a result, score and rank are relative to this shortlist and should not be read as absolute material ratings.
