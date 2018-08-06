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
    if (fileData.indexOf('AP Top 25') != -1) {
        // set error flag to false for passing sanity check
        errorFlag = false;
        // load the html into the cheerio doc
        var fullDoc = cheerio.load(fileData);
		// find the elements of which week this is (pre-season, week 1, week 2, etc)
        var blockTitleDoc = cheerio.load(fullDoc('.block-title').html()); 
		var weekName = blockTitleDoc.text().trim()
		// find the element containing the release date of the poll (Sep 7, Sep 14, etc)
		var releasedDateDoc = cheerio.load(fullDoc('[id=poll-released]').html());
		var releasedDate = releasedDateDoc.text().trim();
		releasedDate = releasedDate.replace('Poll released: ', '');
		// set the week and release date elements
		allTop25Data.weekName = weekName;
		allTop25Data.pollDate = releasedDate;
        // find the stub for the poll rankings table
        var openingThisWeekDoc = cheerio.load(fullDoc('table').html());        
        // iterate through each rank item, add each to return object	
        fullDoc('tr').each(function() {
            var rankDoc = cheerio.load(fullDoc(this).html());
			var teamHTML = rankDoc.html();
			// split out the poll rank number part
			var rankStart = teamHTML.indexOf('<body>');
			var rankEnd   = teamHTML.indexOf('<img');
			var rank      = teamHTML.substring(rankStart + 6, rankEnd);
            var tRank = Number(teamHTML.substring(rankStart + 6, rankEnd));		
			// extract team name
            var tName = rankDoc('.poll-team-name').text().trim();
			// check if name contains a first place votes part
			// if so extract it as a data point
			var tFirstPlaceVotes = 0;
			if (tName.endsWith(')')) {
				var lastPar = tName.lastIndexOf('(');
				var firstVotes = tName.substring(lastPar);
				firstVotes = firstVotes.replace('(', '').replace(')', '').trim();
				if (!isNaN(Number(firstVotes))) {
					tName = tName.substring(0, lastPar - 1).trim();
					tFirstPlaceVotes = Number(firstVotes);
				}
			}
			// extract conference name
            var tConference = rankDoc('.poll-conference').text().trim();
			// extract win-loss record, break into seperate values
			var tRecord = rankDoc('.poll-record').text().trim();	
			tRecord = tRecord.replace('Record: ', '');
			var tRecordWins = Number(tRecord.split('-')[0]);
			var tRecordLosses = Number(tRecord.split('-')[1]);
			// check previous (last week) rank
			var tPrevRank = rankDoc('.info-rank-wrap').text().trim();
			tPrevRank = Number(tPrevRank.replace('PV Rank', ''));
			// if applicable, create a rank change value
			// value is positive for increase in rank, negative for decreased rank
			var tRankChange = -1;
			if (isNaN(tPrevRank))
				tPrevRank = -1;
			else {
				tRankChange = tPrevRank - tRank;
			}			
			// get the voting points value
			var tVotes = rankDoc('.info-votes-wrap').text().trim();
			tVotes = Number(tVotes.replace('Points', '').replace(',', ''));
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
exports.getAPTop25Data = function(callback) {
    requestAPTop25HTML(callback);
}
  
//  --- the end ---
