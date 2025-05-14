// Create username form and scoreboard display
document.addEventListener("DOMContentLoaded", () => {
  // Create username form
  const usernameForm = document.createElement("div")
  usernameForm.id = "username-form"
  usernameForm.className = "menu-content"
  usernameForm.style.display = "flex"
  usernameForm.style.flexDirection = "column"
  usernameForm.style.alignItems = "center"
  usernameForm.style.justifyContent = "center"
  usernameForm.style.position = "absolute"
  usernameForm.style.top = "50%"
  usernameForm.style.left = "50%"
  usernameForm.style.transform = "translate(-50%, -50%)"
  usernameForm.style.zIndex = "200"
  usernameForm.style.width = "80%"
  usernameForm.style.maxWidth = "400px"

  const formTitle = document.createElement("h2")
  formTitle.textContent = "ENTER USERNAME"
  formTitle.style.marginBottom = "30px"
  formTitle.style.color = "#33ff33"

  const usernameInput = document.createElement("input")
  usernameInput.id = "player-name"
  usernameInput.type = "text"
  usernameInput.placeholder = "USERNAME"
  usernameInput.style.backgroundColor = "#000"
  usernameInput.style.color = "#33ff33"
  usernameInput.style.border = "2px solid #33ff33"
  usernameInput.style.padding = "10px"
  usernameInput.style.marginBottom = "20px"
  usernameInput.style.width = "100%"
  usernameInput.style.fontFamily = "'Press Start 2P', cursive"
  usernameInput.style.fontSize = "14px"
  usernameInput.style.textAlign = "center"

  const submitBtn = document.createElement("button")
  submitBtn.id = "submit-username-btn"
  submitBtn.textContent = "START GAME"

  const viewScoresBtn = document.createElement("button")
  viewScoresBtn.id = "view-scores-btn"
  viewScoresBtn.textContent = "VIEW SCORES"

  usernameForm.appendChild(formTitle)
  usernameForm.appendChild(usernameInput)
  usernameForm.appendChild(submitBtn)
  usernameForm.appendChild(viewScoresBtn)

  // Create scoreboard
  const scoreboard = document.createElement("div")
  scoreboard.id = "scoreboard"
  scoreboard.className = "menu-content"
  scoreboard.style.display = "none"
  scoreboard.style.position = "absolute"
  scoreboard.style.top = "50%"
  scoreboard.style.left = "50%"
  scoreboard.style.transform = "translate(-50%, -50%)"
  scoreboard.style.zIndex = "200"
  scoreboard.style.width = "80%"
  scoreboard.style.maxWidth = "500px"
  scoreboard.style.maxHeight = "80%"
  scoreboard.style.overflowY = "auto"

  const scoreboardTitle = document.createElement("h2")
  scoreboardTitle.textContent = "HIGH SCORES"
  scoreboardTitle.style.marginBottom = "30px"
  scoreboardTitle.style.color = "#33ff33"

  const scoresList = document.createElement("div")
  scoresList.id = "scores-list"
  scoresList.style.marginBottom = "20px"

  const backBtn = document.createElement("button")
  backBtn.id = "back-btn"
  backBtn.textContent = "BACK"

  scoreboard.appendChild(scoreboardTitle)
  scoreboard.appendChild(scoresList)
  scoreboard.appendChild(backBtn)

  // Add elements to the game container
  document.querySelector(".game-container").appendChild(usernameForm)
  document.querySelector(".game-container").appendChild(scoreboard)

  // Event listeners
  submitBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim()
    if (username) {
      localStorage.setItem("playerName", username)
      usernameForm.style.display = "none"
      // Assuming startGame is defined elsewhere or imported
      if (typeof startGame === "function") {
        startGame()
      } else {
        console.error("startGame function is not defined.")
      }
    } else {
      alert("Please enter a username!")
    }
  })

  viewScoresBtn.addEventListener("click", () => {
    usernameForm.style.display = "none"
    scoreboard.style.display = "block"
    fetchScores()
  })

  backBtn.addEventListener("click", () => {
    scoreboard.style.display = "none"
    usernameForm.style.display = "flex"
  })

  // Modify game over to show username form
  const originalGameOver = window.gameOver
  window.gameOver = () => {
    originalGameOver()

    // Add submit score button to game over menu
    const submitScoreBtn = document.createElement("button")
    submitScoreBtn.id = "submit-score-btn"
    submitScoreBtn.textContent = "SUBMIT SCORE"

    const viewScoresGameOverBtn = document.createElement("button")
    viewScoresGameOverBtn.id = "view-scores-game-over-btn"
    viewScoresGameOverBtn.textContent = "VIEW SCORES"

    document.querySelector(".menu-content").appendChild(submitScoreBtn)
    document.querySelector(".menu-content").appendChild(viewScoresGameOverBtn)

    submitScoreBtn.addEventListener("click", () => {
      submitScore()
    })

    viewScoresGameOverBtn.addEventListener("click", () => {
      document.getElementById("pause-menu").style.display = "none"
      scoreboard.style.display = "block"
      fetchScores()
    })
  }

  // Prevent the game from starting automatically
  window.removeEventListener("load", startGame)
})

// Function to fetch scores from the API
function fetchScores() {
  const scoresList = document.getElementById("scores-list")
  scoresList.innerHTML = '<p style="color: #33ff33;">Loading scores...</p>'

  fetch("/scores?page=1&limit=10")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch scores")
      }
      return response.json()
    })
    .then((scores) => {
      scoresList.innerHTML = ""

      if (scores.length === 0) {
        scoresList.innerHTML = '<p style="color: #33ff33;">No scores yet!</p>'
        return
      }

      // Create table for scores
      const table = document.createElement("table")
      table.style.width = "100%"
      table.style.borderCollapse = "collapse"
      table.style.marginBottom = "20px"
      table.style.color = "#33ff33"

      // Create table header
      const thead = document.createElement("thead")
      const headerRow = document.createElement("tr")

      const rankHeader = document.createElement("th")
      rankHeader.textContent = "RANK"
      rankHeader.style.padding = "10px"
      rankHeader.style.textAlign = "center"
      rankHeader.style.borderBottom = "2px solid #33ff33"

      const nameHeader = document.createElement("th")
      nameHeader.textContent = "NAME"
      nameHeader.style.padding = "10px"
      nameHeader.style.textAlign = "left"
      nameHeader.style.borderBottom = "2px solid #33ff33"

      const scoreHeader = document.createElement("th")
      scoreHeader.textContent = "SCORE"
      scoreHeader.style.padding = "10px"
      scoreHeader.style.textAlign = "right"
      scoreHeader.style.borderBottom = "2px solid #33ff33"

      headerRow.appendChild(rankHeader)
      headerRow.appendChild(nameHeader)
      headerRow.appendChild(scoreHeader)
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // Create table body
      const tbody = document.createElement("tbody")

      scores.forEach((score, index) => {
        const row = document.createElement("tr")

        const rankCell = document.createElement("td")
        rankCell.textContent = score.rank
        rankCell.style.padding = "10px"
        rankCell.style.textAlign = "center"

        const nameCell = document.createElement("td")
        nameCell.textContent = score.name
        nameCell.style.padding = "10px"
        nameCell.style.textAlign = "left"

        const scoreCell = document.createElement("td")
        scoreCell.textContent = score.score
        scoreCell.style.padding = "10px"
        scoreCell.style.textAlign = "right"

        row.appendChild(rankCell)
        row.appendChild(nameCell)
        row.appendChild(scoreCell)

        // Highlight current player's score
        const playerName = localStorage.getItem("playerName")
        if (playerName && score.name === playerName) {
          row.style.backgroundColor = "rgba(51, 255, 51, 0.2)"
        }

        tbody.appendChild(row)
      })

      table.appendChild(tbody)
      scoresList.appendChild(table)
    })
    .catch((error) => {
      console.error("Error fetching scores:", error)
      scoresList.innerHTML = '<p style="color: #ff3333;">Error loading scores. Please try again.</p>'
    })
}

// Function to submit score
function submitScore() {
  const playerName = localStorage.getItem("playerName")
  const score = Number.parseInt(document.getElementById("score").textContent)
  const time = new Date().toISOString()

  if (!playerName) {
    alert("Username not found! Please restart the game.")
    return
  }

  fetch("/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playerName,
      score: score,
      time: time,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Score submitted successfully!")
        // Show the scoreboard after submitting
        document.getElementById("pause-menu").style.display = "none"
        document.getElementById("scoreboard").style.display = "block"
        fetchScores()
      } else {
        alert("Failed to submit score.")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      alert("Error submitting score.")
    })
}
