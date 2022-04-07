const express = require("express");
const app = express();

const cheerio = require("cheerio");
const axios = require("axios");

async function getBitcoinPrice () {
    try {
        const siteURL = "https://coinmarketcap.com/";
        
        const { data } = await axios.get(siteURL);
        const $ = cheerio.load(data);
        
        const selector = "#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr";
        const keys = ["rank", "name", "price", "24h", "7d", "marketCap", "volume", "circulatingSupply"];
        const coinArray = [];
        
        $(selector).each((parentIndex, parentElement) => {
            let keyIndex = 0;
            const coinObject = {};
            
            if (parentIndex <= 9) {
                $(parentElement).children().each((childIndex, childElement) => {
                    let tdValue = $(childElement).text(); 
                    if (keyIndex === 1 || keyIndex === 6) tdValue = $("p:first-child", $(childElement).html()).text();
                    if(tdValue) {
                        coinObject[keys[keyIndex]] = tdValue;
                        keyIndex++;
                    };
                });
                coinArray.push(coinObject);
            };
        });
        return coinArray;
    } catch (error) {
        console.log(`Oh no, something went wrong here...${error}`);
    };
};

app.get("/api/price-feed", async (req, res) => {
    try {
        const result = await getBitcoinPrice();
        return res.status(200).json({ result });
    } catch (error) {
        return res.status(500).json(error.toString());
    };
});

app.listen(3000, () => console.log("Server is up and running on port 3000..."));