const baseUrl = "https://gigachat.devices.sberbank.ru/api/v1";
const request = require('request');
const {sysError, sysInfo} = require("../../common/modules");
const fs = require("node:fs");
let token;

class sberGigaChat{

    constructor(client, interaction) {
        // this.client = client;
        // this.interaction = interaction;
    }

    async request(value) {
        return await new Promise( async (resolve, reject) => {

            let options = {
                'method': 'POST',
                'url': `${baseUrl}/chat/completions`,
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
                    else {
                        await resolve(result.choices[0].message.content)
                    }
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

    async requestImage(value){
        return await new Promise( async (resolve, reject) => {
            let options = {
                'method': 'POST',
                'url': `${baseUrl}/chat/completions`,
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
                            "content": `Нарисуй "${value}"`
                        }
                    ],
                    "temperature": 1,
                    "top_p": 0.1,
                    "n": 1,
                    "stream": false,
                    "max_tokens": 512,
                    "repetition_penalty": 1,
                    "update_interval": 0,
                    "function_call": "auto"
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
                        });
                    else {
                        // await resolve(`Запрос принят, ожидайте.`);
                        let result = JSON.parse(response.body);
                        console.log(result.choices[0].message.content);
                        let file_id = result.choices[0].message.content.split("src")[1].slice(1).split(" ")[0].replaceAll('"', "");
                        await this.getImage(file_id)
                            .then(async (image) => {
                                let tempFile = await fs.createWriteStream("test.jpg");
                                tempFile.write(image);
                                tempFile.end();
                            })
                            // .then(async image => {
                            //     let embed = new EmbedBuilder()
                            //         .setColor(embed_color)
                            //         .setTitle(value)
                            //         .setImage(image)
                            //         .setFooter({
                            //             iconURL: this.interaction.user.displayAvatarURL(),
                            //             text: `Application "Simplex" | Requested ${this.interaction.user.username}`})
                            //     await this.interaction.channel.send({ephemeral: false, embeds: [embed], fetchReply: true});
                            // })
                            // .catch(async err =>{
                            //      await sysError(err);
                            // })
                    }
                }
            });
        })
    }

    async getImage(file_id){
        return await new Promise(async (resolve, reject) => {
            let options = {
                'method': 'GET',
                'url': `${baseUrl}/files/${file_id}/content`,
                'headers': {
                    'Accept': 'image/jpg',
                    'Authorization': `Bearer ${token}`
                },
                insecure: true,
                rejectUnauthorized: false,
            };

            console.log(token)

            // Необходимо настроить получение картинки

            await request(options, async (error, response) => {
                if (error) reject(error);
                resolve(response.body);
            });
        })
    }
}

module.exports = {sberGigaChat}
