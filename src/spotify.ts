/// <reference path="require.d.ts" />
/// <reference path="request.d.ts" />

const request = require('request');

module Spotify {
    "use strict";

    export class Artist {
        private albums: Album[] = new Array<Album>();
        
        constructor(private artistID: string) { }

        public getAlbums(): Album[] {
            return this.albums;
        }

        public getRandomAlbum(): Album {
            let index: number = Math.floor(Math.random() * this.albums.length);
            return this.albums[index];
        }

        public getID(): string {
            return this.artistID;
        }

        public async downloadAlbums() {
            let downloader: AlbumArrayDownloader = new AlbumArrayDownloader(this.artistID);
            try {
                this.albums = await downloader.run();
            }
            catch (error) {
                console.log("[" + new Date() + "] " + error);
            }
        }
    }

    class AlbumArrayDownloader {
        private downloaded: Album[] = new Array<Album>();
        private offset: number = 0;
        private artistURL: string;

        constructor(private artistID: string) {
            this.artistURL = AlbumArrayDownloader.getAlbumURL(artistID);
        }

        public run() {
            return new Promise<Array<Album>>(this.download.bind(this));
        }

        private download(resolve, reject) {
            request(this.artistURL  + '?offset=' + this.offset, (function(error, response, json) {
                if (error) {
                    console.log("[" + new Date() + "] " + error);
                    reject(error);
                    return;
                }

                try {
                    var body = JSON.parse(json);
                }
                catch (error) {
                    reject(error);
                    return;
                }

                this.addRawItems(body.items);
                if (this.downloaded.length >= body.total || body.offset + body.limit > body.total) {
                    resolve(this.downloaded);
                }
                else {
                    this.offset += body.limit;
                    this.download(resolve, reject);
                }
            }).bind(this));
        }

        private addRawItems(items) {
            for (let i = 0; i < items.length; i++) {
                this.downloaded.push(Album.getFromPlainJSObject(items[i]));
            }
        }

        public static getAlbumURL(artistID: string): string {
            return "https://timodenk.com/api/spotify/v1/artists/" + artistID + "/albums";
            //return "https://api.spotify.com/v1/artists/" + artistID + "/albums";
        }
    }

    export class Album {
        public albumType: string; 
        public availableMarkets: string[];
        public href: string; 
        public id: string; 
        public images: Image[];
        public name: string;
        public type: string;
        public uri: string;
        public spotifyExternalURL: string;

        public static getFromPlainJSObject(data): Album {
            let album = new Album();
            album.albumType = data.album_type;
            album.availableMarkets = data.available_markets;
            album.href = data.href;
            album.id = data.id;
            album.images = Image.getArrayFromPlainJSObject(data.images);
            album.spotifyExternalURL = data.external_urls.spotify;
            album.name = data.name;
            album.type = data.type;
            album.uri = data.uri;
            return album;
        }

        public getDieDreiFragezeichenEpisodeNumber(): number {
            let parts:string[] = this.name.split('/');
            if (parts.length !== 2) {
                return NaN;
            }
            try {
                return parseInt(parts[0]);
            } catch (e) {
                return NaN;
            }
        }
    }

    export class Image {
        constructor(
            private height: number, 
            private width: number,
            private URL: string
        ) { }

        public static getFromPlainJSObject(data): Image {
            return new Image(data.height, data.width, data.url);
        }

        public static getArrayFromPlainJSObject(dataArray): Array<Image> {
            let images = new Array<Image>();
            for (var i = 0; i < dataArray.length; i++) {
                images.push(Image.getFromPlainJSObject(dataArray[i]));
            }
            return images;
        }
    }
}