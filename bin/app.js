#!/usr/bin/env node
const loog = require('../utils/logger');
const network = require('../utils/network');
const WordTable = require('../utils/table-printer');

let app = {
    sessionID: undefined,
    username: 201600301190,
    password: 000000, //这不是我的密码，放弃吧
    u_modified: false,
    p_modified: false,
    flag: {
        day: '1234567',
        jie: '12345'
    },
    reset() {
        this.sessionID = undefined;
        this.username = '201600301190';
        this.password = '000000';
        this.u_modified = false;
        this.p_modified = false;
    },
    checkFlag() {
        flag = this.flag;
        let ok = true;
        if(isNaN(Number(flag.day)) || isNaN(Number(flag.jie))) {
            loog.error('周几和节数必须是数字');
            ok = false;
        }
        let strDay = flag.day + '';
        let strJie = flag.jie + '';
        for(let i = 0; i < strDay.length; i++) {
            let num = Number(strDay[i]);
            if(num < 0 || num > 7) {
                loog.error('周数必须是1-7之间的数字');
                ok = false;
            }
        }
        for(let i = 0; i < strJie.length; i++) {
            let num = Number(strJie[i]);
            if(num < 0 || num > 5) {
                loog.error('节数必须是1-5之间的数字');
                ok = false;
            }
        }
        return ok;
    },
    login() {
        loog.info('开始登录...')
        var _this = this;
        network.getSessionId(function(err, sessionid) {
            if(err) {
                loog.error('获取SESSIONID失败');
                return;
            } else {
                loog.info('获取SESSIONID成功...');
                _this.sessionID = sessionid;
                network.login(sessionid, _this.username, _this.password, function(err, success) {
                    if(err) {
                        loog.error('登录失败！请重新输入您的学号密码');
                        return;
                    } else {
                        loog.info('登录成功！开始获取课程...');
                        _this.getCourse(_this.flag);
                    }
                });
            }
        })        
    },
    getCourse(flag) {
        flag.day = flag.day + '';
        flag.jie = flag.jie + '';
        network.getCourses(this.sessionID, function(err, data) {
            var header = data[0];
            var body = data.slice(1);
            for(var i = 0; i < body.length; i++) {
                let qidi = flag.day.indexOf(body[i][4] + '') != -1 && flag.jie.indexOf(body[i][5] + '') != -1;
                if(!qidi) {
                    body.splice(i, 1);
                    i--;
                }
            }
            var wt = new WordTable(header, body);
            console.log(wt.string());
            console.log('课程都为你查好啦，不要翘课哦:)')
        });
    },
    run() {
        if(args[0] === '-v') {
            console.log('v1.0.0');
            return;
        }
        if(args[0] === '-h') {
            loog.info('There should be a handbook for you. But I haven\'t written it!');
            return;
        }
    
        if(args.indexOf('-u') != -1) {
            let index = args.indexOf('-u');
            this.username = args[index + 1];
            this.u_modified = true;
        }
        if(args.indexOf('-p') != -1) {
            let index = args.indexOf('-p');
            this.password = args[index + 1];
            this.p_modified = true;
        }
        if(this.p_modified ^ this.u_modified) {
            loog.error('您只指定了账号或者密码中的一项！');
            return;
        }

        if(args.indexOf('-d') != -1) {
            let index = args.indexOf('-d');
            this.flag.day = args[index + 1];
        }

        if(args.indexOf('-j') != -1) {
            let index = args.indexOf('-j');
            this.flag.jie = args[index + 1];
        }
        if(this.checkFlag()) {
            this.login();
        }
    }
}

let args = process.argv.slice(2);
app.run(args);