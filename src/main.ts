import { Telegram } from "./telegram-bot.ts";
import { SecretValue } from "./secret.ts";

module DieDreiFragezeichenTelegramBotApp {
    class App {
        public constructor() {
            new Telegram.Bot(SecretValue.die_drei_fragezeichen_bot_token);
            console.log('https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums');
        }
    }


    var app = new App();
}