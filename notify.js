var notifier = require('node-notifier');

notifier.notify({
  'title': 'Rishadan Port opens',
  'message': 'Now polling for changes',
  'sound': true
});

var request = require('request'),
    cheerio = require('cheerio');

var searchUrl = 'http://www.marktplaats.nl/z/hobby-en-vrije-tijd/verzamelkaartspellen-magic-the-gathering/magic-the-gathering.html?query=magic%20the%20gathering&categoryId=919&sortBy=standaard&sortOrder=decreasing';

var foundResults = [];

function initialPoll() {
    request(searchUrl, function (error, response, body) {
        var $ = cheerio.load(body);

        $('.search-result.defaultSnippet').each(function () {
            var titleStr = $(this).find('.mp-listing-title').text();
            var ul = document.getElementById("results-container");
            var li = document.createElement("li");
            li.innerHTML = '<a target="_blank" href="' + $(this).attr('data-url') + '">' + titleStr + '</a>';
            ul.appendChild(li);
            foundResults.push(titleStr);
        });
    })
}

initialPoll();

function timedPoll() {
    request(searchUrl, function (error, response, body) {
        var $ = cheerio.load(body);

        $('.search-result.defaultSnippet').each(function () {
            var titleStr = $(this).find('.mp-listing-title').text();
            for (var s = 0; s < foundResults.length; s++) {
                if (foundResults[s] == titleStr) {
                    return;
                }
            }
            var ul = document.getElementById("results-container");
            var li = document.createElement("li");
            li.innerHTML = '<a target="_blank" href="' + $(this).attr('data-url') + '">' + titleStr + '</a>';
            ul.insertBefore(li, ul.childNodes[0]);
            foundResults.push(titleStr);

            notifier.notify({
              'title': 'Arrived at Rishadan Port',
              'message': titleStr,
              'sound': true
            });
        });
    })
};

setInterval(timedPoll, 155000);
