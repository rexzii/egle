import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ApiserviceService } from '../apiservice.service';
import { Router, ActivatedRoute, NavigationEnd  } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogboxComponent } from '../confirmation-dialogbox/confirmation-dialogbox.component';

@Component({
  selector: 'app-admission-form',
  templateUrl: './admission-form.component.html',
  styleUrls: ['./admission-form.component.css']
})

export class AdmissionFormComponent implements OnInit {
admissionForm!: FormGroup;
selectedPhotoFile: File | null = null;
photoPreview: string | ArrayBuffer | null = null;
todayDate: string = new Date().toISOString().split('T')[0];
admissions: any[] = [];
loading = false;
editMode = false;
editId: number | null = null;
expireDate: string | null = '';
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};
path: string;
showPassword: boolean = false;
user_id: any;
username: any;
leadData: any;
company_code: any;
company_name: string;
user_right: any;
isModalOpen = false;
showModal: boolean = false;
stageData: any;
reminderData: any;
showInput2: boolean = false;
showInput3: boolean = false;
newstageName: string = '';

  get workExperienceArray(): FormArray {
    return this.admissionForm.get('workExperience') as FormArray;
  }

  constructor(private Service: ApiserviceService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit(): void {

     this.route.params.subscribe(params => {
  this.user_id = params['user_id']; 
  });
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username']; 
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
  }); 
 this.getstage(this.company_code);
  this.getreminder(this.company_code);
    this.initializeForm();
      this.loadAdmissions();

      const routeEditId = this.route.snapshot.paramMap.get('id');
      const queryEditId = this.route.snapshot.queryParamMap.get('edit_id');
      const resolvedEditId = routeEditId || queryEditId;

      if (resolvedEditId) {
        this.editMode = true;
        this.editId = +resolvedEditId;
        this.loadAdmissionData(this.editId);
      }

  }


  // Add method to load data for edit
loadAdmissionData(id: number): void {
  this.Service.getAdmissionById(id).subscribe((res: any) => {
    const data = res.data;
    // Patch main form
    this.admissionForm.patchValue({
      studentId: data.admission.student_id,
      rollNo: data.admission.roll_no,
      courseApplying: data.admission.course_applying,
      academicSession: data.admission.academic_session,
      totalWorkYears: data.admission.total_work_years,
      totalWorkMonths: data.admission.total_work_months,
      accommodationRequired: data.admission.accommodation_required,
      termsAccepted: data.admission.terms_accepted === 1
    });

    // Patch personal group
    this.admissionForm.get('personal')?.patchValue({
      name: data.admission.name,
      dateOfBirth: data.admission.date_of_birth,
      semester: data.admission.semester,
      gender: data.admission.gender,
      nationality: data.admission.nationality,
      domicileHaryana: data.admission.domicile_haryana,
      category: data.admission.category,
      languagesKnown: data.admission.languages_known,
      telephone: data.admission.telephone,
      mobile: data.admission.mobile,
      email: data.admission.email,
      fatherName: data.admission.father_name,
      fatherOccupation: data.admission.father_occupation,
      motherName: data.admission.mother_name,
      motherOccupation: data.admission.mother_occupation,
      familyIncomeMonthly: data.admission.family_income_monthly,
      correspondenceSameAsPermanent: !!data.admission.correspondence_address ? false : true,
     
      // Add these after declaration group
stage: new FormControl(''),
reminder_status: new FormControl(''),
nextfollow_up_by: new FormControl(''),
follow_up_time: new FormControl(''),
remark: new FormControl('')
    });

    // Patch permanent address
    this.admissionForm.get('personal.permanentAddress')?.patchValue({
      address: data.admission.permanent_address,
      city: data.admission.permanent_city,
      state: data.admission.permanent_state,
      pin: data.admission.permanent_pin
    });

    // Patch correspondence address if exists
    if (data.admission.correspondence_address) {
      this.admissionForm.get('personal.correspondenceAddress')?.patchValue({
        address: data.admission.correspondence_address,
        city: data.admission.correspondence_city,
        state: data.admission.correspondence_state,
        pin: data.admission.correspondence_pin
      });
    }

    // Patch academic qualifications
    for (let qual of data.academic) {
      const levelMap: {[key: string]: string} = {
        '10th': 'tenth', '12th': 'twelfth', 'Graduation': 'graduation',
        'Masters': 'masters', 'Others': 'others'
      };
      const groupName = levelMap[qual.qualification_level];
      if (groupName) {
        this.admissionForm.get(`academic.${groupName}`)?.patchValue({
          yearOfPassing: qual.year_of_passing,
          institution: qual.institution,
          boardUniversity: qual.board_university,
          streamDegree: qual.stream_degree,
          subjectSpecialization: qual.subject_specialization,
          percentage: qual.percentage
        });
      }
    }

    // Patch work experiences (clear existing and add)
    const workArray = this.workExperienceArray;
    while (workArray.length !== 0) workArray.removeAt(0);
    if (data.work && data.work.length) {
      data.work.forEach((exp: any) => {
        workArray.push(this.createWorkExpGroup());
        const lastIndex = workArray.length - 1;
        workArray.at(lastIndex).patchValue({
          organization: exp.organization,
          designation: exp.designation,
          natureOfResponsibility: exp.nature_of_responsibility,
          duration: exp.duration,
          years: exp.years_of_exp
        });
      });
    } else {
      workArray.push(this.createWorkExpGroup()); // keep one empty
    }

    // Patch other groups
    this.admissionForm.get('extraCurricular')?.patchValue({
      sports: data.admission.sports,
      culturals: data.admission.culturals
    });
    this.admissionForm.get('knowAbout')?.patchValue({
      source: data.admission.know_source,
      otherSourceSpecify: data.admission.know_other_specify
    });
    this.admissionForm.get('nationalLevelExam')?.patchValue({
      appeared: data.admission.appeared_national_exam === 1,
      examName: data.admission.national_exam_name
    });
    this.admissionForm.get('checklist')?.patchValue(JSON.parse(data.admission.checklist || '{}'));
    this.admissionForm.get('prospectusFee')?.patchValue({
      mode: data.admission.fee_mode,
      ddNumber: data.admission.dd_number,
      bankName: data.admission.bank_name,
      ddDate: data.admission.dd_date,
      cashAmount: data.admission.cash_amount
    });
    this.admissionForm.get('declaration')?.patchValue({
      applicantName: data.admission.declaration_name,
      sonOf: data.admission.declaration_son_of,
      declarationDate: data.admission.declaration_date,
      signature: data.admission.signature_text
    });
  });
}

  initializeForm(): void {
    this.admissionForm = new FormGroup({
      // Basic Info (no required)
      studentId: new FormControl(''),
      rollNo: new FormControl(''),
      courseApplying: new FormControl(''), // removed required
      academicSession: new FormControl(''), // removed required

      // Personal Details (no required)
      personal: new FormGroup({
        name: new FormControl('', Validators.pattern(/^[A-Z\s]+$/)), // pattern only, not required
        dateOfBirth: new FormControl(''), // removed required
        semester: new FormControl(''),
        gender: new FormControl(''), // removed required
        nationality: new FormControl(''), // removed required
        domicileHaryana: new FormControl(''), // removed required
        category: new FormControl(''), // removed required
        languagesKnown: new FormControl(''),
        telephone: new FormControl('', Validators.pattern(/^[0-9+\-\s()]*$/)),
        mobile: new FormControl('', Validators.pattern(/^[0-9]{10}$/)), // pattern only
        email: new FormControl('', Validators.email), // email validation only
        permanentAddress: new FormGroup({
          address: new FormControl(''), // removed required
          city: new FormControl(''), // removed required
          state: new FormControl(''), // removed required
          pin: new FormControl('', Validators.pattern(/^[0-9]{6}$/))
        }),
        correspondenceSameAsPermanent: new FormControl(true),
        correspondenceAddress: new FormGroup({
          address: new FormControl(''),
          city: new FormControl(''),
          state: new FormControl(''),
          pin: new FormControl('')
        }),
        fatherName: new FormControl(''), // removed required
        fatherOccupation: new FormControl(''),
        motherName: new FormControl(''), // removed required
        motherOccupation: new FormControl(''),
        familyIncomeMonthly: new FormControl('', Validators.pattern(/^[0-9]+$/))
      }),

      // Academic Qualifications (no required anywhere)
      academic: new FormGroup({
        tenth: this.createQualificationGroup(),
        twelfth: this.createQualificationGroup(),
        graduation: this.createQualificationGroup(),
        masters: this.createQualificationGroup(),
        others: this.createQualificationGroup()
      }),

      // Work Experience
      totalWorkYears: new FormControl(''),
      totalWorkMonths: new FormControl(''),
      workExperience: new FormArray([this.createWorkExpGroup()]),

      // Extra Curricular
      extraCurricular: new FormGroup({
        sports: new FormControl(''),
        culturals: new FormControl('')
      }),

      // How did you know
      knowAbout: new FormGroup({
        source: new FormControl(''),
        otherSourceSpecify: new FormControl('')
      }),

      accommodationRequired: new FormControl(''), // removed required

      // Entrance exams
      nationalLevelExam: new FormGroup({
        appeared: new FormControl(false),
        examName: new FormControl('')
      }),

      // Checklist
      checklist: new FormGroup({
        completeForm: new FormControl(false),
        transferMigration: new FormControl(false),
        domicileCert: new FormControl(false),
        casteCert: new FormControl(false),
        marksheets: new FormControl(false),
        idProof: new FormControl(false),
        scorecard: new FormControl(false)
      }),

      // Prospectus fee
      prospectusFee: new FormGroup({
        mode: new FormControl(''), // removed required
        ddNumber: new FormControl(''),
        bankName: new FormControl(''),
        ddDate: new FormControl(''),
        cashAmount: new FormControl('')
      }),

      // Terms & Conditions (no longer requiredTrue)
      termsAccepted: new FormControl(false), // removed requiredTrue

      // Declaration
      declaration: new FormGroup({
        applicantName: new FormControl(''), // removed required
        sonOf: new FormControl(''), // removed required
        declarationDate: new FormControl(''), // removed required
        signature: new FormControl('') // removed required
      }),
      stage: new FormControl(''),
    reminder_status: new FormControl(''),
    nextfollow_up_by: new FormControl('')
    });

    // Setup subscriptions
    this.setupCorrespondenceCopy();
    this.setupDefaultDeclarationDate();
    this.setupKnowAboutValidator();
    this.setupExamValidator();
  }

  private createQualificationGroup(): FormGroup {
    return new FormGroup({
      yearOfPassing: new FormControl('', Validators.pattern(/^[0-9]{4}$/)),
      institution: new FormControl(''),
      boardUniversity: new FormControl(''),
      streamDegree: new FormControl(''),
      subjectSpecialization: new FormControl(''),
      percentage: new FormControl('', Validators.pattern(/^[0-9]{1,2}(\.[0-9]{1,2})?$|^100$/))
    });
  }

  private createWorkExpGroup(): FormGroup {
    return new FormGroup({
      organization: new FormControl(''),
      designation: new FormControl(''),
      natureOfResponsibility: new FormControl(''),
      duration: new FormControl(''),
      years: new FormControl('', Validators.pattern(/^[0-9]+$/))
    });
  }

  private setupCorrespondenceCopy(): void {
    this.admissionForm.get('personal.correspondenceSameAsPermanent')?.valueChanges.subscribe(isSame => {
      const permAddr = this.admissionForm.get('personal.permanentAddress');
      const corrAddr = this.admissionForm.get('personal.correspondenceAddress');
      if (isSame && permAddr) {
        corrAddr?.patchValue({
          address: permAddr.get('address')?.value,
          city: permAddr.get('city')?.value,
          state: permAddr.get('state')?.value,
          pin: permAddr.get('pin')?.value
        });
        corrAddr?.disable();
      } else {
        corrAddr?.enable();
      }
    });
  }

  private setupDefaultDeclarationDate(): void {
    this.admissionForm.get('declaration.declarationDate')?.setValue(this.todayDate);
  }

  private setupKnowAboutValidator(): void {
    // Removed required validator for 'Others' - now no validation
    this.admissionForm.get('knowAbout.source')?.valueChanges.subscribe(val => {
      const otherSpecify = this.admissionForm.get('knowAbout.otherSourceSpecify');
      otherSpecify?.clearValidators();
      otherSpecify?.updateValueAndValidity();
    });
  }

  private setupExamValidator(): void {
    // Removed required validator for exam name
    this.admissionForm.get('nationalLevelExam.appeared')?.valueChanges.subscribe(appeared => {
      const examNameCtrl = this.admissionForm.get('nationalLevelExam.examName');
      examNameCtrl?.clearValidators();
      examNameCtrl?.updateValueAndValidity();
    });
  }

  addWorkExperience(): void {
    this.workExperienceArray.push(this.createWorkExpGroup());
  }

  removeWorkExperience(index: number): void {
    if (this.workExperienceArray.length > 1) {
      this.workExperienceArray.removeAt(index);
    }
  }

  convertToUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const uppercaseValue = input.value.toUpperCase();
    this.admissionForm.get('personal.name')?.setValue(uppercaseValue, { emitEvent: false });
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedPhotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    // No validation - form can be submitted even if empty
    const formData = new FormData();
    if (this.selectedPhotoFile) {
      formData.append('photo', this.selectedPhotoFile);
    }

    formData.append('username', this.username || '');
  formData.append('company_code', this.company_code || '');
  formData.append('user_id', this.user_id || '');
  formData.append('user_right', this.user_right || '');

    // Root fields
    formData.append('studentId', this.admissionForm.get('studentId')?.value || '');
    formData.append('rollNo', this.admissionForm.get('rollNo')?.value || '');
    formData.append('courseApplying', this.admissionForm.get('courseApplying')?.value || '');
    formData.append('academicSession', this.admissionForm.get('academicSession')?.value || '');
    formData.append('totalWorkYears', this.admissionForm.get('totalWorkYears')?.value || '');
    formData.append('totalWorkMonths', this.admissionForm.get('totalWorkMonths')?.value || '');
    formData.append('accommodationRequired', this.admissionForm.get('accommodationRequired')?.value || '');
    formData.append('termsAccepted', this.admissionForm.get('termsAccepted')?.value || false);

    // Nested groups as JSON strings
    formData.append('personal', JSON.stringify(this.admissionForm.get('personal')?.value));
    formData.append('academic', JSON.stringify(this.admissionForm.get('academic')?.value));
    formData.append('workExperience', JSON.stringify(this.admissionForm.get('workExperience')?.value));
    formData.append('extraCurricular', JSON.stringify(this.admissionForm.get('extraCurricular')?.value));
    formData.append('knowAbout', JSON.stringify(this.admissionForm.get('knowAbout')?.value));
    formData.append('nationalLevelExam', JSON.stringify(this.admissionForm.get('nationalLevelExam')?.value));
    formData.append('checklist', JSON.stringify(this.admissionForm.get('checklist')?.value));
    formData.append('prospectusFee', JSON.stringify(this.admissionForm.get('prospectusFee')?.value));
    formData.append('declaration', JSON.stringify(this.admissionForm.get('declaration')?.value));
    formData.append('stage', this.admissionForm.get('stage')?.value || '');
formData.append('reminder_status', this.admissionForm.get('reminder_status')?.value || '');
formData.append('nextfollow_up_by', this.admissionForm.get('nextfollow_up_by')?.value || '');
// DO NOT append remark or follow_up_time
    


    // ✅ Check if edit mode or create mode
  if (this.editMode && this.editId) {
    // UPDATE MODE
    this.Service.updateAdmission(this.editId, formData).subscribe({
      next: (response) => {
        console.log('Update Success:', response);
        alert('Admission updated successfully!');
        const queryParams = {
          username: this.username,
          company_code: this.company_code,
          company_name: this.company_name,
          user_right: this.user_right
        };
        this.router.navigate(['/dashboard', this.user_id], { queryParams });
      },
      error: (error) => {
        console.error('Update Error:', error);
        alert('Update failed: ' + error.message);
      }
    });
  } else {
    // CREATE MODE
    this.Service.submitAdmissionForm(formData).subscribe({
      next: (response) => {
        console.log('Success:', response);
        alert('Admission form submitted successfully!');
        this.admissionForm.reset();
        this.selectedPhotoFile = null;
        this.photoPreview = null;
        this.admissionForm.get('declaration.declarationDate')?.setValue(this.todayDate);
        this.admissionForm.get('personal.correspondenceSameAsPermanent')?.setValue(true);
        while (this.workExperienceArray.length !== 1) {
          this.workExperienceArray.removeAt(0);
        }
        this.workExperienceArray.at(0).reset();
        // Optional: navigate to list after create
        // this.router.navigate(['/admissions']);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Submission failed: ' + error.message);
      }
    });
  }
}

  resetForm(): void {
    this.admissionForm.reset();
    this.photoPreview = null;
    this.selectedPhotoFile = null;
    this.admissionForm.get('declaration.declarationDate')?.setValue(this.todayDate);
    while (this.workExperienceArray.length !== 1) {
      this.workExperienceArray.removeAt(0);
    }
    this.workExperienceArray.at(0).reset();
    this.admissionForm.get('personal.correspondenceSameAsPermanent')?.setValue(true);
  }



  loadAdmissions(): void {
    this.loading = true;
    this.Service.getAdmissions().subscribe({
      next: (res: any) => {
        this.admissions = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewDetails(id: number): void {
     this.router.navigate(['/admission_view', id]);
  }

  editAdmission(id: number): void {
     this.router.navigate(['/admission/edit', id]);
  }

  deleteAdmission(id: number): void {
    if (confirm('Are you sure you want to delete this admission?')) {
      this.Service.deleteAdmission(id).subscribe({
        next: () => {
          alert('Deleted successfully');
          this.loadAdmissions();
        },
        error: (err) => alert('Delete failed: ' + err.message)
      });
    }
  }

  createReceipt(id: number): void {
    // Option 1: open a new window with receipt HTML
    this.Service.getAdmissionById(id).subscribe((res: any) => {
      const receiptHtml = this.generateReceiptHtml(res.data.admission);
      const win = window.open();
      win?.document.write(receiptHtml);
      win?.print();
    });
  }


  generateReceiptHtml(admission: any): string {
  // Use admission data where available, otherwise placeholders
  const receiptNo = admission.id || '______';
  const date = new Date().toLocaleDateString('en-IN');
  const studentName = admission.name || '______';
  const amount = '______';        // You can get from admission.fees_paid or similar
  const cashMode = 'Cash / Cheque'; // Or 'Cash' / 'Cheque No. ______'
  const chequeNo = '______';
  const chequeDate = '______';
  const contactNo = admission.mobile || '______';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>EAGLE INSTITUTE - Receipt</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          width: 150mm;
          margin: 0 auto;
          padding: 10px;
          background: #fff;
        }
        .receipt {
          border: 1px solid #000;
          padding: 10px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
        }
        .header p {
          margin: 2px 0;
          font-size: 10px;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
          text-decoration: underline;
        }
        .details {
          text-align: left;
          margin-top: 15px;
          font-size: 12px;
        }
        .details p {
          margin: 6px 0;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          text-align: center;
        }
        hr {
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>EAGLE INSTITUTE</h1>
          <p>ISO 9001: 2015 CERTIFIED</p>
          <p>• UGC APPROVED UNIVERSITY •</p>
        </div>
        <div class="title">RECEIPT</div>
        <div class="details">
          <p><strong>NO.:</strong> ${receiptNo}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Received with thanks from Mr./Mrs.</strong> ${studentName}</p>
          <p><strong>a sum of Rupees</strong> ${amount}</p>
          <p><strong>by</strong> ${cashMode} 
            ${cashMode.includes('Cheque') ? `<strong>Cheque No.</strong> ${chequeNo} <strong>Dated</strong> ${chequeDate}` : ''}
          </p>
          <p><strong>Contact No.</strong> ${contactNo}</p>
        </div>
        <div class="footer">
          <p>For EAGLE INSTITUTE</p>
          <p style="margin-top: 20px;">Authorized Signatory</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

dash1() {
  const queryParams = {
  username: this.username, 
  company_code: this.company_code,
  company_name: this.company_name,
  user_right: this.user_right
  };
  this.router.navigate(['/dashboard', this.user_id], { queryParams });
}

navigateTotrashpage(){
  if (this.user_id !== undefined) {
    const queryParams = {
    username: this.username,
    company_code: this.company_code,
    company_name: this.company_name,
    user_right: this.user_right
  };
    this.router.navigate(['/trash_leads', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigatevisistingcardpage(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    };
      this.router.navigate(['/visitingcard-scanner', this.user_id], { queryParams });
  }else {
      console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTouser(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
     user_right: this.user_right
    };
    this.router.navigate(['/register', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateToFaceboookpage(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
    user_right: this.user_right
    };
    this.router.navigate(['/facebookleads', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTomanageuser(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
     user_right: this.user_right
    };
    this.router.navigate(['/manageruser', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateTomasterentry(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
      };
      this.router.navigate(['/masters_entry', this.user_id], { queryParams });
    } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateToleadstatastics(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
      user_right: this.user_right
    };
    this.router.navigate(['/lead_statastics', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateReportspage(){
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
    user_right: this.user_right
    };
    this.router.navigate(['/email_reports', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

navigateToFamilyPage() {
  if (this.user_id !== undefined) {
    const queryParams = {
      username: this.username,
      company_code: this.company_code,
      company_name: this.company_name,
    user_right: this.user_right
    };
    this.router.navigate(['/addLead', this.user_id], { queryParams });
  } else {
    console.error('user_id is undefined. Unable to navigate.');
  }
}

openDialog(title: string, message: string): void {
  this.dialog.open(ConfirmationDialogboxComponent, {
    width: '300px',
    data: { title, message }
  });
}

openModal() {
  this.isModalOpen = true;
}

logout() {
  this.router.navigate(['/login']); 
}

openUserPopup(userId: string, userName: string) {
  this.modalData.user_id = userId;
  this.modalData.username = userName;
  this.modalData.password = ''; 
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}

submitUserForm() {
  console.log('Form submitted:', this.modalData);
  this.Service.updatePassword(this.modalData.user_id, this.modalData.password).subscribe(
    (response) => {
      console.log('Password update response:', response);
      alert('Password updated successfully');
      this.closeModal();
    },
    (error) => {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  );
}

togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}

fetchImage(companyCode: string) {
  this.Service.getCompanyLogoUrl(companyCode).subscribe(
    (imageBlob: Blob) => {
      const imageUrl = URL.createObjectURL(imageBlob);
      console.log('Image URL:', imageUrl);
      this.path = imageUrl;
    },
    error => {
      console.error('Error fetching company logo:', error);
    }
  );
}

getstage(companyCode: string): void{
  this.Service.getstage(companyCode).subscribe(
    (data: any) => {
      this.stageData = data; 
      console.log('stage Data:', this.stageData); 
    },
    (error) => {
      console.error('Error fetching source data:', error);
    }
  );
}

getreminder(companyCode: string): void{
  this.Service.getreminder(companyCode).subscribe(
    (data: any) => {
      this.reminderData = data; 
      console.log('reminder Data:', this.reminderData); 
    },
    (error) => {
      console.error('Error fetching source data:', error);
    }
  );
}

toggleInput2(){
  this.showInput2 = !this.showInput2;
}

submitStage() {
  const stageName = this.newstageName.trim(); 
    if (stageName && this.company_code) {
      this.Service.insertStage(stageName, this.company_code).subscribe(
        (response) => {
          console.log('Inserted successfully:', response);
          alert("Stage Add Sucessfully")
          this.getstage(this.company_code);
          this.showInput2 = false;
          this.newstageName = '';
        },
        (error) => {
          console.error('Error inserting source:', error);
        }
      );
    }
}

getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


}