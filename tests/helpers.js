const resultsDiv = document.getElementById('test-results');
const results = [];

export function logTest(name, success, details) {
  results.push({ name, success, details });

  const card = document.createElement('div');
  card.className = 'card mb-3';

  const header = document.createElement('div');
  header.className = `card-header ${success ? 'text-success' : 'text-danger'}`;
  header.textContent = (success ? '✅ ' : '🚨 ') + name;

  const body = document.createElement('div');
  body.className = 'card-body';

  const detailsEl = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Output';
  summary.style.cursor = 'pointer';

  const pre = document.createElement('pre');
  pre.style.maxHeight = '300px';
  pre.style.fontSize = '0.7rem';
  pre.className = 'mb-0 overflow-y-auto mt-1 bg-body-tertiary p-2 rounded';
  pre.textContent = details;

  detailsEl.appendChild(summary);
  detailsEl.appendChild(pre);
  body.appendChild(detailsEl);
  card.appendChild(header);
  card.appendChild(body);
  resultsDiv.appendChild(card);
}

export function assertDeepEqual(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const diff = `Expected:\n${JSON.stringify(expected, null, 2)}\n\nActual:\n${JSON.stringify(actual, null, 2)}`;
    throw new Error(diff);
  }
}

export function reportResults() {
  fetch('/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  });
}
