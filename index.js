/*
MIT License

Copyright (c) 2018 Adam Moses

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// parses the HTML body that the request operation received
// uses the cheerio package to achieve this
function parseTop25Data(fileData) {
    var cheerio = require("cheerio");
    // prep the return object
    var allTop25Data = { 	weekName: '',
							pollDate: '',
							ranks: [ ]
							};
    var errorFlag = true;
    // sanity check that this is the ap top 25 page
    if (fileData.indexOf('AP Top 25 College Football Poll') != -1) {
        // set error flag to false for passing sanity check
        errorFlag = false;
        // load the html into the cheerio doc
        var fullDoc = cheerio.load(fileData);
		// find the elements of which week this is (pre-season, week 1, week 2, etc)
        var blockTitleDoc = cheerio.load(fullDoc('[class=c0142]').html()); 
		var weekName = blockTitleDoc.text().trim();
		weekName = weekName.substring(0, 1).toUpperCase() +
					weekName.substring(1, weekName.length).toLowerCase();
		// find the element containing the release date of the poll (Sep 7, Sep 14, etc)
		var releasedDateDoc = cheerio.load(fullDoc('[class=c0144]').html());
		var releasedDate = releasedDateDoc.text().trim();
		releasedDate = releasedDate.replace('Released ', '').trim();
		var rdMonth = releasedDate.split(' ')[0].substring(0, 3);
		var rdDay = releasedDate.split(' ')[1];
		// set the week and release date elements
		allTop25Data.weekName = weekName;
		allTop25Data.pollDate = String(rdMonth + " " + rdDay);	
        // find the stub for the poll rankings table
        var openingThisWeekDoc = cheerio.load(fullDoc('table').html());   
        // iterate through each rank item, add each to return object
        fullDoc('tr').each(function() {
            var rankDoc = cheerio.load(fullDoc(this).html(), {normalizeWhitespace: false, xmlMode: true });
			var teamHTML = rankDoc.html();
			var itemIndex = 0;
			var tRank = 0;
			var tFullTeam = String();
			var tName = String();
			var tPrevRank = -1;
            var tRankChange = 0;			
			var tConference = String();
			var tVotesString = String();
			var tVotes = 0;
			var tFirstPlaceVotes = 0;
			var tRecordWins = 0;
			var tRecordLosses = 0;
			rankDoc('td').each(function() {
				var tdDoc = cheerio.load(rankDoc(this).html(), {normalizeWhitespace: false, xmlMode: true });
				var tdHTML = tdDoc.html();
				var tdTEXT = tdDoc.text().trim()
				// extract team rank
				if (itemIndex == 0) 
					tRank = Number(tdTEXT);
				// extract team name
				if (itemIndex == 2) {					
					tFullTeam = tdTEXT;
					tName = tFullTeam.split('(')[0].trim();
					// extract win-loss record, break into seperate values
					var tRecords = tFullTeam.split('(')[1].trim();
					tRecords = tRecords.replace(')', '');
					tRecordWins = Number(tRecords.split('-')[0]);
					tRecordLosses = Number(tRecords.split('-')[1]);					
				}
				// check previous (last week) rank
				if (itemIndex == 3) {
					tPrevRank = Number(tdTEXT);
					//consol
					if (isNaN(tPrevRank)) {
						tPrevRank = -1;
					}
					else {
						if (tPrevRank > 0) {
							// check rank change
							tRankChange = tPrevRank - tRank;
						}
						else
							tPrevRank = -1;
					}
				}
				// extract conference name				
				if (itemIndex == 4)
					tConference = tdTEXT;
				// extract votes
				if (itemIndex == 6) {
					tVotesString = tdTEXT;
					tVotesString = tVotesString.replace(',', '');
					tVotes = Number(tVotesString);
				}
				// iterate index
				itemIndex = itemIndex + 1;
			});
			// create a team data object for all values
            var teamObj = { 
                team_name: tName, 
                team_conference: tConference,
                rank_position: tRank, 				
				rank_previous: tPrevRank,
				rank_change: tRankChange,
				record_wins: tRecordWins,
				record_losses: tRecordLosses,
				votes_points: tVotes,
				votes_firstplace: tFirstPlaceVotes,
            };			
			// add team object to data list
            if (tName != '')
                allTop25Data.ranks.push(teamObj);
        });	
	}
    // return error flag and the data  
    return {error: errorFlag, data: allTop25Data};	
}

// makes a call to get the HTML from the AP Top 25 NCAAF Poll front page
// uses the request package to achieve this
function requestAPTop25HTML(callback) {
    var request = require("request");
    request({ uri: "https://collegefootball.ap.org/poll" }, 
        function(error, response, body) {
            if (!error) {
                var parsedData = parseTop25Data(body);
				// if no error return false error and the data
                if (parsedData.error == false)
                    callback(false, parsedData.data);
				// otherwise return true error and null data
                else
                    callback(true, null);
            }
			// if error on request return true error and null data
            else {
                callback(true, null);
            }
        });
}

// the export function exposed via the package
// uses a callback since the request call itself is asynchronous
exports.getAPTop25NCAAFRankingsData = function(callback) {
    requestAPTop25HTML(callback);
}
 
//  --- the end ---
