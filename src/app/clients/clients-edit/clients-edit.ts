import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../client.service';
import { Client } from '../model/Client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule ],
    templateUrl: './clients-edit.html',
    styleUrl: './clients-edit.scss'
})
export class ClientsEdit implements OnInit {
    client: Client;
    nameExists = false;


    constructor(
        public dialogRef: MatDialogRef<ClientsEdit>,
        @Inject(MAT_DIALOG_DATA) public data: {client : Client},
        private clientService: ClientService
    ) {}


    ngOnInit(): void {
        this.client = this.data.client ? Object.assign({}, this.data.client) : new Client();
    }



    onSave() {

      this.nameExists = false;

      if (!this.client.name || this.client.name.trim() === '') {

        return;
      }

      this.clientService.getClients().subscribe(clients => {

        const exists = clients.some(client =>

          client.name.toLowerCase() === this.client.name.toLowerCase() &&
          client.id !== this.client.id
        );

        if (exists) {
          this.nameExists = true;
          alert('Ya existe un cliente con ese nombre');
          return;
        }

        this.clientService.saveClient(this.client).subscribe(() => {
          this.dialogRef.close();
        });

      });
    }

    onClose() {
        this.dialogRef.close();
    }
}
