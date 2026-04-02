// ============ DATA STORAGE ============
let currentUser = "John Doe";

function initData() {
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify([]));
    }
    if (!localStorage.getItem('leaveRequests')) {
        localStorage.setItem('leaveRequests', JSON.stringify([]));
    }
    if (!localStorage.getItem('leaveBalance')) {
        localStorage.setItem('leaveBalance', JSON.stringify({
            annual: 12,
            sick: 10
        }));
    }
}

// ============ ATTENDANCE FUNCTIONS ============

function isCheckedInToday() {
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('attendance'));
    const todayRecord = attendance.find(record => record.date === today);
    return todayRecord && todayRecord.checkIn;
}

function isCheckedOutToday() {
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('attendance'));
    const todayRecord = attendance.find(record => record.date === today);
    return todayRecord && todayRecord.checkOut;
}

function checkIn() {
    const now = new Date();
    const today = now.toDateString();
    const time = now.toLocaleTimeString();

    let attendance = JSON.parse(localStorage.getItem('attendance'));
    let todayRecord = attendance.find(record => record.date === today);

    if (todayRecord && todayRecord.checkIn) {
        showMessage('Already checked in today!', 'error');
        return;
    }

    if (!todayRecord) {
        attendance.push({
            date: today,
            checkIn: time,
            checkOut: null,
            fullDate: now.toISOString()
        });
    } else {
        todayRecord.checkIn = time;
    }

    localStorage.setItem('attendance', JSON.stringify(attendance));
    updateAttendanceDisplay();
    showMessage('✅ Checked in successfully at ' + time, 'success');
}

function checkOut() {
    const now = new Date();
    const today = now.toDateString();
    const time = now.toLocaleTimeString();

    let attendance = JSON.parse(localStorage.getItem('attendance'));
    let todayRecord = attendance.find(record => record.date === today);

    if (!todayRecord || !todayRecord.checkIn) {
        showMessage('❌ You must check in first!', 'error');
        return;
    }

    if (todayRecord.checkOut) {
        showMessage('Already checked out today!', 'error');
        return;
    }

    todayRecord.checkOut = time;
    localStorage.setItem('attendance', JSON.stringify(attendance));
    updateAttendanceDisplay();
    showMessage('✅ Checked out successfully at ' + time, 'success');
}

function updateAttendanceDisplay() {
    const today = new Date().toDateString();
    const attendance = JSON.parse(localStorage.getItem('attendance'));
    const todayRecord = attendance.find(record => record.date === today);

    const checkInBtn = document.getElementById('checkin-btn');
    const checkOutBtn = document.getElementById('checkout-btn');
    const statusSpan = document.getElementById('today-status');
    const checkInTimeSpan = document.getElementById('checkin-time');
    const checkOutTimeSpan = document.getElementById('checkout-time');

    if (todayRecord) {
        if (todayRecord.checkIn) {
            statusSpan.textContent = '✅ Checked In';
            checkInTimeSpan.textContent = todayRecord.checkIn;
            checkInBtn.disabled = true;

            if (todayRecord.checkOut) {
                statusSpan.textContent = '✅ Checked Out';
                checkOutTimeSpan.textContent = todayRecord.checkOut;
                checkOutBtn.disabled = true;
            } else {
                checkOutBtn.disabled = false;
            }
        }
    } else {
        statusSpan.textContent = '❌ Not checked in';
        checkInBtn.disabled = false;
        checkOutBtn.disabled = true;
    }
}

// ============ LEAVE FUNCTIONS ============

function submitLeave(event) {
    event.preventDefault();

    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    const reason = document.getElementById('leave-reason').value;

    if (!startDate || !endDate || !reason) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const balance = JSON.parse(localStorage.getItem('leaveBalance'));
    if (days > balance.annual) {
        showMessage(`Insufficient balance! You have ${balance.annual} days left.`, 'error');
        return;
    }

    const leaveRequest = {
        id: Date.now(),
        startDate,
        endDate,
        reason,
        days,
        status: 'pending',
        submittedDate: new Date().toISOString()
    };

    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    requests.push(leaveRequest);
    localStorage.setItem('leaveRequests', JSON.stringify(requests));

    document.getElementById('leave-form').reset();
    showMessage('✅ Leave request submitted!', 'success');
    displayPendingLeaves();
    displayLeaveHistory();
}

function displayPendingLeaves() {
    const requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const pending = requests.filter(r => r.status === 'pending');
    const container = document.getElementById('pending-leaves');

    if (pending.length === 0) {
        container.innerHTML = '<p>No pending leave requests.</p>';
        return;
    }

    container.innerHTML = pending.map(request => `
        <div class="leave-request pending">
            <strong>📅 ${request.startDate} to ${request.endDate}</strong> (${request.days} days)
            <br>📝 ${request.reason}
            <div class="request-actions">
                <button onclick="approveLeave(${request.id})" class="btn btn-success">✅ Approve</button>
                <button onclick="rejectLeave(${request.id})" class="btn btn-danger">❌ Reject</button>
            </div>
        </div>
    `).join('');
}

function approveLeave(id) {
    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const request = requests.find(r => r.id === id);

    if (request && request.status === 'pending') {
        request.status = 'approved';

        let balance = JSON.parse(localStorage.getItem('leaveBalance'));
        balance.annual -= request.days;
        localStorage.setItem('leaveBalance', JSON.stringify(balance));

        localStorage.setItem('leaveRequests', JSON.stringify(requests));
        showMessage('✅ Leave approved!', 'success');
        displayPendingLeaves();
        displayLeaveHistory();
        updateLeaveBalanceDisplay();
    }
}

function rejectLeave(id) {
    let requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const request = requests.find(r => r.id === id);

    if (request && request.status === 'pending') {
        request.status = 'rejected';
        localStorage.setItem('leaveRequests', JSON.stringify(requests));
        showMessage('❌ Leave rejected', 'info');
        displayPendingLeaves();
        displayLeaveHistory();
    }
}

function updateLeaveBalanceDisplay() {
    const balance = JSON.parse(localStorage.getItem('leaveBalance'));
    document.getElementById('leave-balance').textContent = balance.annual;
}

// ============ HISTORY FUNCTIONS ============

function displayAttendanceHistory() {
    const attendance = JSON.parse(localStorage.getItem('attendance'));
    const container = document.getElementById('attendance-history');

    if (attendance.length === 0) {
        container.innerHTML = '<p>No attendance records yet.</p>';
        return;
    }

    attendance.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));

    const table = `
        <table>
            <thead>
                <tr><th>Date</th><th>Check In</th><th>Check Out</th></tr>
            </thead>
            <tbody>
                ${attendance.map(record => `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.checkIn || '--'}</td>
                        <td>${record.checkOut || '--'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = table;
}

function displayLeaveHistory() {
    const requests = JSON.parse(localStorage.getItem('leaveRequests'));
    const container = document.getElementById('leave-history');

    if (requests.length === 0) {
        container.innerHTML = '<p>No leave requests yet.</p>';
        return;
    }

    requests.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

    const table = `
        <table>
            <thead>
                <tr><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
                ${requests.map(request => `
                    <tr>
                        <td>${request.startDate} → ${request.endDate}</td>
                        <td>${request.days}</td>
                        <td>${request.reason}</td>
                        <td style="color: ${request.status === 'approved' ? 'green' : request.status === 'rejected' ? 'red' : 'orange'}; font-weight: bold;">
                            ${request.status.toUpperCase()}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = table;
}

// ============ HELPER FUNCTIONS ============

function showMessage(message, type) {
    const statusDiv = document.getElementById('attendance-status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type === 'success' ? 'success' : 'error'}`;

    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
    }, 3000);
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'history') {
        displayAttendanceHistory();
        displayLeaveHistory();
    } else if (tabName === 'leave') {
        displayPendingLeaves();
        updateLeaveBalanceDisplay();
    }
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    initData();
    updateAttendanceDisplay();
    displayPendingLeaves();
    updateLeaveBalanceDisplay();
    displayAttendanceHistory();
    displayLeaveHistory();

    document.getElementById('checkin-btn').addEventListener('click', checkIn);
    document.getElementById('checkout-btn').addEventListener('click', checkOut);
    document.getElementById('leave-form').addEventListener('submit', submitLeave);
});

window.showTab = showTab;
window.approveLeave = approveLeave;
window.rejectLeave = rejectLeave;
