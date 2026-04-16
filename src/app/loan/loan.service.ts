import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Loan } from './model/Loan';
import { Pageable } from '../core/model/page/Pageable';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private baseUrl = 'http://localhost:8080/loan';

  constructor(private http: HttpClient) {}

 getLoansPaged(
  pageable: Pageable,
  gameId?: number,
  clientId?: number,
  date?: Date
) {
  const body: any = {
    pageable: pageable
  };

  if (gameId) body.gameId = gameId;
  if (clientId) body.clientId = clientId;
  if (date) body.date = date.toISOString().substring(0, 10);

  return this.http.post<any>(this.baseUrl, body);
}


  getLoans(
    gameId?: number,
    clientId?: number,
    date?: Date
  ): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.composeFindUrl(gameId, clientId, date));
  }



    saveLoan(loan: {
      id?: number;
      gameId: number;
      clientId: number;
      startDate: string;
      endDate: string;
    }): Observable<void>
    {
    const { id } = loan;
    const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;
    return this.http.put<void>(url, loan);
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


  private composeFindUrl(
    gameId?: number | null,
    clientId?: number | null,
    date?: Date | null
  ): string {
    const params = new URLSearchParams();

    if (gameId) {
      params.set('gameId', gameId.toString());
    }

    if (clientId) {
      params.set('clientId', clientId.toString());
    }

    if (date) {
      params.set('date', date.toISOString());
    }

    const queryString = params.toString();
    return queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
  }
}
