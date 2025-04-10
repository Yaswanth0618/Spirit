// home.js - Spirit Enhanced Backend with Timer Pause/Resume + Dark/Light Mode Ready

// home.js - Spirit Enhanced Backend with Timer Pause/Resume + Dark/Light Mode Ready

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let studyGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
let tasks = [];

let timer = null;
let breakTimer = null;
let timerPaused = false;
let breakPaused = false;
let timerTimeLeft = 0;
let breakTimeLeft = 0;

window.onload = () => {
    // Load tasks from localStorage first
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // If there's a current user, prioritize their tasks, otherwise use stored tasks
    if (currentUser) {
        tasks = currentUser.tasks || storedTasks;
        // Update currentUser's tasks if they were loaded from storedTasks
        if (!currentUser.tasks && storedTasks.length > 0) {
            currentUser.tasks = storedTasks;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } else {
        tasks = storedTasks;
    }

    // Save tasks back to localStorage to maintain consistency
    localStorage.setItem('tasks', JSON.stringify(tasks));

    if (currentUser || tasks.length > 0) {
        renderTaskList();
        updateTaskSelect();
        generateTimeline();
        renderStudyGroups();
        updateChronoQuote();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
};

// ... rest of the code remains the same ...

function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function updateChronoQuote() {
    const chronoQuotes = [
        "Time bends for the bold. Shape it.",
        "Chrono sync complete. Let's elevate your day.",
        "Productivity isn't about time—it's about intention."
    ];
    const quote = chronoQuotes[Math.floor(Math.random() * chronoQuotes.length)];
    const quoteEl = document.getElementById("chronoQuote");
    if (quoteEl) quoteEl.innerText = quote;
}

function saveTasks() {
    if (currentUser) {
        currentUser.tasks = tasks;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    tasks.forEach((task, index) => {
        list.innerHTML += `<li>${task.name} - ${task.duration} mins - ${task.priority} <button onclick="deleteTask(${index})" style="background-color: white; color: black;">❌</button></li>`;
    });
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTaskList();
    updateTaskSelect();
    generateTimeline();
    showToast("Task deleted. Time rebalanced ⏳");
}

function addTask() {
    const name = document.getElementById("taskName").value;
    const duration = parseInt(document.getElementById("duration").value);
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;

    if (!name || !duration || !deadline) {
        showToast("Missing task info! Complete your quest 📝");
        return;
    }

    const task = { name, duration, deadline, priority };
    tasks.push(task);
    saveTasks();
    renderTaskList();
    updateTaskSelect();
    generateTimeline();

    document.getElementById("taskName").value = "";
    document.getElementById("duration").value = "";
    showToast("+1 Task added to the timeline 🌌");
}

function updateTaskSelect() {
    const select = document.getElementById("taskSelect");
    select.innerHTML = "";
    tasks.forEach((task, i) => {
        select.innerHTML += `<option value="${i}">${task.name}</option>`;
    });
}

function generateTimeline() {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    timeline.innerHTML = "";
    tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    tasks.forEach(task => {
        let bg = "#64748b";
        if (task.priority === "low") bg = "#10b981";
        else if (task.priority === "medium") bg = "#f59e0b";
        else if (task.priority === "high") bg = "#ef4444";

        timeline.innerHTML += `<div class="timeline-block" style="background-color:${bg}">
            <span>${task.name}</span>
            <span>${task.duration} mins</span>
        </div>`;
    });
}

function startTimer() {
    const taskIndex = parseInt(document.getElementById("taskSelect").value);
    if (isNaN(taskIndex) || !tasks[taskIndex]) {
        showToast('Please select a task');
        return;
    }
    const task = tasks[taskIndex];
    timerTimeLeft = task.duration * 60;
    runTimer();
}

function runTimer() {
    clearInterval(timer);
    timerPaused = false;
    timer = setInterval(() => {
        const mins = Math.floor(timerTimeLeft / 60).toString().padStart(2, '0');
        const secs = (timerTimeLeft % 60).toString().padStart(2, '0');
        document.getElementById("timerDisplay").innerText = `${mins}:${secs}`;

        if (timerTimeLeft === 0) {
            clearInterval(timer);
            document.getElementById("productivity-feedback").innerText = "Well done! Task complete ✅";
            new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3').play();
        }
        timerTimeLeft--;
    }, 1000);
}

function pauseResumeTimer() {
    if (timerPaused) {
        runTimer();
        showToast("Timer resumed ▶");
    } else {
        clearInterval(timer);
        showToast("Timer paused ⏸");
    }
    timerPaused = !timerPaused;
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
    timerTimeLeft = 0;
    document.getElementById("timerDisplay").innerText = "00:00";
    document.getElementById("productivity-feedback").innerText = "";
}

function startBreakTimer() {
    const breakTime = parseInt(document.getElementById("breakTime").value);
    if (!breakTime || breakTime <= 0) {
        showToast('Enter a valid break time. Even Chrono rests! 💤');
        return;
    }
    breakTimeLeft = breakTime * 60;
    runBreakTimer();
}

function runBreakTimer() {
    clearInterval(breakTimer);
    breakPaused = false;
    breakTimer = setInterval(() => {
        const mins = Math.floor(breakTimeLeft / 60).toString().padStart(2, '0');
        const secs = (breakTimeLeft % 60).toString().padStart(2, '0');
        document.getElementById("breakDisplay").innerText = `${mins}:${secs}`;

        if (breakTimeLeft === 0) {
            clearInterval(breakTimer);
            new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3').play();
            showToast("Break's over! Back to orbit 🚀");
        }
        breakTimeLeft--;
    }, 1000);
}

function pauseResumeBreak() {
    if (breakPaused) {
        runBreakTimer();
        showToast("Break resumed ☀️");
    } else {
        clearInterval(breakTimer);
        showToast("Break paused 💤");
    }
    breakPaused = !breakPaused;
}

function stopBreakTimer() {
    clearInterval(breakTimer);
    breakTimer = null;
    breakTimeLeft = 0;
    document.getElementById("breakDisplay").innerText = "00:00";
}

function renderStudyGroups() {
    const container = document.getElementById('studyGroupsList');
    if (!container) return;
    container.innerHTML = '';

    const userGroups = studyGroups.filter(group =>
        group.members.includes(currentUser.email) || group.createdBy === currentUser.email
    );

    if (userGroups.length === 0) {
        container.innerHTML = '<p>No study groups yet. Create one!</p>';
        return;
    }

    userGroups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = 'study-group-card';
        groupEl.innerHTML = `
            <h4>${group.name}</h4>
            <p>Members: ${group.members.join(', ')}</p>
            <button onclick="viewGroup(${group.id})" class="dashboard-button" style="margin-top: 0.5rem;">View Group</button>
        `;
        container.appendChild(groupEl);
    });
}

function viewGroup(groupId) {
    const group = studyGroups.find(g => g.id === groupId);
    if (group) {
        showToast(`Viewing group: ${group.name}`);
    }
}