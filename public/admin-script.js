
// Admin Dashboard Functionality (modular, DRY, reusable)
// Adhere to modularity and reusability
const API_BASE_URL = 'http://localhost:5000/api';
let userChart = null;
let diseaseChart = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
    setupNavigation();
    setupSMSForm();
    loadActiveSection();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.admin-section');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    loadSectionData(targetId);
                }
            });
        });
    });
}

// Load data for specific section
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'disease-reports':
            await loadDiseaseReports();
            break;
        case 'advisories':
            await loadAdvisories();
            break;
        case 'sms':
            await loadSMSHistory();
            break;
        case 'analytics':
            await loadAnalytics();
            break;
    }
}

// Load active section data
function loadActiveSection() {
    const activeSection = document.querySelector('.admin-section.active');
    if (activeSection) {
        loadSectionData(activeSection.id);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await authFetch('/admin/stats');
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.data);
            createCharts(data.data);
            loadRecentReports(data.data);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
    document.getElementById('totalFarms').textContent = stats.totalFarms.toLocaleString();
    document.getElementById('diseaseReports').textContent = stats.totalDiseaseReports.toLocaleString();
    document.getElementById('unreadAlerts').textContent = stats.unreadAlerts.toLocaleString();
}

// Create charts
function createCharts(stats) {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
    
    if (userChart) {
        userChart.destroy();
    }
    
    userChart = new Chart(userGrowthCtx, {
        type: 'line',
        data: {
            labels: stats.userGrowth.map(d => d.date),
            datasets: [{
                label: 'New Users',
                data: stats.userGrowth.map(d => d.count),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Disease Distribution Chart
    const diseaseCtx = document.getElementById('diseaseChart').getContext('2d');
    
    if (diseaseChart) {
        diseaseChart.destroy();
    }
    
    diseaseChart = new Chart(diseaseCtx, {
        type: 'doughnut',
        data: {
            labels: stats.diseaseStatistics.map(d => d._id),
            datasets: [{
                data: stats.diseaseStatistics.map(d => d.count),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Load recent disease reports
function loadRecentReports(stats) {
    // In a real implementation, you would fetch recent reports from API
    const tableBody = document.querySelector('#recentReportsTable tbody');
    
    // Mock data - replace with API call
    const mockReports = [
        {
            date: '2024-03-15',
            farmer: 'John Okello',
            disease: 'Groundnut Rosette',
            confidence: '92%',
            status: 'pending'
        },
        {
            date: '2024-03-14',
            farmer: 'Sarah Nakato',
            disease: 'Early Leaf Spot',
            confidence: '78%',
            status: 'diagnosed'
        },
        {
            date: '2024-03-13',
            farmer: 'Peter Ogwang',
            disease: 'Rust',
            confidence: '65%',
            status: 'treated'
        }
    ];
    
    tableBody.innerHTML = mockReports.map(report => `
        <tr>
            <td>${report.date}</td>
            <td>${report.farmer}</td>
            <td>${report.disease}</td>
            <td>${report.confidence}</td>
            <td><span class="status-badge status-${report.status}">${report.status}</span></td>
            <td>
                <button onclick="viewReport('${report.date}')" class="btn btn-view btn-small">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="updateReportStatus('${report.date}')" class="btn btn-edit btn-small">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load users
async function loadUsers() {
    try {
        const response = await authFetch('/admin/users');
        const data = await response.json();
        
        if (data.success) {
            populateUsersTable(data.data);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

function populateUsersTable(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.fullName}</td>
            <td>${user.phoneNumber}</td>
            <td>${user.district || 'N/A'}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${user.isVerified ? 'status-treated' : 'status-pending'}">
                    ${user.isVerified ? 'Verified' : 'Pending'}
                </span>
            </td>
            <td class="action-buttons">
                <button onclick="viewUser('${user._id}')" class="btn btn-view btn-small">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editUser('${user._id}')" class="btn btn-edit btn-small">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser('${user._id}')" class="btn btn-delete btn-small">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load disease reports
async function loadDiseaseReports() {
    try {
        const response = await authFetch('/admin/disease-reports');
        const data = await response.json();
        
        if (data.success) {
            populateDiseaseReportsTable(data.data);
        }
    } catch (error) {
        console.error('Error loading disease reports:', error);
        showError('Failed to load disease reports');
    }
}

function populateDiseaseReportsTable(reports) {
    const tableBody = document.querySelector('#diseaseReportsTable tbody');
    
    tableBody.innerHTML = reports.map(report => `
        <tr>
            <td>
                ${report.imageUrl ? 
                    `<img src="${report.imageUrl}" alt="Disease" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : 
                    'No Image'
                }
            </td>
            <td>${report.user?.fullName || 'Unknown'}</td>
            <td>${report.disease || 'Not Diagnosed'}</td>
            <td>${report.confidence ? `${report.confidence}%` : 'N/A'}</td>
            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
            <td>
                <span class="status-badge status-${report.status}">
                    ${report.status}
                </span>
            </td>
            <td class="action-buttons">
                <button onclick="viewReportDetails('${report._id}')" class="btn btn-view btn-small">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="updateReport('${report._id}')" class="btn btn-edit btn-small">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// SMS Form Setup
function setupSMSForm() {
    const messageTextarea = document.getElementById('smsMessage');
    const charCount = document.getElementById('charCount');
    const districtSelect = document.getElementById('districtSelect');
    
    // Character count
    messageTextarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
    
    // District select enable/disable
    const districtRadio = document.querySelector('input[value="district"]');
    const allRadio = document.querySelector('input[value="all"]');
    
    districtRadio.addEventListener('change', function() {
        districtSelect.disabled = !this.checked;
    });
    
    allRadio.addEventListener('change', function() {
        districtSelect.disabled = this.checked;
    });
}

// Preview SMS
function previewSMS() {
    const message = document.getElementById('smsMessage').value;
    const preview = document.getElementById('smsPreview');
    
    preview.textContent = message || 'Your message will appear here...';
}

// Send Bulk SMS
async function sendBulkSMS() {
    const message = document.getElementById('smsMessage').value;
    const recipients = document.querySelector('input[name="recipients"]:checked').value;
    const district = document.getElementById('districtSelect').value;
    
    if (!message.trim()) {
        showError('Please enter a message');
        return;
    }
    
    if (recipients === 'district' && !district) {
        showError('Please select a district');
        return;
    }
    
    try {
        const response = await authFetch('/admin/bulk-sms', {
            method: 'POST',
            body: JSON.stringify({
                message,
                district: recipients === 'district' ? district : null,
                userType: 'farmer'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`SMS sent to ${data.data.length} users`);
            // Clear form
            document.getElementById('smsMessage').value = '';
            document.getElementById('charCount').textContent = '0';
            previewSMS();
            // Reload SMS history
            loadSMSHistory();
        } else {
            showError(data.message || 'Failed to send SMS');
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
        showError('Failed to send SMS');
    }
}

// Load SMS History
async function loadSMSHistory() {
    // In a real implementation, fetch from API
    const mockHistory = [
        {
            date: '2024-03-15',
            recipients: 'All Farmers',
            message: 'Weather alert: Heavy rain expected tomorrow',
            status: 'Sent'
        },
        {
            date: '2024-03-14',
            recipients: 'Nakasongola',
            message: 'Disease outbreak reported in your area',
            status: 'Sent'
        }
    ];
    
    const tableBody = document.querySelector('#smsHistoryTable tbody');
    tableBody.innerHTML = mockHistory.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.recipients}</td>
            <td>${item.message}</td>
            <td><span class="status-badge status-treated">${item.status}</span></td>
        </tr>
    `).join('');
}

// Authentication helper
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Token expired or invalid
        logout();
        return;
    }
    
    return response;
}

// Check admin authentication
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        // Redirect to login
        window.location.href = 'login.html?admin=true';
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Modal functions
function viewReportDetails(reportId) {
    // Fetch report details and show in modal
    fetchReportDetails(reportId);
}

async function fetchReportDetails(reportId) {
    try {
        const response = await authFetch(`/disease/${reportId}`);
        const data = await response.json();
        
        if (data.success) {
            showReportModal(data.data);
        }
    } catch (error) {
        console.error('Error fetching report details:', error);
        showError('Failed to load report details');
    }
}

function showReportModal(report) {
    const modal = document.getElementById('reportModal');
    const content = document.getElementById('reportDetails');
    
    content.innerHTML = `
        <div class="report-details">
            <div class="report-image">
                <img src="${report.imageUrl}" alt="Disease" style="max-width: 100%; border-radius: 8px;">
            </div>
            
            <div class="report-info">
                <h4>Farmer Information</h4>
                <p><strong>Name:</strong> ${report.user?.fullName || 'Unknown'}</p>
                <p><strong>District:</strong> ${report.user?.district || 'N/A'}</p>
                
                <h4>Diagnosis</h4>
                <p><strong>Disease:</strong> ${report.disease || 'Not Diagnosed'}</p>
                <p><strong>Confidence:</strong> ${report.confidence || 'N/A'}%</p>
                <p><strong>Status:</strong> <span class="status-badge status-${report.status}">${report.status}</span></p>
                
                <h4>Treatment</h4>
                <p>${report.treatment || 'No treatment information available'}</p>
                
                <h4>Preventive Measures</h4>
                <ul>
                    ${report.preventiveMeasures ? 
                        report.preventiveMeasures.map(measure => `<li>${measure}</li>`).join('') : 
                        '<li>No preventive measures specified</li>'
                    }
                </ul>
                
                ${report.extensionOfficerNotes ? `
                    <h4>Extension Officer Notes</h4>
                    <p>${report.extensionOfficerNotes}</p>
                ` : ''}
            </div>
        </div>
        
        <div class="modal-actions" style="margin-top: 20px; text-align: right;">
            <button onclick="updateReportStatus('${report._id}')" class="btn btn-primary">
                Update Status
            </button>
            <button onclick="closeModal()" class="btn btn-outline">
                Close
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// Notification functions
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        max-width: 500px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}