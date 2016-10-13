///<reference path='./secret.ts'/>
///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>

module Telegram {
    'use strict';

    export class Bot {
        private tg;

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
                    $.sendMessage('subscribed');
                }
                get routes() { return { 'startCommand': 'startHandler' } }
            }

            class StopController extends TelegramBaseController {
                stopHandler($) {
                    let storage: DataBase.LocalFileStorage = new DataBase.LocalFileStorage();
                    let chatID: number = $._chatId;
                    storage.removeSubscriber(bot, chatID);
                    $.sendMessage('unsubscribed');
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
            this.tg.api.sendMessage(chatID, msg);
        }
    }
}