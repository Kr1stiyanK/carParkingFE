import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {DataService} from "../../service/data.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private service: DataService,
    private fb: FormBuilder,
    private router: Router) {
    this
      .loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  submitForm() {
    this.service.login(this.loginForm.value).subscribe(
      (response) => {
        if (response.jwtToken != null) {
          const jwtToken = response.jwtToken;
          localStorage.setItem('jwtToken', jwtToken);
          this.router.navigateByUrl("/profile");
        }
      },
      (error) => {
        alert('Login failed: ' + error.message);
      }
    );
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  }


}
