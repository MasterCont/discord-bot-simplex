const {ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder} = require('discord.js');
const play = require('play-dl')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior} = require("@discordjs/voice");
const { sysError, getTrackArtists, sendReply, sendReplyHidden, sysPrint, db, createError} = require('../common/modules');
const {YMApi, WrappedYMApi} = require("ym-api");
const api = new YMApi();
const wrapApi = new WrappedYMApi();

const queue = {};
let counter = 0;
let yt_color = "#f00f00";
class executeMusic{

    // Получаем клиента и итерацию
    constructor(client, interaction) {
        this.client = client;
        this.interaction = interaction;
        this.quene = [];
        this.connection = null;
    }

    async playMusic(author, channelID, url, title, name, resource){
        try {
            if (!voiceChannel) return {status: false, reason: 'Войдите в голосовой канал и запустите ещё раз команду.'};
            else {

                if (!connection) connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                counter++;

                await player.play(resource);
                await connection.subscribe(player);

                active_message = await interaction.channel.send(`\`${counter} / ${queue[server_id].length}\` \`${author}\`: Сейчас проигрывается "${title}" - ${name}`);

                await player.on('error', async (error) => {
                    await sendReplyHidden(interaction, `Произошла ошибка: ${error.message}`);
                    await createError(error);
                });

                await player.on(AudioPlayerStatus.Playing, async (e) => {
                    console.log('Audio player is in the Playing state!');
                    console.log(e)
                });

                await player.on(AudioPlayerStatus.Paused, async ()=> {
                    console.log('Connection is in the paused!');
                });

                await player.on(AudioPlayerStatus.AutoPaused, async ()=> {
                    console.log('Connection is in the auto paused!');
                });

                await player.on(AudioPlayerStatus.Idle, async () => {
                    // console.log("Трек завершён");
                    await queue[server_id].shift()
                    if (queue[server_id].length > 0 ) {
                        return await playNewMusic(queue[server_id][0].author, queue[server_id][0].channel, queue[server_id][0].url, queue[server_id][0].title, queue[server_id][0].name, queue[server_id][0].resource);
                    } else {
                        await interaction.channel.send(`Треки в очереди закончились.`);
                        await interaction.guild.members.me.voice.setChannel(null).catch(async err => {
                            try {await interaction.editReply({content: `Ошибка при выходе из голосового канала.`, ephemeral: true});}
                            catch (err) {interaction.channel.send(`Ошибка при выходе из голосового канала.`)}
                            await sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);
                        });
                    }
                });

                return {status: true, reason: null};
            }
        } catch (err) {
            interaction.reply({content: `Произошла ошибка: ${err.message}. Попробуйте ещё раз.`, ephemeral: true});
            await sysError(err);
        }
    }

    async addTrack(author, channel, url, title, name, resource){
        if (!queue || queue.length === 0) {
            await queue.push({author: author, channel: channel, url: url, title: title, name: name, resource: resource});
            await this.playMusic(author, channel, url, title, name, resource).then( async (data) => {
                if (data.status === true) await sendReply(this.interaction, `Добавил в очередь музыки: "${title}". Вся очередь: ${queue.length}`);
                else await sendReplyHidden(this.interaction, data.reason);
            });
        } else {
            await queue.push({author: author, channel: channel, url: url, title: title, name: name, resource: resource});
            await sendReply(this.interaction, `Добавлено в очередь: "${title}". Вся очередь: ${queue.length}`)
        }

        let sql = `UPDATE \`${process.env.MYSQL_TABLE_MUSIC_LIST}\` SET \`list\` = '${queue}' WHERE \`guild_id\` = ${this.interaction.guild.id}`;
        await db.query(sql, async (err) => {
            await createError(err);
        })
    }

    async play(voiceChannel, url){

        let sql;
        // Проверяем, есть ли в базе данных список сервера с музыкальной очередью
        sql = `SELECT * FROM \`${process.env.MYSQL_TABLE_MUSIC_LIST}\` WHERE \`guild_id\` = '${this.interaction.guild.id}'`;
        await db.query(sql, async (err, data) => {
            if (err) throw err;
            else {

                // Если в базе нет сервера, то добавляем его
                if (data.length === 0) {
                    sql = `INSERT INTO \`${process.env.MYSQL_TABLE_MUSIC_LIST}\` (\`id\`, \`guild_id\`, \`list\`, \`listening\`) VALUES (NULL, '${this.interaction.guild.id}', '[]', '0')`;
                    await db.query(sql, async (err) => {
                        if (err) throw err;
                        else {
                            // Перезапускаем скрипт
                            await this.play();
                        }
                    });

                } else {
                    // Получаем список
                    this.queue = await JSON.parse(data[0].list);

                    if (url.slice(0,8) === "https://" || url.slice(0,7) === "http://") {
                        let link = new URL(url);
                        switch(link.host) {
                            case "music.yandex.ru":
                                await (async () => {
                                    try {
                                        await api.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});
                                        await wrapApi.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});
                                        const pathname = link.pathname.split("/");
                                        if (pathname[1] === "album") {
                                            if (pathname[3] === undefined || pathname[4] === undefined) {
                                                await api.getAlbum(pathname[2], true).then(async (data) => {
                                                    for (let i = 0; i < data.trackCount; i++) {
                                                        await api.getTrack(data.volumes[0][i].id).then(async (dataTrack) => {
                                                            let new_url = `${link.origin}/${pathname[1]}/${data.id}/track/${data.volumes[0][i].id}`;
                                                            await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                                                                const resource = createAudioResource(`${new_track}.mp3`);
                                                                await this.addTrack(this.interaction.user.username, this.interaction.channel.id, new_track, dataTrack[0].title, getTrackArtists(dataTrack[0].artists), resource);
                                                            })
                                                                .catch(async () => {
                                                                let new_content = `Ошибка при добавлении в очередь. Проверьте URL-адрес и попробуйте ещё раз.`;
                                                                await sendReply(this.interaction, new_content);
                                                            });
                                                        }).catch(async () => {
                                                            await sendReplyHidden(this.interaction, `Трек не найден.`);
                                                        })
                                                    }
                                                })
                                                    .catch( async () => sendReplyHidden(this.interaction, `Альбом не найден.`));
                                            } else {
                                                await api.getTrack(pathname[4]).then(async (data) => {
                                                    let new_url = `${link.origin}/${pathname[1]}/${pathname[2]}/${pathname[3]}/${pathname[4]}`;
                                                    await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                                                        const resource = createAudioResource(`${new_track}.mp3`);
                                                        await this.addTrack(this.interaction.user.username, this.interaction.channel.id, new_track, data[0].title, getTrackArtists(data[0].artists), resource);
                                                    })
                                                        .catch(async (err) => {
                                                            await sendReplyHidden(this.interaction, `Ошибка воиспроизведения: ${err}. Проверьте URL-адрес и попробуйте ещё раз.`);
                                                        });
                                                })
                                                    .catch(async () => {
                                                        await sendReplyHidden(this.interaction, `Трек не найден.`);
                                                    });
                                            }
                                            // console.log((await api.getAlbumWithTracks(pathname[2])).volumes[0]);
                                        } else if (pathname[1] === "users") {
                                            if (pathname[4] === undefined) {
                                                await api.getUserPlaylists(pathname[2]).then(async (data) => {
                                                    // const uid = data.uid;

                                                    function getPlaylistDescription(value) {
                                                        if (value === undefined) return `Описание отсутствует`; else return `${value}`;
                                                    }
                                                    if (data.length > 1) {
                                                        let playlists = [];
                                                        for (let i = 0; i < data.length; i++) {
                                                            playlists.push({
                                                                label: data[i].title,
                                                                description: `${getPlaylistDescription(data[i].description)}`,
                                                                value: `${link.origin}/users/${data[i].owner.login}/playlists/${data[i].kind}`
                                                            });
                                                        }
                                                        const row = new ActionRowBuilder().addComponents(
                                                            new StringSelectMenuBuilder()
                                                                .setCustomId('selectYaMusicPlaylist')
                                                                .setPlaceholder('Выберите плейлист')
                                                                .setMaxValues(1)
                                                                .addOptions(playlists)
                                                        );
                                                        await this.interaction.reply({components: [row]});
                                                    }
                                                    // console.log(data);
                                                });
                                            } else {
                                                // console.log(pathname)
                                                try {
                                                    await api.getPlaylist(pathname[4], pathname[2]).then(async (data) => {
                                                        if (!voiceChannel) return await sendReplyHidden(this.interaction, 'Войдите в голосовой канал и запустите ещё раз команду.');
                                                        // console.log(data);
                                                        for (let i = 0; i < data.tracks.length; i++) {
                                                            await api.getTrack(data.tracks[i].id).then(async (dataTrack) => {
                                                                if (dataTrack[0].albums !== undefined) {
                                                                    let new_url = `${link.origin}/album/${dataTrack[0].albums[0].id}/track/${dataTrack[0].id}`;
                                                                    await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                                                                        const resource = createAudioResource(`${new_track}.mp3`);
                                                                        await this.addTrack(this.interaction.user.username, this.interaction.channel.id, new_track, dataTrack[0].title, getTrackArtists(dataTrack[0].artists), resource);
                                                                    }).catch(async (err) => {
                                                                        await sendReplyHidden(this.interaction, `Ошибка при добавлении в очередь.`);
                                                                        await createError(err);
                                                                    });
                                                                }
                                                            }).catch( async () => {
                                                                await sendReplyHidden(this.interaction, `Трек не найден.`);
                                                            });
                                                        }
                                                    });
                                                } catch (err) {
                                                    await sendReplyHidden(this.interaction, `Запрос не удался: ${err}`);
                                                    await sysError(err);
                                                }
                                            }
                                        } else {
                                            await sendReplyHidden(this.interaction, `Недействительный запрос. Проверьте URL и попробуйте ещё раз.`);
                                        }
                                        // console.log({ result });
                                    } catch (e) {
                                        // sysError(`api error ${e}`);
                                        await sendReplyHidden(this.interaction, `Ошибка при получении данных.`);
                                        await createError(e);
                                    }
                                })();
                                break;
                            case "www.youtube.com":
                            case "youtube.com":
                                let yt_info = await play.search(url, {limit: 1})
                                // console.log(yt_info)
                                if (yt_info[0] !== undefined){
                                    if (yt_info) {
                                        const stream = await play.stream(url)
                                        const resource = createAudioResource(stream.stream, {inputType: stream.type});
                                        try {await this.addTrack(this.interaction.user.username, this.interaction.channel.id, yt_info[0].url, yt_info[0].title, yt_info[0].channel.name, resource);}
                                        catch (err) {this.interaction.channel.send("Неудалось добавить в очередь музыки")}

                                    } else await sendReplyHidden(this.interaction, `Видео не найдено из результатов.`);
                                } else await sendReplyHidden(this.interaction, `Видео не найдено из результатов.`);
                                break;
                            default: return await sendReplyHidden(this.interaction, `Нет результатов.`);
                        }
                    } else {
                        let yt_info = await play.search(url, {limit: 1})
                        // console.log(yt_info)
                        if (yt_info[0] !== undefined){
                            if (yt_info) {
                                await play.stream(yt_info[0].url).then( async (data) => {
                                    const resource = createAudioResource(data.stream, {inputType: data.type});
                                    try {await this.addTrack(this.interaction.user.username, this.interaction.channel.id, yt_info[0].url, yt_info[0].title, yt_info[0].channel.name, resource);}
                                    catch (err) {this.interaction.channel.send("Неудалось добавить в очередь музыки")}
                                }).catch(err => this.interaction.channel.send(err.message));
                            } else {
                                await sendReplyHidden(this.interaction, `Видео не найдено из результатов.`);
                            }
                        } else await sendReplyHidden(this.interaction, `Видео не найдено из результатов.`);
                    }
                }
            }
        });



    }

    async skip(voiceChannel){

    }

    async stop(voiceChannel){

    }

}

module.exports = {executeMusic};