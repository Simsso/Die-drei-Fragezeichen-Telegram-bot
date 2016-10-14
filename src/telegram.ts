///<reference path='./secret.ts'/>
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>

module Telegram {
    'use strict';

    export class Bot {
        private tg;

        private outbox: Message[];

        private timeLastMessageSent: Date = new Date();
        private static minTimeBetweenMessages: number = 500; // milliseconds

        constructor(private name: string, private token: string) {
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
                    bot.sendMessage(chatID, "subscribed");
                }
                get routes() { return { 'startCommand': 'startHandler' } }
            }

            class StopController extends TelegramBaseController {
                stopHandler($) {
                    let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
                    let chatID: number = $._chatId;
                    storage.removeSubscriber(bot, chatID);
                    bot.sendMessage(chatID, "unsubscribed");
                }
                get routes() { return { 'stopCommand': 'stopHandler' } }
            }

            this.tg.router.when(new TextCommand('start', 'startCommand'), new StartController());
            this.tg.router.when(new TextCommand('stop', 'stopCommand'), new StopController());
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
            }
            else {
                setTimeout(this.tryToSendMessage, Telegram.Bot.minTimeBetweenMessages);
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