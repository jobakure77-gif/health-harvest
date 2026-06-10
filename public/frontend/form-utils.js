// Form Utility Module for DRY, modularity, and reusability
// Adhere to modularity and reusability

export function validateForm(form) {
    if (!form) return true;
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)';
            let errorMsg = input.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.color = 'var(--danger-color)';
                errorMsg.style.fontSize = '0.8rem';
                errorMsg.style.marginTop = '5px';
                input.parentNode.appendChild(errorMsg);
            }
            errorMsg.textContent = 'This field is required';
        } else {
            input.style.borderColor = '';
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
        }
    });
    return isValid;
}
