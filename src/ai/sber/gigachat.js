const baseUrl = "https://gigachat.devices.sberbank.ru/api/v2";
const request = require('request');
const {sysError, sysInfo} = require("../../common/modules");
let token;


class sberGigaChat{
    async request(value) {
        return await new Promise( async (resolve, reject) => {

            let options = {
                'method': 'POST',
                'url': 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
                'headers': {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                insecure: true,
                rejectUnauthorized: false,
                body: JSON.stringify({
                    "model": `${process.env.API_SBER_GIGACHAT_MODEL}`,
                    "messages": [
                        {
                            "role": "user",
                            "content": `${value}`
                        }
                    ],
                    "temperature": 1,
                    "top_p": 0.1,
                    "n": 1,
                    "stream": false,
                    "max_tokens": 512,
                    "repetition_penalty": 1,
                    "update_interval": 0
                })

            };

            await request(options, async (err, response) => {
                if (err) await reject(err);
                else {
                    let result = JSON.parse(response.body);
                    if (result.status === 401) await this.getToken()
                        .then(async (data) => {
                            token = data.access_token;
                            await sysInfo(`Новый токен для Sber GigaChat AI сгенерирован.`);
                            await resolve(`Новый токен для AI сгенерирован, повторите запрос.`);
                            setTimeout(async ()=> {
                                await this.request(value);
                            }, 500);
                        })
                        .catch(async (err) => {
                            await sysError(err);
                        })
                    else await resolve(result.choices[0].message.content)
                }
            })
        })
    }

    async getToken(){
        return await new Promise( async (resolve, reject) => {
            let options = {
                'method': 'POST',
                'url': 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'RqUID': `${process.env.API_SBER_GIGACHAT_CLIENT_SECRET}`,
                    'Authorization': `Basic ${process.env.API_SBER_GIGACHAT_AUTH_BASIC}`,
                },
                insecure: true,
                rejectUnauthorized: false,
                form: {
                    'scope': `${process.env.API_SBER_GIGACHAT_SCOPE}`
                },

            };

            await request(options, async (err, response) => {
                if (err) await reject(err)
                else {
                    await resolve(JSON.parse(response.body));
                }
            })
        });
    }
}

module.exports = {sberGigaChat}
