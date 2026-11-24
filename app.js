const materials = [
  { name: 'Galvanized wire', grade: '1570', uts: 1570, proof: 1335, density: 7850, modulus: 200, fatigue: 4.0, corrosion: 3.5, price: 1.25, emissions: 2.15 },
  { name: 'Galvanized wire', grade: '1770', uts: 1770, proof: 1505, density: 7850, modulus: 200, fatigue: 3.8, corrosion: 3.5, price: 1.35, emissions: 2.20 },
  { name: 'Galvanized wire', grade: '1860', uts: 1860, proof: 1580, density: 7850, modulus: 200, fatigue: 3.6, corrosion: 3.5, price: 1.45, emissions: 2.25 },
  { name: 'Galvanized wire', grade: '1960', uts: 1960, proof: 1665, density: 7850, modulus: 200, fatigue: 3.4, corrosion: 3.5, price: 1.60, emissions: 2.30 },
];

const criteria = [
  { key: 'uts', higherIsBetter: true },
  { key: 'proof', higherIsBetter: true },
  { key: 'specificStrength', higherIsBetter: true },
  { key: 'modulus', higherIsBetter: true },
  { key: 'fatigue', higherIsBetter: true },
  { key: 'corrosion', higherIsBetter: true },
  { key: 'price', higherIsBetter: false },
  { key: 'emissions', higherIsBetter: false },
];

const form = document.querySelector('#basis-form');
const resultsBody = document.querySelector('#results-body');
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const wholeFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function projectBasis() {
  const load = Number(form.elements.load.value);
  const length = Number(form.elements.length.value);
  const factor = Number(form.elements.factor.value);
  if (![load, length, factor].every(Number.isFinite) || load <= 0 || length <= 0 || factor < 1) return null;
  return { forceN: load * 1e6, lengthM: length, factor };
}

function scoreCandidates(candidates) {
  const bounds = Object.fromEntries(criteria.map(({ key }) => {
    const values = candidates.map((candidate) => candidate[key]);
    return [key, { min: Math.min(...values), max: Math.max(...values) }];
  }));
  return candidates.map((candidate) => {
    const score = criteria.reduce((sum, { key, higherIsBetter }) => {
      const { min, max } = bounds[key];
      const utility = max === min ? 0.5 : (candidate[key] - min) / (max - min);
      return sum + (higherIsBetter ? utility : 1 - utility);
    }, 0) / criteria.length;
    return { ...candidate, score: score * 100 };
  }).sort((a, b) => b.score - a.score || Number(a.grade) - Number(b.grade));
}

function calculate() {
  const basis = projectBasis();
  if (!basis) return;
  const evaluated = materials.map((material) => {
    const specificStrength = material.uts * 1e6 / material.density / 1000;
    const allowablePa = material.uts * 1e6 / basis.factor;
    const area = basis.forceN / allowablePa;
    const massKg = material.density * area * basis.lengthM;
    const elongation = basis.forceN * basis.lengthM / (area * material.modulus * 1e9);
    return {
      ...material,
      specificStrength,
      area,
      massKg,
      elongation,
      totalCost: massKg * material.price,
      carbonKg: massKg * material.emissions,
    };
  });
  const ranked = scoreCandidates(evaluated);
  render(ranked);
}

function render(candidates) {
  const [winner, ...rest] = candidates;
  document.querySelector('#winner-name').textContent = `${winner.grade} grade`;
  document.querySelector('#winner-caption').textContent = `${winner.name} · highest balanced screening fit`;
  document.querySelector('#winner-score').textContent = wholeFormat.format(winner.score);
  document.querySelector('#winner-area').textContent = `${numberFormat.format(winner.area)} m²`;
  document.querySelector('#winner-mass').textContent = `${numberFormat.format(winner.massKg / 1000)} t`;
  document.querySelector('#winner-cost').textContent = currencyFormat.format(winner.totalCost);

  const maxScore = winner.score || 1;
  resultsBody.innerHTML = [winner, ...rest].map((material, index) => `
    <tr class="${index === 0 ? 'is-top' : ''}">
      <td><span class="grade-name"><span class="rank-badge">${index + 1}</span>${material.grade} grade</span><span class="grade-sub">galvanized steel</span></td>
      <td>${wholeFormat.format(material.uts)}</td>
      <td>${wholeFormat.format(material.proof)}</td>
      <td>${numberFormat.format(material.specificStrength)}</td>
      <td>${numberFormat.format(material.area)}</td>
      <td>${numberFormat.format(material.massKg / 1000)}</td>
      <td>${numberFormat.format(material.elongation)}</td>
      <td>${currencyFormat.format(material.totalCost)}</td>
      <td>${numberFormat.format(material.carbonKg / 1000)}</td>
      <td class="score-cell"><div class="score-line"><span>${wholeFormat.format(material.score)}</span><span class="score-track"><span class="score-fill" style="width:${Math.max(0, material.score / maxScore * 100)}%"></span></span></div></td>
    </tr>`).join('');
}

form.addEventListener('input', calculate);
form.addEventListener('reset', () => requestAnimationFrame(calculate));
calculate();
