const {ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder} = require('discord.js');
const play= require('play-dl')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior} = require("@discordjs/voice");
const { sysError, getTrackArtists, sendReply, sendReplyHidden, createError, send} = require('../common/modules');
const {YMApi, WrappedYMApi} = require("ym-api");
const api = new YMApi();
const wrapApi = new WrappedYMApi();

const queue = {};
let yt_color = "#f00f00";
async function removeLastValueFromQueue(arr) {arr.shift();}

async function executeMusic(command, interaction, voiceChannel, request){
    let author = {name: interaction.user.username, icon_url: interaction.user.displayAvatarURL()};
    let server_id = `${interaction.guild.id}`;
    if (queue[server_id] === undefined) queue[server_id] = [];
    const player = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Play}});

    async function playNewMusic(content, resource, title, color, fields, author, footer, thumbnali_url, update_quene){
        try {
            if (!voiceChannel) return sendReplyHidden(interaction, 'Войдите в голосовой канал и запустите ещё раз команду.');
            // let new_field = {name: fields.name, value: `Треков в очереди: ${queue[server_id].length}`};
            // console.log(content, resource, title, color, fields, author, footer, thumbnali_url, update_quene)

            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });

            player.play(resource);
            connection.subscribe(player);

            const embed = new EmbedBuilder();
            embed.setTitle(title);
            embed.setColor(color);
            embed.setAuthor({name: `${author.name}`, iconURL: author.icon_url});
            embed.setFooter({text: `${footer.text}`, iconURL: footer.icon_url});
            embed.setThumbnail(queue[server_id][0].thumbnali_url);

            if (update_quene !== false) {
              embed.setFields({name: `${queue[server_id][0].fields.name}`, value: `Треков в очереди: ${queue[server_id].length}`});
              embed.setThumbnail(queue[server_id][0].thumbnali_url);
              // await new send(interaction).embed(embed);
              return {status: true, reason: null};
            } else embed.setFields({name: `${newfield.name}`, value: `Треков в очереди: ${queue[server_id].length}`});

            await new send(interaction).embed(embed)
                .catch(async (err) => {
                    await createError(err);
                });

            player.on('error', async (error) => {
                // interaction.reply({content: `Произошла ошибка: ${error.message}`, ephemeral: true});
                await createError(error);
              });
        
              player.on(AudioPlayerStatus.Idle, async () => {
                await removeLastValueFromQueue(queue[server_id]);
                  if (queue[server_id].length > 0 ) {
                    await playNewMusic(queue[server_id][0].content, queue[server_id][0].resource, queue[server_id][0].title, queue[server_id][0].color, queue[server_id][0].fields, queue[server_id][0].author, queue[server_id][0].footer, thumbnali_url, false);
                  } else {
                    await sendReply(interaction, `Треки закончились.`);
                    await interaction.guild.members.me.voice.setChannel(null).catch(err => {sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);});
                  }
              });
        
              return {status: true, reason: null};
    
        } catch (error) { 
            await sendReplyHidden(interaction, `Произошла ошибка: ${error}. Попробуйте ещё раз.`);
            await createError(error);
        }
    }

    async function addNewTrack(content, resource, title, color, fields, author, footer, thumbnali_url){
        try {
          let obj = {content: content, resource: resource, title: title, color: color, fields: fields, author: author, footer: footer, thumbnali_url: thumbnali_url, update_quene: false};
            if (!queue[server_id] || queue[server_id].length === 0) {
                await queue[server_id].push(obj);
                await playNewMusic(content, resource, title, color, fields, author, footer, thumbnali_url, false).then((data) => {
                  // if (data.status != true) sendReplyHidden(interaction, data.reason);
                }).catch(async (error) => {
                  await sysError(`Не удалось воиспроизвести музыку: ` + error);
                  await createError(error);
                });
              } else {
                await queue[server_id].push(obj);
              }

        } catch (error) {
            // sendReplyHidden(interaction, `Произошла ошибка: ${error}. Попробуйте ещё раз.`);
            await createError(error);
        }
    }

    if (command === 'play') {
      if (request.slice(0,8) === "https://" || request.slice(0,7) === "http://") {
      let link = new URL(request);
      switch(link.host) {
        case "music.yandex.ru":
          let embed_color = `#ffdb4d`;
          console.log("Поиск Яндекс Музыки по ссылке");
          let footer = {text: `Яндекс Музыка`, icon_url: `https://img.icons8.com/?size=32&id=GcHAhJmJIDHm&format=png`}
          // console.log(author, footer)
            try {
              await api.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});
              await wrapApi.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});
              // console.log("Инициализировано Yandex Music API");
              const pathname = link.pathname.split("/");
              if (pathname[1] === "album") {
                // console.log("Поиск альбома.")
                if (pathname[3] === undefined || pathname[4] === undefined) {
                  // console.log("Трек не указан.");
                  await api.getAlbum(pathname[2], true).then( async (data) => {
                    for (let i = 0; i < data.trackCount; i++) {
                      await api.getTrack(data.volumes[0][i].id).then(async (dataTrack) => {
                        let new_url = `${link.origin}/${pathname[1]}/${data.id}/track/${data.volumes[0][i].id}`;
                        await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                          const resource = createAudioResource(`${new_track}.mp3`);
                          let fields = {name: `Сейчас играет: ${dataTrack[0].title} - ${getTrackArtists(dataTrack[0].artists)}`};
                          let thumbnali_url = `${link.origin}${dataTrack[0].albums[0].ogImage.slice(0, -2)}100x100`;
                          await addNewTrack(null, resource, dataTrack[0].title, embed_color, fields.name, author, footer, thumbnali_url);
                        }).catch(async (err) => {
                          let new_content = `Ошибка при добавлении в очередь. Проверьте URL-адрес и попробуйте ещё раз.`;
                          await sendReplyHidden(interaction, new_content).catch(async (err) => {
                            await interaction.editReply({content: new_content, ephemeral: true}).catch((err) => sysError(err));
                            await createError(err);
                          });
                          await createError(err);
                        });
                      }).catch(async (err) => {
                          await sendReplyHidden(interaction, `Трек не найден.`);
                        await createError(err);
                      })
                    }
                  })
                      .catch(async () => {
                      await sendReplyHidden(interaction, `Альбом не найден.`);
                  });
                } else {
                  // console.log("Трек указан.");
                  await api.getTrack(pathname[4]).then(async (data) => {
                    let new_url = `${link.origin}/${pathname[1]}/${pathname[2]}/${pathname[3]}/${pathname[4]}`;
                    await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                    const resource = createAudioResource(`${new_track}.mp3`);
                    let fields = {name: `Сейчас играет: ${data[0].title} - ${getTrackArtists(data[0].artists)}`};
                    let thumbnali_url = `${link.protocol}//${data[0].albums[0].ogImage.slice(0, -2)}100x100`;
                    await addNewTrack(null, resource, data[0].title, embed_color, fields, author, footer, thumbnali_url);
                    }).catch(async (err) => {
                        await sendReplyHidden(interaction, `Ошибка воиспроизведения: ${err}. Проверьте URL-адрес и попробуйте ещё раз.`);
                    });
                  }).catch(async () => {
                      await sendReplyHidden(interaction, `Трек не найден.`);
                  });
                }
                // console.log((await api.getAlbumWithTracks(pathname[2])).volumes[0]);
              } else if (pathname[1] === "users") {
                console.log("Поиск плейлиста.")
                if (pathname[4] === undefined) {
                  await api.getUserPlaylists(pathname[2]).then( async (data) => {
                    // const uid = data.uid;
                    function getPlaylistDescription(value) {if (value === undefined) return `Описание отсутствует`; else return `${value}`;};
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
                      await interaction.reply({components: [row]});
                    } 
                    // console.log(data);
                  });
                 } else {
                  // console.log(pathname)
                  try {
                    await api.getPlaylist(pathname[4], pathname[2]).then( async (data) => {
                      if (!voiceChannel) return sendReplyHidden(interaction, 'Войдите в голосовой канал и запустите ещё раз команду.');
                      // console.log(data);
                      for (let i = 0; i < data.tracks.length; i++) {
                        await api.getTrack(data.tracks[i].id).then(async (dataTrack) => {
                          if (dataTrack[0].albums !== undefined) {
                            let new_url = `${link.origin}/album/${dataTrack[0].albums[0].id}/track/${dataTrack[0].id}`;
                            await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                              const resource = createAudioResource(`${new_track}.mp3`);
                              let fields = {name: `Сейчас играет: ${dataTrack[0].title} - ${getTrackArtists(dataTrack[0].artists)}`, value: `Треков в очереди: ${queue[server_id].length}`};
                              let thumbnali_url = `${link.protocol}//${dataTrack[0].albums[0].ogImage.slice(0, -2)}100x100`;
                              await addNewTrack(null, resource, `Плейлист: "${data.title}"`, embed_color, fields, author, footer, thumbnali_url);
                            }).catch(async (err) => {
                              let new_content = `Ошибка при добавлении в очередь.`;
                              await sendReplyHidden(`${i}: ${new_content}`);
                              await createError(err);
                            });
                          }
                        }).catch ( async () => {
                          let new_content = `Трек №${data.tracks[i].id} не найден.`;
                          await sendReply(interaction, new_content);
                        });
                      }
                    });
                  } catch (err) {
                      await sendReplyHidden(interaction, `Запрос не удался: ${err}`)
                      await createError(err);
                  }
                 }
              } else {
                  await sendReplyHidden(interaction, `Недействительный запрос. Проверьте URL и попробуйте ещё раз.`);
              }
              // console.log({ result });
            } catch (err) {
                  await sendReplyHidden(interaction, `Ошибка при получении данных.`);
                  await createError(err);
            }
        break;
        case "www.youtube.com":
        case "youtube.com":
        case "youtu.be":
          await searchOnYouTube(request);
        break;
        default: return await sendReplyHidden(interaction, `Нет результатов. Проверьте URL-Адрес и попробуйте ещё раз.`);
      }
    } else {
      await (async () => {
          try {
              // console.log("Поиск по названию трека.")
              await api.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});
              await wrapApi.init({access_token: process.env.API_YANDEX_TOKEN, uid: process.env.API_YANDEX_CLIENT_ID});

              await api.searchAll(request).then(async (data) => {
                  if (data.tracks.results) {

                      if (data.tracks.results.length > 0) {
                          let tracks = [];

                          for (let i = 0; i < data.tracks.results.length; i++) {
                              tracks.push({
                                  label: data.tracks.results[i].title,
                                  description: getTrackArtists(data.tracks.results[i].artists),
                                  value: `https://music.yandex.ru/album/${data.tracks.results[i].albums[0].id}/track/${data.tracks.results[i].id}`
                              })
                          }

                          const row = new ActionRowBuilder().addComponents(
                              await new StringSelectMenuBuilder()
                                  .setCustomId('selectYaMusicTrack')
                                  .setPlaceholder('Выберите трек')
                                  .setMaxValues(1)
                                  .addOptions(tracks)
                          );
                          await sendReply(interaction, {components: [row]});

                          // console.log(data.tracks.results)

                      } else await sendReplyHidden(interaction, `Не найдены треки по запросу "${data.text}".`);

                  } else {
                      await searchOnYouTube(request).catch(async (err) => {
                          await createError(err);
                      })
                  }
              }).catch(async (err) => {
                  await searchOnYouTube(request).catch(async (err) => {
                      await sendReplyHidden(interaction, `Не найдены результаты по запросу "${request}".`)
                      await createError(err);
                  })
                  await createError(err);
                  // sendReplyHidden(interaction, `Ошибка при запросе Yandex Music.`);
                  // console.log(err);
              });
          } catch (error) {
              await sendReplyHidden(interaction, "Ошибка при запросе музыки.");
              await createError(error);
          }
      })();
      }
    }

    else if (command === "skip") {
        if (!interaction.guild.members.cache.get(interaction.user.id).voice.channel) return sendReplyHidden(interaction, `Вы должны находится в голсовом канале, чтобы остановить музыку!`);
        if (queue[server_id] === undefined || queue[server_id].length === 0) return sendReplyHidden(interaction, `Треков нет в очереди.`);
        else {  
          queue[server_id].shift();
          if (queue[server_id].length === 0) {
            await interaction.guild.members.me.voice.setChannel(null).catch(err => {
              sendReply(interaction, `Ошибка при выходе из голосового канала.`);
              sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);
          });
            return sendReply(interaction, `Треки в очереди закончились.`);
          } 
          // console.log("Пытаюсь запустить трек " + queue[server_id][0].fields.name);
          await playNewMusic(`Трек "${queue[server_id][0].title}" был пропущен.`, queue[server_id][0].resource, queue[server_id][0].title, queue[server_id][0].color, queue[server_id][0].fields, queue[server_id][0].author, queue[server_id][0].footer, queue[server_id][0].thumbnali_url, false).then(() => {
            // sendReply(interaction, `Пропустил трек.`);
          })
              .catch(async err => {
                  await sendReplyHidden(interaction, `Не могу пропустить трек.`);
                  await createError(err);
              });
        }
      }

      else if (command === "stop") {
        if (!interaction.guild.members.cache.get(interaction.user.id).voice.channel) return sendReplyHidden(interaction, `Вы должны находится в голсовом канале, чтобы остановить музыку!`);
        if (queue[server_id].length !== 0) {
          queue[server_id].splice(0, queue[server_id].length);
          player.stop(true);
          await interaction.guild.members.me.voice.setChannel(null).catch(err => {sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);});
          await sendReply(interaction, `Удалил все треки из очереди.`);
        } else return sendReplyHidden(interaction, `Треков нет в очереди.`);
      }
    
      async function searchOnYouTube(request) {
        let yt_footer = {text: `YouTube`, icon_url: `https://www.youtube.com/s/desktop/a5a48819/img/favicon.ico`}
        let yt_info = await play.search(request, {limit: 1});
        // console.log(yt_info)
        if (yt_info[0] !== undefined){
            if (yt_info) {
              const stream = await play.stream(yt_info[0].url)
              const resource = createAudioResource(stream.stream, {inputType: stream.type});
                console.log(resource)
              let ytfields = {name: `Сейчас играет: ${yt_info[0].title} - ${yt_info[0].channel.name}`};
              let thumbnali_url = yt_info[0].thumbnails[0].url;
              await addNewTrack(null, resource, yt_info[0].title, yt_color, ytfields, author, yt_footer, thumbnali_url).catch(async (err) => {
                await sendReplyHidden(interaction, "Неудалось добавить в очередь музыки");
                await createError(err);
              });

              // console.log(yt_info[0])

              } else await sendReplyHidden(interaction, "Не найдено видео из результатов.");
        } else await sendReplyHidden(interaction, "Не найдено видео из результатов.");
}

}

module.exports = {executeMusic};