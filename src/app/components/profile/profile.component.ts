import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {DataService} from "../../service/data.service";
import {CommonModule} from "@angular/common";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: string | null = null;
  isAdmin: boolean = false;

  constructor(private router: Router, private ds: DataService) {
  }

  ngOnInit(): void {
    this.currentUser = this.ds.getCurrentUser();
    this.ds.getUserRole().subscribe((response: { role: string }) => {
      this.isAdmin = response.role === 'ADMIN';
    });
  }

  logout() {
    this.ds.logout();
    this.router.navigate(['/home']);
  }
}
