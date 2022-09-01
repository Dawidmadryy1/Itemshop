const fs = require("fs")
const sak = JSON.parse(fs.readFileSync(`${__dirname}/../serviceAccountKey.json`,'utf-8'))
console.log(sak)
const dotenv = `FIREBASE_CONFIG=${JSON.stringify(sak)}`
console.log(dotenv)
fs.writeFileSync(`${__dirname}/../.env`,dotenv)
