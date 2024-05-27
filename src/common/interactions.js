const {Events} = require('discord.js');
const {
    sysError,
    sysPrintNewCommand,
    sendReplyHidden,
    getUserAvatar,
    getUserInfo,
    getGuildIcon,
    getRandomNumber,
    sendReply,
    moderator,
    warn,
    marriage,
    report,
    role,
    invite, handler, database, createError
} = require("./modules");
const {sberGigaChat} = require("../ai/sber/gigachat");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            // console.log(interaction.guild.members.cache.get(interaction.user.id).voice.channel.permissionsFor(interaction.user).has('CONNECT'))
            await sysPrintNewCommand(`Server: ${interaction.guild.id}: ${interaction.user.username} использует команду "${interaction.commandName}"`);
            const cm = interaction.commandName; // CM - CommandName
            if (cm === "out_channel_history_messages"){
                let channel = interaction.options.getChannel('channel');
                let quantity = interaction.options.getNumber('quantity');
                let search = interaction.options.getString('search');
                await new handler(client, interaction).out_channel_history_messages(channel, quantity, search)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "voice_connect"){
                let voiceChannel = interaction.options.getChannel('channel');
                await new handler(client, interaction).voice_connect(voiceChannel)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "voice_disconnect"){
                await new handler(client, interaction).voice_disconnect()
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "send_message"){
                let message = interaction.options.getString("message");
                let channel = interaction.options.getChannel('channel');
                await new handler(client, interaction).send_message(channel, message)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "kick"){
                const user = interaction.options.getUser("user");
                const reason = interaction.options.getString("reason");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).kick(user, reason, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "ban"){
                const user = interaction.options.getUser("user");
                const reason = interaction.options.getString("reason");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).ban(user, reason, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "unban"){
                const user = interaction.options.getUser("user");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).unBan(user, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "set_nickname"){
                const user = interaction.options.getUser("user");
                const new_Nickname = interaction.options.getString("nickname");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).newNickname(user, new_Nickname, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "get_user_avatar"){
                const user = interaction.options.getUser("user");
                await getUserAvatar(client, interaction, user)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "mute"){
                const user = interaction.options.getUser("user");
                const time = interaction.options.getNumber("time");
                const reason = interaction.options.getString("reason");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).mute(user, time, reason, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "unmute"){
                const user = interaction.options.getUser("user");
                const notification = interaction.options.getBoolean("notification");
                await new handler(client, interaction).unMute(user, notification)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "set_role_random_color"){
                const role_obj = interaction.options.getRole("role");
                await new role(interaction).setColorRandom(role_obj)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "set_role_color"){
                const role_obj = interaction.options.getRole("role");
                const color = interaction.options.getNumber("color");
                await new role(interaction).setColor(role_obj, color)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "invite"){
                const userid = interaction.options.getString("userid");
                await invite(client, interaction, userid);
            }
            // else if (cm === "play"){
            //     const urlMusic = interaction.options.getString("name");
            //     const voiceChannel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
            //     // await executeMusic("play", interaction, voiceChannel, urlMusic).catch((err) => {
            //     //     sendReplyHidden(interaction, `Произошла ошибка: ${err}`);
            //     //     sysError(err);
            //     // });
            //     await new executeMusic(client, interaction).play(voiceChannel, urlMusic);
            // }
            // else if (cm === "skip"){
            //     const voiceChannel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
            //     await new executeMusic(client, interaction).skip(voiceChannel);
            // }
            // else if (cm === "stop"){
            //     const voiceChannel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
            //     await new executeMusic(client, interaction).stop(voiceChannel);
            // }
            else if (cm === "report"){
                await new report(interaction).initWindow()
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "send_json_embed"){
                const channel = interaction.options.getChannel('channel');
                await new handler(client, interaction).send_json_embed(channel)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "send_embed"){
                const title = interaction.options.getString('title');
                const description = interaction.options.getString('description');
                const url = interaction.options.getString('url');
                const color = interaction.options.getString('color');
                const author = interaction.options.getString('author');
                const author_url = interaction.options.getString('author_url');
                const author_icon_url = interaction.options.getString('author_icon_url');
                const footer = interaction.options.getString('footer');
                const footer_icon_url = interaction.options.getString('footer_icon_url');
                const timestamp = interaction.options.getString('timestamp');
                const imageUrl = interaction.options.getString('image');
                const thumbnail = interaction.options.getString('thumbnail');

                await new handler(null, interaction).sendEmbed(false, title, description, url, color, author, author_url, author_icon_url, footer, footer_icon_url, timestamp, imageUrl, thumbnail)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "get_guild_icon"){
                await getGuildIcon(interaction)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "random_number"){
                const numberMinimum = interaction.options.getNumber("minimum");
                const numberMaximum = interaction.options.getNumber("maximum");
                await sendReply(interaction, `Выпало число: ${getRandomNumber(numberMinimum, numberMaximum)}`)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "flip_a_coin"){
                let number = getRandomNumber(0, 2), result;
                if (number === 0) result = "Орёл";
                else result = "Решка";

                await sendReply(interaction, "Подброшенная монетка выдала значение: " + result)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "reverse"){
                const messageOnReverse = interaction.options.getString('message');
                await sendReply(interaction, messageOnReverse.split("").reverse().join(""))
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "print_all_words"){
                const messageOnSplit = interaction.options.getString('message');
                let words = messageOnSplit.split(" ");
                await sendReply(interaction, `Текст ${"`" + messageOnSplit + "`"} \nВсего слов: ${words.length} \nВсего символов: ${messageOnSplit.length}`)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "ping"){
                await sendReply(interaction, `${Date.now() - interaction.createdTimestamp}мс.`)
                    .catch(async () => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Техническая ошибка. Попробуйте ещё раз.`);
                    })
            }
            else if (cm === "notification_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "notifications", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включены уведомления от приложения.`);
                else await new handler(client, interaction).send_info_notification(`На сервере отключены уведомления от приложения.`);
            }
            else if (cm === "log_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "logs", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включено логирование сообщений.`);
                else await new handler(client, interaction).send_info_notification(`На сервере отключено логирование сообщений.`);
            }
            else if (cm === "set_chat_global"){
                const channel = interaction.options.getChannel("channel");
                await new database().setParameter(interaction.guildId, "channel_global_id", channel.id);
                await new handler(client, interaction).send_info_notification(`Канал <#${channel.id}> установлен как глобальный.`);
            }
            else if (cm === "set_chat_news"){
                const channel = interaction.options.getChannel("channel");
                await new database().setParameter(interaction.guildId, "channel_news_id", channel.id);
                await new handler(client, interaction).send_info_notification(`Канал <#${channel.id}> установлен как новостной.`);
            }
            else if (cm === "marry_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "marriages", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включена система брака.`);
                else await new handler(client, interaction).send_info_notification(`На сервере отключена система брака.`);
            }
            else if (cm === "set_max_number_of_warns"){
                const number = interaction.options.getNumber("max");
                await new database().setParameter(interaction.guildId, "count_warns_max", number);
                await new handler(client, interaction).send_info_notification(`Максимальное чисто предупреждений изменено на \`${number}\`.`);
            }
            else if (cm === "warns_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "warns", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включена система предупреждений.`);
                else await new handler(client, interaction).send_info_notification(`На сервере отключена система предупреждений.`);
            }
            else if (cm === "fake_warns_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "fake_warns", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включена шуточная система предупреждений.`);
                else await new handler(client, interaction).send_info_notification(`На сервере отключена шуточная система предупреждений.`);
            }
            else if (cm === "add_a_moderator"){
                const user = interaction.options.getUser("user");
                await new moderator(client, interaction).addUser(user)
                    .then(async () => {
                        await new handler(client, interaction)
                            .send_info_notification(`Пользователь \`${user.username}\` добавлен в модераторы приложения на сервере \`${interaction.guild.name}\`.`, true);
                    })
                    .catch(async (err) => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Не удалось добавить пользователя \`${user.username}\` в модераторы приложения на сервере \`${interaction.guild.name}\`. \n${err}`, true);
                    });

            }
            else if (cm === "remove_a_moderator"){
                const user = interaction.options.getUser("user");
                await new moderator(client, interaction).removeUser(user)
                    .then(async () => {
                        await new handler(client, interaction)
                            .send_info_notification(`Пользователь \`${user.username}\` удалён из модераторов приложения на сервере \`${interaction.guild.name}\`.`, true);
                    })
                    .catch(async (err) => {
                        await new handler(client, interaction)
                            .send_warn_notification(`Не удалось удалить пользователя \`${user.username}\` из модераторов приложения на сервере \`${interaction.guild.name}\`. \n${err}`, true);
                    });
            }
            else if (cm === "get_a_list_of_moderators"){
                await new moderator(client, interaction).getUsers()
                    .catch(async (err) => {
                        await new handler(client, interaction)
                            .send_warn_notification(`${err}`);
                    })
            }
            else if (cm === "warn"){
                const user = interaction.options.getUser("user");
                await new warn(client, interaction).addUser(user)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось выдать предупреждение. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось выдать предупреждение. \n${err.reason}`, true);
                    });
            }
            else if (cm === "warn_remove"){
                const user = interaction.options.getUser("user");
                await new warn(client, interaction).removeUser(user)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось удалить предупреждение. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось удалить предупреждение. \n${err.reason}`, true);
                    });
            }
            else if (cm === "warn_list"){
                await new warn(client, interaction).getUsers(interaction.guildId)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось вывести список предупреждений сервера. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось вывести список предупреждений сервера. \n${err.reason}`, true);
                    });
            }
            else if (cm === "warn_fake"){
                const user = interaction.options.getUser("user");
                await new warn(client, interaction).addUser_fake(user)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось выдать предупреждение. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось выдать предупреждение. \n${err.reason}`, true);
                    });
            }
            else if (cm === "marry"){
                const user = interaction.options.getUser("user");
                await new marriage(client, interaction).marry(user)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось сделать предложение пользователю \`${user.username}\`. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось сделать предложение пользователю \`${user.username}\`. \n${err.reason}`, true);
                    });
            }
            else if (cm === "divorce"){
                await new marriage(client, interaction).divorce(interaction.guild, interaction.user)
                    .then(async (data) => {
                        await new handler(client, interaction).send_info_notification(`Брак \`${data.offering_user.username}\` и \`${data.expected_user.username}\` разорван.`)
                    })
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось разорвать брак. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось разорвать брак. \n${err.reason}`, true);
                    });
            }
            else if (cm === "marriages"){
                await new marriage(client, interaction).getMarriages(interaction.guild)
                    .catch(async (err) => {
                        if (err.type === "warn") await new handler(client, interaction)
                            .send_warn_notification(`Не удалось вывести список любовных браков. \n${err.reason}`, true);
                        else if (err.type === "error") await new handler(client, interaction)
                            .send_error_notification(`Не удалось вывести список любовных браков. \n${err.reason}`, true);
                    });
            }
            else if (cm === "set_chat_ai"){
                const channel = interaction.options.getChannel("channel");
                await new database().setParameter(interaction.guildId, "channel_ai_id", channel.id);
                await new handler(client, interaction).send_info_notification(`Канал <#${channel.id}> установлен для разговоров с искусственным интеллектом.`);
            }
            else if (cm === "ai_system"){
                const status = interaction.options.getBoolean("status");
                await new database().setParameter(interaction.guildId, "ai", Number(status));
                if (status) await new handler(client, interaction).send_info_notification(`На сервере включен доступ к ИИ. Укажите текстовый канал, где будет использоваться ИИ: </set_chat_ai:1231952621372313610>`);
                else await new handler(client, interaction).send_info_notification(`На сервере выключен доступ к ИИ.`);
            }
            else if (cm === "help"){
                await new handler(client, interaction).help();
            }
            else if (cm === "draw"){
                const request = interaction.options.getString("request");
                await new sberGigaChat(client, interaction).requestImage(request)
                    .then(async (data) => {
                        await new handler(client, interaction).send_info_notification(data);
                    })
                    .catch(async (err) => {
                        await sysError(err);
                    })
            }
            else if (cm === "add_an_emoji"){
                const attachment = interaction.options.getAttachment("picture");
                const name = interaction.options.getString("name");
                await new handler(client, interaction).add_an_emoji(attachment, name);
            }
            else if (cm === "add_an_sticker"){
                const attachment = interaction.options.getAttachment("picture");
                const name = interaction.options.getString("name");
                const tags = interaction.options.getString("tags");
                const description = interaction.options.getString("description");
                await new handler(client, interaction).add_an_sticker(attachment, name, tags, description);
            }
            else if (cm === "get_role_permissions"){
                const role = interaction.options.getRole("role");
                await new handler(client, interaction).get_role_permissions(role);
            }
            else {
                await sendReplyHidden(interaction, `Неизвестная команда. Как вы её нашли?`);
            }
        }
        else if (interaction.isStringSelectMenu()) {
            switch (interaction.customId) {
                case "selectYaMusicPlaylist":
                    const yaMusicUrl = interaction.values[0];
                    const voiceChannelOnYandexMusicPlayList = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
                    music("play", interaction, voiceChannelOnYandexMusicPlayList, yaMusicUrl).catch((err) => {
                        interaction.reply({content: `Произошла ошибка: ${err}`, ephemeral: true}).catch(() => {
                            interaction.editReply({content: `Произошла ошибка: ${err}`, ephemeral: true}).catch(err => sysError(err));
                        });
                    });
                    break;
                case "selectYaMusicTrack":
                    const yaMusicTrack = interaction.values[0];
                    const voiceChannelOnYandexMusicTrack = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
                    music("play", interaction, voiceChannelOnYandexMusicTrack, yaMusicTrack).catch((err) => {
                        sendReplyHidden(interaction, `Произошла ошибка: ${err}`);
                    });

                    break;
            }
        }
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === "modal_send_bug_report"){
                let content = interaction.fields.getTextInputValue("modalSendBugReportContent");
                await new report(interaction).save(content);
            }
            if (interaction.customId.slice(0,15) === "modalSendEmbed_"){
                let content = interaction.fields.getTextInputValue("modelSendEmbedJSON");
                let modalArray = interaction.customId.split("_");
                let channelID = modalArray[1];

                try {
                    await client.channels.cache.get(channelID).send({embeds: [JSON.parse(content)]}).then(async () => {
                        interaction.reply({content: "Встроенное сообщение отправлено!", ephemeral: true});
                    }).catch(async (error) => {
                        interaction.reply({content: `Не удолась отправить встроенное сообщение! \nОшибка: ${error.message}`, ephemeral: true});
                        console.log(error.requestBody.json.embeds);
                    });
                } catch (err) {
                    await sendReplyHidden(interaction, `Не удалось отправить встроенное сообщение. \nПроверьте JSON-структуру на наличие ошибок и попробуйте ещё раз. \nОшибка: ${err}`);
                    // sysError(err);
                }

            }
        }
        else if (interaction.isUserContextMenuCommand()) {
            try {
                let user = await client.users.cache.get(interaction.targetId);
                await sysPrintNewCommand(`Server: ${interaction.guild.id}: ${interaction.user.username} использует user-команду "${interaction.commandName}"`);
                let cm = interaction.commandName;
                if (cm === "Get the user avatar") await getUserAvatar(client, interaction, user);
                else if (cm === "Get user information") await getUserInfo(client, interaction, user);
                else if (cm === "Flip the user nickname") await new handler(client, interaction).send_info_notification(`Перевёрнутое имя пользователя <@${user.id}>: \n\`${user.username}\` - ${user.username.split("").reverse().join("")}`);
                else if (cm === "Marry") await new marriage(client, interaction).marry(user);
                else if (cm === "Warn") await new warn(client, interaction).addUser(user);
                else await sendReplyHidden(interaction, `Неизвестная команда. Как вы её нашли?`);
            } catch (err) {
                await new handler(client, interaction).send_warn_notification(`Не удалось найти пользователя. Попробуйте ещё раз.`, true);
                await createError(err);
            }
        }
        else if (interaction.isButton()){
            let button = JSON.parse(interaction.customId);
            await sysPrintNewCommand(`Server: ${interaction.guild.id}: ${interaction.user.username} использует инлайн-кнопку "${button.name}"`);
            const cd = button.name; // CM - CommandId

            if (cd === "marry_btn_yes"){
                if (interaction.user.id !== button.exp_uid) return await new handler(client, interaction)
                    .send_error_notification(`Данная кнопка не предназначена для вас.`, true);
                await interaction.guild.members.fetch(button.off_uid).then( async (offering_user) => { // Предлагающий брак
                    await interaction.guild.members.fetch(button.exp_uid).then( async (expected_user) => { // Предложившему брак

                        // Если пользователи согласны на брак, то добавляем новый брак
                        await new marriage(client, interaction).checkMarriage(interaction.guild, offering_user, expected_user)
                            .then( async () => {
                                await new marriage(client, interaction).accept(interaction.guild, offering_user, expected_user);
                            }).catch(async (err) => {
                               await new handler(client, interaction).send_error_notification(err, true);
                            });
                        await interaction.message.delete();
                    });
                });
            }
            else if (cd === "marry_btn_no"){
                if (interaction.user.id !== button.exp_uid) return await new handler(client, interaction)
                    .send_error_notification(`Данная кнопка не предназначена для вас.`, true);
                await interaction.guild.members.fetch(button.off_uid).then( async (offering_user) => { // Предлагающий брак
                    await interaction.guild.members.fetch(button.exp_uid).then( async (expected_user) => { // Предложившему брак

                        await new handler(client, interaction)
                            .send_error_notification(`Пользователь \`${expected_user.user.username}\` отклонил преложение вступить в брак от \`${offering_user.user.username}(а)\`.`);
                        await interaction.message.delete();

                    });
                });
            }
            else if (cd === "marry_btn_cancel"){
                if (interaction.user.id !== button.off_uid) return await sendReplyHidden(interaction, `Данная кнопка не предназначена для вас.`);
                await interaction.guild.members.fetch(button.off_uid).then( async (offering_user) => { // Предлагающий брак
                    await interaction.guild.members.fetch(button.exp_uid).then( async (expected_user) => { // Предложившему брак

                        await interaction.message.delete();
                        await new handler(client, interaction)
                            .send_error_notification(`${offering_user.user.username} отменил предложение свадьбы с ${expected_user.user.username}.`);

                    });
                });
            }
        }
    }
}

