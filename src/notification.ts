///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
///<reference path='./telegram.ts'/>

module Notification {
    "use strict";

    export class Album {
        constructor(private bot: Telegram.Bot, private albums: Spotify.Album[]) { }

        public async broadcast() {
            let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
            let subscribers: number[] = await storage.getSubscibers(this.bot);

            for (let i = 0; i < subscribers.length; i++) {
                for (let j = 0; j < this.albums.length; j++) {
                    let message: string = this.albums[j].name + ' is now available: ' + this.albums[j].spotifyExternalURL;
                    this.bot.sendMessage(subscribers[i], message);
                }
            }
        }
    }

    export function delay(ms: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
}