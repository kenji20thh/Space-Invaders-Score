package main


type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}


type RankedScore struct {
	Name     string `json:"name"`
	Score    int    `json:"score"`
	Time     string `json:"time"`
	Rank     int    `json:"rank"`
	Percent  string `json:"percent,omitempty"`
}


var {
	scoresFile = "scores.json"
	mutex = &sync.mutex{}
}