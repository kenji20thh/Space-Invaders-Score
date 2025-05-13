package main

import (
	"encoding/json"
	"net/http"
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
	saveScores(scores)

} 