// This function will open the modal
function openCompanyCodeModal(): void {
    const modal = document.getElementById('companyCodeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// This function will close the modal
function closeCompanyCodeModal(): void {
    const modal = document.getElementById('companyCodeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// This function will handle submitting the company code
function submitCompanyCode(): void {
    const companyCodeInput = document.getElementById('companyCodeInput') as HTMLInputElement;
    const companyCode = companyCodeInput.value.trim();

    if (companyCode) {
        // Redirect to the page with the company code
        window.location.href = `/support_endcustomer/${companyCode}`;
    } else {
        // Show an alert if the company code is not entered
        alert('Company code is required to create a ticket.');
    }
}

// Adding event listeners once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Bind the open modal functionality to the "Create Ticket" button
    const createTicketBtn = document.getElementById('createTicketBtn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', openCompanyCodeModal);
    }

    // Bind the submit functionality to the "Submit" button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitCompanyCode);
    }

    // Bind the cancel functionality to the "Cancel" button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCompanyCodeModal);
    }
});
