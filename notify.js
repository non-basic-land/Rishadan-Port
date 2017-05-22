var notifier = require('node-notifier');

notifier.notify({
  'title': 'Rishadan Port opens',
  'message': 'Now polling for changes',
  'sound': true
});

var request = require('request'),
    cheerio = require('cheerio');

var searchPages = [];

searchPages.push({
    website: 'marktplaats.nl',
    url: 'http://www.marktplaats.nl/z/hobby-en-vrije-tijd/verzamelkaartspellen-magic-the-gathering/magic-the-gathering.html?query=magic%20the%20gathering&categoryId=919&sortBy=standaard&sortOrder=decreasing',
    itemSelector: '.search-result.defaultSnippet',
    titleSelector: '.mp-listing-title',
    linkSelector: 'h2.heading a'
});

searchPages.push({
    website: '2dehands.be',
    url: 'http://www.2dehands.be/verzamelen/cardgames/magic-the-gathering/2/magic/?locale=all',
    itemSelector: '.search-result .listed-adv-item',
    titleSelector: '.listed-item-description h3',
    linkSelector: 'a.listed-adv-item-link'
});

searchPages.push({
    website: 'mtgstocks.com',
    url: 'http://www.mtgstocks.com/interests',
    itemSelector: '#interests tr',
    titleSelector: '#interests tr',
    linkSelector: 'a.screenshot'
});

var foundResults = [];

function initialPoll() {

    for (var p = 0; p < searchPages.length; p++) {
        (function () {
            var searchPage = searchPages[p];
            request(searchPage.url, function (error, response, body) {
                var $ = cheerio.load(body);

                $(searchPage.itemSelector).each(function () {
                    if (searchPage.titleSelector === searchPage.itemSelector) {
                        var titleStr = $(this).text();
                    } else {
                        var titleStr = $(this).find(searchPage.titleSelector).text();
                    }
                    var urlStr = $(this).find(searchPage.linkSelector).attr('href');
                    var ul = document.getElementById("results-container");
                    var li = document.createElement("li");
                    li.innerHTML = searchPage.website + ': <a target="_blank" href="' + urlStr + '">' + titleStr + '</a>';
                    ul.appendChild(li);
                    foundResults.push(titleStr);
                });
            });
        })();
    }
}

initialPoll();

var searchIndex = 0;

function timedPoll() {

    var searchPage = searchPages[searchIndex];
    searchIndex++;
    if (searchIndex >= searchPages.length) {
        searchIndex = 0;
    }

    request(searchPage.url, function (error, response, body) {
        var $ = cheerio.load(body);

        $(searchPage.itemSelector).each(function () {
            if (searchPage.titleSelector === searchPage.itemSelector) {
                var titleStr = $(this).text();
            } else {
                var titleStr = $(this).find(searchPage.titleSelector).text();
            }
            var urlStr = $(this).find(searchPage.linkSelector).attr('href');
            for (var s = 0; s < foundResults.length; s++) {
                if (foundResults[s] == titleStr) {
                    return;
                }
            }
            var ul = document.getElementById("results-container");
            var li = document.createElement("li");
            li.innerHTML = searchPage.website + ': <a target="_blank" href="' + urlStr + '">' + titleStr + '</a>';
            ul.insertBefore(li, ul.childNodes[0]);
            foundResults.push(titleStr);

            notifier.notify({
              'title': 'Arrived at ' + searchPage.website,
              'message': titleStr,
              'sound': true
            });
        });
    });
};

setInterval(timedPoll, 122029);
