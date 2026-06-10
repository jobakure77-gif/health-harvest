
// Modular import (for modern browsers or bundlers)
// import { addEventListenerSafe, setTextContentSafe, setDisplaySafe, showError } from './frontend/ui-utils.js';
// import { validateForm } from './frontend/form-utils.js';

// For legacy support, you can copy utility functions here or use a bundler.

// Example usage of modular utilities for DRY, modularity, and reusability

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));

document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Dashboard Notifications (DRY)
function updateNotificationCount() {
    const notificationCount = document.querySelector('.notification-count');
    if (notificationCount) {
        const count = 2; // Example count
        notificationCount.textContent = count;
        notificationCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Form Validation (modular)
function validateFormById(formId) {
    const form = document.getElementById(formId);
    return window.validateForm ? window.validateForm(form) : true;
}

// File Upload Handling (modular)
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileName();
            }
        });
        fileInput.addEventListener('change', updateFileName);
    }
}

function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileInput && fileInput.files.length > 0 && fileNameDisplay) {
        fileNameDisplay.textContent = fileInput.files[0].name;
        fileNameDisplay.style.color = 'var(--primary-color)';
    }
}

// Disease Diagnosis Simulation
function simulateDiagnosis() {
    // Show loading state
    const diagnoseBtn = document.querySelector('#diagnoseBtn');
    const originalText = diagnoseBtn ? diagnoseBtn.innerHTML : '';
    
    if (diagnoseBtn) {
        diagnoseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        diagnoseBtn.disabled = true;
    }
    
    // Simulate API call delay
    setTimeout(() => {
        // Show results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update results with simulated data
        const diseases = [
            { name: 'Groundnut Rosette', confidence: 92, treatment: 'Remove infected plants immediately and use resistant varieties.' },
            { name: 'Early Leaf Spot', confidence: 78, treatment: 'Apply fungicide and practice crop rotation.' },
            { name: 'Rust', confidence: 65, treatment: 'Use fungicides containing chlorothalonil.' },
            { name: 'Healthy Plant', confidence: 95, treatment: 'Continue good farming practices.' }
        ];
        
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
        
        document.getElementById('diseaseName').textContent = randomDisease.name;
        document.getElementById('confidenceValue').textContent = randomDisease.confidence + '%';
        document.getElementById('confidenceFill').style.width = randomDisease.confidence + '%';
        document.getElementById('treatmentAdvice').textContent = randomDisease.treatment;
        
        // Set icon based on disease
        const resultIcon = document.getElementById('resultIcon');
        if (resultIcon) {
            if (randomDisease.name === 'Healthy Plant') {
                resultIcon.className = 'result-icon success';
                resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            } else {
                resultIcon.className = 'result-icon danger';
                resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            }
        }
        
        // Reset button
        if (diagnoseBtn) {
            diagnoseBtn.innerHTML = originalText;
            diagnoseBtn.disabled = false;
        }
    }, 2000);
}

// Weather Data Simulation
function loadWeatherData() {
    const weatherData = {
        location: 'Nakasongola District',
        temperature: '28°C',
        rainfall: 'Medium',
        forecast: [
            { day: 'Today', rainfall: 'Low', temp: '28-32°C' },
            { day: 'Tomorrow', rainfall: 'Medium', temp: '26-30°C' },
            { day: 'Day 3', rainfall: 'High', temp: '25-29°C' },
            { day: 'Day 4', rainfall: 'Medium', temp: '26-31°C' },
            { day: 'Day 5', rainfall: 'Low', temp: '27-33°C' }
        ],
        advisory: 'Best planting window: March 10-15. Flood risk: Low.'
    };
    
    // Update UI with weather data
    document.getElementById('weatherLocation').textContent = weatherData.location;
    document.getElementById('weatherTemp').textContent = weatherData.temperature;
    document.getElementById('weatherRainfall').textContent = weatherData.rainfall;
    document.getElementById('weatherAdvisory').textContent = weatherData.advisory;
    
    // Create forecast table
    const forecastTable = document.getElementById('forecastTable');
    if (forecastTable) {
        forecastTable.innerHTML = weatherData.forecast.map(day => `
            <tr>
                <td>${day.day}</td>
                <td><span class="rainfall-badge ${day.rainfall.toLowerCase()}">${day.rainfall}</span></td>
                <td>${day.temp}</td>
            </tr>
        `).join('');
    }
}

// Market Data Simulation
function loadMarketData() {
    const marketData = [
        { location: 'Nakasongola', price: '3,200', trend: 'up' },
        { location: 'Lira', price: '3,500', trend: 'stable' },
        { location: 'Gulu', price: '3,300', trend: 'down' },
        { location: 'Masindi', price: '3,400', trend: 'up' },
        { location: 'Kampala', price: '3,800', trend: 'stable' }
    ];
    
    const marketTable = document.getElementById('marketTable');
    if (marketTable) {
        marketTable.innerHTML = marketData.map(item => `
            <tr>
                <td>${item.location}</td>
                <td>UGX ${item.price}/kg</td>
                <td>
                    <span class="trend-${item.trend}">
                        <i class="fas fa-arrow-${item.trend === 'up' ? 'up' : item.trend === 'down' ? 'down' : 'right'}"></i>
                        ${item.trend}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components based on current page
    updateNotificationCount();
    setupFileUpload();
    
    // Check current page and initialize accordingly
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'weather.html' || currentPage === '') {
        loadWeatherData();
    }
    
    if (currentPage === 'market.html' || currentPage === '') {
        loadMarketData();
    }
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this.id)) {
                e.preventDefault();
            } else {
                // Simulate successful form submission
                if (this.id === 'loginForm' || this.id === 'registerForm') {
                    e.preventDefault();
                    // In a real app, this would be an API call
                    setTimeout(() => {
                        alert('Form submitted successfully!');
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            }
        });
    });
    
    // Add CSS for dynamic elements
    const style = document.createElement('style');
    style.textContent = `
        .rainfall-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .rainfall-badge.low {
            background-color: #d4edda;
            color: #155724;
        }
        .rainfall-badge.medium {
            background-color: #fff3cd;
            color: #856404;
        }
        .rainfall-badge.high {
            background-color: #f8d7da;
            color: #721c24;
        }
        .trend-up {
            color: var(--primary-color);
        }
        .trend-down {
            color: var(--danger-color);
        }
        .trend-stable {
            color: var(--warning-color);
        }
        .error-message {
            color: var(--danger-color);
            font-size: 0.8rem;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
});

// API Base URL (prefer same-origin when served by the backend)
const API_BASE_URL = '/api';

// Authentication functions
async function loginUser(phoneNumber, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Function to make authenticated requests
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
}

// Upload image for disease diagnosis
async function uploadImageForDiagnosis(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`${API_BASE_URL}/disease/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  return response.json();
}
