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
const request = require('request');
var Spotify;
(function (Spotify) {
    "use strict";
    class Artist {
        constructor(artistID) {
            this.artistID = artistID;
        }
        getAlbums() {
            return this.albums;
        }
        getID() {
            return this.artistID;
        }
        downloadAlbums() {
            return __awaiter(this, void 0, void 0, function* () {
                let downloader = new AlbumArrayDownloader(this.artistID);
                try {
                    this.albums = yield downloader.run();
                }
                catch (error) {
                    console.log(error);
                }
            });
        }
    }
    Spotify.Artist = Artist;
    class AlbumArrayDownloader {
        constructor(artistID) {
            this.downloaded = new Array();
            this.offset = 0;
            this.artistURL = AlbumArrayDownloader.getAlbumURL(artistID);
        }
        run() {
            return new Promise(this.download.bind(this));
        }
        download(resolve, reject) {
            console.log("request " + this.artistURL + '?offset=' + this.offset);
            request(this.artistURL + '?offset=' + this.offset, (function (error, response, json) {
                if (error) {
                    console.log(error);
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
        addRawItems(items) {
            for (let i = 0; i < items.length; i++) {
                this.downloaded.push(Album.getFromPlainJSObject(items[i]));
            }
        }
        static getAlbumURL(artistID) {
            return "https://api.spotify.com/v1/artists/" + artistID + "/albums";
        }
    }
    class Album {
        static getFromPlainJSObject(data) {
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
    }
    Spotify.Album = Album;
    class Image {
        constructor(height, width, URL) {
            this.height = height;
            this.width = width;
            this.URL = URL;
        }
        static getFromPlainJSObject(data) {
            return new Image(data.height, data.width, data.url);
        }
        static getArrayFromPlainJSObject(dataArray) {
            let images = new Array();
            for (var i = 0; i < dataArray.length; i++) {
                images.push(Image.getFromPlainJSObject(dataArray[i]));
            }
            return images;
        }
    }
    Spotify.Image = Image;
})(Spotify || (Spotify = {}));
var Secret;
(function (Secret) {
    Secret.DieDreiFragezeichenBotToken = "288343558:AAF0wq0PiPnuk5KGoglmmVsl8GyuXOTkB0s";
})(Secret || (Secret = {}));
///<reference path='./secret.ts'/>
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
var Telegram;
(function (Telegram_1) {
    'use strict';
    class Bot {
        constructor(name, token) {
            this.name = name;
            this.token = token;
            const Telegram = require('telegram-node-bot');
            const TelegramBaseController = Telegram.TelegramBaseController;
            const TextCommand = Telegram.TextCommand;
            this.tg = new Telegram.Telegram(token, { workers: 1 });
            let bot = this;
            class StartController extends TelegramBaseController {
                startHandler($) {
                    let storage = new DataBase.LocalFileStorage();
                    let chatID = $._chatId;
                    storage.addSubscriber(bot, chatID);
                    $.sendMessage('subscribed');
                }
                get routes() { return { 'startCommand': 'startHandler' }; }
            }
            class StopController extends TelegramBaseController {
                stopHandler($) {
                    let storage = new DataBase.LocalFileStorage();
                    let chatID = $._chatId;
                    storage.removeSubscriber(bot, chatID);
                    $.sendMessage('unsubscribed');
                }
                get routes() { return { 'stopCommand': 'stopHandler' }; }
            }
            this.tg.router.when(new TextCommand('start', 'startCommand'), new StartController());
            this.tg.router.when(new TextCommand('stop', 'stopCommand'), new StopController());
        }
        getName() {
            return this.name;
        }
        sendMessage(chatID, msg) {
            this.tg.api.sendMessage(chatID, msg);
        }
    }
    Telegram_1.Bot = Bot;
})(Telegram || (Telegram = {}));
///<reference path='./spotify.ts'/>
///<reference path='./telegram.ts'/>
var DataBase;
(function (DataBase) {
    "use strict";
    const fs = require('fs');
    const path = require('path');
    class LocalFileStorage {
        constructor() {
            LocalFileStorage.createDirectory(LocalFileStorage.dataDir);
            LocalFileStorage.createDirectory(LocalFileStorage.telegramData);
        }
        static createDirectory(dir) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        }
        saveArtistsAlbums(artistID, albums) {
            if (artistID.length === 0) {
                throw new Error("Invalid artistID");
            }
            return new Promise(((resolve, reject) => {
                let filePath = LocalFileStorage.getArtistPath(artistID);
                fs.writeFile(filePath, this.albumsToString(albums), function (error) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            }).bind(this));
        }
        albumsToString(albums) {
            let result = "";
            for (var i = 0; i < albums.length; i++) {
                result += ((i === 0) ? "" : "\n") + albums[i].id;
            }
            return result;
        }
        static getArtistPath(artistID) {
            return path.join(LocalFileStorage.dataDir, artistID + "." + LocalFileStorage.dataFileType);
        }
        getArtistsAlbums(artistID) {
            return new Promise(((resolve, reject) => {
                let path = LocalFileStorage.getArtistPath(artistID);
                fs.exists(path, (exists) => {
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
                        resolve(new Array());
                    }
                });
            }).bind(this));
        }
        // Telegram
        static getBotPath(bot) {
            return path.join(LocalFileStorage.telegramData, bot.getName() + "." + LocalFileStorage.dataFileType);
        }
        chatIDsToString(chatIDs) {
            let output = "";
            for (let i = 0; i < chatIDs.length; i++) {
                output += ((i === 0) ? '' : '\n') + chatIDs[i];
            }
            return output;
        }
        addSubscriber(bot, chatID) {
            return __awaiter(this, void 0, void 0, function* () {
                let subscribers = yield this.getSubscibers(bot);
                if (subscribers.indexOf(chatID) === -1) {
                    subscribers.push(chatID);
                }
                yield this.setSubscribers(bot, subscribers);
            });
        }
        removeSubscriber(bot, chatID) {
            return __awaiter(this, void 0, void 0, function* () {
                let subscribers = yield this.getSubscibers(bot);
                if (subscribers.indexOf(chatID) !== -1) {
                    subscribers.splice(subscribers.indexOf(chatID), 1);
                }
                yield this.setSubscribers(bot, subscribers);
            });
        }
        setSubscribers(bot, chatIDs) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(((resolve, reject) => {
                    let path = LocalFileStorage.getBotPath(bot);
                    fs.writeFile(path, this.chatIDsToString(chatIDs), function (error) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                }).bind(this));
            });
        }
        getSubscibers(bot) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(((resolve, reject) => {
                    let path = LocalFileStorage.getBotPath(bot);
                    fs.exists(path, (exists) => {
                        if (exists) {
                            fs.readFile(path, 'utf8', (error, data) => {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                let charIDsRaw = data.split('\n');
                                let charIDs = new Array();
                                for (let i = 0; i < charIDsRaw.length; i++) {
                                    let parsed = parseInt(charIDsRaw[i]);
                                    if (isNaN(parsed)) {
                                        continue;
                                    }
                                    charIDs.push(parsed);
                                }
                                resolve(charIDs);
                            });
                        }
                        else {
                            resolve(new Array());
                        }
                    });
                }).bind(this));
            });
        }
    }
    LocalFileStorage.dataDir = "./data";
    LocalFileStorage.telegramData = "./data/telegram";
    LocalFileStorage.dataFileType = "txt";
    DataBase.LocalFileStorage = LocalFileStorage;
})(DataBase || (DataBase = {}));
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
var SpotifyArtistWatch;
(function (SpotifyArtistWatch) {
    "use strict";
    class Comparator {
        constructor(artistID) {
            this.artistID = artistID;
            this.addedAlbums = new Array();
            this.removedAlbums = new Array();
            this.allAlbums = new Array();
            this.storage = new DataBase.LocalFileStorage();
            this.artist = new Spotify.Artist(this.artistID);
        }
        getAddedAlbums() {
            return this.addedAlbums;
        }
        compare() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.artist.downloadAlbums();
                this.allAlbums = this.artist.getAlbums();
                let storedAlbumIDs = yield this.storage.getArtistsAlbums(this.artist.getID());
                // find removed albums
                for (let i = 0; i < storedAlbumIDs.length; i++) {
                    if (!this.albumWithIdExists(storedAlbumIDs[i])) {
                        this.removedAlbums.push(storedAlbumIDs[i]);
                    }
                }
                // find new albums
                for (let i = 0; i < this.allAlbums.length; i++) {
                    if (storedAlbumIDs.indexOf(this.allAlbums[i].id) === -1) {
                        // new album found
                        this.addedAlbums.push(this.allAlbums[i]);
                    }
                }
            });
        }
        albumWithIdExists(albumID) {
            for (let i = 0; i < this.allAlbums.length; i++) {
                if (this.allAlbums[i].id === albumID) {
                    return true;
                }
            }
            return false;
        }
        save() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.storage.saveArtistsAlbums(this.artist.getID(), this.allAlbums);
            });
        }
    }
    SpotifyArtistWatch.Comparator = Comparator;
})(SpotifyArtistWatch || (SpotifyArtistWatch = {}));
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>
///<reference path='./telegram.ts'/>
var Notification;
(function (Notification) {
    "use strict";
    class Album {
        constructor(bot, album) {
            this.bot = bot;
            this.album = album;
        }
        broadcast() {
            return __awaiter(this, void 0, void 0, function* () {
                let storage = new DataBase.LocalFileStorage();
                let subscribers = yield storage.getSubscibers(this.bot);
                let message = this.album.name + ' is now available: ' + this.album.href;
                for (let i = 0; i < subscribers.length; i++) {
                    this.bot.sendMessage(subscribers[i], message);
                }
            });
        }
    }
    Notification.Album = Album;
})(Notification || (Notification = {}));
///<reference path='./compare-logic.ts'/>
///<reference path='./telegram.ts'/>
///<reference path='./notification.ts'/>
var SpotifyArtistWatch;
(function (SpotifyArtistWatch) {
    "use strict";
    class App {
        static main() {
            console.log("running");
            App.startBot();
            setTimeout(App.checkForChanges, 10000);
        }
        static checkForChanges() {
            return __awaiter(this, void 0, void 0, function* () {
                App.watchedArtists.map((artistID) => __awaiter(this, void 0, void 0, function* () {
                    let comparator = new SpotifyArtistWatch.Comparator(artistID);
                    yield comparator.compare();
                    let addedAlbums = comparator.getAddedAlbums();
                    comparator.save();
                    addedAlbums.map((album) => __awaiter(this, void 0, void 0, function* () {
                        let notification = new Notification.Album(App.bot, album);
                        yield notification.broadcast();
                        console.log("message broadcasted");
                    }));
                }));
            });
        }
        static startBot() {
            this.bot = new Telegram.Bot("DieDreiFragezeichenBot", Secret.DieDreiFragezeichenBotToken);
        }
    }
    App.watchedArtists = ["3meJIgRw7YleJrmbpbJK6S"];
    App.main();
})(SpotifyArtistWatch || (SpotifyArtistWatch = {}));
//# sourceMappingURL=app.js.map