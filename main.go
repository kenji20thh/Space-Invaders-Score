package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"` // Format: "mm:ss"
}

var (
	scoresFile = "scores.json"
	mutex      = &sync.Mutex{}
)

func main() {
	http.HandleFunc("/score", handlePostScore)
	http.HandleFunc("/scores", handleGetScores)

	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func handlePostScore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Could not read request body", http.StatusBadRequest)
		return
	}

	var entry ScoreEntry
	if err := json.Unmarshal(body, &entry); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	scores := loadScores()
	scores = append(scores, entry)
	saveScores(scores)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Score saved"))
}

func handleGetScores(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET allowed", http.StatusMethodNotAllowed)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	scores := loadScores()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}

func loadScores() []ScoreEntry {
	data, err := os.ReadFile(scoresFile)
	if err != nil {
		if os.IsNotExist(err) {
			return []ScoreEntry{}
		}
		fmt.Println("Error reading file:", err)
		return []ScoreEntry{}
	}

	var scores []ScoreEntry
	if err := json.Unmarshal(data, &scores); err != nil {
		fmt.Println("Error parsing JSON:", err)
		return []ScoreEntry{}
	}
	return scores
}
