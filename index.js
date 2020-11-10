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
	var allTop25Data = {
		weekName: '',
		pollDate: '',
		ranks: [ ]
	};
	var errorFlag = true;
	// sanity check that this is the ap top 25 page
	if (fileData.indexOf('AP Top 25 College Football Poll') != -1) {
	        // set error flag to false for passing sanity check
	        errorFlag = false;
        	// load the html into the cheerio doc
	        var fullDoc, $ = cheerio.load(fileData);
		// uncomment below line for HTML debug
		//console.log(fullDoc.html());

		var str = $('script')[0].children[0].data;
		str = str.match(/titanium-state'] = (.*)/)[1];
		str = JSON.parse(str);

		console.log("week");
		console.log(Object.keys(str));

		// find the elements of which week this is (pre-season, week 1, week 2, etc)
		var weekNum = str.hub.data['/ap-top-25-college-football-poll'].cards[0].pollFilters.week;
		var weekName = 'Week '+ weekNum;
		weekName = weekName.substring(0, 1).toUpperCase() +
				weekName.substring(1, weekName.length).toLowerCase();

		// find the element containing the release date of the poll (Sep 7, Sep 14, etc)
		var releasedDate = str.hub.data['/ap-top-25-college-football-poll'].cards[0].pollUpdated;
		releasedDate = new Date(releasedDate);
		releasedDate = releasedDate.toString().split(' ');
		var rdMonth = releasedDate[1];
		var rdDay = releasedDate[2];

		// set the week and release date elements
		allTop25Data.weekName = weekName;
		allTop25Data.pollDate = String(rdMonth + " " + rdDay);	
        	// find the stub for the poll rankings table
		var teams = str.hub.data['/ap-top-25-college-football-poll'].cards[0].teams;
		// iterate through each rank item, add each to return object
		teams.forEach(function(team, num) {
			console.log(num);
			if (num < 25) {
				var teamObj = {
					team_name: team.name,
					team_conference: team.conferenceName,
					rank_position: team.rank,
					rank_previous: team.lastRank,
					rank_change: team.lastRank - team.rank,
					record_wins: team.overallRecord.wins,
					record_losses: team.overallRecord.losses,
					votes_points: team.pollPoints,
					votes_firstplace: team.firstPlacePoints,
				};

				if (team.name != '')
					allTop25Data.ranks.push(teamObj);
			}
		});
	}

	// return error flag and the data
	return {error: errorFlag, data: allTop25Data};
}

// makes a call to get the HTML from the AP Top 25 NCAAF Poll front page
// uses the request package to achieve this
function requestAPTop25HTML(callback) {
	var request = require("request");
	request({ uri: "https:\/\/collegefootball.ap.org/poll" }, function(error, response, body) {
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
