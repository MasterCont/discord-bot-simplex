const baseUrl = "https://gigachat.devices.sberbank.ru/api/v2";
const request = require('request');
const {sysError} = require("../../common/modules");


class sberGigaChat{
    async request(value) {
        return await new Promise( async (resolve, reject) => {

            await this.getToken()
                .then(async (data) => {

                    let options = {
                        'method': 'POST',
                        'url': 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
                        'headers': {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${data.access_token}`
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
                            await resolve(result.choices[0].message.content)
                        }
                    })

                })
                .catch(async (err) => {
                    await sysError(err);
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
