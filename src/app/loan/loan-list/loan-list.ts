import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

import { Loan } from '../model/Loan';
import { LoanService } from '../loan.service';
import { GameService } from '../../game/game.service';
import { ClientService } from '../../clients/client.service';
import { Game } from '../../game/model/Game';
import { Client } from '../../clients/model/Client';
import { Pageable } from '../../core/model/page/Pageable';
import { LoanEdit } from '../loan-edit/loan-edit';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

export const ES_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS },
    provideNativeDateAdapter()
  ],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.scss',
})
export class LoanList implements OnInit {

  pageNumber = 0;
  pageSize = 5;
  totalElements = 0;

  games: Game[] = [];
  clients: Client[] = [];

  dataSource = new MatTableDataSource<Loan>();
  displayedColumns = ['id', 'game', 'client', 'startDate', 'endDate', 'action'];

  filterGame: Game;
  filterClient: Client;
  filterDate: Date;

  constructor(
    private loanService: LoanService,
    private gameService: GameService,
    private clientService: ClientService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.gameService.getGames().subscribe(g => (this.games = g));
    this.clientService.getClients().subscribe(c => (this.clients = c));
    this.loadPage();
  }

  loadPage(event?: PageEvent): void {

    const pageable: Pageable = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sort: [{ property: 'id', direction: 'ASC' }],
    };

    if (event) {
      pageable.pageNumber = event.pageIndex;
      pageable.pageSize = event.pageSize;
    }

    this.loanService
      .getLoansPaged(
        pageable,
        this.filterGame?.id,
        this.filterClient?.id,
        this.filterDate
      )
      .subscribe(data => {

        this.dataSource.data = data.content.map(loan => ({
          ...loan,
          startDate: new Date(loan.startDate),
          endDate: new Date(loan.endDate),
        }));

        this.pageNumber = data.pageable.pageNumber;
        this.pageSize = data.pageable.pageSize;
        this.totalElements = data.totalElements;
      });
  }

  onSearch(): void {
    this.pageNumber = 0;
    this.loadPage();
  }

  onCleanFilter(): void {
    this.filterGame = null;
    this.filterClient = null;
    this.filterDate = null;
    this.pageNumber = 0;
    this.loadPage();
  }

  createLoan(): void {
    const dialogRef = this.dialog.open(LoanEdit, { data: {} });
    dialogRef.afterClosed().subscribe(() => this.loadPage());
  }

  editLoan(loan: Loan): void {
    const dialogRef = this.dialog.open(LoanEdit, { data: { loan } });
    dialogRef.afterClosed().subscribe(() => this.loadPage());
  }

  deleteLoan(loan: Loan): void {
    if (confirm('¿Seguro que deseas eliminar el préstamo?')) {
      this.loanService.deleteLoan(loan.id).subscribe(() => {
        this.loadPage();
      });
    }
  }
}
