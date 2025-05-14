package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
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

// func main () {
// 	http.HandleFunc("/score", handlePostScore)
// 	http.HandleFunc("/scores", handleGetScores)
// }

func handlePostScore(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	var entry ScoreEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		http.Error(w, "Invalid Json", http.StatusBadRequest)
		return
	}
	mutex.Lock()
	defer mutex.Unlock()

	scores := loadScores()
	scores = append(scores, entry)
	// saveScores(scores)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Score Saved"))
}

func loadScores() []ScoreEntry {
	data, err := ioutil.ReadFile(scoresFile)
	if err != nil {
		if os.IsNotExist(err) {
			return []ScoreEntry{}
		}
		fmt.Println("Reading Error", err)
		return []ScoreEntry{}
	}
	var scores []ScoreEntry
	json.Unmarshal(data, &scores)
	return scores
}
