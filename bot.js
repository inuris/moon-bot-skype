// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

const Website = require("./core/moon.js").Website;
const Item = require("./core/moon.js").Item;
const logger = require('./core/logger.js').logger;
// Imports dependencies and set up http server
const request = require("request")

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
                    const message = await new Promise(resolve => {                        
                        var requestOptions = {
                            method: "GET",
                            url: website.url,
                            gzip: true
                        };
                        // Nếu website cần Cookie thì set
                        if (website.cookie !== null){
                            var cookie = request.cookie(website.cookie);
                            requestOptions.headers = {
                                'Cookie': cookie
                            };
                            requestOptions.jar = true;
                        }
                        request(requestOptions, function(error, response, body) {
                            // Đưa html raw vào website
                            website.setHtmlRaw(body);  
                            var item = new Item(website);                 
                            // Log to file
                            var logtype='info';
                            if (item.weight.value===0 || item.category.ID === "UNKNOWN") {logtype='error';}
                            logger.log(logtype,'{\n"URL":"%s",\n"PRICE":"%s",\n"SHIPPING":"%s",\n"WEIGHT":"%s",\n"CATEGORY":"%s",\n"TOTAL":"%s",\n"CATEGORYSTRING":"%s"\n}', website.url, item.price.string, item.shipping.string,item.weight.current,item.category.att.ID,item.totalString,item.category.string);
                    
                            var _response= item.toText();
                            resolve(_response);             
                        });  
                    })
                    return turnContext.sendActivity(message);                   
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
