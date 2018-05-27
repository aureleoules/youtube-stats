# YouTube Personal Statistics
YouTube Personal Statistics will show you how much time you've spent watching videos.

## How to use
* `$ yarn` or `$ npm install` to install dependencies
* Create a `config.json` using the `config.json.sample` file. Create a **Google API Key** [here](https://console.developers.google.com/apis/dashboard). You need to active the **YouTube API V3** [here](https://console.developers.google.com/apis/library).
* Download your **Personal Google Data** [here](https://takeout.google.com/settings/takeout/downloads).
    - Click on **Create an archive**
    - Only select **My Activity**
    - Select data: **YouTube**
    - Click on next
    - Click on **Create an archive**
    - Download your archive
    - Find the file `My Activity.html` in `Takout/My Activity/YouTube/`
    - Move it to this folder and rename it activity.html
* Run using `$ node index.js`. This might take a while.

## How does it work
* The script read and fetch every links of `activity.html`.
* It will next detect if the link is a video.
* A request containing 50 videos will be made because the YouTube API V3 limits the amount of videos to be 50 per request.
* For each video informations, the duration given by the YouTube API V3 will be converted to a human readable duration.
* The total amount of time spent on YouTube watching videos will be printed out.

# Author
[Aurèle Oulès](http://aurele.oules.com)