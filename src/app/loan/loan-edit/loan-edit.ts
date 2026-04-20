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
import { ChangeDetectorRef } from '@angular/core';

import { Loan } from '../model/Loan';
import { LoanService } from '../loan.service';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/model/Game';
import { ClientService } from '../../clients/client.service';
import { Client } from '../../clients/model/Client';

import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';

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
    MatNativeDateModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS },
    provideNativeDateAdapter(),
  ],
  templateUrl: './loan-edit.html',
  styleUrl: './loan-edit.scss',
})
export class LoanEdit implements OnInit {
  loan!: Loan;
  games: Game[] = [];
  clients: Client[] = [];
  existingLoans: Loan[] = [];

  constructor(
    public dialogRef: MatDialogRef<LoanEdit>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loanService: LoanService,
    private gameService: GameService,
    private clientService: ClientService,
    private cdRef: ChangeDetectorRef,
  ) { }

  private normalize(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  ngOnInit(): void {
    this.loan = this.data.loan ? structuredClone(this.data.loan) : new Loan();

    this.loan.game ??= {} as Game;
    this.loan.client ??= {} as Client;

    if (this.loan.startDate) {
      this.loan.startDate = new Date(this.loan.startDate);
    }

    if (this.loan.endDate) {
      this.loan.endDate = new Date(this.loan.endDate);
    }

    this.gameService.getGames().subscribe((games) => {
      this.games = games;
      if (this.loan.game?.id) {
        const found = games.find((g) => g.id === this.loan.game.id);
        if (found) {
          this.loan.game = found;
          this.cdRef.detectChanges();
        }
      }
    });

    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
      if (this.loan.client?.id) {
        const found = clients.find((c) => c.id === this.loan.client.id);
        if (found) {
          this.loan.client = found;
          this.cdRef.detectChanges();
        }
      }
    });

    this.loanService
      .getLoansPaged({
        pageNumber: 0,
        pageSize: 1000,
        sort: [{ property: 'id', direction: 'ASC' }],
      })
      .subscribe((data) => {
        this.existingLoans = data.content.map((l) => ({
          ...l,
          startDate: this.normalize(new Date(l.startDate)),
          endDate: this.normalize(new Date(l.endDate)),
        }));
      });
  }

  onSave(): void {
    if (!this.loan.startDate || !this.loan.endDate) {
      alert('Debe indicar las fechas de inicio y fin');
      return;
    }

    this.loan.startDate = this.normalize(new Date(this.loan.startDate));
    this.loan.endDate = this.normalize(new Date(this.loan.endDate));

    if (this.loan.endDate < this.loan.startDate) {
      alert('La fecha de devolución no puede ser anterior a la de inicio');
      return;
    }

    const diffDays =
      Math.floor(
        (this.loan.endDate.getTime() - this.loan.startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    if (diffDays > 14) {
      alert('El periodo máximo de préstamo es de 14 días');
      return;
    }

    const gameAlreadyLoaned = (() => {
      for (
        let d = new Date(this.loan.startDate);
        d <= this.loan.endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const loanThatDay = this.existingLoans.find(
          (l) =>
            l.id !== this.loan.id &&
            l.game.id === this.loan.game.id &&
            l.startDate <= d &&
            l.endDate >= d,
        );
        if (loanThatDay) return true;
      }
      return false;
    })();

    if (gameAlreadyLoaned) {
      alert('Este juego ya está prestado en esas fechas');
      return;
    }

    const hasTooManyLoans = (() => {
      for (
        let d = new Date(this.loan.startDate);
        d <= this.loan.endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const existingCount = this.existingLoans.filter(
          (l) =>
            l.id !== this.loan.id &&
            l.client.id === this.loan.client.id &&
            l.startDate <= d &&
            l.endDate >= d,
        ).length;

        console.log(
          '[CLIENT CHECK]',
          d.toDateString(),
          'existentes:',
          existingCount,
          '→ total con nuevo:',
          existingCount + 1,
        );

        if (existingCount + 1 > 2) {
          return true;
        }
      }
      return false;
    })();

    if (hasTooManyLoans) {
      alert('Un cliente no puede tener más de dos préstamos en un mismo día');
      return;
    }

    const loanDto = {
      id: this.loan.id,
      startDate: this.loan.startDate,
      endDate: this.loan.endDate,
      game: { id: this.loan.game.id },
      client: { id: this.loan.client.id },
    };

    this.loanService.saveLoan(loanDto).subscribe(() => {
      this.dialogRef.close();
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
