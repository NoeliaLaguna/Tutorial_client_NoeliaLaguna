import { Component, OnInit } from '@angular/core';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';
import { MatTableDataSource } from '@angular/material/table';
import { Client } from '../model/Client';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClientService } from '../client.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientsEdit } from '../clients-edit/clients-edit';

@Component({
    selector: 'app-client-list',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        CommonModule
    ],
    templateUrl: './clients-list.html',
    styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit{

    dataSource = new MatTableDataSource<Client>();
    displayedColumns: string[] = ['id', 'name', 'action'];

    constructor(
        private clientService: ClientService,
        public dialog: MatDialog,
    ) { }


    ngOnInit(): void {
      this.clientService.getClients().subscribe(
            clients => this.dataSource.data = clients);
    }

    createClient() {
    const dialogRef = this.dialog.open(ClientsEdit, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  editClient(client: Client) {
    const dialogRef = this.dialog.open(ClientsEdit, {
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
  }

  deleteClient(client: Client) {
    const dialogRef = this.dialog.open(DialogConfirmation, {
      data: { title: "Eliminar cliente", description: "Atención si borra el cliente se perderán sus datos.<br> ¿Desea eliminar el cliente?" }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.deleteClient(client.id).subscribe(result => {
          this.ngOnInit();
        });
      }
    });
  }
}
