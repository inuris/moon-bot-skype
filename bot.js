// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

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
                var website= new Website(turnContext.activity.text);
                // Nếu có trong list website thì mới trả lời
                if (website.found === true){
                    var message = await Website.getResponse(website);
                    // Nếu ko lấy được giá thì có thể là 3rd Seller (Amazon)
                    if (message.price==0 && message.redirect!=="")
                    {
                        website= new Website(message.redirect);
                        message = await Website.getResponse(website);
                    }
                    return turnContext.sendActivity(message.toText());                   
                }
                if (website.isUrl === true)
                    return turnContext.sendActivity("Xin lỗi, Moon chỉ hỗ trợ báo giá các web sau: " + Website.getAvailableWebsite());                          
            } 
            else {
                //await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
            } 
        };       
        await response(turnContext);
    };
    
}

module.exports.MyBot = MyBot;
