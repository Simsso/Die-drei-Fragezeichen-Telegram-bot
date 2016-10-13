///<reference path='./spotify.ts'/>
///<reference path='./telegram.ts'/>

module DataBase {
    "use strict";

    const fs = require('fs');
    const path = require('path');

    export class LocalFileStorage {
        private static dataDir = "./data";
        private static telegramData = "./data/telegram";
        private static dataFileType = "txt";

        constructor() {
            LocalFileStorage.createDirectory(LocalFileStorage.dataDir);
            LocalFileStorage.createDirectory(LocalFileStorage.telegramData);
        }

        public static createDirectory(dir: string) {
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        }

        public saveArtistsAlbums(artistID: string, albums: Spotify.Album[]) {
            if (artistID.length === 0) {
                throw new Error("Invalid artistID");
            }
            return new Promise<void>(((resolve, reject) => {
                let filePath = LocalFileStorage.getArtistPath(artistID);
                fs.writeFile(filePath, this.albumsToString(albums), function(error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }); 
            }).bind(this));
        }

        private albumsToString(albums: Spotify.Album[]): string {
            let result: string = "";
            for (var i = 0; i < albums.length; i++) {
                result += ((i === 0) ? "" : "\n") + albums[i].id;
            }
            return result;
        }

        private static getArtistPath(artistID: string) {
            return path.join(
                LocalFileStorage.dataDir, 
                artistID + "." + LocalFileStorage.dataFileType);
        }

        public getArtistsAlbums(artistID: string) {
            return new Promise<Array<string>>(((resolve, reject) => {
                let path = LocalFileStorage.getArtistPath(artistID);
                fs.exists(path, (exists: boolean) => { // check whether a file exists for the given artist
                    if (exists) {
                        fs.readFile(path, 'utf8', (error, data) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(data.split('\n'));
                        });
                    }
                    else {
                        resolve(new Array<string>());
                    }
                });
            }).bind(this));
        }


        // Telegram

        private static getBotPath(bot: Telegram.Bot) {
            return path.join(
                LocalFileStorage.telegramData, 
                bot.getName() + "." + LocalFileStorage.dataFileType);
        }

        private chatIDsToString(chatIDs: number[]): string {
            let output = "";
            for (let i = 0; i < chatIDs.length; i++) {
                output += ((i === 0) ? '' : '\n') + chatIDs[i];
            }
            return output;
        }

        public async addSubscriber(bot: Telegram.Bot, chatID: number) {
            let subscribers: number[] = await this.getSubscibers(bot);
            if (subscribers.indexOf(chatID) === -1) {
                subscribers.push(chatID);
            }
            await this.setSubscribers(bot, subscribers);
        }

        public async removeSubscriber(bot: Telegram.Bot, chatID: number) {
            let subscribers: number[] = await this.getSubscibers(bot);
            if (subscribers.indexOf(chatID) !== -1) {
                subscribers.splice(subscribers.indexOf(chatID), 1);
            }
            await this.setSubscribers(bot, subscribers);
        }

        public async setSubscribers(bot: Telegram.Bot, chatIDs: number[]) {
            return new Promise<Array<void>>(((resolve, reject) => {
                let path = LocalFileStorage.getBotPath(bot);
                fs.writeFile(path, this.chatIDsToString(chatIDs), function(error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                }); 
            }).bind(this));
        }

        public async getSubscibers(bot: Telegram.Bot) {
            return new Promise<Array<number>>(((resolve, reject) => {
                let path = LocalFileStorage.getBotPath(bot);
                fs.exists(path, (exists: boolean) => { // check whether a file exists for the given artist
                    if (exists) {
                        fs.readFile(path, 'utf8', (error, data) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            let charIDsRaw: string[] = data.split('\n');
                            let charIDs: number[] = new Array<number>();
                            for (let i = 0; i < charIDsRaw.length; i++) {
                                let parsed: number = parseInt(charIDsRaw[i]);
                                if (isNaN(parsed)) {
                                    continue;
                                }
                                charIDs.push(parsed);
                            }
                            resolve(charIDs);
                        });
                    }
                    else {
                        resolve(new Array<number>());
                    }
                });
            }).bind(this));
        }
    }
}