import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client} from './model/Client';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) {}

    private baseUrl = 'http://localhost:8080/client';

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.baseUrl);
  }

  saveClient(client: Client): Observable<Client> {
    const { id } = client;
        const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;
        return this.http.put<Client>(url, client);
  }

  deleteClient(idClient : number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${idClient}`);
  }
}
