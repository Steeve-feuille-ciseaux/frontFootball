let players = [];
let draggedPlayer = null;
let isDragging = false;
let formationLimits = {
    Gardien: 1,
    Défenseur: 4,
    Milieu: 4,
    Attaquant: 2
};

const formationPositions = {
    '4-4-2': {
        Gardien: [{x: 50, y: 90}],
        Défenseur: [
            {x: 20, y: 70},
            {x: 40, y: 70},
            {x: 60, y: 70},
            {x: 80, y: 70}
        ],
        Milieu: [
            {x: 20, y: 45},
            {x: 40, y: 45},
            {x: 60, y: 45},
            {x: 80, y: 45}
        ],
        Attaquant: [
            {x: 35, y: 20},
            {x: 65, y: 20}
        ]
    },
    '4-3-3': {
        Gardien: [{x: 50, y: 90}],
        Défenseur: [
            {x: 20, y: 70},
            {x: 40, y: 70},
            {x: 60, y: 70},
            {x: 80, y: 70}
        ],
        Milieu: [
            {x: 30, y: 45},
            {x: 50, y: 45},
            {x: 70, y: 45}
        ],
        Attaquant: [
            {x: 30, y: 20},
            {x: 50, y: 15},
            {x: 70, y: 20}
        ]
    },
    '3-5-2': {
        Gardien: [{x: 50, y: 90}],
        Défenseur: [
            {x: 30, y: 70},
            {x: 50, y: 70},
            {x: 70, y: 70}
        ],
        Milieu: [
            {x: 20, y: 45},
            {x: 35, y: 45},
            {x: 50, y: 40},
            {x: 65, y: 45},
            {x: 80, y: 45}
        ],
        Attaquant: [
            {x: 35, y: 20},
            {x: 65, y: 20}
        ]
    },
    '5-3-2': {
        Gardien: [{x: 50, y: 90}],
        Défenseur: [
            {x: 20, y: 70},
            {x: 35, y: 70},
            {x: 50, y: 70},
            {x: 65, y: 70},
            {x: 80, y: 70}
        ],
        Milieu: [
            {x: 30, y: 45},
            {x: 50, y: 40},
            {x: 70, y: 45}
        ],
        Attaquant: [
            {x: 35, y: 20},
            {x: 65, y: 20}
        ]
    },
    '4-5-1': {
        Gardien: [{x: 50, y: 90}],
        Défenseur: [
            {x: 20, y: 70},
            {x: 40, y: 70},
            {x: 60, y: 70},
            {x: 80, y: 70}
        ],
        Milieu: [
            {x: 20, y: 45},
            {x: 35, y: 40},
            {x: 50, y: 35},
            {x: 65, y: 40},
            {x: 80, y: 45}
        ],
        Attaquant: [
            {x: 50, y: 20}
        ]
    }
};

function updateFormation() {
    const formation = document.getElementById('formation').value;
    const [def, mil, att] = formation.split('-').map(Number);
    
    formationLimits = {
        Gardien: 1,
        Défenseur: def,
        Milieu: mil,
        Attaquant: att
    };

    updatePositionCounts();
}

function autoPositionPlayers() {
    const formation = document.getElementById('formation').value;
    const positions = formationPositions[formation];
    
    const playersByPosition = {
        Gardien: players.filter(p => p.position === 'Gardien'),
        Défenseur: players.filter(p => p.position === 'Défenseur'),
        Milieu: players.filter(p => p.position === 'Milieu'),
        Attaquant: players.filter(p => p.position === 'Attaquant')
    };

    Object.keys(positions).forEach(position => {
        const positionPlayers = playersByPosition[position];
        const positionCoords = positions[position];

        positionPlayers.forEach((player, index) => {
            if (index < positionCoords.length) {
                player.x = positionCoords[index].x;
                player.y = positionCoords[index].y;
                
                const playerEl = document.getElementById(`player-${player.id}`);
                if (playerEl) {
                    playerEl.style.left = `${player.x}%`;
                    playerEl.style.top = `${player.y}%`;
                }
            }
        });
    });
}

function saveTeam() {
    const teamData = {
        formation: document.getElementById('formation').value,
        players: players
    };
    
    const teamJson = JSON.stringify(teamData);
    localStorage.setItem('savedTeam', teamJson);
    alert('Équipe sauvegardée avec succès!');
}

function loadTeam() {
    const savedTeam = localStorage.getItem('savedTeam');
    if (!savedTeam) {
        alert('Aucune équipe sauvegardée trouvée.');
        return;
    }

    const teamData = JSON.parse(savedTeam);
    document.getElementById('formation').value = teamData.formation;
    updateFormation();

    // Supprimer l'équipe actuelle
    players.forEach(player => {
        const playerEl = document.getElementById(`player-${player.id}`);
        if (playerEl) playerEl.remove();
    });
    
    players = teamData.players;
    players.forEach(player => createPlayerElement(player));
    updatePlayersList();
    updatePositionCounts();
}
function getPlayerCountByPosition(position) {
    return players.filter(player => player.position === position).length;
}

function updatePositionCounts() {
    const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];
    
    positions.forEach(position => {
        const count = getPlayerCountByPosition(position);
        const limit = formationLimits[position];
        const element = document.getElementById(`${position.toLowerCase()}Count`);
        
        element.textContent = `${position}s: ${count}/${limit}`;
        element.className = 'formation-count ' + 
            (count === limit ? 'limit-reached' : 'available');
    });
}

function canAddPlayerToPosition(position) {
    const currentCount = getPlayerCountByPosition(position);
    return currentCount < formationLimits[position];
}

function addPlayer() {
    const name = document.getElementById('playerName').value;
    const position = document.getElementById('playerPosition').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (name.trim() === '') {
        errorMessage.textContent = 'Veuillez entrer un nom de joueur';
        return;
    }

    if (!canAddPlayerToPosition(position)) {
        errorMessage.textContent = `Nombre maximum de ${position}s atteint pour cette formation`;
        return;
    }

    errorMessage.textContent = '';

    const player = {
        id: Date.now(),
        name,
        position,
        x: 50,
        y: 50
    };

    players.push(player);
    createPlayerElement(player);
    updatePlayersList();
    updatePositionCounts();

    document.getElementById('playerName').value = '';
}

function createPlayerElement(player) {
    const playerEl = document.createElement('div');
    playerEl.className = `player ${player.position}`;
    playerEl.id = `player-${player.id}`;
    playerEl.innerHTML = `
        ${player.position[0]}
        <div class="player-name">${player.name}</div>
    `;

    playerEl.style.left = `${player.x}%`;
    playerEl.style.top = `${player.y}%`;

    playerEl.addEventListener('mousedown', startDragging);
    document.getElementById('field').appendChild(playerEl);
}

function startDragging(e) {
    isDragging = true;
    draggedPlayer = e.target;
    draggedPlayer.classList.add('dragging');

    const rect = draggedPlayer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    function onMouseMove(e) {
        if (isDragging) {
            const field = document.getElementById('field');
            const fieldRect = field.getBoundingClientRect();
            
            let x = ((e.clientX - fieldRect.left - offsetX) / fieldRect.width) * 100;
            let y = ((e.clientY - fieldRect.top - offsetY) / fieldRect.height) * 100;

            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            x = Math.round(x * 10) / 10;
            y = Math.round(y * 10) / 10;

            draggedPlayer.style.left = `${x}%`;
            draggedPlayer.style.top = `${y}%`;

            const playerId = parseInt(draggedPlayer.id.split('-')[1]);
            const player = players.find(p => p.id === playerId);
            if (player) {
                player.x = x;
                player.y = y;
            }
        }
    }

    function onMouseUp() {
        isDragging = false;
        if (draggedPlayer) {
            draggedPlayer.classList.remove('dragging');
            draggedPlayer = null;
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function removePlayer(id) {
    players = players.filter(p => p.id !== id);
    const playerEl = document.getElementById(`player-${id}`);
    if (playerEl) playerEl.remove();
    updatePlayersList();
    updatePositionCounts();
}

function updatePlayersList() {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <span>${player.name} (${player.position})</span>
            <button class="delete-btn" onclick="removePlayer(${player.id})">Supprimer</button>
        `;
        list.appendChild(card);
    });
}

// Initialiser les compteurs au chargement
updateFormation();