// Difficulty bands: level 1-5 = easy, 6-10 = medium, 11+ = hard
function getDifficultyBand(level) {
  if (level <= 5) return "easy";
  if (level <= 10) return "medium";
  return "hard";
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArithmetic(level) {
  const band = getDifficultyBand(level);

  let start, step, length;
  if (band === "easy") {
    start = randInt(1, 20);
    step = randInt(1, 5) * (Math.random() < 0.2 ? -1 : 1);
    length = 4;
  } else if (band === "medium") {
    start = randInt(1, 50);
    step = randInt(5, 20) * (Math.random() < 0.4 ? -1 : 1);
    length = 5;
  } else {
    start = randInt(10, 100);
    step = randInt(10, 50) * (Math.random() < 0.5 ? -1 : 1);
    length = 5;
  }

  const terms = Array.from({ length }, (_, i) => start + i * step);
  const answer = start + length * step;

  return {
    type: "arithmetic",
    terms,
    answer,
    hint: `Beda: ${step > 0 ? "+" : ""}${step}`,
  };
}

function generateGeometric(level) {
  const band = getDifficultyBand(level);

  let start, ratio, length;
  if (band === "easy") {
    start = randInt(1, 5);
    ratio = randInt(2, 3);
    length = 4;
  } else if (band === "medium") {
    start = randInt(1, 10);
    ratio = randInt(2, 4);
    length = 5;
  } else {
    start = randInt(1, 5);
    ratio = randInt(3, 6);
    length = 5;
  }

  const terms = Array.from({ length }, (_, i) => start * Math.pow(ratio, i));
  const answer = start * Math.pow(ratio, length);

  // skip if numbers get too large
  if (answer > 1_000_000) return generateGeometric(level);

  return {
    type: "geometric",
    terms,
    answer,
    hint: `Rasio: ×${ratio}`,
  };
}

export function generateQuestion(level) {
  // alternate types, with geometric slightly less frequent at low levels
  const band = getDifficultyBand(level);
  const useGeometric = band === "easy" ? Math.random() < 0.3 : Math.random() < 0.5;

  return useGeometric ? generateGeometric(level) : generateArithmetic(level);
}
