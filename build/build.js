var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/// <reference path="require.d.ts" />
/// <reference path="request.d.ts" />
var request = require('request');
var Spotify;
(function (Spotify) {
    "use strict";
    class Artist {
        constructor(artistURL) {
            this.artistURL = artistURL;
        }
        downloadAlbums() {
            return __awaiter(this, void 0, void 0, function* () {
                let downloader = new AlbumArrayDownloader(this.artistURL);
                try {
                    this.albums = yield downloader.run();
                }
                catch (error) {
                    console.log(error);
                }
            });
        }
        getAlbums() {
            return this.albums;
        }
    }
    Spotify.Artist = Artist;
    class AlbumArrayDownloader {
        constructor(artistURL) {
            this.downloaded = new Array();
            this.offset = 0;
            this.artistURL = artistURL;
        }
        run() {
            return new Promise(this.download.bind(this));
        }
        download(resolve, reject) {
            console.log(this.artistURL + '?offset=' + this.offset);
            request(this.artistURL + '?offset=' + this.offset, (function (error, response, json) {
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
        addRawItems(items) {
            for (let i = 0; i < items.length; i++) {
                this.downloaded.push(Album.getFromPlainJSObject(items[i]));
            }
        }
    }
    class Album {
        static getFromPlainJSObject(data) {
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
    Spotify.Album = Album;
    class Image {
        constructor(height, width, URL) {
            this.height = height;
            this.width = width;
            this.URL = URL;
        }
    }
    Spotify.Image = Image;
})(Spotify || (Spotify = {}));
///<reference path='./spotify.ts'/>
var SpotifyArtistWatch;
(function (SpotifyArtistWatch) {
    "use strict";
    class App {
        constructor() {
            let dieDreiFragezeichen = new Spotify.Artist("https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums");
            dieDreiFragezeichen.downloadAlbums();
            console.log(dieDreiFragezeichen.getAlbums());
        }
    }
    new App();
})(SpotifyArtistWatch || (SpotifyArtistWatch = {}));
//# sourceMappingURL=build.js.map