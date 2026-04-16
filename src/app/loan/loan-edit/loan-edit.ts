import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { Loan } from '../model/Loan';
import { LoanService } from '../loan.service';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/model/Game';
import { ClientService } from '../../clients/client.service';
import { Client } from '../../clients/model/Client';

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
    MatDatepickerModule
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
      ? Object.assign({}, this.data.loan)
      : new Loan();


    this.gameService.getGames().subscribe(games => {
      this.games = games;

      if (this.loan.game) {
        const selected = games.find(g => g.id === this.loan.game.id);
        if (selected) {
          this.loan.game = selected;
        }
      }
    });


    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
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
      l.game.id === this.loan.game.id &&
      this.overlap(l.startDate, l.endDate, this.loan.startDate, this.loan.endDate)
    );

    if (gameOverlap) {
      alert('Este juego ya está prestado en esas fechas');
      return;
    }

const clientLoans = this.existingLoans.filter(l =>
  l.id !== this.loan.id &&
  l.client?.id === this.loan.client?.id &&
  this.overlap(
    l.startDate,
    l.endDate,
    this.loan.startDate,
    this.loan.endDate
  )
);

if (clientLoans.length >= 2) {
  alert('Un cliente no puede tener más de dos préstamos simultáneos');
  return;
}


    if (clientLoans.length >= 2) {
      alert('Un cliente no puede tener más de dos préstamos simultáneos');
      return;
    }


    this.loanService.saveLoan(this.loan).subscribe(() => {
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
``
