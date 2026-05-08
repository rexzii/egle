import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  companyCode: string = '';  
  isModalVisible: boolean = false;  

  @Output() companyCodeSubmitted = new EventEmitter<string>();  

  // Open the modal
  openModal(): void {
    this.isModalVisible = true;
  }

  // Close the modal
  closeModal(): void {
    this.isModalVisible = false;
  }

  // Submit the company code
  submitCompanyCode(): void {
    if (this.companyCode.trim()) {
      this.companyCodeSubmitted.emit(this.companyCode);  
      this.closeModal();  // Close the modal
    } else {
      alert('Please enter a valid company code.');
    }
  }
}
