import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {DataService} from "../../service/data.service";

@Component({
  selector: 'app-allbookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './allbookings.component.html',
  styleUrl: './allbookings.component.css'
})
export class AllbookingsComponent implements OnInit {
  bookings: any[] = [];
  pagedBookings: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 16;
  totalPages: number = 1;

  constructor(private ds: DataService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.ds.getAllBookings().subscribe((data: any[]) => {
      this.bookings = data;
      this.totalPages = Math.ceil(this.bookings.length / this.itemsPerPage);
      this.updatePagedBookings();
    });
  }

  updatePagedBookings(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedBookings = this.bookings.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedBookings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedBookings();
    }
  }
}
