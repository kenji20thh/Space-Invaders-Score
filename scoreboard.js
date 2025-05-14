document.getElementById('submit-score-btn').addEventListener('click', () => {
    const name = document.getElementById('player-name').value;
    const score = parseInt(document.getElementById('score').textContent);
    const time = new Date().toISOString(); // or your game timer value

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    fetch('/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            score: score,
            time: time
        })
    })
    .then(res => {
        if (res.ok) {
            alert('Score submitted successfully!');
        } else {
            alert('Failed to submit score.');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error submitting score.');
    });
});
