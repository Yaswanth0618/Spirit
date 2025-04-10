let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let studyGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let mood = "";
let timer;
let breakTimer;

// Initialize on page load
window.onload = () => {
    // Check if user is logged in
    if (currentUser) {
        tasks = currentUser.tasks || [];
        renderTaskList();
        updateTaskSelect();
        generateTimeline();
        renderMoodChart();
        renderStudyGroups();
    } else {
        // Show login form by default
        document.querySelector('.login__register').style.display = 'none';
    }

    // Password visibility toggle
    togglePassword('password', 'loginPassword');
    togglePassword('passwordCreate', 'loginPasswordCreate');

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
};

// Toggle between login and register forms
const loginAccessRegister = document.querySelector('.login__register');
const loginAccess = document.querySelector('.login__access');
const buttonRegister = document.getElementById('loginButtonRegister');
const buttonAccess = document.getElementById('loginButtonAccess');

buttonRegister.addEventListener('click', () => {
    loginAccess.style.display = 'none';
    loginAccessRegister.style.display = 'block';
});

buttonAccess.addEventListener('click', () => {
    loginAccessRegister.style.display = 'none';
    loginAccess.style.display = 'block';
});

// Register Form Submission
document.getElementById('WealthifyRegister').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('emailCreate').value;
    const password = document.getElementById('passwordCreate').value;
    
    // Validate inputs
    if (!fullName || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('User already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        fullName,
        email,
        password,
        subscription: {
            plan: 'trial',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        },
        tasks: [],
        moodHistory: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully! You can now login.');
    loginAccessRegister.style.display = 'none';
    loginAccess.style.display = 'block';
});

// Login Form Submission
document.querySelector('.login__form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(user => user.email === email && user.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        tasks = currentUser.tasks || [];
        
        // Update UI
        renderTaskList();
        updateTaskSelect();
        generateTimeline();
        renderMoodChart();
        renderStudyGroups();
        
        alert('Login successful!');
    } else {
        alert('Invalid email or password');
    }
});

// Password visibility toggle
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId),
          icon = document.getElementById(iconId);

    icon.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('ri-eye-off-fill');
            icon.classList.add('ri-eye-fill');
        } else {
            input.type = 'password';
            icon.classList.remove('ri-eye-fill');
            icon.classList.add('ri-eye-off-fill');
        }
    });
}

// Task Management
function saveTasks() {
    if (currentUser) {
        currentUser.tasks = tasks;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update users array
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
        list.innerHTML += `<li>${task.name} - ${task.duration} mins - ${task.priority} <button onclick="deleteTask(${index})">❌</button></li>`;
    });
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTaskList();
    updateTaskSelect();
    generateTimeline();
}

function addTask() {
    const name = document.getElementById("taskName").value;
    const duration = parseInt(document.getElementById("duration").value);
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;

    if (!name || !duration || !deadline) {
        alert('Please fill all required fields');
        return;
    }

    const task = { name, duration, deadline, priority };
    tasks.push(task);
    saveTasks();
    renderTaskList();
    updateTaskSelect();
    generateTimeline();
    
    // Clear form
    document.getElementById("taskName").value = "";
    document.getElementById("duration").value = "";
}

function updateTaskSelect() {
    const select = document.getElementById("taskSelect");
    select.innerHTML = "";
    tasks.forEach((task, i) => {
        select.innerHTML += `<option value="${i}">${task.name}</option>`;
    });
}

// Mood Tracking
function setMood(emoji) {
    mood = emoji;
    document.getElementById("currentMood").innerText = emoji;
    const relaxAudio = document.getElementById("relaxAudio");
    const focusAudio = document.getElementById("focusAudio");

    relaxAudio.pause();
    focusAudio.pause();

    if (mood === '😞') {
        relaxAudio.style.display = 'block';
        focusAudio.style.display = 'none';
        relaxAudio.play();
    } else if (mood === '😐') {
        relaxAudio.style.display = 'none';
        focusAudio.style.display = 'block';
        focusAudio.play();
    } else {
        relaxAudio.style.display = 'none';
        focusAudio.style.display = 'none';
    }

    // Save mood history
    if (currentUser) {
        if (!currentUser.moodHistory) currentUser.moodHistory = [];
        currentUser.moodHistory.push({
            date: new Date().toISOString(),
            mood: emoji
        });
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        renderMoodChart();
    }

    generateTimeline();
}

function renderMoodChart() {
    if (!currentUser || !currentUser.moodHistory || currentUser.moodHistory.length === 0) {
        document.getElementById('moodChart').innerHTML = '<p>No mood data yet. Track your mood to see insights.</p>';
        return;
    }
    
    const chart = document.getElementById('moodChart');
    chart.innerHTML = '';
    
    // Analyze mood patterns
    const happyDays = currentUser.moodHistory.filter(entry => entry.mood === '😊').length;
    const neutralDays = currentUser.moodHistory.filter(entry => entry.mood === '😐').length;
    const sadDays = currentUser.moodHistory.filter(entry => entry.mood === '😞').length;
    const totalDays = currentUser.moodHistory.length;
    
    const happyPercentage = Math.round((happyDays / totalDays) * 100);
    const stressPercentage = Math.round((sadDays / totalDays) * 100);
    
    let insights = `
        <p>You've been happy ${happyPercentage}% of the time.</p>
        <p>Stress detected ${stressPercentage}% of the time.</p>
    `;
    
    if (stressPercentage > 30) {
        insights += '<p>Consider taking more breaks and practicing mindfulness!</p>';
    }
    
    document.getElementById('moodInsights').innerHTML = insights;
    
    // Simple bar chart for last 7 days
    const recentMoods = currentUser.moodHistory.slice(-7);
    recentMoods.forEach(entry => {
        const bar = document.createElement('div');
        bar.style.height = '40px';
        bar.style.width = '100%';
        bar.style.marginBottom = '5px';
        bar.style.display = 'flex';
        bar.style.alignItems = 'center';
        bar.innerHTML = `
            <span style="width: 60px;">${new Date(entry.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
            <span style="font-size: 1.5em; width: 40px;">${entry.mood}</span>
            <div style="flex-grow: 1; background: #eee; height: 20px; border-radius: 10px;">
                <div style="height: 100%; width: ${entry.mood === '😊' ? '100%' : entry.mood === '😐' ? '60%' : '30%'}; 
                    background: ${entry.mood === '😊' ? '#4cc9f0' : entry.mood === '😐' ? '#4895ef' : '#f72585'}; 
                    border-radius: 10px;"></div>
            </div>
        `;
        chart.appendChild(bar);
    });
}

// Study Group Functions
function createStudyGroup() {
    const name = document.getElementById('groupName').value;
    const members = document.getElementById('groupMembers').value.split(',').map(email => email.trim());
    
    if (!name || members.length === 0) {
        alert('Please fill all required fields');
        return;
    }
    
    const group = {
        id: Date.now(),
        name,
        members,
        createdBy: currentUser.email,
        tasks: [],
        meetings: []
    };
    
    studyGroups.push(group);
    localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
    renderStudyGroups();
    
    // Clear form
    document.getElementById('groupName').value = '';
    document.getElementById('groupMembers').value = '';
}

function renderStudyGroups() {
    const container = document.getElementById('studyGroupsList');
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
        alert(`Viewing group: ${group.name}\nMembers: ${group.members.join(', ')}`);
        // In a full implementation, you would show a detailed view of the group
    }
}

// Timeline Generation
function generateTimeline() {
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    // Sort tasks by priority: high first, then medium, then low
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

// Timer Functions
function startTimer() {
    const taskIndex = document.getElementById("taskSelect").value;
    if (!tasks[taskIndex]) {
        alert('Please select a valid task');
        return;
    }
    
    const task = tasks[taskIndex];
    let timeLeft = task.duration * 60;

    clearInterval(timer);

    timer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        document.getElementById("timerDisplay").innerText = `${mins}:${secs}`;

        if (timeLeft === Math.floor(task.duration * 30)) {
            document.getElementById("productivity-feedback").innerText = "You're halfway there! Keep going 💪";
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("productivity-feedback").innerText = "Well done! Task complete ✅";
            // Play completion sound
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');
            audio.play();
        }

        timeLeft--;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    document.getElementById("timerDisplay").innerText = "00:00";
    document.getElementById("productivity-feedback").innerText = "";
}

function startBreakTimer() {
    const breakTime = parseInt(document.getElementById("breakTime").value);
    if (!breakTime || breakTime <= 0) {
        alert('Please enter a valid break time');
        return;
    }
    
    let timeLeft = breakTime * 60;

    clearInterval(breakTimer);

    breakTimer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        document.getElementById("breakDisplay").innerText = `${mins}:${secs}`;

        if (timeLeft <= 0) {
            clearInterval(breakTimer);
            alert("Break's over! Get back to work 💼");
            // Play alarm sound
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
            audio.play();
        }

        timeLeft--;
    }, 1000);
}

function stopBreakTimer() {
    clearInterval(breakTimer);
    document.getElementById("breakDisplay").innerText = "00:00";
}

// Quick Add Functionality
function showQuickAdd() {
    document.getElementById('quickAddModal').style.display = 'flex';
}

function hideQuickAdd() {
    document.getElementById('quickAddModal').style.display = 'none';
}

function addQuickTask() {
    const name = document.getElementById('quickTaskName').value;
    if (!name) {
        alert('Please enter a task name');
        return;
    }
    
    const task = {
        name,
        duration: 30,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        priority: 'medium'
    };
    
    tasks.push(task);
    saveTasks();
    renderTaskList();
    updateTaskSelect();
    generateTimeline();
    hideQuickAdd();
    document.getElementById('quickTaskName').value = '';
}