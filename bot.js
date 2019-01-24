// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

const DiscordLogger = require('discord-logger');
const options = {
  endpoint: process.env.DISCORD_WEBHOOK,
  botUsername: 'Logger'
} 
const logger = new DiscordLogger(options);

const Website = require("./core/moon.js").Website;

// Imports dependencies and set up http server

class MyBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */    
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types. 
        const response = async (turnContext) => {
            if (turnContext.activity.type === ActivityTypes.Message) {
                if (turnContext.activity.text==="!list"){
                    return turnContext.sendActivity("Moon hỗ trợ báo giá các web sau: " + Website.getAvailableWebsite()); 
                }
                else
                {
                    var website= new Website(turnContext.activity.text);
                    // Nếu có trong list website thì mới trả lời
                    if (website.found === true){
                        var item = await Website.getItem(website);
                        var log=item.toLog();
                        if (log.type==="error") logger.error(log.content);
                        else logger.success(log.content);
                        // Nếu ko lấy được giá thì có thể là 3rd Seller (Amazon)
                        if (item.price.value==0 && item.redirect!=="")
                        {
                            console.log("Found redirect");
                            website= new Website(item.redirect);
                            item = await Website.getItem(website, item);
                            log=item.toLog();
                            if (log.type==="error") logger.error(log.content);
                            else logger.success(log.content);
                        }
                        return turnContext.sendActivity(item.toText());                   
                    }
                    if (website.isUrl === true)
                        return turnContext.sendActivity("Xin lỗi, Moon chỉ hỗ trợ báo giá các web sau: " + Website.getAvailableWebsite()); 
                }                         
            } 
            else {
                await turnContext.sendActivity(`Gõ !list để xem các web hỗ trợ`);
            } 
        };       
        await response(turnContext);
    };
    
}

module.exports.MyBot = MyBot;
