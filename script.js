// Round Robin Scheduling with proper Gantt chart
function roundRobinScheduling(processes, timeQuantum) {
    let ganttChart = [];
    let queue = [...processes];
    let currentTime = 0;

    while (queue.length > 0) {
        let process = queue.shift(); // Pop the first process in the queue

        if (process.burstTime > 0) { // If the process still has burst time left
            ganttChart.push(process.PID);

            if (process.burstTime > timeQuantum) {
                currentTime += timeQuantum;
                process.burstTime -= timeQuantum; // Decrease burst time
                queue.push(process); // Re-add to the queue for the next cycle
            } else {
                currentTime += process.burstTime;
                process.completionTime = currentTime;
                process.burstTime = 0; // Process is finished
            }
        }
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}

// Function to calculate Waiting Time and Turnaround Time for all processes
function calculateTimes(processes) {
    let totalWT = 0;
    let totalTAT = 0;

    processes.forEach(process => {
        process.waitingTime = process.completionTime - process.arrivalTime - process.originalBurstTime;
        process.turnAroundTime = process.completionTime - process.arrivalTime;
        totalWT += process.waitingTime;
        totalTAT += process.turnAroundTime;
    });

    const avgWT = (totalWT / processes.length).toFixed(2);
    const avgTAT = (totalTAT / processes.length).toFixed(2);

    return { avgWT, avgTAT };
}

// Display results in a table
function displayResultsTable(processes, avgWT, avgTAT) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear the existing table

    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML =
            `<td>${process.PID}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.originalBurstTime}</td>
            <td>${process.completionTime || '-'}</td>
            <td>${process.waitingTime || '-'}</td>
            <td>${process.turnAroundTime || '-'}</td>`;
        tableBody.appendChild(row);
    });

    const avgRow = document.createElement('tr');
    avgRow.innerHTML =
        `<td colspan="4"></td>
        <td ><strong>Average WT: </strong>${avgWT}</td>
        <td><strong>Average TAT: </strong>${avgTAT}</td>`;
    tableBody.appendChild(avgRow);

    document.getElementById('resultTable').classList.remove('hidden'); // Show table
}

// Display Gantt chart with colorful blocks
function displayGanttChart(ganttChart) {
    const ganttChartDiv = document.getElementById('ganttChart');
    ganttChartDiv.innerHTML = ''; // Clear previous chart

    ganttChart.forEach(pid => {
        const block = document.createElement('div');
        block.textContent = pid;
        block.style.display = 'inline-block';
        block.style.margin = '2px';
        block.style.padding = '10px';
        block.style.backgroundColor = getRandomColor(); // Apply a random color
        ganttChartDiv.appendChild(block); // Append block to Gantt chart
    });
}

// Function to generate random color for blocks
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// FCFS (First Come First Serve) Scheduling
// Updated FCFS Scheduling Function
function fcfsScheduling(processes) {
    let ganttChart = [];
    let currentTime = 0;

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by Arrival Time

    processes.forEach(process => {
        // If current time is less than arrival time, wait until the process arrives
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        
        // Record the process in the Gantt chart
        ganttChart.push(process.PID);
        
        // Calculate Completion Time (CT) for the process
        currentTime += process.burstTime;
        process.completionTime = currentTime;
    });

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}


// SJF (Shortest Job First) Scheduling (Non-preemptive)
// Updated SJF Scheduling Function (Non-Preemptive)
function sjfScheduling(processes) {
    let ganttChart = [];
    let currentTime = 0;
    let completed = 0;
    const n = processes.length;

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by Arrival Time

    while (completed < n) {
        // Get processes that have arrived by the current time and are not completed
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && !p.isCompleted);

        if (availableProcesses.length === 0) {
            // If no process has arrived yet, jump to the next arrival time
            currentTime = Math.min(...processes.filter(p => !p.isCompleted).map(p => p.arrivalTime));
            continue;
        }

        // Select the process with the shortest burst time among available processes
        let shortestProcess = availableProcesses.reduce((prev, curr) => 
            curr.burstTime < prev.burstTime ? curr : prev
        );

        // Update Gantt Chart and completion details
        ganttChart.push(shortestProcess.PID);
        currentTime += shortestProcess.burstTime;
        shortestProcess.completionTime = currentTime;
        shortestProcess.isCompleted = true;
        completed++;
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}


// Priority Scheduling (Non-preemptive)
// Updated Priority Scheduling Function (Non-Preemptive)
function priorityScheduling(processes) {
    let ganttChart = [];
    let currentTime = 0;
    let completed = 0;
    const n = processes.length;

    // Sort processes by arrival time initially for easier management of time jumps
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

    while (completed < n) {
        // Filter for processes that have arrived and are not completed
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && !p.isCompleted);

        if (availableProcesses.length === 0) {
            // If no process has arrived, jump to the arrival time of the next process
            currentTime = Math.min(...processes.filter(p => !p.isCompleted).map(p => p.arrivalTime));
            continue;
        }

        // Select the process with the highest priority (smallest priority number)
        let highestPriorityProcess = availableProcesses.reduce((prev, curr) => 
            (curr.priority < prev.priority || (curr.priority === prev.priority && curr.arrivalTime < prev.arrivalTime)) ? curr : prev
        );

        // Update Gantt Chart and completion details
        ganttChart.push(highestPriorityProcess.PID);
        currentTime += highestPriorityProcess.burstTime;
        highestPriorityProcess.completionTime = currentTime;
        highestPriorityProcess.isCompleted = true;
        completed++;
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}


// HRRN (Highest Response Ratio Next) Scheduling
function hrrnScheduling(processes) {
    let ganttChart = [];
    let currentTime = 0;

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort by Arrival Time

    let completed = 0;
    let totalProcesses = processes.length;
    let queue = [];

    while (completed < totalProcesses) {
        // Add processes to the queue that have arrived
        processes.forEach(process => {
            if (process.arrivalTime <= currentTime && !process.completed && !queue.includes(process)) {
                queue.push(process);
            }
        });

        if (queue.length > 0) {
            // Calculate the response ratio for each process
            queue.forEach(process => {
                process.responseRatio = (process.waitingTime + process.burstTime) / process.burstTime;
            });

            // Sort by highest response ratio
            queue.sort((a, b) => b.responseRatio - a.responseRatio);

            let process = queue.shift(); // Pop the process with highest ratio
            ganttChart.push(process.PID);
            currentTime += process.burstTime;
            process.completionTime = currentTime;
            process.completed = true;
            completed++;
        } else {
            currentTime++; // If no process is ready, just increment time
        }
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}

function srtfScheduling(processes) {
    let currentTime = 0;
    let completed = 0;
    let ganttChart = [];
    const n = processes.length;

    // Initialize remaining burst times
    processes.forEach(p => { p.remainingTime = p.burstTime; });
    
    while (completed < n) {
        // Filter for processes that have arrived and are not completed
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
        
        if (availableProcesses.length === 0) {
            // If no process is ready, advance to the next arrival time
            currentTime = Math.min(...processes.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
            continue;
        }

        // Select process with shortest remaining time
        let shortestProcess = availableProcesses.reduce((prev, curr) =>
            (curr.remainingTime < prev.remainingTime ||
            (curr.remainingTime === prev.remainingTime && curr.arrivalTime < prev.arrivalTime)) ? curr : prev
        );

        // Run the selected process for one unit of time
        ganttChart.push(shortestProcess.PID);
        shortestProcess.remainingTime -= 1;
        currentTime += 1;

        // Check if the process is completed
        if (shortestProcess.remainingTime === 0) {
            shortestProcess.completionTime = currentTime;
            completed++;
        }
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}

function preemptivePriorityScheduling(processes) {
    let currentTime = 0;
    let completed = 0;
    let ganttChart = [];
    const n = processes.length;

    // Initialize remaining burst times
    processes.forEach(p => { p.remainingTime = p.burstTime; });

    while (completed < n) {
        // Filter for processes that have arrived and are not completed
        let availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
        
        if (availableProcesses.length === 0) {
            // If no process is ready, advance to the next arrival time
            currentTime = Math.min(...processes.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
            continue;
        }

        // Select process with the highest priority (lowest priority number)
        let highestPriorityProcess = availableProcesses.reduce((prev, curr) =>
            (curr.priority < prev.priority ||
            (curr.priority === prev.priority && curr.arrivalTime < prev.arrivalTime)) ? curr : prev
        );

        // Run the selected process for one unit of time
        ganttChart.push(highestPriorityProcess.PID);
        highestPriorityProcess.remainingTime -= 1;
        currentTime += 1;

        // Check if the process is completed
        if (highestPriorityProcess.remainingTime === 0) {
            highestPriorityProcess.completionTime = currentTime;
            completed++;
        }
    }

    const times = calculateTimes(processes);
    return { ganttChart, ...times };
}



// Main function to run the selected scheduling algorithm
function runScheduling() {
    const arrivalTime = document.getElementById('arrivalTime').value.split(' ').map(Number);
    const burstTime = document.getElementById('burstTime').value.split(' ').map(Number);
    const priority = document.getElementById('priority').value.split(' ').map(Number);
    const timeQuantum = parseInt(document.getElementById('timeQuantum').value);
    const algorithm = document.getElementById('algorithm').value;

    let processes = [];
    for (let i = 0; i < arrivalTime.length; i++) {
        processes.push({
            PID: `P${i}`,
            arrivalTime: arrivalTime[i],
            originalBurstTime: burstTime[i],
            burstTime: burstTime[i],
            priority: priority[i] || 0,  // Priority is used only in Priority Scheduling
        });
    }

    let result;
    switch (algorithm) {
        case 'roundRobin':
            result = roundRobinScheduling(processes, timeQuantum);
            break;
        case 'fcfs':
            result = fcfsScheduling(processes);
            break;
        case 'sjf':
            result = sjfScheduling(processes);
            break;
        case 'priority':
            result = priorityScheduling(processes);
            break;
        case 'hrrn':
            result = hrrnScheduling(processes);
            break;
        case 'srtf':
            result = srtfScheduling(processes);
            break;
        case 'preemptivePriority':
            result = preemptivePriorityScheduling(processes);
            break;
        default:
            alert("Selected algorithm not implemented yet.");
            return;
    }

    // Display the Gantt chart
    displayGanttChart(result.ganttChart);

    // Display the results in the table
    displayResultsTable(processes, result.avgWT, result.avgTAT);
}