var request = require('request');
var cheerio = require('cheerio')
var _ = require('lodash')
var fs = require('fs');
let uids = fs.readFileSync('list_uid.txt').toString().split('\r\n')
let uids_scaned = fs.readFileSync('list_uid_scaned.txt').toString()
let headers = {
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Referer': 'http://izfabo.com/infouid/?tk=100012274605386^&add=checkinfo',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Cookie': 'PHPSESSID=tc0t8hi842v1kdj3mbdt7dv5m3; _ga=GA1.2.835735398.1526179118; __cfduid=d17a8afa859e8c3704d86a844cc9a72c81526369347; _gid=GA1.2.1353304028.1529330154; profile_id=9029; email=tgdd76214^%^40gmail.com; account_id=3826; special=EAAAAUaZA8jlABALcZAQn4hoLJeKMewgCN8g3MWsmtrrKZACoIajf9vSfLUdxC1naUCuVVBAIhSYyEEQAzzemWLxadf1BB7YorS9osmzJcYr7JYhEcOISmOTurLh7ZCCpCKL0Ci7Pr81YZAlG1uaGC60p7gJXwCUea1YJOKKdZAxgZDZD'
};

let arrUIDs = _.chunk(uids, 15)
start()
async function start() {
    for (let i = 0; i < arrUIDs.length; i++) {
        let arrUID = arrUIDs[i]
        console.log('Getting ', arrUID)
        let arrResult = await getByArrUID(arrUID)
        fs.appendFileSync('result/phone_friend.txt', arrResult.join('\n') + '\n')
        console.log(i, arrUIDs.length, arrResult.length, 'Saved')
    }
}

function getByArrUID(arrUID) {
    let dem = 0
    let arrResult = []
    return new Promise((resolve, reject) => {
        arrUID.forEach(async (uid, index) => {
            if (uids_scaned.includes(uid)) {
                console.log(uid + ' is scaned')
                dem++
                if (dem === arrUID.length) {
                    resolve(arrResult)
                }
            } else {
                let data = await getByUID(uid)
                if (data) {
                    arrResult = arrResult.concat(data)
                    dem++
                    if (dem === arrUID.length) {
                        resolve(arrResult)
                    }
                } else {
                    dem++
                    if (dem === arrUID.length) {
                        resolve(arrResult)
                    }
                }
            }
        });
    })
}
function getByUID(uid) {
    let options = {
        url: 'http://izfabo.com/infouid/?tk=' + uid + '&add=checkinfo',
        headers: headers
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                let arrResult = []
                let $ = cheerio.load(body)
                let items = $('#table1').first().find('tr')
                if (items.length) {
                    items.each(function (i, ele) {
                        let datas = $(ele).find('td')
                        let uid = $(datas[1]).text()
                        let phone = $(datas[6]).text()
                        if (phone != '__') {
                            arrResult.push(uid + '_' + phone)
                        }
                        if (i + 1 == items.length && arrResult.length) {
                            // console.log(arrResult.length)
                            resolve(arrResult)
                        }
                    })
                } else {
                    console.log(uid, 'Fail', 'Status code: ' + response.statusCode)
                    resolve(0)
                }
            } else {
                console.log(response.statusCode, 'Loi cmnr' + error)
            }
        });
    })
}



