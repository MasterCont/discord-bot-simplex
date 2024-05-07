// All editing copyrights belong to MasterCont
// For deleting this inscription, you automatically lose the license to edit this code.
require('dotenv').config();
const {Client, GatewayIntentBits, Routes, REST, ActivityType, Events} = require('discord.js'); // Подключаем библиотеку discord.js
const {sysPrint, sysError, createNewHistoryMessage, checkServerBase, database, createError, handler, warn} = require("./src/common/modules");
const {version, name} = require("./package.json");
const commands = require('./src/commands/slash_commands');
const {execute} = require('./src/common/interactions');
const {terminal} = require('./src/terminal/terminal');
const {sberGigaChat} = require('./src/ai/sber/gigachat')
const client = new Client({
    intents: [
        GatewayIntentBits["Guilds"],
        GatewayIntentBits["GuildMessages"],
        GatewayIntentBits["MessageContent"],
        GatewayIntentBits["GuildMembers"],
        GatewayIntentBits["GuildIntegrations"],
        GatewayIntentBits["GuildModeration"],
        GatewayIntentBits["GuildVoiceStates"],
        GatewayIntentBits["GuildInvites"],
        GatewayIntentBits["GuildMessageTyping"],
        GatewayIntentBits["GuildPresences"],
    ]
}) // Объявляем, что client - бот

let IMAPClientToken = process.env["API_BOT_TOKEN"];
let testBotToken = process.env["API_TEST_BOT_TOKEN"];
let {IMAPClient_id, testBotClient_id} = require('./config.json');

const token = IMAPClientToken;
const client_id = IMAPClient_id;

const rest = new REST({ version: '10'}).setToken(token);
process.noDeprecation = true;

let clientGuilds = [];

client.on(Events.ClientReady, async (bot) => {
    function updateClientStatus() {
        setInterval(() => {
            try{
                client.user.setPresence({
                    status: 'online',
                    activities: [{name: `Servers: ${client.guilds.cache.size} | v${version}`, type: ActivityType.Watching}]
                });
            } catch (e) {sysError("Не удалось установить статус приложения. Error: " + e.message)}

        }, 10000);
    }

    client.guilds.cache.forEach(guild => {
        checkServerBase(guild.id);
        new database().checkServerBase(guild.id);
    });

    await sysPrint(`Интегрированное приложение "${bot.user.username}" запустилось.`);
    await sysPrint("Количество серверов: " + client.guilds.cache.size);
    client.user.setPresence({
        status: 'online',
        activities: [{name: `discord.js | v${version}`, type: ActivityType.Watching}]
    });

    updateClientStatus();
});


client.on(Events.MessageCreate, async (message) => {
    await message.mentions.users.find(async user => {
        if (user.id === client.user.id && user.id !== message.author.id){
            new database().getServer(message.guild.id)
                .then(async (data) => {
                    if (!data["ai"]) await message.reply("Система искусственного интеллекта на этом сервере отключена. Чтобы включить ее, используйте </ai_system:1231954362717311056>");
                    else if (Number(data["channel_ai_id"]) === 0) await message.reply("Канал по умолчанию не указан для разговоров с ИИ. Используйте </set_chat_ai:1231952621372313610>");
                    else if (Number(data["channel_ai_id"]) !== Number(message.channel.id)) await message.reply(`Для разговоров с ИИ используйте канал <#${data["channel_ai_id"]}>`);
                    else {
                        await new sberGigaChat().request(message.content)
                            .then(async (data) => {
                                try {
                                    await message.reply(data.toString());
                                } catch (err) {
                                    await sysError(err);
                                    setTimeout(async () => {
                                        await message.channel.send(data.toString());
                                    }, 1000)
                                }
                            })
                            .catch(async (err) => {
                                await createError(err);
                            })
                    }
                })
                .catch(async (err) => {
                    await message.reply("Извините, но что-то пошло не так.");
                    await createError(err);
                });
        }
    })
    await createNewHistoryMessage(message.guild, message.channel, `user`, message);
});

client.on(Events.GuildCreate, async (guild) => {
    await sysPrint(`Бот добавлен на сервере: @${guild.id} - ${guild.name}`);
    clientGuilds.push(guild);
    await checkServerBase(guild.id);
});

client.on(Events.GuildDelete, async (guild) => {
    await sysPrint(`Бот удален из сервера: @${guild.id} - ${guild.name}`);
    clientGuilds.splice(clientGuilds.indexOf(guild), 1);
});

client.on(Events.InteractionCreate, async (interaction) => await execute( interaction, client));

client.on(Events.Error, async (err) => {

    err = {
        rawError:{
            message: err
        },
        code: null,
        status: null,
        method: null,
        url: null
    }

    await createError(err);
});

// client.on(Events.TypingStart, async (data) => {
//     await client.guilds.cache.get(data.guild.id).channels.cache.get(data.channel.id).send(`${data.user.username} печатает...`);
// })


async function main(){
    try {
        await new database().initialization(); // Инициализация базы данных
        await rest.put(Routes.applicationCommands(client_id), {body: commands.body}); // Записываем команды в базу
        await new database().check_availability_commands(commands); // Проверяем наличие команд
        await client.login(token); // Авторизация бота
    } catch (err) {await createError(err)}
}

(async () => {
    await sysPrint(`Приложение "${name}" стратануло!`);
    await sysPrint(`Версия приложения: ${version}.`);
    await main();
    await new terminal(client).update();
})();


// Прочие настройки
