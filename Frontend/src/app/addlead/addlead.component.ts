import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogboxComponent } from '../confirmation-dialogbox/confirmation-dialogbox.component';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-addlead',
  templateUrl: './addlead.component.html',
  styleUrl: './addlead.component.css'
})

export class AddleadComponent {
showLeadForm: boolean = true; 
showUploadForm: boolean = false;
@ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
selectedFile: File | null = null;
leadForm: FormGroup;
isSubmitted = false;
user_id: any;
username: any;
leadData: any;
productData: {
  quantity: string;
  selected: any; product_name: string 
}[] = []; 
// Declare the variable to toggle visibility
showSecondPersonForm: boolean = false;
sourceData: any;
profileData: any;
stageData: any;
reminderData: any;
categoryData:any;
lead: any;
activeStage: any;
selectedClient!: string;
openFilterPopup: any;
company_code: any;
company_name: string;
uniqueCompanyNames: string[] = [];
path: string;
designation: any;
file:any;
filename: any;
file_extn: any;
showInput: boolean = false;
//showInput1: boolean = false;
showInput2: boolean = false;
showInput3: boolean = false;
showInput4: boolean = false;
newsourceName: string = '';
newstageName: string = '';
newproductName: string = '';
newcategory: string = '';
newprofile: string = '';
formGroup: any;
products: any[] = [];
selectedCompanyName: string = '';
private subscriptions: Subscription[] = [];
user_right: any;
accessDenied: boolean = false;
isModalOpen = false;
expireDate: string | null = '';
showPassword: boolean = false;
showPurchasedProducts: boolean = true;
showModal: boolean = false;
modalData: any = {
  user_id: '',
  username: '',
  password: ''
};
names: string[] = []; 
//selectedName: string = '';
errorMessage: string = '';
clientDetails: any = {}; 
selectedName: string = '';
selectedProducts: { [key: string]: boolean } = {};
showInput1 = false;



constructor(private Service:ApiserviceService,private router: Router, private route: ActivatedRoute,private zone: NgZone, private cdr: ChangeDetectorRef, private http: HttpClient, public dialog: MatDialog){
  this.user_right = this.getUserRightFromLocalStorage();
}

ngOnInit() {
  this.route.params.subscribe(params => {
  this.user_id = params['user_id']; 
  });
  this.route.queryParams.subscribe(queryParams => {
  this.username = queryParams['username']; 
  this.company_code = queryParams['company_code'];
  this.company_name = queryParams['company_name'];
  this.user_right = queryParams['user_right'];
  });    
  this.leadForm = new FormGroup({
    selectedClient: new FormControl(null),
    selectedName: new FormControl(null),
    company_code: new FormControl(this.company_code, Validators.required),
    username: new FormControl(this.username, Validators.required),
    personname: new FormControl('', Validators.required),
    companyname: new FormControl('', Validators.required),
    email: new FormControl(''),
    contactno: new FormControl('', Validators.required),
    city: new FormControl(''),
    designation: new FormControl('', Validators.required),
    address: new FormControl(''),
    source: new FormControl('', Validators.required),
    products:new FormControl('',Validators.required),
    stage: new FormControl('', Validators.required),
    reminder_status: new FormControl('', Validators.required),
    company_vertical: new FormControl(''),
    nextfollow_up_by: new FormControl(this.getTodayDate()),
    remark: new FormControl('', Validators.required),
    source_name: new FormControl(''),
    product_name: new FormControl(''),
    category_name: new FormControl(''),
    profile_name: new FormControl(''),
    stage_name: new FormControl(''),
    extended_user: new FormArray([],),
    secondPersonName: new FormControl(''),
    secondContactno: new FormControl(''),
    secondEmail: new FormControl(''),
    secondProfile: new FormControl(''),
    
  });

  
  if (this.company_code) {
    this.fetchImage(this.company_code);
  } else {
    console.error('Company code is not defined.');
  }

  this.getLeadData(this.company_code);
  this.getProducts(this.company_code); 
  this.getsource(this.company_code); 
  this.getprofile(this.company_code); 
  this.getstage(this.company_code);
  this.getreminder(this.company_code);
  this.getcategory(this.company_code);
 // this.setupPersonnameChangeSubscription();
  this.expireDate = localStorage.getItem('expire_date');
  if (this.company_code && this.username) {
    this.fetchNames(this.company_code, this.username); 
  } else {
    console.warn("⚠️ Missing company_code or username! Skipping fetchNames().");
  } 


   // Fetch users based on company code
   this.Service.getUsersByCompanyCode(this.company_code).subscribe(
    (users) => {
      this.leadData = users;
      this.initializeExtendedUsers();
    },
    (error) => {
      console.error('Error fetching users:', error);
    }
  );

  this.initializeProductCheckboxes();
  this.initializeExtendedUsers();

  

}


fetchNames(company_code: string, username: String): void {
  console.log("📢 fetchNames() called with company_code:", company_code);
  if (!company_code) {
    console.warn("⚠️ Missing company_code! Cannot fetch names.");
    return;
  }
  this.Service.getNames(company_code, username).subscribe(
    (response: any) => {
      console.log("✅ API Response for Names:", response);
      if (response.status === 'success') {
        this.names = response.names;
        console.log("🎯 Names List Updated:", this.names);
      } else {
        this.errorMessage = 'Error fetching names!';
        console.warn("⚠️ API Response did not return success!");
      }
    },
    (error) => {
      console.error('❌ API Error in fetchNames():', error);
      this.errorMessage = 'Failed to fetch names. Please try again later.';
    }
  );
}


// onProductChecked(index: number, event: any) {
//   this.productData[index].selected = event.target.checked;

//   // Optional: clear quantity if unchecked
//   if (!event.target.checked) {
//     this.productData[index].quantity = '';
//   }
// }


onClientSelect() {
    const selectedClientValue = this.leadForm.get('selectedName')?.value;
      if (selectedClientValue ) {
        this.Service.getClientexistingDetails1(selectedClientValue).subscribe(
          (clientDetails) => {
            this.leadForm.patchValue({
              personname: clientDetails.personname,
              companyname: clientDetails.companyname,
              email: clientDetails.email,
              contactno: clientDetails.contactno,
              address: clientDetails.address,
            });
            this.selectedCompanyName = clientDetails.personname;
            //this.getProductsForCompany(clientDetails.companyname);
          },
          (error) => {
            console.error('Error fetching client details:', error);
          }
        );
      }
  }
  


logSelected(name: string) {
  console.log("🔍 Name Clicked:", name);
}


selectFile(event: any){
  this.file = event.target.files[0];
  console.log(this.file);
}

toggleInput() {
  this.showInput = !this.showInput;
}

toggleInput1(){
  this.showInput1 = !this.showInput1;
}

toggleInput2(){
  this.showInput2 = !this.showInput2;
}

toggleInput3(){
  this.showInput3 = !this.showInput3;
}

toggleInput4(){
  this.showInput4 = !this.showInput4;
}

submitSource() {
  const sourceName = this.newsourceName.trim();
  if (sourceName && this.company_code) {
    this.Service.insertSource(sourceName, this.company_code).subscribe(
      (response) => {
        console.log('Inserted successfully:', response);
        alert("Source Added Successfully");
        this.getsource(this.company_code); 
        this.showInput = false; 
        this.newsourceName = ''; 
      },
      (error) => {
        console.error('Error inserting source:', error);
      }
    );
  }
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

submitprodusts() {
  const productName = this.newproductName.trim(); 
  if (productName && this.company_code) {
    this.Service.insertproducts(productName, this.company_code).subscribe(
      (response) => {
        console.log('Inserted successfully:', response);
        alert("Product Add Sucessfully")
        this.getProducts(this.company_code);
        this.showInput1 = false;
        this.newproductName = '';
      },
      (error) => {
        console.error('Error inserting source:', error);
      }
    );
  }
}

submitcategory() {
  const categoryName = this.newcategory.trim(); 
  if (categoryName && this.company_code) {
    this.Service.insertbussinesscategory(categoryName, this.company_code).subscribe(
      (response) => {
        console.log('Inserted successfully:', response);
        alert("Category Add Sucessfully")
        this.getcategory(this.company_code);
        this.showInput3 = false;
        this.newcategory = '';
      },
      (error) => {
        console.error('Error inserting source:', error);
      }
    );
  }
}

submitprofile() {
  const profileName = this.newprofile.trim();
    if (profileName && this.company_code) {
      this.Service.insertprofile(profileName, this.company_code).subscribe(
        (response) => {
          console.log('Inserted successfully:', response);
          alert("Profile Add Successfully");
          this.getprofile(this.company_code);
          this.showInput4 = false;
          this.newprofile = '';
        },
        (error) => {
          console.error('Error inserting profile:', error);
        }
      );
    }
  }
   
uploadFile() {
  let formData = new FormData();
  formData.append("file", this.file);
  this.http.post('https://prathhamcrm.com/nodeapp/exelupload', formData)
  .subscribe(
    (data) => {
    console.log('Success:', data); 
    alert("File Uploaded Sucessfully.")
    },
    (error) => {
    console.error('Error:', error);
    alert("File Uploaded Sucessfully.") 
    }
  );
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

getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

showAccessDenied() {
  this.accessDenied = true;
  setTimeout(() => this.accessDenied = false, 3000);
}

private getUserRightFromLocalStorage(): string {
  return localStorage.getItem('user_right') || 'default';
}

getLeadData(companyCode: string) {
  this.Service.getLeadDatabystatistics(companyCode).subscribe(
    (data: any[]) => {
      this.leadData = data;
    
      this.uniqueCompanyNames = Array.from(
        new Set(this.leadData.map((lead: any) => lead.companyname))
      ).sort() as string[];
       

      console.log('Unique Company Names:', this.uniqueCompanyNames);
    },
    (error) => {
      console.error('Error fetching lead data:', error);
    }
  );
}

sortLeadData() {
  this.leadData.sort((a: { companyname: string; }, b: { companyname: string; }) => a.companyname.localeCompare(b.companyname));
}

 
  // Function to fetch product data
  getProducts(companyCode: string): void {
    this.Service.getProducts(companyCode).subscribe(
      (data: any) => {
        this.productData = data; // Populate productData with response
        console.log('Lead Data:', this.productData);

        // Initialize the checkboxes based on the product data
        this.initializeProductCheckboxes();
      },
      (error) => {
        console.error('Error fetching lead data:', error);
      }
    );
  }

  // initializeProductCheckboxes() {
  //   const productControlArray = this.leadForm.get('products') as FormArray;
  
  //   // Clear the FormArray before adding new controls (in case the data changes)
  //   productControlArray.clear();
  
  //   // Loop through product data and create a control for each product, initially unchecked (false)
  //   this.productData.forEach(() => {
  //     productControlArray.push(new FormControl(false)); // false means unchecked
  //   });
  // }
  


  initializeProductCheckboxes() {
    const productControlArray = this.leadForm.get('products') as FormArray;
    productControlArray.clear();
  
    this.productData.forEach(() => {
      productControlArray.push(
        new FormGroup({
          selected: new FormControl(false),
          quantity: new FormControl(null)
        })
      );
    });
  }
  
  initializeExtendedUsers() {
    const extendedUserControlArray = this.leadForm.get('extended_user') as FormArray;
    
    // Clear the FormArray before adding new controls (in case of changes)
    extendedUserControlArray.clear();
  
    // Add each user as a new control in the FormArray
    this.leadData.forEach((user) => {
      extendedUserControlArray.push(new FormControl(false)); // false means unchecked initially
    });
  }

  toggleSecondPersonForm() {
    this.showSecondPersonForm = !this.showSecondPersonForm;
  
    if (this.showSecondPersonForm) {
      this.leadForm.addControl('secondPersonName', new FormControl('', Validators.required));
      this.leadForm.addControl('secondContactno', new FormControl('', Validators.required));
      this.leadForm.addControl('secondEmail', new FormControl(''));
      this.leadForm.addControl('secondProfile', new FormControl('', Validators.required));
    } else {
      this.leadForm.removeControl('secondPersonName');
      this.leadForm.removeControl('secondContactno');
      this.leadForm.removeControl('secondEmail');
      this.leadForm.removeControl('secondProfile');
    }
  }

 // Access FormArray of products
 get productFormArray() {
  return this.leadForm.get('products') as FormArray;
}

// Function to handle checkbox click and update the 'selected' field
onProductChecked(i: number, event: any) {
  const productSelected = event.target.checked; // Check if checkbox is selected
  const productGroup = this.productFormArray.at(i); // Access the specific FormGroup
  productGroup.get('selected')?.setValue(productSelected); // Update the 'selected' value
  this.productData[i].selected = productSelected; // Update the product data for UI
}



  onSubmit(): void {
  if (this.leadForm.valid) {
    const formData = this.leadForm.value;
    this.Service.addlead(formData).subscribe(
      (res) => {
        console.log('Lead inserted successfully:', res);
        alert('Lead Inserted Successfully');
        this.resetLeadForm();
          this.isSubmitted = false;
      },
      (error) => {
        console.error('Error inserting lead:', error);
        alert('Error inserting lead');
      }
    );
  } else {
    alert('Please fill in * required fields.');
  }
}

  resetLeadForm() {
  this.isSubmitted = false;
   this.buildForm(); 
}


buildForm() {
  this.leadForm = new FormGroup({
    selectedClient: new FormControl(null),
    selectedName: new FormControl(null),
    company_code: new FormControl(this.company_code, Validators.required),
    username: new FormControl(this.username, Validators.required),
    personname: new FormControl('', Validators.required),
    companyname: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    contactno: new FormControl(''),
    city: new FormControl(''),
    designation: new FormControl('', Validators.required),
    address: new FormControl(''),
    source: new FormControl('', Validators.required),
    products: new FormControl('', Validators.required), 
    stage: new FormControl('', Validators.required),
    reminder_status: new FormControl('', Validators.required),
    company_vertical: new FormControl(''),
    nextfollow_up_by: new FormControl(this.getTodayDate()),
    remark: new FormControl('', Validators.required),
    source_name: new FormControl(''),
    product_name: new FormControl(''),
    category_name: new FormControl(''),
    profile_name: new FormControl(''),
    stage_name: new FormControl(''),  
  });
}

  
// getProducts(companyCode: string): void {
//   this.Service.getProducts(companyCode).subscribe(
//     (data: any) => {
//       this.productData = data; 
//       console.log('Lead Data:', this.productData);
//     },
//     (error) => {
//       console.error('Error fetching lead data:', error);
//     }
//   );
// }

getsource(companyCode: string): void {
  this.Service.getsource(companyCode).subscribe(
    (data: any) => {
      this.sourceData = data; 
      console.log('Source Data:', this.sourceData); 
    },
    (error) => {
      console.error('Error fetching source data:', error);
    }
  );
}
  
getprofile(companyCode: string): void{
  this.Service.getprofile(companyCode).subscribe(
    (data: any) => {
      this.profileData = data; 
      console.log('profile Data:', this.profileData); 
    },
    (error) => {
      console.error('Error fetching source data:', error);
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

getcategory(companyCode: string): void{
  this.Service.getbusiness(companyCode).subscribe(
    (data: any) => {
      this.categoryData = data; 
      console.log('category Data:', this.categoryData); 
    },
    (error) => {
      console.error('Error fetching source data:', error);
    }
  );
}

onClientSelected() {
  const selectedClientValue = this.leadForm.get('selectedClient')?.value;
  const companyCode = this.leadForm.get('company_code')?.value;
    if (selectedClientValue && companyCode) {
      this.Service.getClientexistingDetails(selectedClientValue, companyCode).subscribe(
        (clientDetails) => {
          this.leadForm.patchValue({
            personname: clientDetails.personname,
            companyname: clientDetails.companyname,
            email: clientDetails.email,
            contactno: clientDetails.contactno,
            city: clientDetails.city,
            designation: clientDetails.designation,
            address: clientDetails.address,
            source: clientDetails.source,
            company_vertical: clientDetails.company_vertical
          });
          this.selectedCompanyName = clientDetails.companyname;
          this.getProductsForCompany(clientDetails.companyname);
        },
        (error) => {
          console.error('Error fetching client details:', error);
        }
      );
    }
}

getProductsForCompany(companyname: string) {
  this.Service.getProductsForCompany(companyname)
    .subscribe(
      (data: any) => {
        this.products = data;  
        console.log('Products Data:', this.products);
      },
      (error: any) => {
        console.error('Error fetching products data:', error);
      }
    );
  }

onNewClientSelected() {
  const newClientValue = this.leadForm.get('newclient')?.value;
    if (newClientValue === 'newClient') {
      this.leadForm.reset();
      this.leadForm.get('newclient')?.setValue('newClient'); 
    } else {
      this.leadForm.patchValue({
        selectedClient: '',
        personname: '',
        companyname: '',
        email: '',
        contactno: '',
        city: null,
        designation: '',
        address: null,
        source: '',
        company_vertical: null,
        stage: '',
        reminder_status: null,
        nextfollow_up_by: '',
        remark: null,
        product: '',
      });

      this.showPurchasedProducts = false;

    }
}
  
logout() {
  this.router.navigate(['/login']); 
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

// setupPersonnameChangeSubscription() {
//   this.leadForm.get('personname')?.valueChanges.pipe(
//   debounceTime(300),
//   distinctUntilChanged(),
//   switchMap((value) => {
//     if (!value || !this.company_code) {
//     return of({ exists: false }); 
//     }
//    return this.checkLeadExistence(value, this.company_code);
//      })
//    ).subscribe(
//      (response) => {
//        if (response.exists) {
//         const dialogRef = this.dialog.open(ConfirmationDialogboxComponent, {
//            width: '300px',
//            data: { title: 'Lead Exists', message: 'This client already exists in the database.' }
//          });

//          dialogRef.afterClosed().subscribe(result => {
//            if (result === 'yes') {
//              this.fetchLeadDetails(this.leadForm.get('personname')?.value);
//            } else {
//             this.resetForm();
//            }
//          });
//        }
//      },
//      (error) => {
//        console.error('Error checking lead existence:', error);
//       this.openDialog('Error', 'An error occurred while checking lead existence.');
//      }
//    );
//  }

fetchLeadDetails(personname: string) {
   this.Service.getClientDetails(personname, this.company_code).subscribe(
     (lead) => {
       this.leadForm.patchValue({
         personname: lead.personname,
         companyname: lead.companyname,
         email: lead.email,
         contactno: lead.contactno,
         city: lead.city,
         designation: lead.designation,
         address: lead.address,
         source: lead.source,
         company_vertical: lead.company_vertical                  
      });
       this.selectedCompanyName = lead.companyname;
       this.getProductsForCompany(lead.companyname);
     },
     (error) => {
       console.error('Error fetching lead details:', error);
     }
   );
}

checkLeadExistence(personname: string, companyCode: string): Observable<any> {
  return this.http.post<any>(`https://prathhamcrm.com/nodeapp/check-lead`, { personname, company_code: companyCode })
    .pipe(
      catchError(error => {
        console.error('Error checking lead existence:', error);
        return throwError('Error checking lead existence');
      }),
      map(response => {
        return { exists: response && response.exists };
      })
    );
}

resetForm() {
  this.leadForm.reset();
  this.products = [];  
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



}
