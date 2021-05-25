import { updateValues } from 'backend/googlesheetsintegration';
import wixSecretsBackend from 'wix-secrets-backend';

async function getSecretSheetId(spreadsheet) {
    const id = await wixSecretsBackend.getSecret(spreadsheet);
    return id;
}

export async function updateValuesWrapper(values, range, dimension, spreadsheet) {
    try {
        //console.log('Trying to update sheets...')
        validateValues(values);
        validateRange(range);
        validateDimension(dimension);
        try {
            const sheetId = await getSecretSheetId(spreadsheet);
            //console.log(sheetId)
            const result = await updateValues(sheetId, values, range, dimension);
            //console.log(result)
            const response = result.data.updatedCells
            return response;
        } catch (err) {
            return Promise.reject('Update values failed. Info: ' + err);
        }
    } catch (validationError) {
        return Promise.reject(validationError.toString());
    }
}

function validateValues(values) {
    //console.log('Validating values...')
    for (const val of values) {
        if (typeof val !== 'string') {
            throw new Error(`Input value's type must be a string (got: ${val}, ${typeof val})`);
        }
    }
}

function validateRange(range) {
    //console.log('Validating range...')
    const regex = /([a-zA-Z0-9:]+)/g;
    const match = range.match(regex);
    if (!match || match.length !== 1 || match[0] !== range) {
        throw new Error(`Input range is invalid (got: ${range})`);
    }
}

function validateDimension(dimension) {
    //console.log('Validating dimension...')
    if (dimension !== 'ROWS' && dimension !== 'COLUMNS') {
        throw new Error(`Input dimension must be either 'ROWS' or 'COLUMNS'(got: ${dimension})`);
    }
}