import { get_account_info_by_name } from 'backend/riotapi';
import { get_champion_mastery } from 'backend/riotapi';
import { get_current_patch } from 'backend/riotapi';
import { get_champion_dictionary } from 'backend/riotapi';
import { updateValuesWrapper } from 'backend/googlesheets';

var summonerNameFormatted
var static_champ_list
var region
var patch

$w.onReady(function () {
    get_current_patch()
        .then((value) => {
            patch = value
        })
    $w('#button1').onClick(() => {
        registerHandlers();
    })
    $w('#input1').onKeyPress((event) => {
        if (event.key === 'Enter') {
            registerHandlers()
        }
    })
});

async function registerHandlers() {
    if ($w('#input1').value == '') {
        $w('#text22').text = 'Please enter a summoner'
    } else {
        if ($w('#dropdown1').value == '') {
            $w('#text22').text = 'Please select a region'
        } else {
            $w('#text22').text = 'Loading summoner...'

            get_champion_dictionary(patch)
                .then((champ_dictionary) => {
                    static_champ_list = champ_dictionary;
                    console.log(static_champ_list);
                })
            var masteryJSON = await getChampionMastery();
            updateValuesOnSheet(masteryJSON);
        }
    }


}

async function getChampionMastery() {
    return new Promise((resolve, reject) => {
        const summonerName = encodeURIComponent($w('#input1').value);
        region = $w('#dropdown1').value;
        var summonerID;
        get_account_info_by_name(summonerName, region)
            .then((accountInfo) => {
                console.log(accountInfo);
                summonerID = accountInfo['id'];
                summonerNameFormatted = String(accountInfo['name'])
                console.log(summonerNameFormatted)
                get_champion_mastery(summonerID, region)
                    .then((mastery) => {
                        console.log(mastery);
                        resolve(mastery)
                    })
            })
            .catch(() => {
                reject($w('#text22').text = 'Could not load summoner')
            })

    })
}

async function updateValuesOnSheet(masteryJSON) {
    var championDictionary = {}
    for (var key in static_champ_list['data']) {
        var row = static_champ_list['data'][key]
        championDictionary[row['key']] = row['id']
    }

    var champion = []
    var championLevel = []
    var championPoints = []
    var pointsUntilNextLevel = []
    var lastTimePlayed = []
    var date
    for (var i = 0; i < 155; i++) {
        champion.push('')
        championLevel.push('')
        championPoints.push('')
        pointsUntilNextLevel.push('')
        lastTimePlayed.push('')
    }
    for (var j in masteryJSON) {
        champion[j] = String(championDictionary[(String(masteryJSON[j]['championId']))])
        championLevel[j] = String(masteryJSON[j]['championLevel'])
        championPoints[j] = String(masteryJSON[j]['championPoints'])
        pointsUntilNextLevel[j] = String(masteryJSON[j]['championPointsUntilNextLevel'])
        date = new Date(masteryJSON[j]['lastPlayTime'])
        lastTimePlayed[j] = String(('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())
    }

    try {
        console.log('Updating, please wait...')
        $w('#text22').text = 'Updating, please wait...'
        var res0 = updateValuesWrapper([summonerNameFormatted], 'A2', 'COLUMNS', 'ChampionMastery');
        var res1 = updateValuesWrapper([region], 'B2', 'COLUMNS', 'ChampionMastery');
        var res2 = updateValuesWrapper(champion, 'C3:C', 'COLUMNS', 'ChampionMastery');
        var res3 = updateValuesWrapper(championLevel, 'D3:D', 'COLUMNS', 'ChampionMastery');
        var res4 = updateValuesWrapper(championPoints, 'E3:E', 'COLUMNS', 'ChampionMastery');
        var res5 = updateValuesWrapper(pointsUntilNextLevel, 'F3:F', 'COLUMNS', 'ChampionMastery');
        var res6 = await updateValuesWrapper(lastTimePlayed, 'G3:G', 'COLUMNS', 'ChampionMastery')
        //.then(() => { console.log(res0+res1+res2+res3+res4+res5+res6 + ' cells were updated'); })
        $w('#input1').value = '';
        $w('#text22').text = 'Summoner mastery updated'
    } catch (err) {
        $w('#text22').text = 'Updating sheets failed'
    }

}