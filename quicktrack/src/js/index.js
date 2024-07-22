document.addEventListener('DOMContentLoaded', () => {
  const trackTab = document.getElementById('track-tab');
  const analyticsTab = document.getElementById('analytics-tab');
  const trackSection = document.querySelector('main');
  const analyticsSection = document.getElementById('analytics');
  const taskInput = document.getElementById('task-input');
  const startTrackingButton = document.getElementById('start-tracking');
  const logManualButton = document.getElementById('log-manual');
  const manualStartTimeInput = document.getElementById('manual-start-time');
  const manualEndTimeInput = document.getElementById('manual-end-time');
  const currentTasksDiv = document.getElementById('current-tasks');
  const logList = document.getElementById('log-list');
  const summary = document.getElementById('summary');

  let logs = JSON.parse(localStorage.getItem('logs')) || [];
  let currentTasks = [];
  let timers = {};

  trackTab.addEventListener('click', () => {
      trackSection.classList.remove('hidden');
      analyticsSection.classList.add('hidden');
  });

  analyticsTab.addEventListener('click', () => {
      trackSection.classList.add('hidden');
      analyticsSection.classList.remove('hidden');
      displaySummary();
  });

  startTrackingButton.addEventListener('click', () => {
      const task = taskInput.value.trim();
      if (manualStartTimeInput.classList.contains('hidden')) {
          
          if (task) {
              const taskElement = createTaskElement(task);
              currentTasks.push({
                  description: task,
                  startTime: new Date(),
                  endTime: null,
                  duration: null,
                  element: taskElement
              });
              currentTasksDiv.appendChild(taskElement);
              startTimer(task, taskElement.querySelector('.task-timer'));
              taskInput.value = '';
          }
      } else {
         
          const startTime = new Date(manualStartTimeInput.value);
          const endTime = new Date(manualEndTimeInput.value);
          if (task && startTime && endTime && endTime > startTime) {
              const duration = (endTime - startTime) / 1000;
              logs.push({ description: task, startTime, endTime, duration });
              saveLogs();
              renderLogs();
              resetManualInputs();
          }
      }
  });

  logManualButton.addEventListener('click', () => {
      taskInput.placeholder = 'Task description';
      manualStartTimeInput.classList.toggle('hidden');
      manualEndTimeInput.classList.toggle('hidden');
      startTrackingButton.textContent = manualStartTimeInput.classList.contains('hidden') ? 'Start' : 'Add';
  });

  function createTaskElement(task) {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      taskElement.innerHTML = `
          <span class="task-name">${task}</span>
          <span class="task-timer">00:00:00</span>
          <button class="stop-button">Stop</button>
      `;
      taskElement.querySelector('.stop-button').addEventListener('click', () => stopTracking(task));
      return taskElement;
  }

  function startTimer(task, timerElement) {
      timers[task] = setInterval(() => {
          const now = new Date();
          const taskObj = currentTasks.find(t => t.description === task);
          const elapsedTime = Math.round((now - taskObj.startTime) / 1000);
          const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
          const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
          const seconds = String(elapsedTime % 60).padStart(2, '0');
          timerElement.textContent = `${hours}:${minutes}:${seconds}`;
      }, 1000);
  }

  function stopTracking(task) {
      clearInterval(timers[task]);
      const taskObj = currentTasks.find(t => t.description === task);
      taskObj.endTime = new Date();
      taskObj.duration = (taskObj.endTime - taskObj.startTime) / 1000;
      logs.push(taskObj);
      saveLogs();
      renderLogs();
      taskObj.element.remove();
      currentTasks = currentTasks.filter(t => t.description !== task);
  }

  function saveLogs() {
      localStorage.setItem('logs', JSON.stringify(logs));
  }

  function renderLogs() {
      logList.innerHTML = '';
      logs.forEach(log => {
          const logItem = document.createElement('li');
          logItem.innerHTML = `
              <span>${log.description}</span>
              <span>${new Date(log.startTime).toLocaleString()}</span>
              <span>${new Date(log.endTime).toLocaleString()}</span>
              <span>${new Date(log.duration * 1000).toISOString().substr(11, 8)}</span>
              <button class="delete-button">Delete</button>
          `;
          logItem.querySelector('.delete-button').addEventListener('click', () => {
              logs = logs.filter(l => l !== log);
              saveLogs();
              renderLogs();
          });
          logList.appendChild(logItem);
      });
  }

  function resetManualInputs() {
      taskInput.placeholder = 'What are you working on?';
      manualStartTimeInput.classList.add('hidden');
      manualEndTimeInput.classList.add('hidden');
      taskInput.value = '';
      manualStartTimeInput.value = '';
      manualEndTimeInput.value = '';
      startTrackingButton.textContent = 'Start';
  }

  function displaySummary() {
      const totalDuration = logs.reduce((total, log) => total + log.duration, 0);
      const hours = String(Math.floor(totalDuration / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalDuration % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalDuration % 60).padStart(2, '0');
      summary.textContent = `Total Time Spent: ${hours}:${minutes}:${seconds}`;
  }

  
  renderLogs();
});
