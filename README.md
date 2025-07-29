# K-Drama Recommendation API

A simple API that provides personalized K-Drama recommendations based on content similarity. This project uses modern machine learning techniques to understand the semantic content of K-Drama synopsis, genres, and tags to deliver relevant suggestions.

---

## Features

- **Content-Based Recommendations:** Suggests K-Dramas based on plot, genre, cast, and tags.
- **Confidence Score:** Each recommendation comes with a similarity score, indicating the model's confidence in the match.
- **Clear Reasoning:** Provides a simple explanation for each recommendation, highlighting shared genres and tags.
- **Fast and Lightweight:** All heavy computation is done offline. The API only serves pre-computed results, making it extremely fast.
- **Simple REST Endpoints:** Easy-to-use endpoints for getting a list of all dramas or fetching recommendations for a specific title.

---

## How It Works

The project is split into two main parts:

1.  **Offline Data Processing (in Google Colab):**

    - A Python script loads the K-Drama dataset.
    - It cleans and combines key features (`Synopsis`, `Genre`, `Tags`, `Cast`) into a single text block for each drama. To prioritize plot similarity, the synopsis is given extra weight.
    - A pre-trained **Sentence Transformer** model (`Qwen/Qwen3-Embedding-0.6B`) is used to convert these text blocks into high-dimensional numerical vectors (embeddings). These embeddings capture the semantic meaning of the text.
    - A **cosine similarity matrix** is calculated from these embeddings. This matrix stores a similarity score between every single pair of dramas in the dataset.
    - The final data (drama details and the similarity matrix) is saved as JSON files.

2.  **Online API Server (Node.js & Express):**

    - A lightweight Express.js server loads the pre-computed JSON files into memory on startup.
    - When a request is made to the `/rec` endpoint, the server finds the requested drama, looks up its similarity scores in the matrix, and returns the top 5 most similar dramas.
    - It enriches the response with the confidence score and the reasoning by comparing genres and tags.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Machine Learning/Data Processing:** Python, Pandas, Scikit-learn
- **NLP Model:** `sentence-transformers` library with the `Qwen/Qwen3-Embedding-0.6B` model.
- **Deployment:** Vercel

---

## API Endpoints

### Get All Titles

- **URL:** `/titles`
- **Method:** `GET`
- **Description:** Returns a JSON array of all K-Drama titles available in the dataset.
- **Example Response:**
  ```json
  ["Crash Landing on You", "Vincenzo", "Itaewon Class", "..."]
  ```

### Get Recommendations

- **URL:** `/rec`
- **Method:** `GET`
- **Query Parameters:**
  - `title` (required): The name of the K-Drama you want recommendations for.
- **Example Request:** `http://localhost:3001/rec?title=Vincenzo`
- **Example Response:**
  ```json
  {
    "sourceTitle": "A Business Proposal",
    "recommendations": [
      {
        "title": "Coffee Prince",
        "confidence": "58.96%",
        "reason": "Shared Genres: Comedy, Romance, Drama. Shared Tags: Boss-Employee Relationship."
      },
      {
        "title": "The Beauty Inside",
        "confidence": "57.98%",
        "reason": "Shared Genres: Comedy, Romance. Shared Tags: Secondary Couple, Contract Relationship, Sismance."
      },
      {
        "title": "49 Days",
        "confidence": "57.60%",
        "reason": "Shared Genres: Romance, Drama."
      },
      {
        "title": "Healer",
        "confidence": "57.48%",
        "reason": "Shared Genres: Romance. Shared Tags: Double Identity."
      },
      {
        "title": "The Master's Sun",
        "confidence": "57.46%",
        "reason": "Shared Genres: Comedy, Romance. Shared Tags: Secondary Couple."
      }
    ]
  }
  ```

---

## Kaggle Dataset

This project was built using the "K-Drama Dataset" by JUHYEON\_ available on Kaggle. It contains a comprehensive list of dramas with details like synopsis, genre, cast, ratings, and more.

You can find and download the dataset here:
[**top K-Drama Data EDA**](https://www.kaggle.com/code/kagleo123/top-k-drama-data-eda/input)
