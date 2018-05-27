const fs = require("fs");
const cheerio = require('cheerio');
const async = require("async");
const axios = require("axios");
const ProgressBar = require('progress');

const config = require("./config.json");
const API_ENDPOINT = "https://www.googleapis.com/youtube/v3";
const FILE_LOCATION = "./activity.html";

init();
function init() {
    console.log("Reading file: " + FILE_LOCATION);
    fs.readFile(FILE_LOCATION, function (err, html) {
        console.log("File successfuly read.");
        if (err) {
            throw err;
        } else {
            console.log("Fetching links...");
            const ids = fetchIds(html); //split because youtube v3 limits 50 ids per request
            console.log(ids[ids.length -4]);
            console.log("Links fetched. (" + ids.length + ")");
            getTotalDuration(ids);
        }
    });
}

function fetchIds(document) {
    const $ = cheerio.load(document.toString());
    const links = $('a');
    const validUrls = [];

    for(let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = link.attribs.href;
        if (href.includes("https://www.youtube.com/watch?v=")) {
            validUrls.push(href.replace("https://www.youtube.com/watch?v=", ""));
        }
    }
    return validUrls;
}

function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}

function getTotalDuration(ids) {
    const totalLength = ids.length;
    const idsArray = splitIds(ids, 50);

    let totalDuration = 0;
    let count = 0;
    const bar = new ProgressBar("Analysing [:bar] :current/:total :percent", {total: totalLength});
    async.eachSeries(idsArray, (list, cb) => {
        axios.get(API_ENDPOINT + "/videos", {
            params: {
                part: "contentDetails",
                id: list.join(","),
                key: config.google_api_key
            }
        }).then(response => {
            if(response) {
                const videos = response.data.items;
                for(let i = 0; i < videos.length; i++) {
                    totalDuration += convert_time(videos[i].contentDetails.duration);
                }
                bar.tick(list.length);
                count += list.length;
                cb();
            }
        }).catch(err => {
            if(err) console.log(err);
        });
    }, () => {
        console.log("\nTotal duration: " + totalDuration / 3600 + " hours");
        console.log("Videos: " + totalLength);
    });
}

function splitIds(ids, length) {
    let chunk;
    let array = [];
    while (ids.length > 0) {
        chunk = ids.splice(0, length)
        array.push(chunk);
    }
    return array;
}