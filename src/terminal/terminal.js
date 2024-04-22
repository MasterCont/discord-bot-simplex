const readline = require('readline');
const {sysPrint, sysInfo, sendPrivateMessage, sysError, sysInfoError, getAllServers, getServer, getUser, checkServerBase,
    checkObject, checkObjects, serverBase} = require('../common/modules');
const commands = require("./list_commands_for_terminal.json");
const {name, author, version, description, license} = require("../../package.json");
readline.emitKeypressEvents(process.stdin);

// Активируем терминал для создания команд во время работы приложения
class terminal {
    constructor (client) {
        this.client = client;
    }

    rl = readline.createInterface({
        input: process.stdin, 
        output: process.stdout,
    });

    async update() {
        this.rl.on("line", async (input) => {
            let args = input.split(' ');
            let value, userid, user, guildid, channelid, object, parameter, command;

            // Создаём команды
            switch (args[0]) {
                case "help": for(let i=0; i<commands.main.length; i++) await sysInfo(commands.main[i]); break;
                case "about": 
                    await sysInfo(`Приложение: "${name}".`);
                    await sysInfo(`Описание: "${description}".`);
                    await sysInfo(`Версия: "${version}".`);
                    await sysInfo(`Автор: "${author}".`);
                    await sysInfo(`Лицензия: "${license}".`);
                    break;
                case "create": 
                    object = args[1];

                    if (object) {

                        switch (object){
                            case "help": for(let i=0; i<commands.createcommands.length; i++) await sysInfo(`${args[0]} ${commands.createcommands[i]}`); break;
                            case "serverbase": 
                                guildid = args[2];

                                if (guildid) {
                                    await checkServerBase(guildid, true);
                                } else await sysInfoError(`Проверьте синтаксис: ${args[0]} ${args[1]} [guildid]`);
                                break;
                            default: await sysInfoError(`Объект ${object} не найден. Используйте "${args[0]} help" для справки.`);
                        }

                    } else await sysInfoError(`Проверьте синтаксис: ${args[0]} [object];`);

                    break;
                case "get":
                    object = args[1]; // Получаем то, что хотим получить

                    if (object){
                        switch(object) {
                            case "help": for(let i=0; i<commands.getcommands.length; i++) await sysInfo(`get ${commands.getcommands[i]}`); break;
                            case "servers":
                            case "guilds":
                               let serverslist = await getAllServers(this.client); // Получаем список серверов
                               for (let i=0; i<serverslist.length; i++) await sysInfo(serverslist[i]); // Поочерёдно выводим в терминал
                               break;
                            case "server":
                            case "guild":
                                guildid = args[2];

                                if (guildid) {
                                    await sysInfo(`Информация о сервере ${guildid}:`);
                                    getServer(this.client, guildid).then(console.log).catch(console.error);
                                } else await sysInfoError(`Проверьте синтаксис: get server [serverid]`);
                                break;
                            case "user":
                                user = args[2];

                                if (user){
                                    let data = await getUser(this.client, user);
                                    if (data) {
                                        await sysInfo(`Информация о пользователе ${user}`);
                                        console.log(data);
                                    } else await sysError(`Не удалось получить информацию о пользователе "${user}"`);
                                } else await sysInfoError(`Проверьте синтаксис: get server [userid/username]`);
                                break;
                            default: await sysInfoError(`Объект ${object} не найден. Используйте "get help" для справки.`);
                        }
                    } else await sysInfoError("Проверьте синтаксис: get [object];");

                    break;
                case "sendprivatemessage":
                case "sendprivatemsg":
                    userid = args[1];
                    value = "";

                    for (let i = 2; i < args.length; i++) {
                        value = value + `${args[i]} `;
                    }

                    if (userid && value){

                        // Пробуем получить пользователя сначала по id
                        let user;
                        try {
                            user = await this.client.users.cache.get(userid);
                            // Если это не id, то пробоуем по username
                            if (!user) user = this.client.users.cache.find(user => user.username === args[1]);
                        } catch (err) {
                            // Иначе выдаём ошибку
                            await sysInfoError("Не удалось получить пользователя. Проверьте синтаксис и попробуйте ещё раз.")
                            await sysError(err);
                        }

                        await sendPrivateMessage(this.client, user, value)
                        .then(async () => {
                            await sysInfo(`Сообщение '${value}' отправлено пользователю ${user.username}.`);
                        }).catch(err => {
                            sysError(err);
                            sysInfoError("Не удалось отправить сообщение. Проверьте синтаксис и попробуйте ещё раз.")
                        });
                    } else await sysInfoError(`Проверьте синтаксис: sendprivatemessage [user] [message];`);
                    break;
                case "sendmessage":
                case "sendmsg":
                    guildid = args[1];
                    channelid = args[2];
                    value = "";

                    for (let i = 3; i < args.length; i++) {
                        value = value + `${args[i]} `;
                    }

                    if (guildid && channelid && value) {
                        try{
                            await this.client.guilds.cache.get(guildid).channels.cache.get(channelid).send(value);
                            await sysInfo(`Сообщение "${value}" было отправлено на сервер "${guildid}"`);
                        } catch (err) {
                            await sysError(`Не удалось отправить сообщение. ${err}`);
                        }
                    } else await sysInfoError("Проверьте синтаксис: sendmessage/sendmsg [guildid] [channelid] [msg];")
                    break;
                case "set": // Установить параметер/свойство какому-либо объекту.
                    object = args[1];

                    if (await checkObject([args[0]], object)) {
                        switch (object) {
                            case "help": for(let i=0; i<commands.setcommands.length; i++) await sysInfo(`${args[0]} ${commands.setcommands[i]}`); break;
                            case "server": // Взаимодействие с сервером.
                                guildid = args[2];

                                if (await checkObject([args[0], args[1]], object)) {
                                    switch (guildid){
                                        case "help": for(let i=0; i<commands.server_commands.length; i++) await sysInfo(`${args[0]} ${commands.server_commands[i]}`); break;
                                        default:
                                            object = args[3];
                                            command = args[4];
                                            parameter = args[5];

                                            // Если аргументов больше положенного, то просто склееваем все оставшее в последний аргумент
                                            // if (args.length > 6) for(let i=6; i<args.length; i++) parameter += args[i];

                                            if (await checkObjects([object, command, parameter])){
                                                switch (command) { // Если команда найдена
                                                    case "set": await new serverBase().setParameter(guildid, object, parameter); break;
                                                    case "add": await new serverBase().addParameter(guildid, object, parameter); break;
                                                    case "splice": await new serverBase().spliceArray(guildid, object, parameter); break;
                                                    default:
                                                        await sysInfoError(`Команда "${command}" не найдена. Ниже перечислены доступные команды:`);
                                                        for(let i=0; i<commands.server_commands.length; i++) await sysInfo(`${args[0]} ${commands.server_commands[i]}`); break;
                                                }
                                            } else await sysInfoError(`Проверьте синтаксис: ${args[0]} ${args[1]} [guildId] [object] [command] [parameter];`);

                                            // await sysInfoError(`Объект ${object} не найден. Используйте "${args[0]} ${args[1]} help" для справки.`);
                                    }
                                }
                                break;
                            default: await sysInfoError(`Объект ${object} не найден. Используйте "${args[0]} help" для справки.`);
                        }
                    }


                    break;
                case "stop":
                case "exit": await stopProcess("Приложение принудительно остановлено."); break;
                default: await sysInfoError(`Команда "${args[0]}" является неизвестной. \nИспользуйте "help" для вывода доступных команд.`); break;
            }
        });
    
    }
}

// process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

_input = "";

process.stdin.on('keypress', (str, key) => {

    if(key.sequence === '\u0003') { // Если crtl-c, то выключаем процесс
        stopProcess("Приложение принудительно остановлено.");
    }

});

function stopProcess(value) {
    sysPrint(value)
    process.exit();
}

module.exports = {
    terminal
}
