///<reference path='./spotify.ts'/>

module DataBase {
    "use strict";

    const fs = require('fs');
    const path = require('path');

    export class LocalFileStorage {
        private static dataDir = "./data";
        private static dataFileType = "txt";

        constructor() {
            LocalFileStorage.createDirectory(LocalFileStorage.dataDir);
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
                let filePath = LocalFileStorage.getPath(artistID);
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

        private static getPath(artistID: string) {
            return path.join(
                LocalFileStorage.dataDir, 
                artistID + "." + LocalFileStorage.dataFileType);
        }

        public getArtistsAlbums(artistID: string) {
            return new Promise<Array<string>>(((resolve, reject) => {
                let path = LocalFileStorage.getPath(artistID);
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
    }
}