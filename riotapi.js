import {fetch} from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';

const api_key = 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
const url_front = 'https://'
const base_url_account_by_name = '.api.riotgames.com/lol/summoner/v4/summoners/by-name/'
const base_url_account_by_summoner_id = '.api.riotgames.com/lol/summoner/v4/summoners/'
const base_url_mastery = '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/'
const base_url_summoner_clash = '.api.riotgames.com/lol/clash/v1/players/by-summoner/'
const base_url_team_clash = '.api.riotgames.com/lol/clash/v1/teams/'
const patch_url = 'https://ddragon.leagueoflegends.com/realms/na.json'
const datadragon_url_front = 'http://ddragon.leagueoflegends.com/cdn/'
const datadragon_url_back = '/data/en_US/champion.json'

async function getSecret(secret) {
    const id = await wixSecretsBackend.getSecret(secret);
    return id;
}

export function get_account_info_by_name(summonerName, region) {
	return new Promise((resolve, reject) => {
		var api_url = url_front.concat(region, base_url_account_by_name, summonerName)
		console.log(api_url)
		var request = fetch(api_url, {
			method: 'GET',
			headers: {
				"X-Riot-Token": api_key
			}
		})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Riot Account Fetch ok')
					var account = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject("Riot Account Fetch was unsuccessful");
				}
			})
	})		
}

export function get_account_info_by_summoner_id(summonerId, region) {
	return new Promise((resolve, reject) => {
		var api_url = url_front.concat(region, base_url_account_by_summoner_id, summonerId)
		console.log(api_url)
		var request = fetch(api_url, {
			method: 'GET',
			headers: {
				"X-Riot-Token": api_key
			}
		})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Riot Account Fetch ok')
					var account = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject("Riot Account Fetch was unsuccessful");
				}
			})
	})		
}

export function get_champion_mastery(summonerID, region) {
	return new Promise((resolve, reject) => {	
		var api_url = url_front.concat(region, base_url_mastery, summonerID)
		console.log(api_url)
		var request = fetch(api_url, {
			method: 'GET',
			headers: {
				"X-Riot-Token": api_key
			}
		})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Riot Mastery Fetch ok')
					var mastery = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject("Riot Mastery Fetch was unsuccessful");
				}
			})
	})
}

export function get_summoner_clash(summonerID, region) {
	return new Promise((resolve, reject) => {	
		var api_url = url_front.concat(region, base_url_summoner_clash, summonerID)
		console.log(api_url)
		var request = fetch(api_url, {
			method: 'GET',
			headers: {
				"X-Riot-Token": api_key
			}
		})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Riot Mastery Fetch ok')
					var mastery = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject("Riot Clash Fetch was unsuccessful");
				}
			})
	})
}

export function get_team_clash(teamID, region) {
	return new Promise((resolve, reject) => {	
		var api_url = url_front.concat(region, base_url_team_clash, teamID)
		console.log(api_url)
		var request = fetch(api_url, {
			method: 'GET',
			headers: {
				"X-Riot-Token": api_key
			}
		})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Riot Mastery Fetch ok')
					var mastery = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject("Riot Clash Fetch was unsuccessful");
				}
			})
	})
}

export function get_current_patch() {
	return new Promise((resolve, reject) => {
		var api_url = patch_url
		var request = fetch(api_url, {method: 'GET'})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Current Patch Fetch ok')
					var account = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue['v'])
						})
				} else {
					console.log(httpResponse)
					reject('Current Patch Fetch was unsuccessful');
				}
			})
	})	
}

export function get_champion_dictionary(patch) {
	return new Promise((resolve, reject) => {
		var api_url = datadragon_url_front.concat(patch, datadragon_url_back)
		var request = fetch(api_url, {method: 'GET'})
			.then( (httpResponse) => {
				if (httpResponse.ok) {
					console.log('Champion Dictionary Fetch ok')
					var account = httpResponse.json()
						.then(fulfillmentValue => {
							resolve(fulfillmentValue)
						})
				} else {
					console.log(httpResponse)
					reject('Champion Dictionary Fetch was unsuccessful');
				}
			})
	})	
}