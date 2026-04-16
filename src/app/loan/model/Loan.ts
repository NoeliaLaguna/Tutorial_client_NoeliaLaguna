import { Game } from "../../game/model/Game";
import { Client } from "../../clients/model/Client";

export class Loan {
  id: number;
  game: Game;
  client: Client;
  startDate: Date;
  endDate: Date;
}
