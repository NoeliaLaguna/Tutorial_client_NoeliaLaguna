import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';

import { Loan } from '../model/Loan';
import { LoanService } from '../loan.service';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/model/Game';
import { ClientService } from '../../clients/client.service';
import { Client } from '../../clients/model/Client';

import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

export const ES_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-loan-edit',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatNativeDateModule

  ],
  providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS },
        provideNativeDateAdapter()
      ],
  templateUrl: './loan-edit.html',
  styleUrl: './loan-edit.scss',
})
export class LoanEdit implements OnInit {

  loan: Loan;
  games: Game[] = [];
  clients: Client[] = [];
  existingLoans: Loan[] = [];

  constructor(
    public dialogRef: MatDialogRef<LoanEdit>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loanService: LoanService,
    private gameService: GameService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {

      this.loan = this.data.loan
        ? structuredClone(this.data.loan)
        : new Loan();


      this.loan.client ??= {} as Client;
      this.loan.game ??= {} as Game;


      if (this.loan.startDate) {
        this.loan.startDate = new Date(this.loan.startDate);
      }

      if (this.loan.endDate) {
        this.loan.endDate = new Date(this.loan.endDate);
      }


      this.gameService.getGames().subscribe(games => {
        this.games = games;

        if (this.loan.game?.id) {
          const selectedGame = games.find(g => g.id === this.loan.game.id);
          if (selectedGame) {
            this.loan.game = selectedGame;
          }
        }
      });


      this.clientService.getClients().subscribe(clients => {
        this.clients = clients;

        if (this.loan.client?.id) {
          const selectedClient = clients.find(c => c.id === this.loan.client.id);
          if (selectedClient) {
            this.loan.client = selectedClient;
          }
        }
  });


  this.loanService.getLoans().subscribe(loans => {
    this.existingLoans = loans;
  });
}



  onSave(): void {


      if (!this.loan.startDate || !this.loan.endDate) {
        alert('Debe indicar las fechas de inicio y fin');
        return;
      }


      if (this.loan.endDate < this.loan.startDate) {
        alert('La fecha de devolución no puede ser anterior a la de inicio');
        return;
      }


      const diffDays =
        (this.loan.endDate.getTime() - this.loan.startDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays > 14) {
        alert('El periodo máximo de préstamo es de 14 días');
        return;
      }


      const gameOverlap = this.existingLoans.some(l =>
        l.id !== this.loan.id &&
        l.game?.id === this.loan.game?.id &&
        this.overlap(
          new Date(l.startDate),
          new Date(l.endDate),
          this.loan.startDate,
          this.loan.endDate
        )
      );

      if (gameOverlap) {
        alert('Este juego ya está prestado en esas fechas');
        return;
      }


      const clientLoans = this.existingLoans.filter(l =>
        l.id !== this.loan.id &&
        l.client?.id === this.loan.client?.id &&
        this.overlap(
          new Date(l.startDate),
          new Date(l.endDate),
          this.loan.startDate,
          this.loan.endDate
        )
      );

      if (clientLoans.length >= 2) {
        alert('Un cliente no puede tener más de dos préstamos simultáneos');
        return;
      }


        const addOneDay = (d: Date) => {
          const copy = new Date(d);
          copy.setDate(copy.getDate() + 1);
          return copy;
        };



      const loanDto = {
        id: this.loan.id,
        gameId: this.loan.game.id,
        clientId: this.loan.client.id,
        startDate: addOneDay(this.loan.startDate).toISOString().substring(0, 10),
        endDate: addOneDay(this.loan.endDate).toISOString().substring(0, 10)
      };

      console.log('DTO enviado al backend:', loanDto);


      this.loanService.saveLoan(loanDto).subscribe(() => {
        this.dialogRef.close();
      });
  }

  onClose(): void {
    this.dialogRef.close();
  }


  private overlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 <= end2 && end1 >= start2;
  }
}

