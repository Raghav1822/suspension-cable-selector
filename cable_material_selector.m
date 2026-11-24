%% Suspension bridge cable material selector
% Preliminary comparison of galvanized high-strength bridge wire grades.
% Screening estimates below are illustrative and must be verified for design.

clear; clc;

% Project basis
designLoad_MN = 250;       % Tensile force carried by one main cable (MN)
cableLength_m = 1800;      % Effective cable length (m)
safetyFactor = 2.5;        % Applied to ultimate tensile strength

% Material data: proof strength, fatigue/corrosion ratings, cost and emissions
% are screening assumptions, not certified product data or supplier quotes.
grade = [1570; 1770; 1860; 1960];
ultimateStrength_MPa = [1570; 1770; 1860; 1960];
proofStrength_MPa = [1335; 1505; 1580; 1665];
density_kg_m3 = [7850; 7850; 7850; 7850];
elasticModulus_GPa = [200; 200; 200; 200];
fatigueRating = [4.0; 3.8; 3.6; 3.4];       % Relative screening scale, 1–5
corrosionRating = [3.5; 3.5; 3.5; 3.5];     % Relative screening scale, 1–5
cost_USD_kg = [1.25; 1.35; 1.45; 1.60];
emissions_kgCO2e_kg = [2.15; 2.20; 2.25; 2.30];

force_N = designLoad_MN * 1e6;
allowableStress_MPa = ultimateStrength_MPa ./ safetyFactor;
requiredArea_m2 = force_N ./ (allowableStress_MPa * 1e6);
mass_kg = density_kg_m3 .* requiredArea_m2 .* cableLength_m;
elongation_m = force_N .* cableLength_m ./ ...
    (requiredArea_m2 .* elasticModulus_GPa * 1e9);
specificStrength_kNm_kg = ultimateStrength_MPa * 1e6 ./ ...
    density_kg_m3 / 1000;
materialCost_USD = mass_kg .* cost_USD_kg;
embodiedCarbon_kgCO2e = mass_kg .* emissions_kgCO2e_kg;

% Equal-weight, min-max normalized fit; cost and carbon are minimized.
criteria = [ultimateStrength_MPa, proofStrength_MPa, ...
    specificStrength_kNm_kg, elasticModulus_GPa, fatigueRating, ...
    corrosionRating, cost_USD_kg, emissions_kgCO2e_kg];
higherIsBetter = [true, true, true, true, true, true, false, false];
utilities = zeros(size(criteria));
for column = 1:size(criteria, 2)
    values = criteria(:, column);
    valueRange = max(values) - min(values);
    if valueRange == 0
        utilities(:, column) = 0.5;
    elseif higherIsBetter(column)
        utilities(:, column) = (values - min(values)) / valueRange;
    else
        utilities(:, column) = (max(values) - values) / valueRange;
    end
end
fitScore = mean(utilities, 2) * 100;

results = table(grade, ultimateStrength_MPa, proofStrength_MPa, ...
    specificStrength_kNm_kg, requiredArea_m2, mass_kg, elongation_m, ...
    materialCost_USD, embodiedCarbon_kgCO2e_kg, fitScore);
results = sortrows(results, {'fitScore', 'grade'}, {'descend', 'ascend'});
disp(results);
