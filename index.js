const express = require('express')

const {google} = require('googleapis')

const app = express()
app.use(express.json())

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});

app.listen(9999, (req, res) => console.log('running on 9999'))



app.get('/hcheck' , (req,res)=>{
    console.log('health checked')
    res.sendStatus(200)
  })


app.post('/', async(req, res) => {

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient()

    const googleSheets = google.sheets({version: "v4", auth: client})

    const {spreadsheetId, sheetName} = req.body

    const metaData = await googleSheets.spreadsheets.get({
        auth, 
        spreadsheetId,
    })

    // Read rows

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: sheetName+"!B:B",
    })

    const rowValues = getRows.data.values
    const rows = rowValues.length
    const range = sheetName+"!B"+(rows+1)+":B9999"   

    

    const {entryDate,  entryName, entryContactPreference, entryEmail, entryPhone, entryFGTS} = req.body

    const append =  await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        responseValueRenderOption: 'FORMULA',
        resource: {
            values: [
                [entryDate , entryName, entryContactPreference, entryEmail, entryPhone, entryFGTS]
            ]
        }
    })   

    res.send(append.data.values).status(200)
  

    
})
