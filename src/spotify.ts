/// <reference path="require.d.ts" />
/// <reference path="request.d.ts" />

var request = require('request');

module Spotify {
    "use strict";

    export class Artist {
        private albums: Array<Album>;
        private artistURL: string;

        constructor(artistURL: string) {
            this.artistURL = artistURL;
        }

        public async downloadAlbums() {
            let downloader = new AlbumArrayDownloader(this.artistURL);
            try {
                this.albums = await downloader.run();
            }
            catch (error) {
                console.log(error);
            }
        }

        public getAlbums() {
            return this.albums;
        }
    }

    class AlbumArrayDownloader {
        private downloaded = new Array<Album>();
        private offset: number = 0;
        private artistURL: string;

        constructor(artistURL: string) {
            this.artistURL = artistURL;
        }

        public run() {
            return new Promise<Array<Album>>(this.download.bind(this));
        }

        private download(resolve, reject) {
            console.log(this.artistURL  + '?offset=' + this.offset);
            request(this.artistURL  + '?offset=' + this.offset, (function(error, response, json) {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }

                try {
                    var body = JSON.parse(json);
                    console.log(body);
                }
                catch (error) {
                    reject(error);
                    return;
                }

                console.log(this);
                this.addRawItems(body.items);
                console.log(this.downloaded.length);
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

        public static getFromPlainJSObject(data): Album {
            let album = new Album();
            album.albumType = data.albumType;
            album.availableMarkets = data.availableMarkets;
            album.href = data.href;
            album.id = data.id;
            album.images = data.images;
            album.name = data.name;
            album.type = data.type;
            album.uri = data.uri;
            return album;
        }
    }

    export class Image {
        constructor(
            private height: number, 
            private width: number,
            private URL: string
        ) {

        }
    }
}