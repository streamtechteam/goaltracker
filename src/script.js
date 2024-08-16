let goals = JSON.parse(localStorage.getItem('goals')) || [];
let selectedGoalId = null;
const delText = "حذف";
const compText = "تکمیل";
const undoText = "برگشت";
function addGoal() {
    const title = document.getElementById('goalTitle').value;
    const date = document.getElementById('goalDate').value;
    if (title && date) {
        const goal = { id: Date.now(), title, date, completed: false, progress: 0 };
        goals.push(goal);
        saveGoals();
        renderGoals();
        document.getElementById('goalTitle').value = '';
    }
}

function deleteGoal(id) {
    goals = goals.filter(goal => goal.id !== id);
    saveGoals();
    renderGoals();
}

function toggleGoal(id) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        goal.progress = goal.completed ? 100 : 0;
        saveGoals();
        renderGoals();
    }
}

function updateProgress(id, change) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
        goal.progress = Math.max(0, Math.min(100, goal.progress + change));
        goal.completed = goal.progress === 100;
        saveGoals();
        renderGoals();
    }
}

function editGoal(id) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
        const newTitle = prompt("Edit goal title:", goal.title);
        const newDate = prompt("Edit goal date (YYYY-MM-DD):", goal.date);
        if (newTitle !== null && newDate !== null) {
            goal.title = newTitle;
            goal.date = newDate;
            saveGoals();
            renderGoals();
        }
    }
    hideContextMenu();
}

function showGoalDetails(id) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
        alert(`هدف: ${goal.title}\nتاریخ: ${goal.date}\nپیشرفت: ${goal.progress}%\nوضعیت: ${goal.completed ? 'انجام شده' : 'در حال انجام'}`);
    }
    hideContextMenu();
}

function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

function renderGoals() {
    const goalList = document.getElementById('goalList');
    goalList.innerHTML = '';
    goals.forEach(goal => {
        const li = document.createElement('li');
        li.className = 'goal-item';
        li.innerHTML = `
  <div class="goal-info">
    <h3>${goal.title}</h3>
    <p>Due: ${goal.date}</p>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: ${goal.progress}%"></div>
    </div>
  </div>
  <div class="goal-actions">
    <button onclick="toggleGoal(${goal.id})">${goal.completed ? undoText : compText}</button>
    <button onclick="deleteGoal(${goal.id})">${delText}</button>
  </div>
`;
        goalList.appendChild(li);

        // Add touch gestures
        const hammer = new Hammer(li);
        hammer.on('swipeleft', () => deleteGoal(goal.id));
        hammer.on('swiperight', () => toggleGoal(goal.id));
        hammer.on('panleft', (event) => {
            if (event.distance > 50) {
                updateProgress(goal.id, -10);
            }
        });
        hammer.on('panright', (event) => {
            if (event.distance > 50) {
                updateProgress(goal.id, 10);
            }
        });

        // Add right-click event for context menu
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectedGoalId = goal.id;
            showContextMenu(e.clientX, e.clientY);
        });
    });
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
}

document.addEventListener('click', hideContextMenu);

renderGoals();

// Add pull-to-refresh functionality
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY;
    if (touchDiff > 100 && window.scrollY === 0) {
        e.preventDefault();
        location.reload();
    }
});