import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());

let dramaData = [];
let similarityMatrix = [];
let titleToIndex = new Map();

try {
  const dataPath = path.join(__dirname, "embeddings/kdrama_data_QWEN_V2.json");
  const dramasJSON = fs.readFileSync(dataPath, "utf8");
  dramaData = JSON.parse(dramasJSON);

  const matrixPath = path.join(
    __dirname,
    "embeddings/kdrama_similarity_matrix_QWEN_V2.json"
  );
  const matrixData = fs.readFileSync(matrixPath, "utf8");
  similarityMatrix = JSON.parse(matrixData);

  dramaData.forEach((drama, index) => {
    titleToIndex.set(drama.Name.toLowerCase(), index);
  });

  console.log("K-Drama Data Loaded Successfully!!!");
  console.log(`Total Titles Loaded: ${dramaData.length}`);
} catch (error) {
  console.error("Error Loading Data Files!: ", error);
  process.exit(1);
}

const findSharedTerms = (str1, str2) => {
  if (!str1 || !str2) return [];
  const set1 = new Set(
    str1
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
  const set2 = new Set(
    str2
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
  return [...set1].filter((item) => set2.has(item));
};

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "K-Next up and running!!!",
    endpoints: ["/titles", "/rec?title="],
  });
});

app.get("/rec", (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ message: `Title query param is required!` });
  }
  const lowerCaseTitle = title.toLowerCase();
  if (!titleToIndex.has(lowerCaseTitle)) {
    return res
      .status(400)
      .json({ message: `Drama with the title ${title} Not Found!` });
  }
  const dramaIndex = titleToIndex.get(lowerCaseTitle);
  const sourceDrama = dramaData[dramaIndex];

  const scores = similarityMatrix[dramaIndex];

  const scoredDramas = scores.map((score, index) => ({
    index: index,
    score: score,
  }));

  scoredDramas.sort((a, b) => b.score - a.score);

  const topN = 5;
  const recommendedItems = scoredDramas.slice(1, topN + 1);
  const recommendations = recommendedItems.map((item) => {
    const recommendedDrama = dramaData[item.index];
    const sharedGenres = findSharedTerms(
      sourceDrama.Genre,
      recommendedDrama.Genre
    );
    const sharedTags = findSharedTerms(sourceDrama.Tags, recommendedDrama.Tags);

    let reasonParts = [];
    if (sharedGenres.length > 0) {
      reasonParts.push(`Shared Genres: ${sharedGenres.join(", ")}`);
    }
    if (sharedTags.length > 0) {
      reasonParts.push(`Shared Tags: ${sharedTags.join(", ")}`);
    }

    return {
      title: recommendedDrama.Name,
      confidence: (item.score * 100).toFixed(2) + "%",
      reason:
        reasonParts.length > 0
          ? reasonParts.join(". ") + "."
          : "Similar overall synopsis and themes.",
    };
  });

  res.json({
    sourceTitle: sourceDrama.Name,
    recommendations: recommendations,
  });
});

app.get("/titles", (req, res) => {
  const titles = dramaData.map((drama) => drama.Name);
  res.json(titles);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
