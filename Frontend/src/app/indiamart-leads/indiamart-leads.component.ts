import { Component } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-indiamart-leads',
  templateUrl: './indiamart-leads.component.html',
  styleUrl: './indiamart-leads.component.css'
})

export class IndiamartLeadsComponent {
file: File | null = null;
result: any = null;
errorMessage: string | null = null;

constructor(private http: HttpClient) {}

onFileSelected(event: any): void {
  this.file = event.target.files[0];
}

// Upload the file to the server
onUpload(): void {
  if (this.file) {
  const formData = new FormData();
  formData.append('file', this.file, this.file.name);
  // Send POST request to the backend
  this.http.post<any>('https://prathhamcrm.com/nodeapp/upload', formData).subscribe(
    (response) => {
    this.result = response;
    this.errorMessage = null;
    },
    (error) => {
    console.error(error);
    this.errorMessage = 'An error occurred while uploading the file.';
    });
    }
  }
}



//  private trigger = new Subject<void>();
//  triggerObservable = this.trigger.asObservable();
//  webcamImage: WebcamImage | null = null;
//   public triggerSnapshot(): void {
//      this.trigger.next();
//    }

//    public handleImage(webcamImage: WebcamImage): void {
//      this.webcamImage = webcamImage;
//      const imageData = webcamImage.imageAsDataUrl;
//      this.sendImageToBackend(imageData);
//    }

//    private sendImageToBackend(imageData: string) {
//      const headers = new Headers();
//      headers.append('Content-Type', 'application/json');
//      fetch('https://prathhamcrm.com/nodeapp/scan-card', {
//        method: 'POST',
//        headers: headers,
//        body: JSON.stringify({ image: imageData }),
//      })
//      .then(response => response.json())
//      .then(data => {
//        alert('Lead added successfully!');
//      })
//      .catch(err => console.error('Error:', err));
//    }