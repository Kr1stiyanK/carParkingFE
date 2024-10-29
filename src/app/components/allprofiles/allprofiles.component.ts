import {Component, OnInit} from '@angular/core';
import {DataService} from "../../service/data.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-allprofiles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './allprofiles.component.html',
  styleUrl: './allprofiles.component.css'
})
export class AllprofilesComponent implements OnInit {
  profiles: any[] = [];
  pagedProfiles: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  constructor(private ds: DataService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.ds.getAllProfiles().subscribe((data: any[]) => {
      this.profiles = data;
      this.totalPages = Math.ceil(this.profiles.length / this.itemsPerPage);
      this.updatePagedProfiles();
    });
  }

  updatePagedProfiles(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedProfiles = this.profiles.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedProfiles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedProfiles();
    }
  }
}
