const request = require('request');
const md5 = require('js-md5');
const loog = require('./logger');
const cheerio = require('cheerio');

module.exports = {
    getSessionId(callback) {
        request({
            url: 'http://bkjwt.sdu.edu.cn/f/login',
            method: 'GET'
        }, function(err, resp, body) {
            if(resp.headers['set-cookie']) {
                var sessionid = resp.headers['set-cookie'];
                // loog.log('SESSIONID', sessionid);
                callback(null, sessionid);
            }
        })
    },
    // j_password是密码的md5值
    login(sessionid, j_username, j_password, callback) {
        // loog.log('u', j_username);
        // loog.log('p', md5(''+j_password))
        request({
            url: 'http://bkjwt.sdu.edu.cn/b/ajaxLogin',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': sessionid,
                //天坑，没有UA的话服务器会500...mmp
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:63.0) Gecko/20100101 Firefox/63.0'
            },
            form: {
                j_username: j_username,
                j_password: md5(j_password + '')
            }
        }, function(err, res, body) {
            if(err) {
                callback(err);
            } else {
                if(body == '"success"') {
                    callback(null, body);
                }
            }
        })
    },
    getCourses(sessionid, callback) {
        request({
            url: 'http://bkjwt.sdu.edu.cn/f/xk/xs/bxqkb',
            method: 'POST',
            headers: {
                'Cookie': sessionid
            }
        }, function(err, res, body) {
            if(err) {
                callback(err);
            } else {
                // loog.log('cBody', body);
                let $ = cheerio.load(body);
                let trs = $('#ysjddDataTableId').children('tbody').children('tr');
                let decodedData = [];
                trs.each(function(index, ele) {
                    let tds = [];
                    if(index === 0) {
                        tds = $(this).children('th');
                    } else {
                        tds = $(this).children('td');
                    }
                    let row = [];
                    tds.each(function(index, ele) {
                        if(index != 0 && index != 1 && index != 3 && index != 5 && index != 6)
                            row.push($(this).text());
                    })
                    decodedData.push(row);
                    // console.log(decodedData);
                });
                callback(null, decodedData);
            }
        })
    }
}