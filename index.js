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
        var blockTitleDoc = cheerio.load(fullDoc('[class=page-header]').html()); 
		var weekName = blockTitleDoc.text().trim()
        weekName = weekName.replace('AP Top 25 Poll - ', '').trim();
		// find the element containing the release date of the poll (Sep 7, Sep 14, etc)
		var releasedDateDoc = cheerio.load(fullDoc('[class=poll-released]').html());
		var releasedDate = releasedDateDoc.text().trim();
		releasedDate = releasedDate.replace('Poll Released: ', '').trim();
		// set the week and release date elements
		allTop25Data.weekName = weekName;
		allTop25Data.pollDate = releasedDate;
        // find the stub for the poll rankings table
        var openingThisWeekDoc = cheerio.load(fullDoc('table').html());        
        // iterate through each rank item, add each to return object	
        fullDoc('tr').each(function() {
            var rankDoc = cheerio.load(fullDoc(this).html(), {normalizeWhitespace: false, xmlMode: true });
			var teamHTML = rankDoc.html();
			// extract team rank
            var tRank = Number(rankDoc('[class=trank]').text().trim());
			// extract team name
            var tName = rankDoc('[class=tname]').text().trim();
				// extract conference name
            var tConference = rankDoc('[class=tconf]').text().trim();
			// extract win-loss record, break into seperate values
			var tRecord = rankDoc('[class=ovr-rec]').text().trim();	
			var tRecordWins = Number(tRecord.split('-')[0]);
			var tRecordLosses = Number(tRecord.split('-')[1]);
			// check previous (last week) rank
            var tChangeLoc1 = teamHTML.indexOf('class="trend');
            var tChangeLoc2 = teamHTML.indexOf('</td>', tChangeLoc1);
            var tChangeArrow = teamHTML.substring(tChangeLoc1, tChangeLoc2);
            var tChangeLoc3 = tChangeArrow.lastIndexOf('>');
            var tChangeVal = tChangeArrow.substring(tChangeLoc3 + 1, tChangeLoc3 + 3).trim();
            var tRankChange = 0;
            if (!isNaN(Number(tChangeVal))) {
                tRankChange = Number(tChangeVal);
                if (tChangeArrow.includes('down'))
                    tRankChange = tRankChange * -1;
            }
            var tPrevRank = tRank;
            if (tRankChange != 0)
                tPrevRank = tPrevRank + tRankChange;
			// get the voting points value
			var tVotes = rankDoc('[class=tpoints]').text().trim();
            tVotes = tVotes.replace(',', '');
            // check if votes contains first place votes
			// if so extract it seperately
            // otherwise just keep votes
			var tFirstPlaceVotes = 0;
			if (tVotes.endsWith(')')) {
				var fullVotes = tVotes.replace('(', '-').replace(')', '').trim();
                tVotes = Number(fullVotes.split('-')[0]);
                tFirstPlaceVotes = Number(fullVotes.split('-')[1]);
			}
            else
                tVotes = Number(tVotes);
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
exports.getAPTop25Data = function(callback) {
    requestAPTop25HTML(callback);
}
 
//  --- the end ---
