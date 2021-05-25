import { google } from 'googleapis';
import { getSecret } from 'wix-secrets-backend';

const googleSheets = google.sheets('v4').spreadsheets.values;
const scopes = {
    readWrite: ['https://www.googleapis.com/auth/spreadsheets'],
    readOnly: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
};

async function authenticateAccount(scopeType) {
    try {
        const accountSecretStr = await getSecret('velo-spreadsheet-credentials');
        const accountSecret = JSON.parse(accountSecretStr);
        const jwt = new google.auth.JWT(accountSecret.client_email, null, accountSecret.private_key, scopes[scopeType]);
        await jwt.authorize();
        google.options({ auth: jwt });
    } catch (err) {
        return Promise.reject('backend/googlesheet.js -> authenticateAccount(): Authorization Failed. Original error: ' + err);
    }
}

export async function getValues(sheetId, range) {
    const request = {
        spreadsheetId: sheetId,
        range
    };
    try {
        await authenticateAccount('readOnly');
        return await googleSheets.get(request);
    } catch (err) {
        return Promise.reject('backend/googlesheet.js -> getValues(): Read Failed. Original error: ' + err);
    }
}

export async function appendValues(sheetId, values) {
    const request = {
        spreadsheetId: sheetId,
        // The A1 notation of a range to search for a logical table of data.
        // Values are appended after the last row of the table.
        range: 'A1:A' + values.length,
        // How the input data should be interpreted.
        valueInputOption: 'RAW',
        // How the input data should be inserted.
        insertDataOption: 'INSERT_ROWS',
        resource: {
            'values': [values]
        }
    };
    try {
        await authenticateAccount('readWrite');
        return await googleSheets.append(request);
    } catch (err) {
        return Promise.reject('backend/googlesheet.js -> appendValues(): Append Failed. Original error: ' + err);
    }
}

export async function updateValues(sheetId, values, range, dimension) {
    const request = {
        spreadsheetId: sheetId,
        range,
        // How the input data should be interpreted.
        valueInputOption: 'USER_ENTERED',
        resource: {
            'values': [values],
            majorDimension: dimension
        }
    };
    try {
        await authenticateAccount('readWrite');
        return await googleSheets.update(request);
    } catch (err) {
        return Promise.reject('backend/googlesheet.js -> updateValues(): Update Failed. Original error: ' + err);
    }
}

export async function clearValues(sheetId, range) {
    const request = {
        spreadsheetId: sheetId,
        // The A1 notation of the values to clear.
        range
    };
    try {
        await authenticateAccount('readWrite');
        return await googleSheets.clear(request);
    } catch (err) {
        return Promise.reject('backend/googlesheet.js -> clearValues(): Clear Failed. Original error: ' + err);
    }
}