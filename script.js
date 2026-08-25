const artTiming = document.getElementById("art-timing");
const suppression = document.getElementById("suppression");
const immuneActivation = document.getElementById("immune-activation");

const artTimingValue = document.getElementById("art-timing-value");
const suppressionValue = document.getElementById("suppression-value");
const immuneActivationValue = document.getElementById("immune-activation-value");

const cnsVisual = document.getElementById("cns-visual");
const statusPill = document.getElementById("status-pill");
const scenarioSummary = document.getElementById("scenario-summary");

const outputElements = {
  viralActivity: {
    number: document.getElementById("viral-activity-number"),
    bar: document.getElementById("viral-activity-bar")
  },
  reservoir: {
    number: document.getElementById("reservoir-number"),
    bar: document.getElementById("reservoir-bar")
  },
  bbbStress: {
    number: document.getElementById("bbb-number"),
    bar: document.getElementById("bbb-bar")
  },
  microglia: {
    number: document.getElementById("microglia-number"),
    bar: document.getElementById("microglia-bar")
  },
  inflammation: {
    number: document.getElementById("inflammation-number"),
    bar: document.getElementById("inflammation-bar")
  },
  burden: {
    number: document.getElementById("burden-number"),
    bar: document.getElementById("burden-bar")
  }
};

const scenarios = {
  early: {
    art: 20,
    suppression: 85,
    immune: 25,
    summary:
      "Earlier ART and sustained viral suppression produce lower illustrative pathway pressure in this educational model."
  },
  delayed: {
    art: 70,
    suppression: 45,
    immune: 58,
    summary:
      "Delayed ART and partial suppression produce moderate illustrative pressure across the modeled pathway."
  },
  high: {
    art: 85,
    suppression: 20,
    immune: 88,
    summary:
      "Low modeled suppression and high immune activation produce higher illustrative neuroinflammatory pressure in this scenario."
  }
};

function clamp(number) {
  return Math.max(0, Math.min(100, Math.round(number)));
}

function describeArtTiming(value) {
  if (value <= 33) return "Earlier";
  if (value <= 66) return "Delayed";
  return "Very delayed";
}

function describeSuppression(value) {
  if (value >= 70) return "Sustained";
  if (value >= 40) return "Partial";
  return "Low";
}

function describeImmuneActivation(value) {
  if (value <= 33) return "Low";
  if (value <= 66) return "Moderate";
  return "High";
}

function updateValueLabels() {
  artTimingValue.textContent = describeArtTiming(Number(artTiming.value));
  suppressionValue.textContent = describeSuppression(Number(suppression.value));
  immuneActivationValue.textContent = describeImmuneActivation(
    Number(immuneActivation.value)
  );
}

function updateMetric(metricName, value) {
  outputElements[metricName].number.textContent = value;
  outputElements[metricName].bar.style.width = `${value}%`;
}

function getPressureLevel(burden) {
  if (burden <= 35) return "low";
  if (burden <= 65) return "medium";
  return "high";
}

function updateVisualLevel(level) {
  cnsVisual.classList.remove("low", "medium", "high");
  cnsVisual.classList.add(level);

  statusPill.classList.remove("medium", "high");

  if (level === "low") {
    statusPill.textContent = "Lower modeled pressure";
  }

  if (level === "medium") {
    statusPill.textContent = "Moderate modeled pressure";
    statusPill.classList.add("medium");
  }

  if (level === "high") {
    statusPill.textContent = "Higher modeled pressure";
    statusPill.classList.add("high");
  }
}

function updateModel() {
  const art = Number(artTiming.value);
  const suppressionValue = Number(suppression.value);
  const immune = Number(immuneActivation.value);


  const viralActivity = clamp(100 - suppressionValue);

  const reservoir = clamp(
    viralActivity * 0.55 + art * 0.35 + immune * 0.1
  );

  const bbbStress = clamp(
    viralActivity * 0.35 + immune * 0.5 + art * 0.15
  );

  const microglia = clamp(
    viralActivity * 0.25 + immune * 0.6 + bbbStress * 0.15
  );

  const inflammation = clamp(
    bbbStress * 0.4 + microglia * 0.6
  );

  const burden = clamp(
    reservoir * 0.2 + inflammation * 0.8
  );

  updateValueLabels();

  updateMetric("viralActivity", viralActivity);
  updateMetric("reservoir", reservoir);
  updateMetric("bbbStress", bbbStress);
  updateMetric("microglia", microglia);
  updateMetric("inflammation", inflammation);
  updateMetric("burden", burden);

  const level = getPressureLevel(burden);
  updateVisualLevel(level);

  if (!document.querySelector(".scenario.active")) {
    scenarioSummary.textContent =
      "This custom setting updates an illustrative model. It is not a medical measurement or prediction.";
  }
}

function activateScenario(scenarioName) {
  const selected = scenarios[scenarioName];

  artTiming.value = selected.art;
  suppression.value = selected.suppression;
  immuneActivation.value = selected.immune;

  document.querySelectorAll(".scenario").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === scenarioName);
  });

  scenarioSummary.textContent = selected.summary;
  updateModel();
}

[artTiming, suppression, immuneActivation].forEach((slider) => {
  slider.addEventListener("input", () => {
    document.querySelectorAll(".scenario").forEach((button) => {
      button.classList.remove("active");
    });

    updateModel();
  });
});

document.querySelectorAll(".scenario").forEach((button) => {
  button.addEventListener("click", () => {
    activateScenario(button.dataset.scenario);
  });
});

document.getElementById("reset-button").addEventListener("click", () => {
  activateScenario("early");
});

activateScenario("early");