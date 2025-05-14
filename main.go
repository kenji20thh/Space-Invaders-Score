package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sort"
	"strconv"
	"sync"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

type RankedScore struct {
	Name    string `json:"name"`
	Score   int    `json:"score"`
	Time    string `json:"time"`
	Rank    int    `json:"rank"`
	Percent string `json:"percent,omitempty"`
}

var (
	scoresFile = "scores.json"
	mutex      = &sync.Mutex{}
)

func main() {
	http.HandleFunc("/score", handlePostScore)   // POST new score
	http.HandleFunc("/scores", handleGetScores)  // GET scores (with pagination)

	fmt.Println("Server started at http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

// Handle POST /score
func handlePostScore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var entry ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
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

// Handle GET /scores?page=X&limit=Y
func handleGetScores(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 5
	}

	mutex.Lock()
	defer mutex.Unlock()

	scores := loadScores()

	// Sort scores in descending order
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	// Add rank to each entry
	ranked := []RankedScore{}
	for i, s := range scores {
		ranked = append(ranked, RankedScore{
			Name:  s.Name,
			Score: s.Score,
			Time:  s.Time,
			Rank:  i + 1,
		})
	}

	// Pagination
	start := (page - 1) * limit
	if start >= len(ranked) {
		start = len(ranked)
	}
	end := start + limit
	if end > len(ranked) {
		end = len(ranked)
	}
	paged := ranked[start:end]

	// Send JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paged)
}

// Load scores from the JSON file
func loadScores() []ScoreEntry {
	data, err := ioutil.ReadFile(scoresFile)
	if err != nil {
		if os.IsNotExist(err) {
			return []ScoreEntry{}
		}
		fmt.Println("Read error:", err)
		return []ScoreEntry{}
	}

	var scores []ScoreEntry
	json.Unmarshal(data, &scores)
	return scores
}

// Save scores to the JSON file
func saveScores(scores []ScoreEntry) {
	data, _ := json.MarshalIndent(scores, "", "  ")
	ioutil.WriteFile(scoresFile, data, 0644)
}
