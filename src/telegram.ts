///<reference path='./secret.ts'/>
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>

module Telegram {
    'use strict';

    export class Bot {
        private tg;

        private outbox: Message[] = new Array<Message>();

        private timeLastMessageSent: Date = new Date();
        private static minTimeBetweenMessages: number = 1000; // milliseconds

        public artist: Spotify.Artist;

        constructor(private name: string, private token: string, artistID: string) {
            this.artist = new Spotify.Artist(artistID);

            const Telegram = require('telegram-node-bot')
            const TelegramBaseController = Telegram.TelegramBaseController
            const TextCommand = Telegram.TextCommand
            this.tg = new Telegram.Telegram(token, { workers: 1 });
            let bot = this;

            class StartController extends TelegramBaseController {
                startHandler($) {
                    let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
                    let chatID: number = $._chatId;
                    storage.addSubscriber(bot, chatID);
                    bot.sendMessage(chatID, "Subscribed successfully. You'll get an update as soon as there are new episodes available.");
                }
                get routes() { return { 'startCommand': 'startHandler' } }
                handle($) {
                    this.startHandler($);
                }
            }

            class StopController extends TelegramBaseController {
                stopHandler($) {
                    let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
                    let chatID: number = $._chatId;
                    storage.removeSubscriber(bot, chatID);
                    bot.sendMessage(chatID, "Unsubscribed.");
                }
                get routes() { return { 'stopCommand': 'stopHandler' } }
            }

            class DebugController extends TelegramBaseController {
                debugHandler($) {
                    let chatID: number = $._chatId;
                    bot.sendMessage(chatID, "Your chat ID is " + chatID.toString());
                }
                get routes() { return { 'debugCommand': 'debugHandler' } }
            }

            class HelpController extends TelegramBaseController {
                helpHandler($) {
                    let chatID: number = $._chatId;
                    bot.sendMessage(chatID, "This bot sends an update when there are new \"Die drei Fragezeichen\" episodes available on Spotify.");
                }
                get routes() { return { 'helpCommand': 'helpHandler' } }
            }

            class RandomController extends TelegramBaseController {
                async randomHandler($) {
                    let chatID: number = $._chatId;
                    await bot.artist.downloadAlbums();
                    let notification = new Notification.Album(bot, [bot.artist.getRandomAlbum()], Notification.Type.CheckThatOne);
                    notification.sendTo(chatID);
                }
                get routes() { return { 'randomCommand': 'randomHandler' } }
            }

            this.tg.router.when(new TextCommand('start', 'startCommand'), new StartController())
                .when(new TextCommand('stop', 'stopCommand'), new StopController())
                .when(new TextCommand('debug', 'debugCommand'), new DebugController())
                .when(new TextCommand('help', 'helpCommand'), new HelpController())
                .when(new TextCommand('random', 'randomCommand'), new RandomController())
                .otherwise(new StartController());
        }

        public getName(): string {
            return this.name;
        }

        public sendMessage(chatID: number, msg: string) {
            this.outbox.push(new Message(chatID, msg));
            this.tryToSendMessage();
        }

        private tryToSendMessage() {
            if (this.outbox.length === 0) return;
            
            if (this.timeLastMessageSent.getTime() + Telegram.Bot.minTimeBetweenMessages < Date.now()) {
                this.timeLastMessageSent = new Date();
                let message: Message = this.outbox.shift();
                this.tg.api.sendMessage(message.getChatID(), message.getMsg());
                console.log("[" + this.timeLastMessageSent + "] message to " + message.getChatID() + " sent: " + message.getMsg());
            }
            else {
                setTimeout(this.tryToSendMessage.bind(this), Telegram.Bot.minTimeBetweenMessages);
            }
        }


    }

    class Message {
        constructor(private chatID: number, private msg: string) { }
        
        public getChatID(): number {
            return this.chatID;
        }

        public getMsg(): string {
            return this.msg;
        }
    }
}