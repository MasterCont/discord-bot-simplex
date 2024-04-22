const {ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const play = require('play-dl')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior} = require("@discordjs/voice");
const { sysError, getTrackArtists, createError, sendReplyHidden, sendReply} = require('../common/modules');
const {YMApi, WrappedYMApi} = require("ym-api");
const api = new YMApi();
const wrapApi = new WrappedYMApi();

const queue = {};
let counter = 0;
let active_message;

async function executeMusic(command, interaction, voiceChannel, url) {
  let server_id = `${interaction.guild.id}`;
  if (queue[server_id] === undefined) queue[server_id] = [];

  const player = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Play}});

  async function playNewMusic(author, channelID, url, title, name, resource) {
    let connection;
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

  async function addNewTrack(author, channel, url, title, name, resource) {
    try {
      if (queue[server_id] === undefined || queue[server_id].length === 0) {
        await queue[server_id].push({author: author, channel: channel, url: url, title: title, name: name, resource: resource});
        await playNewMusic(author, channel, url, title, name, resource).then((data) => {
          if (data.status === true) interaction.reply({content: `Добавил в очередь музыки: "${title}". Вся очередь: ${queue[server_id].length}`, ephemeral: false});
          else interaction.reply({content: data.reason, ephemeral: true});
        });
      } else {
        await queue[server_id].push({author: author, channel: channel, url: url, title: title, name: name, resource: resource});
        let new_content = `Добавлено в очередь: "${title}". Вся очередь: ${queue[server_id].length}`;
        interaction.reply(new_content).catch(() => interaction.editReply(`Добавлено в очередь: "${title}". Вся очередь: ${queue[server_id].length}`));
      }
    
    } catch (err) {
      interaction.reply({content: `Произошла ошибка: ${err.message}`, ephemeral: true});
      console.error(err);
    }
  }


  if (command === "play") {
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
                          await addNewTrack(interaction.user.username, interaction.channel.id, new_track, dataTrack[0].title, getTrackArtists(dataTrack[0].artists), resource);
                        }).catch(async () => {
                          let new_content = `Ошибка при добавлении в очередь. Проверьте URL-адрес и попробуйте ещё раз.`;
                          interaction.reply({content: new_content, ephemeral: true}).catch(() => {
                            interaction.editReply({content: new_content, ephemeral: true}).catch((err) => sysError(err));
                          })

                        });
                      }).catch(async () => {
                        interaction.reply({content: `Трек не найден.`, ephemeral: true});
                      })
                    }
                  }).catch(() => interaction.reply({content: `Альбом не найден.`, ephemeral: true}));
                } else {
                  await api.getTrack(pathname[4]).then(async (data) => {
                    let new_url = `${link.origin}/${pathname[1]}/${pathname[2]}/${pathname[3]}/${pathname[4]}`;
                    await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                      const resource = createAudioResource(`${new_track}.mp3`);
                      await addNewTrack(interaction.user.username, interaction.channel.id, new_track, data[0].title, getTrackArtists(data[0].artists), resource);
                    }).catch(async (err) => {
                      interaction.reply({
                        content: `Ошибка воиспроизведения: ${err}. Проверьте URL-адрес и попробуйте ещё раз.`,
                        ephemeral: true
                      });
                    });
                  }).catch(async () => {
                    interaction.reply({content: `Трек не найден.`, ephemeral: true});
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
                      await interaction.reply({components: [row]});
                    }
                    // console.log(data);
                  });
                } else {
                  // console.log(pathname)
                  try {
                    await api.getPlaylist(pathname[4], pathname[2]).then(async (data) => {
                      if (!voiceChannel) return interaction.reply({
                        content: 'Войдите в голосовой канал и запустите ещё раз команду.',
                        ephemeral: true
                      });
                      // console.log(data);
                      for (let i = 0; i < data.tracks.length; i++) {
                        await api.getTrack(data.tracks[i].id).then(async (dataTrack) => {
                          if (dataTrack[0].albums !== undefined) {
                            let new_url = `${link.origin}/album/${dataTrack[0].albums[0].id}/track/${dataTrack[0].id}`;
                            await wrapApi.getMp3DownloadUrl(new_url).then(async (new_track) => {
                              const resource = createAudioResource(`${new_track}.mp3`);
                              await addNewTrack(interaction.user.username, interaction.channel.id, new_track, dataTrack[0].title, getTrackArtists(dataTrack[0].artists), resource);
                            }).catch(async (err) => {
                              let new_content = `Ошибка при добавлении в очередь.`;
                              interaction.reply({
                                content: new_content,
                                ephemeral: true
                              }).catch(() => interaction.editReply({
                                content: `${i}: ${new_content}`,
                                ephemeral: true
                              }))
                              await sysError(err);
                            });
                          }
                        }).catch(() => {
                          let new_content = "Трек не найден.";
                          interaction.reply({
                            content: new_content,
                            ephemeral: true
                          }).catch(() => interaction.editReply({content: `${i}: ${new_content}`, ephemeral: true}))
                        });
                      }
                    });
                  } catch (err) {
                    interaction.reply({content: `Запрос не удался: ${err}`, ephemeral: true});
                    await sysError(err);
                  }
                }
              } else {
                interaction.reply({
                  content: `Недействительный запрос. Проверьте URL и попробуйте ещё раз.`,
                  ephemeral: true
                });
              }
              // console.log({ result });
            } catch (e) {
              // sysError(`api error ${e}`);
              try {
                interaction.reply({content: `Ошибка при получении данных.`, ephemeral: true});
              } catch (err) {
                await interaction.editReply({content: `Ошибка при получении данных.`, ephemeral: true})
              }
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
                try {await addNewTrack(interaction.user.username, interaction.channel.id, yt_info[0].url, yt_info[0].title, yt_info[0].channel.name, resource);}
                catch (err) {interaction.channel.send("Неудалось добавить в очередь музыки")}

                } else {
                    interaction.reply({content: `Видео не найдено из результатов.`, ephemeral: true});
                }
          } else await sendReplyHidden(interaction, `Видео не найдено из результатов.`);
        break;
        default: return await sendReplyHidden(interaction, `Нет результатов.`);
      }
    } else {
      let yt_info = await play.search(url, {limit: 1})
          // console.log(yt_info)
          if (yt_info[0] !== undefined){
              if (yt_info) {
                  await play.stream(yt_info[0].url).then( async (data) => {
                  const resource = createAudioResource(data.stream, {inputType: data.type});
                  try {await addNewTrack(interaction.user.username, interaction.channel.id, yt_info[0].url, yt_info[0].title, yt_info[0].channel.name, resource);}
                  catch (err) {interaction.channel.send("Неудалось добавить в очередь музыки")}
                }).catch(err => interaction.channel.send(err.message));
                } else {
                    await sendReplyHidden(interaction, `Видео не найдено из результатов.`);
                }
          } else await sendReplyHidden(interaction, `Видео не найдено из результатов.`);
    }

  }
  else if (command === "skip") {
    if (!interaction.guild.members.cache.get(interaction.user.id).voice.channel) return await sendReplyHidden(interaction, `Вы должны находится в голсовом канале, чтобы остановить музыку.`);
    if (queue[server_id] === undefined || queue[server_id].length === 0) return await sendReply(interaction, `Треков нет в очереди.`);
    else {  
      await queue[server_id].shift();
      if (queue[server_id].length === 0) {
        await interaction.guild.members.me.voice.setChannel(null).catch(async err => {
          await interaction.channel.send(`Ошибка при выходе из голосового канала.`)
          await sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);
      });
        return await sendReply(interaction, `Треки в очереди закончились.`);
      } 
      return await playNewMusic(queue[server_id][0].author, queue[server_id][0].channel, queue[server_id][0].url, queue[server_id][0].title, queue[server_id][0].name, queue[server_id][0].resource)
          .then(async () => {
            await sendReply(interaction, `Трек пропущен.`);
          })
          .catch(async () => {
            await sendReply(interaction, `Не могу пропустить трек.`)
          });
    }
  }
  else if (command === "stop") {
    if (!interaction.guild.members.cache.get(interaction.user.id).voice.channel) return interaction.reply({content: `Вы должны находится в голсовом канале, чтобы остановить музыку!`, ephemeral: true});
    if (queue[server_id].length !== 0) {
     for (let i = 0; i < queue[server_id].length; i++) {
      await queue[server_id].shift();
     }
        await interaction.guild.members.me.voice.setChannel(null).catch(async err => {
          await sendReplyHidden(interaction, `Ошибка при выходе из голосового канала.`);
          await sysError(`Ошибка при выходе из голосового канала (@${interaction.guild.id}): ${err}`);
          await createError(err);
       });

     await sendReply(interaction, `Все треки из очереди удалены.`)
    } else return await sendReply(interaction, `Треков нет в очереди.`);
  }
  else await sendReply(interaction, `Команда недействительна. Попробуйте ещё раз.`);
} 


module.exports = {executeMusic}