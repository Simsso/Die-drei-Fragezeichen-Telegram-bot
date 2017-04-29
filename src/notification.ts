///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
///<reference path='./telegram.ts'/>

module Notification {
    "use strict";

    export enum Type {
        NowAvailable,
        CheckThatOne
    }

    export class Album {
        private static nowAvailableTexts: string[] = [
            'How about',
            'Check that',
            'Do you like',
            'Try',
            'Maybe that one',
            'Check that one',
            'Here you go',
            'Here',
            'Let\'s go',
            'Try that',
            'You are welcome',
            'It\'s a pleasure',
            'One of my favorites'];

        constructor(private bot: Telegram.Bot, private albums: Spotify.Album[], private type: Type) { }

        public async sendTo(chatID: number) {
            for (let i = 0; i < this.albums.length; i++) {
                let message: string = Album.getMessageByAlbum(this.albums[i], this.type);
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

        private static getMessageByAlbum(album: Spotify.Album, type: Type): string {
            switch (type) {
                case Type.CheckThatOne:
                    return this.nowAvailableTexts[Math.floor(Math.random() * this.nowAvailableTexts.length)] + ': ' + album.name + ' ' + album.spotifyExternalURL;
                default: 
                    return album.name + ' is now available: ' + album.spotifyExternalURL;
                }
        }
    }

    export function delay(ms: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
}