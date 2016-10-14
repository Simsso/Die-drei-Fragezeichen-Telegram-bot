///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
///<reference path='./telegram.ts'/>

module Notification {
    "use strict";

    export class Album {
        constructor(private bot: Telegram.Bot, private albums: Spotify.Album[]) { }

        public async sendTo(chatID: number) {
            for (let i = 0; i < this.albums.length; i++) {
                let message: string = Album.getMessageByAlbum(this.albums[i]);
                this.bot.sendMessage(chatID, message);
            }
        }

        public async broadcast() {
            let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
            let subscribers: number[] = await storage.getSubscibers(this.bot);

            for (let i = 0; i < subscribers.length; i++) {
                await this.sendTo(subscribers[i]);
            }
        }

        private static getMessageByAlbum(album: Spotify.Album): string {
            return album.name + ' is now available: ' + album.spotifyExternalURL;
        }
    }

    export function delay(ms: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
}