// Utility function to calculate Waiting Time and Turnaround Time
function calculateTimes(processes) {
    let totalWT = 0, totalTAT = 0;
    processes.forEach(p => {
        p.waitingTime = p.completionTime - p.arrivalTime - p.originalBurstTime;
        p.turnAroundTime = p.completionTime - p.arrivalTime;
        totalWT += p.waitingTime;
        totalTAT += p.turnAroundTime;
    });
    return { avgWT: (totalWT / processes.length).toFixed(2), avgTAT: (totalTAT / processes.length).toFixed(2) };
}

// Gantt Chart Display
function displayGanttChart(ganttChart) {
    const ganttChartDiv = document.getElementById('ganttChart');
    ganttChartDiv.innerHTML = '';
    ganttChart.forEach(pid => {
        const block = document.createElement('div');
        block.textContent = pid;
        block.className = 'gantt-block';
        ganttChartDiv.appendChild(block);
    });
}

// Results Table Display
function displayResultsTable(processes, avgWT, avgTAT) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = processes.map(p => `
        <tr>
            <td>${p.PID}</td>
            <td>${p.arrivalTime}</td>
            <td>${p.originalBurstTime}</td>
            <td>${p.completionTime || '-'}</td>
            <td>${p.waitingTime || '-'}</td>
            <td>${p.turnAroundTime || '-'}</td>
        </tr>
    `).join('');
    tableBody.innerHTML += `
        <tr>
            <td colspan="4"></td>
            <td><strong>Avg WT: ${avgWT}</strong></td>
            <td><strong>Avg TAT: ${avgTAT}</strong></td>
        </tr>
    `;
    document.getElementById('resultTable').classList.remove('hidden');
}

// FCFS (First Come First Serve) Scheduling
function fcfsScheduling(processes) {
    let ganttChart = [], currentTime = 0;
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    processes.forEach(p => {
        currentTime = Math.max(currentTime, p.arrivalTime);
        ganttChart.push(p.PID);
        currentTime += p.burstTime;
        p.completionTime = currentTime;
    });
    return { ganttChart, ...calculateTimes(processes) };
}

// SJF (Shortest Job First) Scheduling (Non-Preemptive)
function sjfScheduling(processes) {
    let ganttChart = [];
    let currentTime = 0, completed = 0;
    const n = processes.length;

    // Sort by arrival time initially for chronological order
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (completed < n) {
        // Filter processes that have arrived and are not yet completed
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && !p.isCompleted);

        if (availableProcesses.length === 0) {
            // If no process has arrived, jump to the next arrival time
            currentTime = Math.min(...processes.filter(p => !p.isCompleted).map(p => p.arrivalTime));
            continue;
        }

        // Find process with shortest burst time
        let shortestProcess = availableProcesses.reduce((prev, curr) => curr.burstTime < prev.burstTime ? curr : prev);

        // Update process details and Gantt chart
        ganttChart.push(shortestProcess.PID);
        currentTime += shortestProcess.burstTime;
        shortestProcess.completionTime = currentTime;
        shortestProcess.isCompleted = true;
        completed++;
    }

    return { ganttChart, ...calculateTimes(processes) };
}

// Main function to run the selected scheduling algorithm
function runScheduling() {
    const arrivalTime = document.getElementById('arrivalTime').value.split(' ').map(Number);
    const burstTime = document.getElementById('burstTime').value.split(' ').map(Number);
    const priority = document.getElementById('priority').value.split(' ').map(Number);
    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
    const algorithm = document.getElementById('algorithm').value;

    let processes = arrivalTime.map((at, i) => ({
        PID: `P${i + 1}`,
        arrivalTime: at,
        burstTime: burstTime[i],
        originalBurstTime: burstTime[i],
        priority: priority[i] || 0,
        isCompleted: false, // Used for algorithms like SJF and Priority
    }));

    let result;
    switch (algorithm) {
        case 'fcfs': result = fcfsScheduling(processes); break;
        case 'sjf': result = sjfScheduling(processes); break;
        default: alert("Selected algorithm not implemented."); return;
    }

    displayGanttChart(result.ganttChart);
    displayResultsTable(processes, result.avgWT, result.avgTAT);
}
