///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
///<reference path='./telegram.ts'/>

module Notification {
    "use strict";

    export class Album {
        constructor(private bot: Telegram.Bot, private album: Spotify.Album) { }

        public async broadcast() {
            let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
            let subscribers: number[] = await storage.getSubscibers(this.bot);

            let message: string = this.album.name + ' is now available: ' + this.album.spotifyExternalURL;
            for (let i = 0; i < subscribers.length; i++) {
                this.bot.sendMessage(subscribers[i], message);
            }
        }
    }
}