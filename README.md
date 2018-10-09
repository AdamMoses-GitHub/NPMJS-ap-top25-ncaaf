## About

This package will retrieve the most recent AP Top 25 Rankings for NCAA College Football.

This data is taken from the official AP Top 25 website, whose URL is **https://collegefootball.ap.org/poll**.

The information returned includes rank, team name and conference, win/loss record, previous rank and rank change, and voting points and first place votes. Some of these values are applicable only in certain circumstances.

## Installation

```
npm install ap-top25-ncaaf
```

## Usage

There is only one method to this package: ```getAPTop25NCAAFRankingsData(callback)```

This method requires the use of a callback, which can be specified or anonymous. The callback has two parameters in the form of ```function(error, data)```.

If there was an error, like failed HTML request or bad parsing, **error** will be true and **data** will be **null**. Otherwise, **error** will be false and **data** will be a javascript object. 

The **data** object has three keys: **weekName**, **pollDate**, **ranks**.

**weekName** contains the week of the season of the poll, like "Pre-Season", "Week 1", "Week 5", etc. Will always be a string.

**pollDate** the release date of the poll, like "Sep 7", "Oct 14", "Oct 21", etc. Will always be a string. This is usually a Sunday or a Monday.

The **ranks** item is a list of team objects, of which there will be 25 entries, one for each of the Top 25 ranks. The list can be expected to be in order of the ranks, 1 to 25, 1 being first, next 2, up to 25, however checking this or sorting based on the **rank_position** key may be useful.

Below is a breakout of the key/data elements of the team objects.

- **team_name** : The name of the team, i.e. "Virginia Tech", "Alabama", "USC". Note that this will be as listed on the AP Poll site so it acronyms and/or shorthand usage may vary. Always a string.
- **team_conference** : The conference the team is in, i.e. "ACC", "SEC", "Big 12". Always a string.
- **rank_position** : The rank of the team in the poll, 1 is best, 25 is worst. Always an integer.
- **rank_previous** : The rank of the team in the previous week. If a team was unranked last week this will be a value of -1. Always an integer.
- **rank_change** : The change in rank from last week to this week. If a teams rank is unchanged or it is newly ranked it will be 0. If it fell in rank position it will be a negative number, i.e. if was 6th place and is now 9th place this value will be -3. If it rose in rank position it will be a positive number, i.e. if it was 12th place and is now 8th place this value will be 4. Always an integer.
- **record_wins** : The number of team wins. This value is for the season, not within conference. Always an integer.
- **record_losses** : The number of team losses. This value is for the season, not within conference. Always an integer.
- **votes_points** : The number voting points the team received to earn their rank. When voting, the AP voting officials vote in a ranked order, 25 points for 1st place, 24 for 2nd place, 1 point for 25th place, etc. This value reflects this point system total for all the voting officials. Always an integer.
- **votes_firstplace** : The number of 1st place votes the team received. Likely most teams not in the top 4 will not have any 1st place votes and this value will be 0. Always an integer.

Examine the usage and data return examples for best results.

## Usage Example

```javascript
// Usage example of ap-top25-ncaaf package
// See https://www.npmjs.com/package/ap-top25-ncaaf

var aptop25ncaaf = require('ap-top25-ncaaf');

console.log('Usage example of the ap-top25-ncaaf package.')

aptop25ncaaf.getAPTop25NCAAFRankingsData( function(error, data) {
        if (!error) {
            console.log(JSON.stringify(data, null, 2));      
        }
        else {
            console.log('Some error occured.');
        }
    });
```

## Data Return Example 

```javascript
{
  "weekName": "Final",
  "pollDate": "Jan 9",
  "ranks": [
    {
      "team_name": "Alabama",
      "team_conference": "SEC",
      "rank_position": 1,
      "rank_previous": 4,
      "rank_change": 3,
      "record_wins": 13,
      "record_losses": 1,
      "votes_points": 1521,
      "votes_firstplace": 57
    },
    {
      "team_name": "Georgia",
      "team_conference": "SEC",
      "rank_position": 2,
      "rank_previous": 3,
      "rank_change": 1,
      "record_wins": 13,
      "record_losses": 2,
      "votes_points": 1454,
      "votes_firstplace": 0
    },
    {
      "team_name": "Oklahoma",
      "team_conference": "Big 12",
      "rank_position": 3,
      "rank_previous": 2,
      "rank_change": -1,
      "record_wins": 12,
      "record_losses": 2,
      "votes_points": 1374,
      "votes_firstplace": 0
    },
    {
      "team_name": "Clemson",
      "team_conference": "ACC",
      "rank_position": 4,
      "rank_previous": 1,
      "rank_change": -3,
      "record_wins": 12,
      "record_losses": 2,
      "votes_points": 1292,
      "votes_firstplace": 0
    },
    {
      "team_name": "Ohio State",
      "team_conference": "Big Ten",
      "rank_position": 5,
      "rank_previous": 5,
      "rank_change": 0,
      "record_wins": 12,
      "record_losses": 2,
      "votes_points": 1286,
      "votes_firstplace": 0
    },
    {
      "team_name": "UCF",
      "team_conference": "The American",
      "rank_position": 6,
      "rank_previous": 10,
      "rank_change": 4,
      "record_wins": 13,
      "record_losses": 0,
      "votes_points": 1248,
      "votes_firstplace": 4
    },
    {
      "team_name": "Wisconsin",
      "team_conference": "Big Ten",
      "rank_position": 7,
      "rank_previous": 6,
      "rank_change": -1,
      "record_wins": 13,
      "record_losses": 1,
      "votes_points": 1194,
      "votes_firstplace": 0
    },
    {
      "team_name": "Penn State",
      "team_conference": "Big Ten",
      "rank_position": 8,
      "rank_previous": 9,
      "rank_change": 1,
      "record_wins": 11,
      "record_losses": 2,
      "votes_points": 1120,
      "votes_firstplace": 0
    },
    {
      "team_name": "TCU",
      "team_conference": "Big 12",
      "rank_position": 9,
      "rank_previous": 13,
      "rank_change": 4,
      "record_wins": 11,
      "record_losses": 3,
      "votes_points": 974,
      "votes_firstplace": 0
    },
    {
      "team_name": "Auburn",
      "team_conference": "SEC",
      "rank_position": 10,
      "rank_previous": 7,
      "rank_change": -3,
      "record_wins": 10,
      "record_losses": 4,
      "votes_points": 917,
      "votes_firstplace": 0
    },
    {
      "team_name": "Notre Dame",
      "team_conference": "Division I FBS Independents",
      "rank_position": 11,
      "rank_previous": 14,
      "rank_change": 3,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 857,
      "votes_firstplace": 0
    },
    {
      "team_name": "USC",
      "team_conference": "Pac-12",
      "rank_position": 12,
      "rank_previous": 8,
      "rank_change": -4,
      "record_wins": 11,
      "record_losses": 3,
      "votes_points": 839,
      "votes_firstplace": 0
    },
    {
      "team_name": "Miami (FL)",
      "team_conference": "ACC",
      "rank_position": 13,
      "rank_previous": 11,
      "rank_change": -2,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 769,
      "votes_firstplace": 0
    },
    {
      "team_name": "Oklahoma State",
      "team_conference": "Big 12",
      "rank_position": 14,
      "rank_previous": 17,
      "rank_change": 3,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 758,
      "votes_firstplace": 0
    },
    {
      "team_name": "Michigan State",
      "team_conference": "Big Ten",
      "rank_position": 15,
      "rank_previous": 18,
      "rank_change": 3,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 705,
      "votes_firstplace": 0
    },
    {
      "team_name": "Washington",
      "team_conference": "Pac-12",
      "rank_position": 16,
      "rank_previous": 12,
      "rank_change": -4,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 668,
      "votes_firstplace": 0
    },
    {
      "team_name": "Northwestern",
      "team_conference": "Big Ten",
      "rank_position": 17,
      "rank_previous": 20,
      "rank_change": 3,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 528,
      "votes_firstplace": 0
    },
    {
      "team_name": "LSU",
      "team_conference": "SEC",
      "rank_position": 18,
      "rank_previous": 16,
      "rank_change": -2,
      "record_wins": 9,
      "record_losses": 4,
      "votes_points": 368,
      "votes_firstplace": 0
    },
    {
      "team_name": "Mississippi State",
      "team_conference": "SEC",
      "rank_position": 19,
      "rank_previous": 24,
      "rank_change": 5,
      "record_wins": 9,
      "record_losses": 4,
      "votes_points": 359,
      "votes_firstplace": 0
    },
    {
      "team_name": "Stanford",
      "team_conference": "Pac-12",
      "rank_position": 20,
      "rank_previous": 15,
      "rank_change": -5,
      "record_wins": 9,
      "record_losses": 5,
      "votes_points": 336,
      "votes_firstplace": 0
    },
    {
      "team_name": "South Florida",
      "team_conference": "The American",
      "rank_position": 21,
      "rank_previous": 23,
      "rank_change": 2,
      "record_wins": 10,
      "record_losses": 2,
      "votes_points": 267,
      "votes_firstplace": 0
    },
    {
      "team_name": "Boise State",
      "team_conference": "Mountain West",
      "rank_position": 22,
      "rank_previous": 25,
      "rank_change": 3,
      "record_wins": 11,
      "record_losses": 3,
      "votes_points": 251,
      "votes_firstplace": 0
    },
    {
      "team_name": "North Carolina State",
      "team_conference": "ACC",
      "rank_position": 23,
      "rank_previous": -1,
      "rank_change": -1,
      "record_wins": 9,
      "record_losses": 4,
      "votes_points": 232,
      "votes_firstplace": 0
    },
    {
      "team_name": "Virginia Tech",
      "team_conference": "ACC",
      "rank_position": 24,
      "rank_previous": 22,
      "rank_change": -2,
      "record_wins": 9,
      "record_losses": 4,
      "votes_points": 126,
      "votes_firstplace": 0
    },
    {
      "team_name": "Memphis",
      "team_conference": "The American",
      "rank_position": 25,
      "rank_previous": 19,
      "rank_change": -6,
      "record_wins": 10,
      "record_losses": 3,
      "votes_points": 119,
      "votes_firstplace": 0
    }
  ]
}
```



