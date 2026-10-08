const API_URL = 'http://127.0.0.1:5000/api/students';

document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    fetchStats();
    checkServerStatus();
    setInterval(checkServerStatus, 5000);
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
});

// SPA Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    
    // Highlight active nav button
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');
}

// Live Time Functionality
function updateLiveTime() {
    const now = new Date();
    document.getElementById('liveTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Check Server Status
async function checkServerStatus() {
    const statusElem = document.getElementById('serverStatus');
    const statusText = document.getElementById('statusText');
    try {
        const res = await fetch(`${API_URL}/stats`);
        if (res.ok) {
            statusElem.className = 'status-indicator online';
            statusText.textContent = 'Backend Active (127.0.0.1:5000)';
        } else {
            throw new Error();
        }
    } catch {
        statusElem.className = 'status-indicator offline';
        statusText.textContent = 'Backend Offline';
    }
}

// Fetch and Render Students Table
async function fetchStudents(query = '') {
    try {
        const res = await fetch(`${API_URL}${query ? '?search=' + encodeURIComponent(query) : ''}`);
        const students = await res.json();
        const tbody = document.getElementById('studentTableBody');
        tbody.innerHTML = '';

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding: 20px;">No student records found.</td></tr>';
            return;
        }

        let distinction = 0, pass = 0, fail = 0;

        students.forEach(s => {
            let badgeClass = 'badge-pass';
            let statusLabel = 'Pass';

            if (s.marks >= 75) {
                badgeClass = 'badge-distinction';
                statusLabel = 'Distinction';
                distinction++;
            } else if (s.marks >= 40) {
                pass++;
            } else {
                badgeClass = 'badge-fail';
                statusLabel = 'Fail';
                fail++;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${s.roll_no}</strong></td>
                <td>${s.name}</td>
                <td>${s.student_class}</td>
                <td>${s.marks}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                <td><a href="tel:${s.contact}" class="phone-link">📞 ${s.contact}</a></td>
                <td>
                    <button class="edit-btn" onclick="editStudent(${s.id}, '${s.roll_no}', '${s.name}', '${s.student_class}', ${s.marks}, '${s.contact}')">Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update Analytics view metrics
        document.getElementById('distinctionCount').textContent = distinction;
        document.getElementById('passCount').textContent = pass;
        document.getElementById('failCount').textContent = fail;

        const total = students.length || 1;
        document.getElementById('distinctionBar').style.width = `${Math.round((distinction / total) * 100)}%`;
        document.getElementById('passBar').style.width = `${Math.round(((distinction + pass) / total) * 100)}%`;

    } catch (err) {
        console.error('Failed to fetch students:', err);
    }
}

// Fetch Stats
async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/stats`);
        const stats = await res.json();
        document.getElementById('totalStudents').textContent = stats.total;
        document.getElementById('avgMarks').textContent = `${stats.avg_marks}%`;
        document.getElementById('maxMarks').textContent = stats.max_marks;
    } catch (err) {
        console.error('Failed to fetch stats:', err);
    }
}

// Submit Form (Add or Edit)
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('studentId').value;
    const payload = {
        roll_no: document.getElementById('rollNo').value,
        name: document.getElementById('name').value,
        student_class: document.getElementById('studentClass').value,
        marks: document.getElementById('marks').value,
        contact: document.getElementById('contact').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
        alert('Error: ' + data.error);
    } else {
        resetForm();
        fetchStudents();
        fetchStats();
        switchTab('directoryTab'); // Auto navigate to directory after saving
    }
});

// Edit Student
function editStudent(id, rollNo, name, studentClass, marks, contact) {
    document.getElementById('studentId').value = id;
    document.getElementById('rollNo').value = rollNo;
    document.getElementById('rollNo').disabled = true;
    document.getElementById('name').value = name;
    document.getElementById('studentClass').value = studentClass;
    document.getElementById('marks').value = marks;
    document.getElementById('contact').value = contact;

    document.getElementById('formTitle').textContent = 'Edit Student Record';
    document.getElementById('saveBtn').textContent = 'Update Student';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    switchTab('formTab'); // Switch to form view
}

document.getElementById('cancelBtn').addEventListener('click', resetForm);

function resetForm() {
    document.getElementById('studentId').value = '';
    document.getElementById('rollNo').disabled = false;
    document.getElementById('studentForm').reset();
    document.getElementById('formTitle').textContent = 'Register New Student';
    document.getElementById('saveBtn').textContent = 'Save Record';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Delete Record
async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
        fetchStats();
    }
}

document.getElementById('searchInput').addEventListener('input', (e) => fetchStudents(e.target.value));