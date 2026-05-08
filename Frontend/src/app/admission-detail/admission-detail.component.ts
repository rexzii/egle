import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-admission-detail',
  templateUrl: './admission-detail.component.html',
  styleUrls: ['./admission-detail.component.css']
})
export class AdmissionDetailComponent implements OnInit {
  admission: any = null;
  academic: any[] = [];
  work: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private service: ApiserviceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.service.getAdmissionById(id).subscribe({
      next: (res: any) => {
        this.admission = res.data.admission;
        this.academic = res.data.academic;
        this.work = res.data.work;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}