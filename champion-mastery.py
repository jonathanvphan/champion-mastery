from gspread_dataframe import get_as_dataframe, set_with_dataframe
import requests
import json
import gspread
import datetime
import pandas as pd

# gets the account ID by the summoner name
def get_account_info():
    base_url = '.api.riotgames.com/lol/summoner/v4/summoners/by-name/'
    api_url = 'https://{0}{1}{2}'.format(region, base_url, summoner)
    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        return json.loads(response.content.decode('utf-8'))
    else:
        return None

# uses the account ID to get the champion mastery JSON
def get_champion_mastery(accountID):
    base_url = '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/'
    api_url = 'https://{0}{1}{2}'.format(region, base_url, accountID)
    response = requests.get(api_url, headers=headers)

    if response.status_code == 200:
        return json.loads(response.content.decode('utf-8'))
    else:
        return None

# Riot API key for authentification
api_key = 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
headers = {'X-Riot-Token' : api_key}

# grabs the current patch for Data Dragon
realms_na = requests.get('https://ddragon.leagueoflegends.com/realms/na.json')
if realms_na.status_code == 200:
    current_patch = json.loads(realms_na.content.decode('utf-8'))
else:
    print('Error getting current patch')

# Data Dragon information for champions
data_dragon = requests.get('http://ddragon.leagueoflegends.com/cdn/' + current_patch['v'] + '/data/en_US/champion.json')
if data_dragon.status_code == 200:
    static_champ_list = json.loads(data_dragon.content.decode('utf-8'))
else:
    print('Error getting Data Dragon')

# opens the spreadsheet
gc = gspread.service_account()
sh = gc.open("Champion Mastery")

# loops until no more inputs
while True:
    # gets the spreadsheet as a dataframe
    sheet1 = sh.get_worksheet(0)
    df_sheet1 = get_as_dataframe(sheet1).astype(str)
    
    while True:
        try:
            # asks for summoner name and region
            summoner = input('Summoner name: ')
            region = input('Region: ')

            # gets account info
            info = get_account_info()
            #print(info)

            # gets champion mastery for the account
            mastery = get_champion_mastery(info['id'])
            break
        except:
            print('Error retrieving account info, please retry')

    # puts the champion mastery data into an array
    champion_mastery = []
    for row in mastery:
        mastery_row = {}
        mastery_row['championId'] = row['championId']
        mastery_row['championLevel'] = row['championLevel']
        mastery_row['championPoints'] = row['championPoints']
        mastery_row['championPointsUntilNextLevel'] = row['championPointsUntilNextLevel']
        mastery_row['lastPlayTime'] = row['lastPlayTime']
        champion_mastery.append(mastery_row)
    
    # clears the spreadsheet of the last input and also associates champion names with their IDs
    champ_dict = {}
    champ_index = 1
    for key in static_champ_list['data']:
        row = static_champ_list['data'][key]
        champ_dict[row['key']] = row['id']
        df_sheet1.at[champ_index, 'Champion'] = 'nan'
        df_sheet1.at[champ_index, 'Champion Level'] = 'nan'
        df_sheet1.at[champ_index, 'Champion Points'] = 'nan'
        df_sheet1.at[champ_index, 'Points Until Next Level'] = 'nan'
        df_sheet1.at[champ_index, 'Last Time Played'] = 'nan'
        champ_index += 1
    for row in champion_mastery:
        row['champion'] = champ_dict[str(row['championId'])]

    # converts the array into a dataframe
    champion_mastery_df = pd.DataFrame(champion_mastery)

    # puts the summoner name and region into the spreadsheet dataframe
    df_sheet1.at[0, 'Summoner'] = info['name']
    df_sheet1.at[0, 'Region'] = region

    # puts the champion mastery data into the spreadsheet dataframe
    for index, row in champion_mastery_df.iterrows():
        df_sheet1.at[index+1, 'Champion'] = row['champion']
        df_sheet1.at[index+1, 'Champion Level'] = row['championLevel']
        df_sheet1.at[index+1, 'Champion Points'] = row['championPoints']
        df_sheet1.at[index+1, 'Points Until Next Level'] = row['championPointsUntilNextLevel']
        df_sheet1.at[index+1, 'Last Time Played'] = datetime.datetime.utcfromtimestamp(row['lastPlayTime']/1000).strftime('%Y-%m-%d %H:%M:%S')

    # replaces nan cells with nothing
    df_sheet1 = df_sheet1.replace('nan', '')

    # tries to upload the datasframe to the spreadsheet
    while True:
        try:
            set_with_dataframe(sheet1, df_sheet1)
            break
        except:
            print('Quota exceeded, waiting 30 seconds...')
            time.sleep(30)

    # asks user if they would like to search another summoner
    repeat = input('Would you like to search another summoner? (y/n): ')
    if repeat == 'n':
        break