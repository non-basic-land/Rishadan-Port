var notifier = require('node-notifier');

notifier.notify({
  'title': 'Rishadan Port opens',
  'message': 'Now polling for changes',
  'sound': true
});

var request = require('request'),
    cheerio = require('cheerio');

Date.prototype.today = function () {
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

var searchPages = [];

/*
searchPages.push({
    website: 'marktplaats.nl',
    url: 'http://www.marktplaats.nl/z/hobby-en-vrije-tijd/verzamelkaartspellen-magic-the-gathering/magic-the-gathering.html?query=magic%20the%20gathering&categoryId=919&sortBy=standaard&sortOrder=decreasing',
    baseUrl: 'http://www.marktplaats.nl',
    itemSelector: '.search-result.defaultSnippet',
    titleSelector: '.mp-listing-title',
    linkSelector: 'h2.heading a'
});
*/

searchPages.push({
    website: 'marktplaats.nl',
    url: 'https://www.marktplaats.nl/l/hobby-en-vrije-tijd/verzamelkaartspellen-magic-the-gathering/q/magic+the+gathering/',
    baseUrl: 'https://www.marktplaats.nl',
    itemSelector: '.mp-Listing--list-item',
    titleSelector: '.mp-Listing-title',
    linkSelector: 'a.mp-Listing-coverLink'
});

/*
searchPages.push({
    website: '2dehands.be',
    url: 'http://www.2dehands.be/verzamelen/cardgames/magic-the-gathering/2/magic/?locale=all',
    baseUrl: 'http://www.2dehands.be',
    itemSelector: '.search-result .listed-adv-item',
    titleSelector: '.listed-item-description h3',
    linkSelector: 'a.listed-adv-item-link'
});
*/

searchPages.push({
    website: '2dehands.be',
    url: 'https://www.2dehands.be/l/hobby-en-vrije-tijd/verzamelkaartspellen-magic-the-gathering/q/magic/',
    baseUrl: 'https://www.2dehands.be',
    itemSelector: '.mp-Listing--list-item',
    titleSelector: '.mp-Listing-title',
    linkSelector: 'a.mp-Listing-coverLink'
});

/*
searchPages.push({
    website: 'mtgstocks.com',
    url: 'http://www.mtgstocks.com/interests',
    baseUrl: 'http://www.mtgstocks.com',
    itemSelector: '#interests tr',
    titleSelector: '#interests tr',
    linkSelector: 'a.screenshot'
});
*/

/*
searchPages.push({
    website: 'mtgfinance subreddit',
    url: 'https://www.reddit.com/r/mtgfinance/',
    baseUrl: 'https://www.reddit.com',
    itemSelector: '.thing',
    titleSelector: '.title a',
    linkSelector: '.title a'
});
// became a modern webapp
*/

searchPages.push({
    website: 'quietspeculation.com/',
    url: 'http://www.quietspeculation.com/',
    baseUrl: 'http://www.quietspeculation.com',
    itemSelector: '.article-wrap',
    titleSelector: 'h3',
    linkSelector: '.article-read-more a'
});

var foundResults = [];

function createLi(searchPage, titleStr, urlStr) {
    if (urlStr.indexOf('http') !== 0 && urlStr.indexOf('/') === 0) {
        urlStr = searchPage.baseUrl + urlStr;
    }
    var ul = document.getElementById("results-container");
    var liId = 'RESULTID' + ((ul.hasChildNodes()) ? ul.childNodes.length : 0);
    var li = document.createElement("li");
    li.id = liId;
    li.innerHTML = '<div>' + searchPage.website + ': <b>' + titleStr + '</b>' + ' -- Date: ' + new Date().today() + " -- Time: " + new Date().timeNow() + '</div>' +
        '<div><a href="'+urlStr+'" target="_blank">'+urlStr+'</a>' + '</div>' +
        '<div><a href="javascript:saveToFavorites(\''+liId+'\')">Opslaan in favorieten</a></div>' +
        '<div>&nbsp;</div>';
    return li;
}

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
                    ul.appendChild(createLi(searchPage, titleStr, urlStr));
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

        var hasResult = false;

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
            ul.insertBefore(createLi(searchPage, titleStr, urlStr), ul.childNodes[0]);
            foundResults.push(titleStr);

            if (titleStr.toLowerCase().indexOf('collectie') > -1 || titleStr.toLowerCase().indexOf('verzameling') > -1) {
                document.getElementById('alarm').play();
            }

            notifier.notify({
              'title': 'Arrived at ' + searchPage.website,
              'message': titleStr,
              'sound': true
            });

            hasResult = true;
        });

        if (hasResult && (searchPage.website.indexOf('quietspeculation') > -1 || searchPage.website.indexOf('mtgfinance') > -1)) {
            document.getElementById('quiet').play();
        }
    });
};

setInterval(timedPoll, 122029);

document.body.addEventListener('click', function (e) {
    document.getElementById('alarm').pause();
});

var favoritesVisible = false;

function toggleFavorites() {

    if (favoritesVisible) {
        document.getElementById('favorites-container').style.display = 'none';
        document.getElementById('favorites-link').innerHTML = 'Favorieten';
        document.getElementById('results-container').style.display = 'block';
        favoritesVisible = false;
    } else {
        document.getElementById('favorites-container').style.display = 'block'
        document.getElementById('favorites-link').innerHTML = 'Resultaten';
        document.getElementById('results-container').style.display = 'none';
        favoritesVisible = true;
    }
}

function saveToFavorites(oldLiId) {
    var oldLi = document.getElementById(oldLiId);
    var liHtml = oldLi.innerHTML;
    var ul = document.getElementById('favorites-container');
    var liId = 'FAVORITEID' + ((ul.hasChildNodes()) ? ul.childNodes.length : 0);
    var li = document.createElement('li');
    li.id = liId;
    liHtml = liHtml.replace(oldLiId, oldLiId + "','" + liId);
    liHtml = liHtml.replace('saveToFavorites', 'removeFromFavorites');
    liHtml = liHtml.replace('Opslaan in favorieten', 'Verwijderen uit favorieten');
    li.innerHTML = liHtml;
    ul.insertBefore(li, ul.childNodes[0]);
    oldLi.innerHTML = liHtml;
    // save
    var ulHtml = ul.innerHTML;
    localStorage.setItem('favorites', ulHtml);
}

function removeFromFavorites(oldLiId, newLiId) {
    var ul = document.getElementById('favorites-container');
    ul.removeChild(document.getElementById(newLiId));
    var oldLi = document.getElementById(oldLiId);
    var liHtml = oldLi.innerHTML;
    liHtml = liHtml.replace(oldLiId + "','" + newLiId, oldLiId);
    liHtml = liHtml.replace('removeFromFavorites', 'saveToFavorites');
    liHtml = liHtml.replace('Verwijderen uit favorieten', 'Opslaan in favorieten');
    oldLi.innerHTML = liHtml;
    // save
    var ulHtml = ul.innerHTML;
    localStorage.setItem('favorites', ulHtml);
}

// load
var favoritesContainerHtml = localStorage.getItem('favorites');
var favoritesContainer = document.getElementById('favorites-container');
if (favoritesContainerHtml) {
    favoritesContainer.innerHTML = favoritesContainerHtml;
}
