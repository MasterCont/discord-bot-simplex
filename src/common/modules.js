const { time, date, getDateMySQL} = require("./time");
const {EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle,
    AttachmentBuilder,
    PermissionsBitField
} = require("discord.js");
const {embed_color} = require("../../config.json");
const fs = require('fs');
const mysql = require("mysql");

// Создаём подключение к базе данных
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE
});

const util = require("util");
const {joinVoiceChannel} = require("@discordjs/voice");
console.trace = function trace() {
    let err = new Error();
    err.name = 'Trace';
    err.message = util.format.apply(null, arguments);
    Error.captureStackTrace(err, trace);
    this.oldWarn(err.stack);
};

console.oldWarn = console.warn;
console.error = console.warn = console.trace;

// Функция для вывода системных оповещений
async function sysPrint(value) {await console.log(`\x1b[0m[\x1b[90mСистема\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}]\x1b[37m ${value}`)}
async function sysInfo(value) {await console.log(`\x1b[0m[\x1b[94mИнформация\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}]\x1b[37m ${value}`)}
async function sysInfoError(value) {await console.log(`\x1b[0m[\x1b[31mИнформация\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}] \x1b[31m${value}\x1b[37m`)}
async function sysError(value) {await console.error(`\x1b[0m[\x1b[31mСистема\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}] \x1b[31m${value}\x1b[37m`)}
async function sysPrintNewMessage(value) {await console.log(`\x1b[0m[\x1b[33mСообщение\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}] \x1b[37m${value}\x1b[37m`)}
async function sysPrintNewCommand(value) {await console.log(`\x1b[0m[\x1b[31mКоманда\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}] \x1b[37m${value}\x1b[37m`)}
async function sysMySQLPrint(value) {await console.log(`\x1b[0m[\x1b[34mMySQL\x1b[0m] \x1b[35m[${date()}]\x1b[37m \x1b[35m[${time()}] \x1b[37m${value}\x1b[37m`)}

async function splice(array = [], object){
    let index = array.indexOf(`${object}`);
    if (index !== -1) array.splice(index, 1);
    return array;
}

function getDbPath(guildId){
    return `./servers/guild_${guildId}.json`;
}
function sendUserInvite(guild, embed_color, inviteUrl, user, admin, clientUserAvatarURL, clientUserUsername) {
    console.log(`\x1b[0m[\x1b[90mСистема\x1b[0m] \x1b[35m[${date}]\x1b[37m \x1b[35m[${time}]\x1b[37m ${admin.username} отправил приглошение пользователю ${user.username} на сервер @${guild.id}. \x1b[3`);
    const newEmbed = new EmbedBuilder();
    newEmbed.setTitle(`Вас пригласили на сервер!`);
    newEmbed.setColor(embed_color);
    newEmbed.setThumbnail(guild.iconURL());
    newEmbed.setDescription(`Модератор ${admin.username} приглашает Вас на сервер ${guild.name}! \n Ссылка для входа на сервер: ${inviteUrl}`);
    newEmbed.setAuthor({name: `Модератор: ${admin.username}`, iconURL: admin.displayAvatarURL()});
    newEmbed.setFooter({iconURL: clientUserAvatarURL, text: `Discord bot ${clientUserUsername}`})
    return newEmbed;
}

async function addWriteInJSON(path, json, object, action, encoding, parameter){

    // Если у нас больше 6-и аргументов
    let args = [], maxDefaultArgs = 6;
    if (arguments.length > maxDefaultArgs) {
        for (let i = maxDefaultArgs; i<arguments.length; i++){
            args.push(arguments[i]);
        }
    }


    try {
        // console.log(path, json, object, encoding)
        return fs.readFile(path, encoding, function readFileCallback(err, data){
            let obj, newJson;
            if (err) {
                return fs.access(path, (err) => {
                    if (err) {
                        return fs.writeFile(path, json, encoding, (err) => {
                            if (err) return {status: false, message: `${path} создать не удалось!`};
                            else return {status: true, message: `${path} создан успешно!`};
                        });
                    } else return {status: false, message: `${path} найден, но что-то пошло не так!`};
                })
            } else {
                try {
                    obj = JSON.parse(data.toString()); //now it an object
                    if (!args || args.length < 1){
                        if(action === "add") obj[parameter].push(object); //add some data
                        else if (action === "set") obj[parameter] = object; //add some data
                        else if (action === "splice") {
                            let index = obj[parameter].indexOf(`${object}`);
                            if (index !== -1) obj[parameter].splice(index, 1);
                        }
                        else {
                            sysError(`Действие ${action} является неизвестным. Используйте "set" для перезаписи переменной или "add" для дозаписи данных в массив.`);
                            return false;
                        }
                    } else {
                        for (let i=0; i<args.length; i++){
                            if(args[i].command === "add") obj[parameter][args[i].name].push(args[i].value); //add some data
                            else if (args[i].command === "set") obj[parameter][args[i].name] = args[i].value; //add some data
                            else if (args[i].command === "setIn") obj[parameter][args[i].id][args[i].name] = args[i].value; //add some data
                            else if (args[i].command === "splice") {
                                let index = obj[parameter][args[i].name].indexOf(`${args[i].value}`);
                                if (index !== -1) obj[parameter][args[i].name].splice(index, 1);
                            }
                            else if (args[i].command === "spliceIn") {
                                obj[parameter].splice(args[i].id, 1);
                            }
                            else {
                                sysError(`Действие ${action} является неизвестным. Используйте "set" для перезаписи переменной или "add" для дозаписи данных в массив.`);
                                return false;
                            }
                        }
                    }

                    newJson = JSON.stringify(obj); //convert it back to json
                    return fs.writeFile(path, newJson, encoding, (err) => {
                        if (err) return {status: false, message: `${path} обновить не удалось!`, error: err};
                        else return {status: true, message: `${path} обновлён успешно!`};
                    }); // write it back
                } catch (e) {sysError(`Error parsing JSON '${path}': ${e.message}`)}
            }});
    } catch (e) {await sysError(`Не удалось сохранить файл ${path + json} по ошибке: ${e.message}`);}
}

async function createError(err, fatal = false){
    const newDate = date().split(".");

    let sql = `
INSERT INTO \`${process.env.MYSQL_TABLE_ERRORS}\` (\`id\`, \`date\`, \`time\`, \`message\`, \`code\`, \`status\`, \`method\`, \`url\`) VALUES (NULL, '${newDate[2]}-${newDate[1]}-${newDate[0]}', '${time()}', "${err.rawError.message}", '${err.code}', '${err.status}', '${err.method}', '${err.url}');`;

    await sysError(JSON.stringify(err));
    await db.query(sql, err => {
       if (err) sysError(err);
    })

    if (fatal) throw err;
}

function getTrackArtists(array) {
    if (array === undefined || array.length === 0) return `Неизвестный исполнитель`;
    else if (array.length === 1) return `${array[0].name}`;
    else if (array.length > 1) {
        let artists = [];
        for (let i = 0; i < array.length; i++) {
            artists.push(`${array[i].name}`);
        }
        return artists.join(", ");
    }
}

async function createNewHistoryMessage(guild, channel, sql_role, message){

    if (!Boolean(message.content)) message["content"] = "[investment]";

    let messageLog = `Server: @${guild.id} | Channel: @${message.channel.id} | Message: @${message.author.username}: ${message.content}`;
    message.attachments.forEach((item) => {
        messageLog += `\n[ Вложение | ${item.url} ]`; // Если картинка
    })

    await sysPrintNewMessage(messageLog);

    let data = await getServerBase(guild.id);
    if (data["logSystem"] === false) return;

    message.embeds.forEach((item) => {
        messageLog += `\n[ Embed | ${JSON.stringify(item)} ]`;
    })

    let arr_date = date().split("."); // Если 10.02.2024 ["10", "02", "2024"]
    let sql_date = `${arr_date[2]}-${arr_date[1]}-${arr_date[0]}`; // 2024-02-10 - для mysql таблицы
    let sql_time = time();
    let sql_guild = JSON.stringify({name: guild.name, id: guild.id});
    let sql_channel = JSON.stringify({name: channel.name, id: channel.id});
    let sql_author = JSON.stringify({username: message.author.username, id: message.author.id});
    let sql_content = JSON.stringify({text: message.content.replaceAll(`"`, `#`).replaceAll(`'`, `#`).replaceAll('`', `#`), embeds: message.embeds, attachments: message.attachments});

    let sql = `INSERT INTO ${process.env.MYSQL_TABLE_MESSAGES} (id, date, time, guild, channel, role, author, content) VALUES (NULL, '${sql_date}', '${sql_time}', '${sql_guild}', '${sql_channel}', '${sql_role}', '${sql_author}', '${sql_content}')`;
    db.query(sql, async (err) => {
         if (err) {
             await sysError(sql);
             await sysError(err);
         }
    });

}

async function checkServerBase(guildId, terminal = false){

    return fs.readFile(getDbPath(guildId), async (err) => {
        if (err) {
            let obj = {
                "id": guildId,
                "notifications": false,
                "warnSystem": true,
                "fakeWarnSystem": false,
                "rangSystem": false,
                "marrySystem": false,
                "logSystem": true,
                "newsChannelId": null,
                "globalChannelId": null,
                "moderators": {
                    "users": [],
                    "roles": []
                },
                "warnCountMax": 3,
                "warns": [

                    // {"userid": "userid", "count": 2},
                    // {"userid": "userid", "count": 1}
                ],
                "fakeWarns": [
                    // {"userid": "userid", "count": 1},
                    // {"userid": "userid", "count": 5}
                ],
                "marriedUsers": [
                    // ["userid", "userid"],
                    // ["userid", "userid"]
                ],
                "ranges": [
                    // {"userid": "userid", "rang": 1},
                    // {"userid": "userid", "rang": 3},
                ]
            }

            let json = JSON.stringify(obj);
            await addWriteInJSON(`./servers/guild_${guildId}.json`, json, obj, null, "utf8");
            await sysInfo(`Сервер "${guildId}" успешно добавлен в базу данных.`);
        } else if (terminal) {
            await sysInfo(`Сервер "${guildId}" уже есть в базе данных.`)
            await sysInfo(`Для вывода информации о сервере используйте: "get server ${guildId}"`);
        }
    });
}

async function getServerBase(guildId) {
    let path = getDbPath(guildId);
    let data = fs.readFileSync(path, "utf8");
    if (data) return JSON.parse(data);
    else {
        await sysError(`Не удалось прочитать файл по пути "${path}".`);
        await sysInfoError(`Команда для создания локальной базы о сервере: "create serverbase [guildId]".`);
        return false;
    }
}

async function sendReply(interaction, value) {
    return await interaction.reply(value).catch(() => interaction.editReply(value).catch(err => console.log(err)))
}

async function sendReplyHidden(interaction, value) {
    return await interaction.reply({content: value, ephemeral: true}).catch(async () => await interaction.editReply({content: value, ephemeral: true}).catch(async err => sysError(err)))
}

async function sendReplyFileHidden(interaction, value, attachment) {
    return await interaction.reply({content: value, files: [attachment], ephemeral: true}).catch(() => interaction.editReply({content: value, files: attachment, ephemeral: true}).catch(err => console.log(err)))
}

class send{
    constructor(interaction) {
        this.interaction = interaction;
    }

    async embed(embed){
        return await this.interaction.reply({embeds: [embed]});
    }
}

async function getUserAvatar(client, interaction, user) {

    let embed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle(`Аватар пользователя ${user.username}`)
        .setImage(client.users.cache.get(user.id).displayAvatarURL({size: 2048}))
        .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `Application "Simplex" | Requested ${interaction.user.username}`})
    await interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true});

}

async function getUserInfo(client, interaction, user) {
    // console.log(user);
    let userOnServer = await getUserOnServerInfo(client, interaction, user);
    let newEmbed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle(`Информация о пользователе ${user.username}`)
        .setThumbnail(client.users.cache.get(user.id).avatarURL())
        .setDescription(`Полное имя: ${user.username}#${user.discriminator}. \n Индификатор: ${user.id}. \n Бот: ${user.bot}. \n Система: ${user.system}. \n BitField: ${user.flags.bitfield}.`)
        .setFields({
            name: `Информация пользователя на этом сервере.`,
            value: `Имя пользователя: ${userOnServer.nickname}. \n joinedTimestamp: ${userOnServer.joinedTimestamp}. \n bitfield: ${userOnServer.flags.bitfield}. \n Всего количество ролей: ${userOnServer._roles.length}. \n Роли: ${await getUserRolesOnServer(client, interaction, user)}. \n Аватар: ${userOnServer.user.avatar}`})
        .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `Application "Simplex" | Requested ${interaction.user.username}`})
    await interaction.reply({ephemeral: false, embeds: [newEmbed], fetchReply: true});
}

async function getUserOnServerInfo(client, interaction, user){
    try {
        return await interaction.guild.members.fetch(user.id);
    } catch (err) {
        return "Информация отсутсвует.";
    }
}

async function getUserRolesOnServer(client, interaction, user){
    let userOnServer = await getUserOnServerInfo(client, interaction, user);
    let roles = [];
    let rolesInSting = ``;

    if(userOnServer._roles !== undefined){
        for(i=0; i<userOnServer._roles.length; i++){
            roles.push(`<@&${userOnServer._roles[i]}>`);
        }

        for (i=0; i<roles.length; i++){
            rolesInSting = `${rolesInSting} ${roles[i]}`;
        }

        return rolesInSting; // Получаем роли в виде строки
    } else if (roles.length === 0) return "Отсутсвуют";
    else return "Не удалось получить список ролей";
}

async function getGuildIcon(interaction) {
    const newEmbedOnAvatar = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle(`Иконка сервера ${interaction.guild.name}`)
        .setImage(interaction.guild.iconURL())
        .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `Application "Simplex" | Requested ${interaction.user.username}`})
    await interaction.reply({ephemeral: true, embeds: [newEmbedOnAvatar], fetchReply: true});

}

async function replyModal(interaction, modalId, modalTitle, labelId, labelPlaceholder = false, bigLabel = false){
    const modal = new ModalBuilder();
    modal.setCustomId(modalId);
    modal.setTitle(modalTitle);

    let input = new TextInputBuilder();
    input.setCustomId(labelId);
    if (labelPlaceholder) input.setLabel(labelPlaceholder.toString());
    if (bigLabel) input.setStyle(TextInputStyle.Paragraph);

    const action = new ActionRowBuilder().addComponents(input);
    modal.addComponents(action);
    await interaction.showModal(modal);
}

async function sendPrivateMessage(client, user, message = null, embed = null) {
    return client.users.cache.get(user.id).send({content: message, embeds: embed}).catch(async err => {
        // console.error(`@${interaction.guild.id}:`);
        if (err.code === 50007) await sysError(`${err} - Пользователь \'${user.username}\' не имеет общих серверов с приложением.`);
        else await sysError(err);
        return {status: false, message: `Пользователь ${user.username} не оповещён: ${err.rawError.message}. \nОбычно это может быть свзяано с тем, что пользователь не имеет общих серверов с приложением.`};
    })
}

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

async function getAllServers(client){
    let serversList = [];

    await client.guilds.cache.forEach(guild => {
        serversList.push(`${guild.name} | ${guild.id}`);
    });

    return serversList;

}

async function getServer(client, id){
    let server, database, channels = [];

    try{
        server = client.guilds.cache.get(id);
    } catch (err) {
        await sysInfoError(`Не удалось найти информацию о сервере "${id}".`);
        await sysError(err);
    }

    try{
        await server.channels.cache.forEach((channel) => {
            channels.push(`${channel.name} | ${channel.id}`);
        });
    } catch (err) {
        await sysInfoError(`Не удалось найти информацию о каналах сервера "${id}".`);
    }

    try {
        database = await getServerBase(id);
    } catch (err) {
        await sysInfoError(`Не удалось найти информацию о сервере "${id}" в базе данных.`);
        await sysInfoError(`Для самостоятельного создания базы используйте команду: "create serverbase ${id}"`);
    }

    let data = {
        id: server.id,
        name: server.name,
        icon: server.icon,
        ownerId: server.ownerId,
        memberCount: server.memberCount,
        preferredLocale: server.preferredLocale,
        systemChannelId: server.systemChannelId,
        joinedTimestamp: server.joinedTimestamp,
        available: server.available,
        shardId: server.shardId,
        splash: server.splash,
        banner: server.banner,
        description: server.description,
        verificationLevel: server.verificationLevel,
        vanityURLCode: server.vanityURLCode,
        nsfwLevel: server.nsfwLevel,
        premiumSubscriptionCount: server.premiumSubscriptionCount,
        discoverySplash: server.discoverySplash,
        large: server.large,
        premiumProgressBarEnabled: server.premiumProgressBarEnabled,
        applicationId: server.applicationId,
        premiumTier: server.premiumTier,
        widgetEnabled: server.widgetEnabled,
        widgetChannelId: server.widgetChannelId,
        explicitContentFilter: server.explicitContentFilter,
        mfaLevel: server.mfaLevel,
        defaultMessageNotifications: server.defaultMessageNotifications,
        maximumMembers: server.maximumMembers,
        maximumPresences: server.maximumPresences,
        maxVideoChannelUsers: server.maxVideoChannelUsers,
        approximateMemberCount: server.approximateMemberCount,
        vanityURLUses: server.vanityURLUses,
        rulesChannelId: server.rulesChannelId,
        publicUpdatesChannelId: server.publicUpdatesChannelId,
        safetyAlertsChannelId: server.safetyAlertsChannelId,
    }

    if (channels.length !== 0) {
        data.channels = channels;
    }

    if (database) {
        data.alerts = database.alerts;
        data.warnSystem = database.warnSystem;
        data.rangSystem = database.rangSystem;
        data.newsChannelId = database.newsChannelId;
        data.globalChannelId = database.globalChannelId;
        data.moderators = database.moderators;
        data.warnCountMax = database.warnCountMax;
        data.warns = database.warns;
        data.fakeWarns = database.fakeWarns;
        data.rangs = database.rangs;
    }

    return data;
}

async function getUser(client, userValue) {
    let user;
    try {
        user = await client.users.cache.get(userValue);
        // Если это не id, то пробоуем по username
        if (!user) user = await client.users.cache.find(user => user.username === userValue);
        return user;
    } catch (err) {
        // Иначе выдаём ошибку
        await sysError("Не удалось получить пользователя. Проверьте синтаксис и попробуйте ещё раз.")
        await sysError(err);
        return false;
    }

}

async function checkObject(args = [], object){
    if (object) {
        return true;
    } else {
        let args_of_command = ``;
        if (args.length !== 0) for (let i=0; i<args.length; i++) args_of_command += `${args[i]} `;
        await sysInfoError(`Проверьте синтаксис: ${args_of_command}[object];`); // Проверьте синтаксис: set server alerts [object]; (Пример)
        return false;
    }
}

async function checkObjects(objects = []){
    for (let i=0; i<objects.length; i++) {
        if (!objects[i]) return false;
    }

    // В случае, если все объекты заданы, то просто выдаём разрешение на дальнейшее работу скриптов
    return true;
}

function convertingVariables (value){ // преобразование переменных из строки
    switch (value){ // То устанавливаем новым параметер
        case "true": return true;
        case "false": return false;
        case "null": return null;
        case "array": return [];
        case "object": return {};
        default:
            try {
                // Пробуем преобразовать строку в объект, если пользователь хотел указать объект
                return JSON.parse(value);
            } catch (err) {
                // Пробуем преобразовать строку в число, если пользователь хотел указать число
                if (!isNaN(Number(value))) return Number(value);
                else return value;
            }
    }
}

async function invite(client, interaction, userid){
    if (!isNaN(Number(userid))) {
        if (interaction.guild.members.cache.get(userid)) interaction.reply({content: `Пользователь уже есть на сервере.`, ephemeral: true});
        else {
            interaction.channel.createInvite({temporary : true}).then((inv) =>{
                // console.log(typeof inviteUserId)
                client.users.fetch(userid, false).then((user) => {
                    try{
                        user.send({embeds: [sendUserInvite(interaction.guild, embed_color, `https://discord.gg/${inv.code}`, user, interaction.user, client.user.avatarURL(), client.user.username)]})
                            .catch(() => {
                                interaction.editReply({content: `Пользователь не принимает личные сообщения от участников сервера или не имеет общих серверов с данным приложением.`, ephemeral: true});
                                sysPrint(`Пользователь ${user.username} не принимает личные сообщения от участников сервера ${interaction.guild.name}`)
                            })
                        interaction.reply({content: `Приглашение отправленно пользователю.`, ephemeral: true});

                    } catch (err) { interaction.reply({content: `Приглашение не отправленно пользователю. ${err.code}`, ephemeral: true}) }
                }).catch(err => {interaction.reply({content: `Не удалось отправить приглашение пользователю по ${err.code}`, ephemeral: true})});
            }).catch((err) => {
                console.log(err);
                interaction.reply({content: `Не удалось создать приглашение для данного пользователя.`, ephemeral: true});
            });
        }
    } else interaction.reply({content: `Вы не указали ID пользователя либо указали дополнительные символы.`, ephemeral: true});
}

class handler{

     constructor(client, interaction) {
         this.client = client;
         this.interaction = interaction;
     }

    async sendEmbed(json = false, title, description, url, color, author, author_url, author_icon_url, footer, footer_icon_url, timestamp, imageUrl, thumbnail){
            try{
                const embedOnSendEmbed = new EmbedBuilder();
                embedOnSendEmbed.setTitle(title);
                embedOnSendEmbed.setDescription(description);
                if (url != null) embedOnSendEmbed.setURL(url);
                if (color != null){
                    if (color.slice(0, 1) === '#') embedOnSendEmbed.setColor(color);
                    else embedOnSendEmbed.setColor(`#${color}`);
                } else embedOnSendEmbed.setColor(embed_color);
                if (author) embedOnSendEmbed.setAuthor({name: author});
                if (author_url) embedOnSendEmbed.setAuthor({url: author_url});
                if (author_icon_url) embedOnSendEmbed.setAuthor({iconURL: author_icon_url});
                if (footer) embedOnSendEmbed.setFooter({text: footer, iconURL: footer_icon_url});
                if (timestamp) embedOnSendEmbed.setTimestamp();
                if (imageUrl) embedOnSendEmbed.setImage(imageUrl);
                if (thumbnail) embedOnSendEmbed.setThumbnail(thumbnail);

                console.log(embedOnSendEmbed)

                await this.interaction.channel.send({ephemeral: false, embeds: [embedOnSendEmbed], fetchReply: true});
                // await sendReplyHidden(this.interaction, "Встроенное сообщение успешно отправлено!");
            } catch(err){
                await sendReplyHidden(this.interaction, `Не удалось отправить встроенное сообщение. \nПроверьте JSON-структуру на наличие ошибок и попробуйте ещё раз. \nОшибка: ${err}`);
                await createError(err);
            }
    }

    async ban(user, reason, notification = false){

        // Проверяем, является ли пользователь модартором, в случае чего отменить действие над участником
        await getServerBase(this.interaction.guildId).then(async data => {
            if (data["moderators"]){
                for (let i=0; i<data.moderators.users.length; i++) {
                    if (data.moderators.users[i] === user.id) { // Проверка, если модератор уже в базе
                        await sendReplyHidden(this.interaction,`Пользователь \`${user.username}\` является модератором. \nК нему невозможно применить изменения.`);
                        return;
                    }
                }
            }
        });

        try {
            await this.interaction.guild.members.cache.get(user.id).ban({reason: `Заблокирован модератором ${this.interaction.user.username} по причине: ${reason}`})
                .then(async () => {
                let reply = `Вы заблокировали участника \'${user.username}\' на сервере \'${this.interaction.guild.name}\'!`;
                if (notification){
                    await sendPrivateMessage(this.client, this.interaction, user, null)
                        .then(async (data) => {
                            if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                        }).catch(async () => {
                            reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                            await this.send_info_notification(`${reply} \nПричина: ${reason}`, true);
                        });
                }
                return await this.send_info_notification(`${reply} \nПричина: ${reason}`, true);
            }).catch(async (err) => {
                await this.send_warn_notification(`Не хватает прав для исполнения операции над пользователем \'${user.username}\'!`, true);
                await createError(err);
            });
        } catch (err) {
            await this.send_warn_notification(`Произошла ошибка.`, true);
            await createError(err);
        }
    }

    async unBan(user, notification = false){
        try {
            await this.interaction.guild.bans.fetch().then(bans => bans.forEach(async banned => {
                if (await banned.user.id === await user.id) {
                    return await this.interaction.guild.members.unban(user.id).then(async () => {
                        let reply = `Вы разблокировали участника \'${user.username}\' на сервере \'${this.interaction.guild.name}\'!`;
                        if (notification) {
                            await sendPrivateMessage(this.client, this.interaction, user, null)
                                .then(async (data) => {
                                    if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                                }).catch(async () => {
                                    reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                                    await this.send_info_notification(reply, true);
                                });
                        }
                        return await this.send_info_notification(reply, true);
                    }).catch(async () => {
                        await this.send_error_notification(`Не хватает прав для исполнения операции над пользователем \'${user.username}\'!`, true);
                    });
                } else await this.send_error_notification(`Пользователь \'${user.username}\' не найден в заблокированном списке.`, true);
            }));
        } catch (err) {
            await this.send_warn_notification(`Произошла ошибка.`, true);
            await createError(err);
        }
    }

    async kick(user, reason, notification = false){

        // Проверяем, является ли пользователь модартором, в случае чего отменить действие над участником
        let data = await getServerBase(this.interaction.guildId);
        if (data){
            if (data["moderators"]){
                for (let i=0; i<data.moderators.users.length; i++) {
                    if (data.moderators.users[i] === user.id) { // Проверка, если модератор уже в базе
                        await sendReplyHidden(this.interaction, `Пользователь \`${user.username}\` является модератором. \nК нему невозможно применить изменения.`);
                        return;
                    }
                }
            }
        }

        try {
            this.interaction.guild.members.cache.get(user.id).kick(`Выгнан модератором ${this.interaction.user.username} по причине: ${reason}`).then(async () => {
                let reply = `Вы исключили участника \'${user.username}\'!`;
                await sendReplyHidden(this.interaction, reply);
                if (notification){
                    await sendPrivateMessage(this.client, this.interaction, user, null)
                        .then(async (data) => {
                            if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                        }).catch(async () => {
                            reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                            await sendReplyHidden(this.interaction, reply);
                        });
                }
            }).catch(() => {
                sendReplyHidden(this.interaction, `Не хватает прав для исполнения операции над пользователем \'${user.username}\'!`);
            });
        } catch (err) {await sendReplyHidden(this.interaction, `Произошла ошибка.`);}
    }

    async newNickname(user, new_nickname, notification = false){

        // Проверяем, является ли пользователь модартором, в случае чего отменить действие над участником
        let data = await getServerBase(this.interaction.guildId);
        if (data){
            if (data["moderators"]){
                for (let i=0; i<data.moderators.users.length; i++) {
                    if (data.moderators.users[i] === user.id) { // Проверка, если модератор уже в базе
                        await sendReplyHidden(`Пользователь \`${user.username}\` является модератором. \nК нему невозможно применить изменения.`);
                        return;
                    }
                }
            }
        }

        try {
            this.interaction.guild.members.cache.get(user.id).setNickname(new_nickname).then(async () => {
                let reply = `Вы изменили имя пользователя ${user.username} на ${new_nickname}!`;
                await sendReplyHidden(this.interaction, reply);
                if (notification){
                    await sendPrivateMessage(this.client, this.interaction, user, null)
                        .then(async (data) => {
                            if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                        }).catch(async () => {
                            reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                            await sendReplyHidden(this.interaction, reply);
                        });
                }
            }).catch(() => {
                sendReplyHidden(this.interaction, `Не хватает прав для исполнения операции над пользователем \'${user.username}\'!`);
            });
        } catch (err) {await sendReplyHidden(this.interaction, `Произошла ошибка.`);}
    }

    async mute(user, time, reason, notification = false){

        // Проверяем, является ли пользователь модартором, в случае чего отменить действие над участником
        let data = await getServerBase(this.interaction.guildId);
        if (data){
            if (data["moderators"]){
                for (let i=0; i<data.moderators.users.length; i++) {
                    if (data.moderators.users[i] === user.id) { // Проверка, если модератор уже в базе
                        await sendReplyHidden(interaction,`Пользователь \`${user.username}\` является модератором. \nК нему невозможно применить изменения.`);
                        return;
                    }
                }
            }
        }

        try {
            let status = this.interaction.guild.members.cache.get(user.id).timeout(time * 1000, `Мутен модератором ${this.interaction.user.username} по причине: ${reason}`).then(async () => {
                let reply = `Вы запретили писать участнику \'${user.username}\' на \'${time}\' секунд!`;
                await sendReplyHidden(this.interaction, reply);
                if (notification){
                    await sendPrivateMessage(this.client, this.nteraction, user, null)
                        .then(async (data) => {
                            if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                        }).catch(async () => {
                            reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                            await sendReplyHidden(this.interaction, reply);
                        })
                }
            })
            if (!status) await sendReplyHidden(this.interaction, `Не хватает прав для исполнения операции над пользователем ${user.username} или вы указали превышающее значение секунд!`);
        } catch (err) {await sendReplyHidden(this.interaction, `Произошла ошибка.`);}
    }

    async unMute(user, notification = false){

        // Проверяем, является ли пользователь модартором, в случае чего отменить действие над участником
        let data = await getServerBase(this.interaction.guildId);
        if (data){
            if (data["moderators"]){
                for (let i=0; i<data.moderators.users.length; i++) {
                    if (data.moderators.users[i] === user.id) { // Проверка, если модератор уже в базе
                        await sendReplyHidden(this.interaction,`Пользователь \`${user.username}\` является модератором. \nК нему невозможно применить изменения.`);
                        return;
                    }
                }
            }
        }

        try {
            this.interaction.guild.members.cache.get(user.id).timeout(1, `The user was granted access to the messages by the moderator ${this.interaction.user.username}.`).then(async () => {
                let reply = `Вы разрешили писать участнику \`${user.username}\`!`;
                await sendReplyHidden(this.interaction, reply);
                if (notification){
                    await sendPrivateMessage(this.client, this.interaction, user, null)
                        .then(async (data) => {
                            if (data.status === false) await sendPrivateMessage(this.client, this.interaction, this.interaction.user, data.message);
                        }).catch(async () => {
                            reply += `\nОтрправить оповещение пользователю \`${user.username}\` не удалось.`;
                            await sendReplyHidden(this.interaction, reply);
                        })
                }
            }).catch(() => {
                sendReplyHidden(this.interaction, `Не хватает прав для исполнения операции над пользователем ${user.username}!`);
            });
        } catch (err) {await sendReplyHidden(this.interaction, `Произошла ошибка.`);}
    }

    async out_channel_history_messages(channel, quantity, search){
        let sql
        if (search) sql = `SELECT * FROM ${process.env.MYSQL_TABLE_MESSAGES} WHERE JSON_CONTAINS(guild, '{"id": "${this.interaction.guildId}"}') AND JSON_CONTAINS(channel, '{"id": "${channel.id}"}') AND content LIKE '%${search}%' ORDER BY id DESC LIMIT ${quantity};`;
        else sql = `SELECT * FROM ${process.env.MYSQL_TABLE_MESSAGES} WHERE JSON_CONTAINS(guild, '{"id": "${this.interaction.guildId}"}') AND JSON_CONTAINS(channel, '{"id": "${channel.id}"}') ORDER BY id DESC LIMIT ${quantity};`;
        console.log(sql);
        let logPathFile = `./temp/guild_${this.interaction.guild.id}.log`;
        let interaction = this.interaction;

        await db.query(sql, async (err, data) => {
            if (err) throw err;
            if (data) await sysMySQLPrint(`Данные сообщений гильдии '${this.interaction.guildId}' для канала '${channel.id}' успешно получены!`);
            if (data.length <= 0) return await sendReplyHidden(interaction, "Результат запроса оказался пустым.");
            else {
                let allQuantity = data.length;
                if (quantity >= allQuantity) await getFile(allQuantity, data);
                else await getFile(quantity, data);
            }

        })

        async function getFile(queue, data){
            for (let i = 0; i < await queue; i++) {
                let guild = await JSON.parse(data[i].guild);
                let channel = await JSON.parse(data[i].channel);
                let author = await JSON.parse(data[i].author);

                if (await guild.id === await interaction.guildId && await channel.id === await interaction.channel["id"]) {
                    let content = await JSON.parse(data[i].content);
                    let message = `${i}. [${await convertDate(data[i].date)} - ${await data[i].time}] ${await author.username}: {"text": "${await content.text}", "embeds": ${JSON.stringify(content.embeds)}}, "attachments": ${JSON.stringify(content.attachments)}}`;
                    await fs.appendFile(logPathFile, `${message}\n`, async function (err) {
                        if (err) {
                            await sendReplyHidden(interaction, "Не удалось внести изменения в файл.");
                            await createError(err);
                        } else {
                            if (i + 1 === await queue) await sendFile(logPathFile, queue);
                        }
                    });
                }
            }
        }
        async function sendFile(logPathFile, allQuantity) {
            const attachment = new AttachmentBuilder(logPathFile, {name: `messages.log`});
            await sendReplyFileHidden(interaction, `Всего ${allQuantity} сообщений в базе.`, attachment)
                .catch(async () => await sendReplyHidden(interaction, `Не удалось отправить файл. Возможно, его вес первышает максимальное допустимое значение. Попробуйте понизить количество сообщений в переменной "quantity".`));
            await fs.unlinkSync(logPathFile);
        }
    }

    async voice_connect(channel){
        joinVoiceChannel({
            channelId: channel.id,
            guildId: this.interaction.guildId,
            adapterCreator: this.interaction.guild.voiceAdapterCreator,
        });
        this.client.channels.fetch(channel.id)
            .then( async () => { await sendReply(this.interaction, `Успешно подключилась в ${"`"+channel.name+"`"}`); })
    }

    async voice_disconnect(){
        let voiceChannel = this.interaction.guild.members.cache.get(this.client.user.id).voice.channel;
        if (voiceChannel) {
            this.interaction.guild.members.me.voice.setChannel(null)
                .then( async () => { await sendReply(this.interaction, `Успешное отключение из голосового канала.`); })
                .catch (async err => {
                    await sendReplyHidden(this.interaction, `Упс. Не удалось покинуть голосовой канал.`);
                    await createError(err);
                })
        } else await sendReplyHidden(`Не нахожусь в голсовом канале. Отключение невозможно.`);
    }

    async send_message(channel, message){
        if (message == null) await sendPrivateMessage(this.interaction, "Сообщение не может быть пустым!");
        else{
            try {
                this.client.channels.cache.get(channel.id).send(message);
                await sendReplyHidden(this.interaction, "Сообщение отправлено!");
                await this.interaction.deleteReply();
            } catch (err) {
                await sendReplyHidden(this.interaction, `Упс. Не удалось отправить сообщение.`);
                await createError(err);
            }
        }
    }

    async send_json_embed(channel){
        try {
            const modalOnSendEmbed = new ModalBuilder();
            modalOnSendEmbed.setCustomId(`modalSendEmbed_${channel.id}`);
            modalOnSendEmbed.setTitle("Отправить встроенное сообщение.");

            let inputOnSendEmbed = new TextInputBuilder();
            inputOnSendEmbed.setCustomId("modelSendEmbedJSON");
            inputOnSendEmbed.setLabel("Вставьте сюда JSON-структуру embed.");
            inputOnSendEmbed.setRequired(true);
            inputOnSendEmbed.setPlaceholder(`{"content":"Hello, world!","embeds":null,"attachments":[]}`);
            inputOnSendEmbed.setStyle(TextInputStyle["Paragraph"]);

            let actionRowOnSendEmbed = new ActionRowBuilder().addComponents(inputOnSendEmbed);
            modalOnSendEmbed.addComponents(actionRowOnSendEmbed);
            await this.interaction.showModal(modalOnSendEmbed);
        } catch (error) {
            await sendReplyHidden(this.interaction, "Error sending embed.");
            await sysPrint(error);
        }
    }

    async send_info_notification(text, ephemeral = false){
        let embed = await new EmbedBuilder()
            .setTitle(":white_check_mark:  Операция выполнена!")
            .setDescription(text)
            .setColor("#58ff5f")
            .setFooter({text: this.interaction.user.username, iconURL: this.interaction.user.avatarURL()})
            .setTimestamp(new Date());


        await this.interaction.reply({ephemeral: ephemeral, embeds: [embed], fetchReply: true});
    }

    async send_warn_notification(text, ephemeral = false){
        let embed = await new EmbedBuilder()
            .setTitle(":warning: Сервис недоступен.")
            .setDescription(text)
            .setColor("#f8ef17")
            .setFooter({text: this.interaction.user.username, iconURL: this.interaction.user.avatarURL()})
            .setTimestamp(new Date());


        await this.interaction.reply({ephemeral: ephemeral, embeds: [embed], fetchReply: true});
    }

    async send_error_notification(err, ephemeral = false,){
         let embed = await new EmbedBuilder()
             .setTitle(":x: Операция отменена.")
             .setDescription(err)
             .setColor("#ff5858")
             .setTimestamp(new Date())
             .setFooter({text: this.interaction.user.username, iconURL: this.interaction.user.avatarURL()});

        await this.interaction.reply({ephemeral: ephemeral, embeds: [embed], fetchReply: true});
    }

    async help(){
         return await new Promise(async () => {
            await new database().getCommands()
                .then( async (data) => {
                   let list = ``;

                    for (let i = 0; i < data.length; i++) {
                        if (Boolean(data[i].active)){
                            let description_localizations = JSON.parse(data[i].description_localizations);
                            list += `\n:incoming_envelope:\`/${data[i].name}\` - ${description_localizations["ru"]}`;
                        }
                    }

                    let embed = new EmbedBuilder()
                        .setColor(embed_color)
                        .setTitle(`Список слэш-команд приложения`)
                        .setDescription(list)
                        .setFooter({
                            iconURL: this.interaction.user.displayAvatarURL(),
                            text: `Application "Simplex" | Requested ${this.interaction.user.username}`});

                    if (Boolean(Number(process.env.API_WEB_STATUS))) embed.setFields({name: ":information_source: Information:", value: `[Подробнее о командах можно узнать здесь](${process.env.API_WEB_PROTOCOL}://${process.env.API_WEB_HOST}/${process.env.API_WEB_PAGE_MAIN}?document=docs)`})

                    await this.interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true});

                })
                .catch( async (err) => {
                    console.log(err);
                });
         });
    }

    async add_an_emoji(attachment, name){
         if(attachment.contentType.split("/")[0] !== "image") return await this.send_error_notification("Файл должен быть типа изображения.", true);
         await this.interaction.guild.emojis.create({
             attachment: attachment.url,
             name: name
         })
             .then( async () => {
                 await this.send_info_notification(`Новое эмодзи \`${name}\` добавлено на сервер!`);
             })
             .catch( async (err) => {
                 await this.send_error_notification(`Не удалось добавить новое эмодзи \`${name}\`. \nПопробуйте использовать другое изображение. \n${err}`, true);
                 await sysError(err);
             })
    }

    async add_an_sticker(attachment, name, tags = null, description = null){
        if(attachment.contentType.split("/")[0] !== "image") return await this.send_error_notification("Файл должен быть типа изображения.", true);
        await this.interaction.guild.stickers.create({
            attachment: attachment.url,
            name: name,
            tags: tags,
            description: description,
        })
            .then( async () => {
                await this.send_info_notification(`Новый стикер \`${name}\` добавлен на сервер!`);
            })
            .catch( async (err) => {
                await this.send_error_notification(`Не удалось добавить новый стикер \`${name}\`. \nПопробуйте использовать другое изображение. \n${err}`, true);
                await sysError(err);
            })
    }

    async get_role_permissions(role){

         let content = `Все разрешения роли <@&${role.id}>: \n`;
         let permissions = permissionsNames(new PermissionsBitField(role.permissions.bitfield));
         if (permissions.length <= 0) content += `Данная роль не имеет разрешений.`;
         for (let i = 0; i < permissions.length; i++) content += `\`${permissions[i]}\`, `;

        let embed = new EmbedBuilder()
            .setTitle(`:information_source:  Информация о роли`)
            .setDescription(content)
            .setColor(embed_color)
            .setTimestamp(new Date())
            .setFooter({text: this.interaction.user.username, iconURL: this.interaction.user.avatarURL()});

        await this.interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true});
    }

}

class serverBase{
    async setParameter(guildId, parameter, value){
        let data = await getServerBase(guildId); // Если база данных сервера найдена
        let path = getDbPath(guildId);
        if (data) {
            await addWriteInJSON(path, data, convertingVariables(value), "set", 'utf8', parameter); // То добавляем в параметер (массив) новое значение
            await sysInfo(`Параметер "${parameter}" установлен в значении "${value}"`);
        } else return false;
    }

    async addParameter(guildId, array, value){
        let data = await getServerBase(guildId); // Если база данных сервера найдена
        let path = getDbPath(guildId);
        if (data) {
            if (data[array]) {
                await addWriteInJSON(path, data, convertingVariables(value), "add", 'utf8', array); // То добавляем в параметер (массив) новое значение
                await sysInfo(`В параметер "${array}" добавлено значение "${value}"`);
            }
            else await sysInfoError(`Не могу добавить значение "${value}" в параметер ${array}, так как элемент ${array} не является массивом.`);
        } else return false;
    }

    async spliceArray(guildId, array, name){
        let data = await getServerBase(guildId); // Если база данных сервера найдена
        let path = getDbPath(guildId);
        if (data) {
            if(data[array]){
                try {
                    await addWriteInJSON(path, data, name, "splice", 'utf8', array); // То добавляем в параметер (массив) новое значение
                    await sysInfo(`Из параметра "${array}" удалено значение "${name}"`);
                } catch (err) {
                    await sysError(`Не удалось изменить значение из массива ${array}. ${err}`);
                }
            } else await sysInfoError(`Не могу стереть значение "${name}" из параметра ${array}, так как элемент ${array} не является массивом.`);
        } else return false;
    }
}

class moderator{

    constructor(client, interaction) {
        this.interaction = interaction;
    }
    async addUser(user){
        return await new Promise( async (resolve, reject) => {
            await new database().getModerators(this.interaction.guildId)
                .then( async (data) => {
                    if (!data) {
                        let sql = `INSERT INTO \`${process.env.MYSQL_TABLE_MODERATORS}\` (\`id\`, \`guild_id\`, \`users\`, \`roles\`) VALUES (NULL, '${this.interaction.guildId}', '[]', '[]')`;
                        await db.query(sql, async (err) => {
                            if (err) await reject(err);
                            else await this.addUser(this.interaction.guildId, user); // Restarting the function
                        });
                    } else {
                        let users = JSON.parse(data.users);
                        if (this.interaction.guild.members.cache.get(user.id).permissions.has(PermissionFlagsBits.Administrator)) return reject("Пользователь является администратором.");
                        for (let i = 0; i < users.length; i++) if (users[i] === user.id) return reject("Пользователь является модератором."); // Проверка, если модератор уже в базе
                        await users.push(user.id);

                        // Updating the database
                        let sql = `UPDATE \`${process.env.MYSQL_TABLE_MODERATORS}\` SET \`users\` = '${JSON.stringify(users)}' WHERE \`guild_id\` = ${this.interaction.guildId}`;
                        await db.query(sql, async (err) => {
                            if (err) await reject(err);
                            else await resolve("Пользователь добавлен в список модераторов сервера.");
                            // end
                        })
                    }
                })
                .catch( async (err) => {
                    await reject("Сервис временно недоступен. Попробуйте ещё раз.");
                    await sysError(err);
                });
        });
    }

    async removeUser(user){
        return await new Promise( async (resolve, reject) => {
            await new database().getModerators(this.interaction.guildId)
                .then( async (data) => {
                    if (!data) {
                        let sql = `INSERT INTO \`${process.env.MYSQL_TABLE_MODERATORS}\` (\`id\`, \`guild_id\`, \`users\`, \`roles\`) VALUES (NULL, '${this.interaction.guildId}', '[]', '[]')`;
                        await db.query(sql, async (err) => {
                            if (err) await reject(err);
                            else await this.removeUser(this.interaction.guildId, user); // Restarting the function
                        });
                    } else {
                        let users = JSON.parse(data.users);
                        if (this.interaction.guild.members.cache.get(user.id).permissions.has(PermissionFlagsBits.Administrator)) return reject("Пользователь является администратором.");
                        for (let i = 0; i < users.length; i++) if (users[i] === user.id) { // Проверка, если модератор уже в базе
                            users = await splice(users, user.id);

                            // Updating the database
                            let sql = `UPDATE \`${process.env.MYSQL_TABLE_MODERATORS}\` SET \`users\` = '${JSON.stringify(users)}' WHERE \`guild_id\` = ${this.interaction.guildId}`;
                            return await db.query(sql, async (err) => {
                                if (err) await reject(err);
                                else await resolve("Пользователь удалён из списка модераторов сервера.");
                                // end
                            })
                        }

                        // Else
                        await reject("Пользователь не модератор."); // end
                    }
                })
                .catch( async (err) => {
                    await reject("Сервис временно недоступен. Попробуйте ещё раз.");
                    await sysError(err);
                });
        });
    }

    async getUsers(){
        return await new Promise(async (resolve, reject) => {
           await new database().getModerators(this.interaction.guildId)
               .then(async (data) => {
                   if (!data) {
                       let sql = `INSERT INTO \`${process.env.MYSQL_TABLE_MODERATORS}\` (\`id\`, \`guild_id\`, \`users\`, \`roles\`) VALUES (NULL, '${this.interaction.guildId}', '[]', '[]')`;
                       await db.query(sql, async (err) => {
                           if (err) await reject(err);
                           else await this.getUsers(this.interaction.guildId); // Restarting the function
                       });
                   } else {
                       let moderators = ``, admins = ``;
                       let users = JSON.parse(data.users);

                       // Получаем список администраторов сервера
                       this.interaction.guild.members.cache.forEach((member) => {
                           if (member.permissions.has(PermissionFlagsBits.Administrator)) admins += `\n <@${member.user.id}>`;
                       })

                       // Получаем список модераторов
                       for (let i = 0; i < users.length; i++) moderators += `\n <@${users[i]}>`;

                       // Создаём и отдаём списком embed
                       let embed = new EmbedBuilder()
                           .setColor(embed_color)
                           .setTitle(`Список адмнистраторов сервера \`${this.interaction.guild.name}\``)
                           .setThumbnail(this.interaction.guild.iconURL())
                           .setDescription(`:bust_in_silhouette: **Основатель**: <@${this.interaction.guild.ownerId}> \n\n:busts_in_silhouette:  **Администраторы**: ${admins} \n\n:busts_in_silhouette: **Модераторы**: ${moderators}`)
                           .setFooter({
                               iconURL: this.interaction.user.displayAvatarURL(),
                               text: `Application "Simplex" | Requested ${this.interaction.user.username}`})
                           await this.interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true});
                   }
               })
               .catch(async (err) => {
                   await reject("Не удалось получить информацию о модераторах сервера.");
                   await sysError(err);
               });
        });
    }
}

class warn{

    constructor(client, interaction = false) {
        this.client = client;
        this.interaction = interaction;
    }

    async addUser(user){
        return await new Promise(async (resolve, reject) => {
            if (this.interaction.guild.members.cache.get(user.id)
                .permissions.has(PermissionFlagsBits["Administrator"])) return reject({type: "error", reason: `Пользователь <@${user.id}> является администратором.`});

            // Проверка, если модератор уже в базе
            let moderators = await new database().getModerators(this.interaction.guildId);
            if (moderators){
                let mod_users = await JSON.parse(moderators.users);
                for (let i= 0; i < mod_users.length; i++) {
                    if (mod_users[i] === user.id) return reject({type: "error", reason: `Пользователь <@${user.id}> является модератором.`});
                }
            }

            await new database().getWarns(this.interaction.guildId, user)
                .then(async (data) => {
                    if (!data) {
                        let sql = `INSERT INTO \`${process.env.MYSQL_TABLE_WARNS}\` (\`id\`, \`guild_id\`, \`user_id\`, \`count\`) VALUES (NULL, '${this.interaction.guildId}', '${user.id}', '0')`;
                        await db.query(sql, async (err) => {
                            if (err) await reject(err);
                            else await this.addUser(user); // Restarting the function
                        });
                    } else {
                        let guild = await new database().getServer(this.interaction.guildId);
                        let new_count = data.count + 1;

                        // Updating the database
                        let sql = `UPDATE \`${process.env.MYSQL_TABLE_WARNS}\` SET \`count\` = '${new_count}' WHERE \`guild_id\` = ${this.interaction.guildId} AND \`user_id\` = ${user.id}`;
                        await db.query(sql, async (err) => {
                            if (err) {
                                await reject( {type: "warn", reason: `Не удалось обновить значения в базе данных. Попробуйте ещё раз.`});
                                await sysError(err);
                            } else {
                                if (guild["count_warns_max"] <= new_count) {
                                    await new handler(this.client, this.interaction).ban(user, `Пользователь превысил максимальное количество предупреждений.`)
                                        .then(async () => {
                                            await resolve(true);
                                            await new handler(this.client, this.interaction)
                                                .send_info_notification(`Пользователь <@${user.id}> заблокирован. \nУ пользователя \`${new_count}/${guild["count_warns_max"]}\` предупреждений.`);
                                        })
                                        .catch(async (err) => {
                                            await reject({type: "warn", reason: `Не удалось заблокировать пользователя.`});
                                            await sysError(err);
                                        })
                                } else {
                                    await resolve(true);
                                    await new handler(this.client, this.interaction)
                                        .send_info_notification(`Пользователю <@${user.id}> выдано предупреждение. \nУ пользователя \`${new_count}/${guild["count_warns_max"]}\` предупреждений.`);
                                }
                            }
                        });
                    }
                })
                .catch(async (err) => {
                    await reject({type: "warn", reason: "Сервис временно недоступен. Попробуйте ещё раз."});
                    await sysError(err);
                });
        });
    }

    async removeUser(user){
        return await new Promise(async (resolve, reject) => {
            if (this.interaction.guild.members.cache.get(user.id)
                .permissions.has(PermissionFlagsBits["Administrator"])) return reject({type: "error", reason: `Пользователь <@${user.id}> является администратором.`});

            // Проверка, если модератор уже в базе
            let moderators = await new database().getModerators(this.interaction.guildId);
            if (moderators){
                let mod_users = JSON.parse(moderators.users);
                for (let i= 0; i < mod_users.length; i++) {
                    if (mod_users[i] === user.id) return reject({type: "error", reason: `Пользователь <@${user.id}> является модератором.`});
                }
            }

            await new database().getWarns(this.interaction.guildId, user)
                .then(async (data) => {
                    if (data.count <= 0) return reject({type: "error", reason: `У пользователя <@${user.id}> нет предупреждений.`});
                    let guild = await new database().getServer(this.interaction.guildId);
                    let new_count = data.count - 1;

                    // Updating the database
                    let sql = `UPDATE \`${process.env.MYSQL_TABLE_WARNS}\` SET \`count\` = '${new_count}' WHERE \`guild_id\` = ${this.interaction.guildId} AND \`user_id\` = ${user.id}`;
                    await db.query(sql, async (err) => {
                        if (err) {
                            await reject( {type: "warn", reason: `Не удалось обновить значения в базе данных. Попробуйте ещё раз.`});
                            await sysError(err);
                        } else {
                            await resolve(true);
                            await new handler(this.client, this.interaction)
                                .send_info_notification(`Пользователю <@${user.id}> удалено предупреждение. \nУ пользователя \`${new_count}/${guild["count_warns_max"]}\` предупреждений.`);
                        }
                    });
                })
                .catch(async (err) => {
                    await reject({type: "warn", reason: "Сервис временно недоступен. Попробуйте ещё раз."});
                    await sysError(err);
                });
        })
    }

    async getUsers(guildId){
        return await new Promise(async (resolve, reject) => {
           let sql = `SELECT * FROM ${process.env.MYSQL_TABLE_WARNS} WHERE guild_id = '${guildId}'`;
           await db.query(sql, async (err, data) => {
              if (err) {
                  await createError(err);
                  return reject({type: "warn", reason: "Сервис временно недоступен. Попробуйте ещё раз."});
              } else {
                  let warns = ``;
                  warns += `**Информация из базы данных:** \n`;
                  if (data.length <= 0) warns += `:white_check_mark: Отсуствуют пользователи с предупреждениями.`;
                  for(let i=0; i < data.length; i++) warns += `\n:bust_in_silhouette: <@${data[i]["user_id"]}> имеет ${data[i].count} предупреждений.`;

                  let embed = await new EmbedBuilder()
                        .setTitle(`Список предупреждений сервера \`${this.interaction.guild.name}\``)
                        .setColor(embed_color)
                        .setThumbnail(this.interaction.guild.iconURL())
                        .setDescription(warns)
                        .setFooter({
                            iconURL: this.interaction.user.displayAvatarURL(),
                            text: `Application "Simplex" | Requested ${this.interaction.user.username}`
                        });

                  await resolve(this.interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true}));
              }
           });
        });
    }

    async addUser_fake(user){
        return await new Promise( async (resolve, reject) => {
            await new database().getWarns(this.interaction.guildId, user)
                .then(async (data) => {
                    let guild = await new database().getServer(this.interaction.guildId);
                    if (!data) data = {count: 0};
                    let new_count = data.count + 1;

                    await new handler(this.client, this.interaction)
                        .send_info_notification(`Пользователю <@${user.id}> выдано предупреждение. \nУ пользователя \`${new_count}/${guild["count_warns_max"]}\` предупреждений.`);

                    setTimeout(async () => {
                        await this.interaction.channel.send("Ладно, мы пошутили.")
                    }, 10000);
                })
                .catch(async (err) => {
                    await reject({type: "warn", reason: "Сервис временно недоступен. Попробуйте ещё раз."});
                    await sysError(err);
                });
        });
    }
}

class marriage{

    constructor(client, interaction) {
        this.client = client
        this.interaction = interaction;
    }

    async marry(user){
        return await new Promise(async (resolve, reject) => {
            await new database().getServer(this.interaction.guildId)
                .then(async (data) => {
                    if (!Boolean(data["marriages"])) return reject({type: "error", reason: `На сервере выключена система браков. Используйте \`/marry_system\` для того, чтобы включить данную систему.`});
                    if (this.interaction.user.id === user.id) return reject({type: "error", reason: `Нельзя жениться на самому себе.`});

                    await new marriage(this.client, this.interaction).checkMarriage(this.interaction.guild, this.interaction.user, user)
                        .then( async () => {

                            // Создаём билдер для кнопок
                            const buttons = new ActionRowBuilder();

                            // Создаём кнопку для соглашения брака
                            const buttonYes = new ButtonBuilder();
                            buttonYes.setLabel("Yes");
                            buttonYes.setStyle(ButtonStyle.Primary);
                            buttonYes.setCustomId(JSON.stringify({name: "marry_btn_yes", exp_uid: user.id, off_uid: this.interaction.user.id}));
                            buttonYes.setEmoji({name: '💍'})

                            // Создаём кнопку для отклонения брака
                            const buttonNo = new ButtonBuilder();
                            buttonNo.setLabel("No");
                            buttonNo.setStyle(ButtonStyle.Primary);
                            buttonNo.setCustomId(JSON.stringify({name: "marry_btn_no", exp_uid: user.id, off_uid: this.interaction.user.id}));
                            buttonNo.setEmoji({name: '💔'})

                            const buttonCancel = new ButtonBuilder();
                            buttonCancel.setLabel("Cancel");
                            buttonCancel.setStyle(ButtonStyle.Secondary);
                            buttonCancel.setCustomId(JSON.stringify({name: "marry_btn_cancel", off_uid: this.interaction.user.id}));
                            buttonCancel.setEmoji({name: '❌'})


                            // Подключаем к билдеру кнопки
                            buttons.addComponents(buttonCancel);
                            buttons.addComponents(buttonYes);
                            buttons.addComponents(buttonNo);

                            this.interaction.reply({content: `<@${user.id}>, <@${this.interaction.user.id}> хочет вступить с вами в брак.`, components: [buttons]});
                            return {status: true};
                        }).catch(async (err) => {
                            await new handler(this.client, this.interaction).send_error_notification(err, true);
                        });
                })
                .catch(async (err) => {
                    await reject({type: "warn", reason: `Сервис временно недоступен. Попробуйте ещё раз.`});
                    await sysError(err);
                });
        });
    }

    async accept(guild, offering_user, expected_user){
        return await new Promise(async (resolve, reject) => {
            console.log(offering_user, expected_user)
            let sql = `INSERT INTO ${process.env.MYSQL_TABLE_MARRIAGES} (\`id\`, \`guild_id\`, \`time\`, \`date\`, \`offering_user\`, \`expected_user\`) VALUES (NULL, '${guild.id}', '${time()}', '${await getDateMySQL()}', '{\\"username\\":\\"${offering_user.user.username}\\",\\"id\\":\\"${offering_user.user.id}\\"}', '{\\"username\\":\\"${expected_user.user.username}\\",\\"id\\":\\"${expected_user.user.id}\\"}')`;
            await db.query(sql, async (err) => {
                if (err) return reject({type: "warn", reason: `Не удалось записать изменения в базу данных. Попробуйте ещё раз.`});
                await new handler(this.client, this.interaction)
                    .send_info_notification(`:partying_face: Поздравляем! Пользователь \`${offering_user.user.username}\` теперь состоит в браке с \`${expected_user.user.username}(ом)\`!`);
                await resolve(true);
            })
        });

    }

    async divorce(guild, user){
        return await new Promise(async (resolve, reject) => {
           await new database().getServer(guild.id)
               .then(async (data) => {
                   if (!Boolean(data["marriages"])) return reject({type: "error", reason: `На сервере выключена система браков. Используйте \`/marry_system\` для того, чтобы включить данную систему.`});
                   await new database().getMarriages(guild.id)
                       .then(async (data) => {
                           // Циклом проходим все созданные браки
                           for (let i = 0; i < data.length; i++) {
                               let off_user = JSON.parse(data[i].offering_user);
                               let exp_user = JSON.parse(data[i].expected_user);
                               if (user.id === off_user.id || user.id === exp_user.id){
                                let sql = `DELETE FROM ${process.env.MYSQL_TABLE_MARRIAGES} WHERE \`id\` = ${data[i].id};`
                                await db.query(sql, async (err) => {
                                    if (err) {
                                        await sysError(err);
                                        return reject({type: "warn", reason: `Не удалось разорвать брак. Попробуйте ещё раз.`})
                                    }
                                    await resolve({offering_user: off_user, expected_user: exp_user})
                                })
                               }
                           }
                       })
                       .catch(async (err) => {
                           await reject({type: "warn", reason: `Сервис временно недоступен. Попробуйте ещё раз.`});
                           await sysError(err);
                       });
               })
               .catch(async (err) => {
                   await reject({type: "warn", reason: `Сервис временно недоступен. Попробуйте ещё раз.`});
                   await sysError(err);
               });
        });
    }

    async getMarriages(guild){
        return await new Promise(async (resolve, reject) => {
           await new database().getServer(guild.id)
               .then(async (data) => {
                   if (!Boolean(data["marriages"])) return reject({type: "error", reason: `На сервере выключена система браков. Используйте \`/marry_system\` для того, чтобы включить данную систему.`});
                   await new database().getMarriages(guild.id)
                       .then(async (data) => {
                           if (data.length <= 0) await new handler(this.client, this.interaction)
                               .send_info_notification(`На вашем сервере еще нет виртуальных браков по любви. Не пора ли это исправить? :)`);
                           let marriages = ``;
                           for (let i= 0; i < data.length; i++) {
                               let off_user = JSON.parse(data[i].offering_user);
                               let exp_user = JSON.parse(data[i].expected_user);
                               marriages += `\n\n💍💍 <@${off_user.id}> в браке с <@${exp_user.id}>. \n\`[${new Date(Date.parse(data[i].date)).toISOString().split("T")[0]} | ${data[i].time}]\``;
                           }

                           let embed = new EmbedBuilder()
                               .setColor(embed_color)
                               .setTitle(`💑 Список виртуальных браков сервера \`${guild.name}\``)
                               .setThumbnail(guild.iconURL())
                               .setDescription(marriages)
                               .setFooter({
                                   iconURL: this.interaction.user.displayAvatarURL(),
                                   text: `Application "Simplex" | Requested ${this.interaction.user.username}`
                               })

                           await this.interaction.reply({ephemeral: false, embeds: [embed], fetchReply: true});
                           return resolve(true);
                       })
                       .catch(async (err) => {
                           await reject({type: "warn", reason: `Сервис временно недоступен. Попробуйте ещё раз.`});
                           await sysError(err);
                       })
               })
               .catch(async (err) => {
                   await reject({type: "warn", reason: `Сервис временно недоступен. Попробуйте ещё раз.`});
                   await sysError(err);
               });
        });

    }

    async checkMarriage(guild, offering_user, expected_user){
        return await new Promise(async (resolve, reject) => {
            try {
                let sql = `SELECT * FROM \`discord_bot_simplex_marriages\` WHERE \`guild_id\` = '${guild.id}' AND JSON_EXTRACT(offering_user, "$.id") = '${offering_user.id}' OR JSON_EXTRACT(expected_user, "$.id") = '${expected_user.id}';`;
                await db.query(sql, async (err, data) => {
                    if (err) await reject(err);
                    else {
                        if (data.length <= 0) resolve(true);
                        else reject(`Вы уже состоите в виртуальном любовном браке c <@${JSON.parse(data[0].expected_user).id}>.`);
                    }
                });
            } catch (err){
                await reject(err);
                await sysError(err);
            }
        })
    }

}

class database {
    async initialization(){
        // Проверяем наличие таблицы, где будут храниться сообщения
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_MESSAGES} (id INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (id), date DATE NOT NULL , time TIME NOT NULL , guild JSON NOT NULL , channel JSON NOT NULL , role VARCHAR(4) NOT NULL , author JSON NOT NULL , content JSON NOT NULL ) ENGINE = InnoDB; `, (err) => {
            if (err) throw err;
        });

        // Проверяем наличие таблицы, где будут хранится репорты к приложению
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_REPORTS} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NULL DEFAULT NULL , \`date\` DATE NOT NULL , \`time\` TIME NOT NULL , \`channel_id\` VARCHAR(20) NULL DEFAULT NULL , \`author\` JSON NOT NULL , \`content\` TEXT NULL DEFAULT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`, (err) => {
           if (err) throw err;
        });

        // Проверяем наличие таблицы, где будут хранится список серверов с их настройками
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_SERVERS} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NOT NULL , \`notifications\` BOOLEAN NOT NULL , \`warns\` BOOLEAN NOT NULL , \`fake_warns\` BOOLEAN NOT NULL , \`ranks\` BOOLEAN NOT NULL , \`marriages\` BOOLEAN NOT NULL , \`logs\` BOOLEAN NOT NULL , \`channel_news_id\` VARCHAR(20) NOT NULL , \`channel_global_id\` VARCHAR(20) NOT NULL , \`count_warns_max\` TINYINT NOT NULL , \`channel_ai_id\` VARCHAR(20) NOT NULL, \`ai\` BOOLEAN NOT NULL DEFAULT FALSE, PRIMARY KEY (\`id\`), UNIQUE \`UNIQUE\` (\`guild_id\`)) ENGINE = InnoDB; `, async (err) => {
            if (err) throw err;
        })

        // Проверяем наличие таблицы, где будут хранится список команд приложения
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_COMMANDS_LIST} (\`id\` INT NOT NULL AUTO_INCREMENT , \`name\` VARCHAR(32) NOT NULL , \`active\` BOOLEAN NOT NULL , \`name_localizations\` JSON NOT NULL , \`description\` CHAR(100) NULL DEFAULT NULL , \`description_localizations\` JSON NOT NULL , \`default_permission\` VARCHAR(10) NULL DEFAULT NULL , \`default_member_permissions\` VARCHAR(32) NULL DEFAULT NULL , \`dm_permission\` VARCHAR(10) NULL DEFAULT NULL , \`nsfw\` VARCHAR(10) NULL DEFAULT NULL, \`type\` TINYINT NOT NULL, \`options\` JSON NOT NULL , PRIMARY KEY (\`id\`), UNIQUE \`UNIQUE\` (\`name\`)) ENGINE = InnoDB;`, (err) => {
            if (err) throw err;
        });

        // Проверяем наличие таблицы, где будут храниться ошибки приложения
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_ERRORS} (\`id\` INT NOT NULL AUTO_INCREMENT , \`date\` DATE NOT NULL , \`time\` TIME NOT NULL , \`message\` TEXT NULL DEFAULT NULL , \`code\` MEDIUMINT NULL DEFAULT NULL , \`status\` SMALLINT NULL DEFAULT NULL , \`method\` TINYTEXT NULL DEFAULT NULL , \`url\` TEXT NULL DEFAULT NULL, \`processed\` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`, (err) => {
           if (err) throw err;
        });

        // Проверяем наличие таблицы, где будет храниться списки музыкальных очередей серверов
        // await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_MUSIC_LIST} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NULL , \`list\` JSON NOT NULL , \`listening\` BOOLEAN NOT NULL DEFAULT FALSE , PRIMARY KEY (\`id\`), UNIQUE \`UNIQUE\` (\`guild_id\`)) ENGINE = InnoDB;`, (err) => {
        //     if (err) throw err;
        // });

        // Проверяем наличие таблицы, где будут храниться действующие модераторы серверов
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_MODERATORS} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NULL DEFAULT NULL , \`users\` JSON NULL , \`roles\` JSON NULL , PRIMARY KEY (\`id\`), UNIQUE \`UNIQUE\` (\`guild_id\`)) ENGINE = InnoDB;`, (err) => {
           if (err) throw err;
        });

        // Проверяем наличие таблицы, где будут храниться предупреждения пользователей за нарушения
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_WARNS} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NULL DEFAULT NULL , \`user_id\` VARCHAR(20) NULL DEFAULT NULL , \`count\` TINYINT NOT NULL DEFAULT '0' , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`, (err) => {
           if (err) throw err;
        });

        // Проверяем наличие таблицы, где будут храниться виртуальные любовные браки
        await db.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQL_TABLE_MARRIAGES} (\`id\` INT NOT NULL AUTO_INCREMENT , \`guild_id\` VARCHAR(20) NULL DEFAULT NULL , \`time\` TIME NOT NULL , \`date\` DATE NOT NULL , \`offering_user\` JSON NULL DEFAULT NULL , \`expected_user\` JSON NULL DEFAULT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`, (err) => {
            if (err) throw err;
        })


        await sysMySQLPrint(`База данных "${process.env.MYSQL_DATABASE}" инициализированна.`);

    }

    async check_availability_commands(commands){
        for (let i = 0; i < commands.body.length; i++){
            // Проверяем наличие команды в базе
            let sql = `SELECT * FROM ${process.env.MYSQL_TABLE_COMMANDS_LIST} WHERE name = '${commands.body[i].name}'`;
            await db.query(sql, async (err, data) => {
                if (err) throw err;
                if (data.length === 0) {
                    // Если такой команды нет в базе данных, то0.

                    if (commands.body[i].options === undefined) commands.body[i].options = [];
                    if (commands.body[i].name_localizations === undefined) commands.body[i].name_localizations = {};
                    if (commands.body[i].description_localizations === undefined) commands.body[i].description_localizations = {};
                    // ... добавляем её
                    if (!commands.body[i].type) commands.body[i].type = 1;
                    let sql = `INSERT INTO \`${process.env.MYSQL_TABLE_COMMANDS_LIST}\` (\`id\`, \`name\`, \`active\`, \`name_localizations\`, \`description\`, \`description_localizations\`, \`default_permission\`, \`default_member_permissions\`, \`dm_permission\`, \`nsfw\`, \`type\`, \`options\`) VALUES (NULL, '${commands.body[i].name}', '1', '${JSON.stringify(commands.body[i].name_localizations)}', '${commands.body[i].description}', '${JSON.stringify(commands.body[i].description_localizations)}', '${commands.body[i].default_permission}', '${commands.body[i].default_member_permissions}', '${commands.body[i].dm_permission}', '${commands.body[i].nsfw}', ${commands.body[i].type}, '${JSON.stringify(commands.body[i].options)}');`;
                    await db.query(sql, async (err) => {
                        if (err) throw err;
                    });
                } else {
                    if (!commands.body[i].default_member_permissions) commands.body[i].default_member_permissions = {};
                    if (!commands.body[i].description_localizations) commands.body[i].description_localizations = {};
                    if (!commands.body[i].options) commands.body[i].options = [];
                    if (!commands.body[i].type) commands.body[i].type = 1;

                    sql = `UPDATE \`${process.env.MYSQL_TABLE_COMMANDS_LIST}\` 
                    SET \`name_localizations\` = '${JSON.stringify(commands.body[i].name_localizations)}', 
                    \`description\` = '${commands.body[i].description}', 
                    \`description_localizations\` = '${JSON.stringify(commands.body[i].description_localizations)}',
                    \`default_member_permissions\` = '${JSON.stringify(commands.body[i].default_member_permissions)}',
                    \`default_permission\` = '${commands.body[i].default_permission}', 
                    \`dm_permission\` = '${commands.body[i].dm_permission}', 
                    \`nsfw\` = '${commands.body[i].nsfw}', 
                    \`type\` = '${commands.body[i].type}', 
                    \`options\` = '${JSON.stringify(commands.body[i].options)}' 
                    WHERE \`name\` = '${commands.body[i].name}'`

                    // Обновляем значения команд в базе данных
                    db.query(sql, async (err) => {
                        if (err) await sysMySQLPrint(`Не удалось обновить настройки у слэш-команды '${commands.body[i].name}'. \n${err}`);
                    });
                }
            });
        }

        // Получаем полностью таблицу с командами
        await db.query(`SELECT * FROM \`${process.env.MYSQL_TABLE_COMMANDS_LIST}\`; `, async (err, data) => {
            if (err) throw err;
            else {
                await data.forEach( (el_db) => {
                    let result = commands.body.find( (el_list) => {
                        return el_list.name === el_db.name;
                    })

                    // Лишнее или неактуальное в базе данных перезаписываем на нулевую активность
                    if (!result) {
                        let sql = `UPDATE ${process.env.MYSQL_TABLE_COMMANDS_LIST} SET active = '0' WHERE ${process.env.MYSQL_TABLE_COMMANDS_LIST}.name = '${el_db.name}'`;
                        db.query(sql, async (err) => {
                            if (err) throw err;
                        })
                    } else {
                        // Иначе перезаписываем, что команда активна
                        let sql = `UPDATE ${process.env.MYSQL_TABLE_COMMANDS_LIST} SET active = '1' WHERE ${process.env.MYSQL_TABLE_COMMANDS_LIST}.name = '${result.name}'`;
                        db.query(sql, async (err) => {
                            if (err) throw err;
                        })
                    }
                })
            }
        });

        await sysMySQLPrint(`Конфигурации слэш-команд в базе данных обновлены.`);
    }

    async checkServerBase(guildId, terminal = false) {
        let sql;

    // Проверяем наличие сервера
        sql = `SELECT * FROM \`${process.env.MYSQL_TABLE_SERVERS}\` WHERE \`guild_id\` = '${guildId}' `;
        await db.query(sql, async (err, data) => {
           if (err) throw err;
           else if (await data.length <= 0) {

               // Добавляем сервер в базу данных
               sql = `INSERT INTO \`${process.env.MYSQL_TABLE_SERVERS}\` (\`id\`, \`guild_id\`, \`notifications\`, \`warns\`, \`fake_warns\`, \`ranks\`, \`marriages\`, \`logs\`, \`channel_news_id\`, \`channel_global_id\`, \`channel_ai_id\`, \`ai\`, \`count_warns_max\`) VALUES (NULL, '${guildId}', '1', '1', '1', '0', '1', '1', '', '', '0', '0', '3') `;
               await db.query(sql, async (err) => {
                    if (err) throw err;
                    if (terminal) await sysMySQLPrint(`Сервер ${guildId} добавлен в базу данных.`);
               });
           }
        });
    }

    async getServer(guildId){
        return await new Promise (async (resolve, reject) => {
           await db.query(`SELECT * FROM \`${process.env.MYSQL_TABLE_SERVERS}\` WHERE \`guild_id\` = '${guildId}'`, async (err, data) => {
               if (err) await reject(err);
               else await resolve(data[0]);
           })
        });
    }

    async getModerators(guildId){
        return await new Promise (async (resolve, reject) => {
            await db.query(`SELECT * FROM \`${process.env.MYSQL_TABLE_MODERATORS}\` WHERE \`guild_id\` = '${guildId}'`, async (err, data) => {
                if (err) await reject(err);
                else await resolve(data[0]);
            })
        });
    }

    async getWarns(guildId, user){
        return await new Promise (async (resolve, reject) => {
            await db.query(`SELECT * FROM \`${process.env.MYSQL_TABLE_WARNS}\` WHERE \`guild_id\` = '${guildId}' AND \`user_id\` = '${user.id}'`, async (err, data) => {
                if (err) await reject(err);
                else await resolve(data[0]);
            })
        });
    }

    async getMarriages(guildId){
        return await new Promise (async (resolve, reject) => {
            await db.query(`SELECT * FROM \`${process.env.MYSQL_TABLE_MARRIAGES}\` WHERE \`guild_id\` = '${guildId}'`, async (err, data) => {
                if (err) await reject(err);
                else await resolve(data);
            })
        });
    }

    async setParameter(guildId, parameter, value){
        return await new Promise( async (resolve, reject) => {
            await this.getServer(guildId) // Если база данных сервера найдена
                .then( async () => {
                    await db.query(`UPDATE \`${process.env.MYSQL_TABLE_SERVERS}\` SET \`${parameter}\` = '${value}' WHERE \`guild_id\` = ${guildId}`, async (err) => {
                        if (err) reject(err);
                        else {
                            await sysInfo(`Параметер "${parameter}" установлен в значении "${value}"`);
                            await resolve(true);
                        }
                    });
                })
                .catch( async (err) => {
                    await createError(err);
                    await reject(err);
                });
        });
    }

    async getCommands(){
        return await new Promise (async (resolve, reject) => {
            await db.query(`SELECT * FROM ${process.env.MYSQL_TABLE_COMMANDS_LIST}`, async (err, data) => {
                if (err) await reject(err);
                else await resolve(data);
            })
        })
    }
}

class report{

    constructor(interaction) {
        this.interaction = interaction;
    }

    async initWindow(){
        const modal = new ModalBuilder();
        await modal.setCustomId("modal_send_bug_report");
        await modal.setTitle("Отправить отчёт об ошибке!");

        let input = new TextInputBuilder();
        await input.setCustomId("modalSendBugReportContent");
        await input.setLabel("Что произошло? Опишите всё здесь.");
        await input.setStyle(TextInputStyle["Paragraph"]);

        let actionRow = await new ActionRowBuilder().addComponents(input);
        await modal.addComponents(actionRow);
        await this.interaction.showModal(modal);
    }

    async save(content){

        let arr_date = date().split("."); // Если 10.02.2024 ["10", "02", "2024"]
        let sql_date = `${arr_date[2]}-${arr_date[1]}-${arr_date[0]}`; // 2024-02-10 - для mysql таблицы
        let sql_user = {username: this.interaction.user.username, id: this.interaction.user.id};

        let sql = `INSERT INTO \`discord_bot_simplex_reports\` (\`id\`, \`guild_id\`, \`date\`, \`time\`, \`channel_id\`, \`author\`, \`content\`) VALUES (NULL, '${this.interaction.guild.id}', '${sql_date}', '${time()}', '${this.interaction.channel.id}', '${JSON.stringify(sql_user)}', '${content}');`;
        db.query(sql, async (err) => {
            if (err) throw err;
            else await sendReplyHidden(this.interaction, `Ваш отчёт об ошибке успешно отправлен!`);
        })
    }
}

class role{

    constructor(interaction) {
        this.interaction = interaction;
    }

    async setColorRandom(role){
        function getRandomColor() {return `#${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`}

        try {
            role.edit({color: getRandomColor()})
                .then(  async () => {
                    await sendReplyHidden(this.interaction, `Вы изминили цвет роли <@&${role.id}>!`);
                })
                .catch( async () => {
                    await sendReplyHidden(this.interaction, `Приложению не хватило прав для исполнения операции над ролью ${role}.`);
                })
        } catch (err) {await this.interaction.editReply({content: `Приложению не хватило прав для исполнения операции над ролью ${role}.`})}
    }

    async setColor(role, color){
        try {
            role.edit({color: `#${String(color).slice(0, 6)}`})
                .then(  async () => {
                    await sendReplyHidden(this.interaction, `Вы изминили цвет роли <@&${role.id}>!`);
                })
                .catch( async () => {
                    await sendReplyHidden(this.interaction, `Приложению не хватило прав для исполнения операции над ролью ${role}.`);
                })
        } catch (err) {await this.interaction.editReply({content: `Приложению не хватило прав для исполнения операции над ролью ${role}.`})}
    }

}

async function convertDate(str) {
    let date = new Date(str),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), month, day].join("-");
}

// imported from https://stackoverflow.com/questions/74843463/is-there-a-way-to-find-the-name-of-the-permission-using-the-permissionsbitfield
function permissionsNames(permissions){
    const result = [];

    for (const perm of Object.keys(PermissionsBitField.Flags)) {
        if (permissions.has(PermissionsBitField.Flags[perm])) {
            result.push(perm);
        }
    }
    return result;
}

module.exports = {
    checkObject,
    checkObjects,
    checkServerBase,
    createNewHistoryMessage,
    createError,
    database,
    db,
    getAllServers,
    getGuildIcon,
    getRandomNumber,
    getServer,
    getTrackArtists,
    getUser,
    getUserAvatar,
    getUserInfo,
    handler,
    invite,
    marriage,
    moderator,
    report,
    role,
    send,
    sendPrivateMessage,
    sendReply,
    sendReplyHidden,
    serverBase,
    sysError,
    sysInfo,
    sysInfoError,
    sysPrint,
    sysPrintNewCommand,
    warn,
}