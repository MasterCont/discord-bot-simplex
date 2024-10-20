const {SlashCommandBuilder, PermissionFlagsBits, ChannelType, ContextMenuCommandBuilder, ApplicationCommandType} = require('discord.js'); // Подключаем библиотеку discord.js
const commands = {
    body: [
        // SlashCommands
        new SlashCommandBuilder()
            .setName('send_message').setNameLocalization("ru", "сообщение")
            .setDescription("Send a message on behalf of the bot.")
            .setDescriptionLocalization("ru", "Отправьте сообщение от имени бота.")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addChannelOption((option) => option.setName("channel").setDescription("The channel where the message will be published.")
                .setDescriptionLocalization("ru", "Канал, на котором будет опубликовано сообщение.")
                .setRequired(true))
            .addStringOption((option) => option.setName("message").setDescription("Value.")
                .setDescriptionLocalization("ru", "Содержимое.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('voice_connect').setNameLocalization("ru", "подключение_к_голосовому_каналу")
            .setDescription("To move the bot to the voice channel.")
            .setDescriptionLocalization("ru", "Отправить бота в голосовой канал.")
            .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
            .addChannelOption((option) => option.setName("channel").setDescription("The channel to join.")
                .setDescriptionLocalization("ru", "Канал, к которому нужно присоединиться.")
                .setRequired(true).addChannelTypes(ChannelType.GuildVoice))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('voice_disconnect').setNameLocalization("ru", "отключение_из_голосового_канала")
            .setDescription("Disable the bot from the voice channel.")
            .setDescriptionLocalization("ru", "Отключите бота от голосового канала.")
            .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('out_channel_history_messages').setNameLocalization("ru", "вывести_историю_сообщений_канала")
            .setDescription("Output of the entire message history on the channel.")
            .setDescriptionLocalization("ru", "Вывод всей истории сообщений на канале.")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addChannelOption((option) => option.setName("channel").setDescription("The channel from which you want to get the entire message history.")
                .setDescriptionLocalization("ru", "Канал, с которого вы хотите получить всю историю сообщений.").setRequired(true))
            .addNumberOption((option) => option.setName("quantity").setDescription("Enter the number of messages from the last one sent on the channel.")
                .setDescriptionLocalization("ru", "Введите количество сообщений из последнего, отправленного по каналу.").setRequired(true))
            .addStringOption((option) => option.setName("search").setDescription("Output messages with a similar value")
                .setDescriptionLocalization("ru", "Вывести сообщения с подобным значением"))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('kick').setNameLocalization("ru", "кик")
            .setDescription("Kick the user out of the server.")
            .setDescriptionLocalization("ru", "Выгнать пользователя из сервера.")
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            .addStringOption((option) => option.setName("reason").setDescription("The reason why the user will be kicked off the server.")
                .setDescriptionLocalization("ru", "Причина, по которой пользователь будет выгнан с сервера.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('ban').setNameLocalization("ru", "бан")
            .setDescription("Ban a user on the server.")
            .setDescriptionLocalization("ru", "Заблокировать пользователя на сервере.")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            .addStringOption((option) => option.setName("reason").setDescription("The reason for the ban.")
                .setDescriptionLocalization("ru", "Причина блокировки пользователя.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('unban').setNameLocalization("ru", "разбан")
            .setDescription("Unblock a user on the server.")
            .setDescriptionLocalization("ru", "Разблокировать пользователя на сервере.")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            // .addBooleanOption((option) => option.setName("createinvite").setDescription("Should I send a link to the server invitation to the user?").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('set_nickname').setNameLocalization("ru", "установить_имя_пользователя")
            .setDescription("Set a new username for the user.")
            .setDescriptionLocalization("ru", "Установить пользователю новое имя пользователя.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            .addStringOption((option) => option.setName("nickname").setDescription("The new nickname.")
                .setDescriptionLocalization("ru", "Установить новое имя пользователя.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('get_user_avatar').setNameLocalization("ru", "получить_аватар_пользователя")
            .setDescription("Get the user avatar.")
            .setDescriptionLocalization("ru", "Получить аватар пользователя.")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('mute').setNameLocalization("ru", "мьют")
            .setDescription("Take away the user access to sending messages.")
            .setDescriptionLocalization("ru", "Забрать у пользователя доступ к отправке сообщениям.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            .addNumberOption((option) => option.setName("time").setDescription("The time that the user will not be able to send messages in seconds.")
                .setDescriptionLocalization("ru", "Время, в течение которого пользователь не сможет отправлять сообщения, исчисляется секундами.").setRequired(true))
            .addStringOption((option) => option.setName("reason").setDescription("The reason for the user ban on messages.")
                .setDescriptionLocalization("ru", "Причина запрета пользователя к сообщениям.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('unmute').setNameLocalization("ru", "размьют")
            .setDescription("Granting user access to messages.")
            .setDescriptionLocalization("ru", "Предоставление доступа пользователю к сообщениям.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .addUserOption((option) => option.setName("user").setDescription("The user to whom the changes will be applied.")
                .setDescriptionLocalization("ru", "Пользователь, к которому будут применены изменения.").setRequired(true))
            .addBooleanOption((option) => option.setName("notification").setDescription("Notify the user in private messages about the change applicable to him? True - Yes, False - No.")
                .setDescriptionLocalization("ru", "Оповестить пользователя в личные сообщения о применимом к нему изменении? True - Да, False - Нет.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName('set_role_random_color').setNameLocalization("ru", "установить_случайный_цвет_роли")
            .setDescription("Edit the role color to unexpected on the server.")
            .setDescriptionLocalization("ru", "Измените цвет роли на неожиданный на сервере.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addRoleOption((option) => option.setName("role").setDescription("The role to edit.")
                .setDescriptionLocalization("ru", "Роль для редактирования.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // new SlashCommandBuilder()
        // .setName('invite')
        // .setDescription("Invite a user to the server.")
        // .setDescriptionLocalization("ru", "Пригласите пользователя на сервер.")
        // .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        // .addStringOption((option) => option.setName("userid").setDescription("The identifier of the user by which the bot will send the invitation.")
        // .setDescriptionLocalization("ru", "Идентификатор пользователя, по которому бот отправит приглашение.").setRequired(true))
        // .toJSON(),

        // new SlashCommandBuilder()
        // .setName('play')
        // .setDescription("Play a music.")
        // .setDescriptionLocalization("ru", "Проиграть музыку.")
        // .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        // .addStringOption((option) => option.setName("name").setDescription("The url or name of the video to play.")
        // .setDescriptionLocalization("ru", "URL-адрес или название воспроизводимого видео.").setRequired(true))
        // .toJSON(),
        //
        // new SlashCommandBuilder()
        // .setName('skip')
        // .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        // .setDescription("Skip a music.")
        // .setDescriptionLocalization("ru", "Пропустить текущий трек.")
        // .toJSON(),
        //
        // new SlashCommandBuilder()
        // .setName('stop')
        // .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        // .setDescription("Stop a music.")
        // .setDescriptionLocalization("ru", "Остановить музыку.")
        // .toJSON(),

        new SlashCommandBuilder()
            .setName("report").setNameLocalization("ru", "репорт")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Send a bug report.")
            .setDescriptionLocalization("ru", "Отправьте сообщение об ошибке.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("get_guild_icon").setNameLocalization("ru", "получить_иконку_сервера")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .setDescription("Get the icon of this server.")
            .setDescriptionLocalization("ru", "Получите значок этого сервера.")
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("send_json_embed").setNameLocalization("ru", "сообщение_встроенное_через_json")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
            .setDescription("Send the embedded message via a JSON structure.")
            .setDescriptionLocalization("ru", "Отправьте встроенное сообщение через JSON-структуру.")
            .addChannelOption((option) => option.setName("channel").setDescription("The channel where the embedded message will be published.")
                .setDescriptionLocalization("ru", "Канал, на котором будет опубликовано встроенное сообщение.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        sendembed = new SlashCommandBuilder()
            .setName("send_embed").setNameLocalization("ru", "сообщение_встроенное")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
            .setDescription("Send the embedded message.")
            .setDescriptionLocalization("ru", "Отправьте встроенное сообщение.")
            .addChannelOption((option) => option.setName("channel").setDescription("The channel where the embedded message will be published.")
                .setDescriptionLocalization("ru", "Канал, на котором будет опубликовано встроенное сообщение.")
                .setRequired(true))

            .addStringOption((option) => option.setName("title").setNameLocalization("ru", "заголовок")
                .setDescription("The title of the embedded message.")
                .setDescriptionLocalization("ru", "Заголовок встроенного сообщения.")
                .setRequired(true))

            .addStringOption((option) => option.setName("description").setNameLocalization("ru", "описание")
                .setDescription("The description of the embedded message.")
                .setDescriptionLocalization("ru", "Описание встроенного сообщения.")
                .setRequired(true))

            .addStringOption((option) => option.setName("url").setNameLocalization("ru", "url-адрес")
                .setDescription("The URL for the embedding of the embedded message.")
                .setDescriptionLocalization("ru", "URL-Адрес для загаловка встроенного сообщения."))

            .addStringOption((option) => option.setName("author").setNameLocalization("ru", "автор")
                .setDescription("The author of the embedded message.")
                .setDescriptionLocalization("ru", "Автор встроенного сообщения."))

            .addStringOption((option) => option.setName("author_url").setNameLocalization("ru", "автор_url")
                .setDescription("Internet link to the author of the embedded message.")
                .setDescriptionLocalization("ru", "Интернет-ссылка на автора встроенного сообщения."))

            .addStringOption((option) => option.setName("author_icon_url").setNameLocalization("ru", "автор_иконка_url")
                .setDescription("The author avatar of the embedded message.")
                .setDescriptionLocalization("ru", "Аватар автора встроенного сообщения."))

            .addStringOption((option) => option.setName("image").setNameLocalization("ru", "изображение")
                .setDescription("Adds an image to the body of the embedded message.")
                .setDescriptionLocalization("ru", "Добавляет изображение в тело встроенного сообщения."))

            .addStringOption((option) => option.setName("thumbnail").setNameLocalization("ru", "мини_изображение")
                .setDescription("Adds a thumbnail image to the embedded message.")
                .setDescriptionLocalization("ru", "Добавляет миниатюрное изображение во встроенное сообщение."))

            .addStringOption((option) => option.setName("footer").setNameLocalization("ru", "нижний_колонтитул")
                .setDescription("This message will be displayed in the footer.")
                .setDescriptionLocalization("ru", "Этот текст будет отображен в нижнем колонтитуле."))

            .addStringOption((option) => option.setName("footer_icon_url").setNameLocalization("ru", "нижний_колонтитул_иконка_url")
                .setDescription("The image is in the footer.")
                .setDescriptionLocalization("ru", "Изображение находится в нижнем колонтитуле."))

            .addBooleanOption((option) => option.setName("timestamp").setNameLocalization("ru", "отметка_времени")
                .setDescription("The timestamp that is displayed in the footer.")
                .setDescriptionLocalization("ru", "Отметка времени, которая отображается в нижнем колонтитуле."))

            .addStringOption((option) => option.setName("color").setNameLocalization("ru", "цвет")
                .setDescription("The color of the left panel.")
                .setDescriptionLocalization("ru", "Цвет левой панельки."))

            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("random_number").setNameLocalization("ru", "случайное_число")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Getting a random number.").setDescriptionLocalization("ru", "Получение случайного числа.")
            .addNumberOption((option) => option.setName("minimum").setNameLocalization("ru", "минимум")
                .setDescription("The minimum number.").setDescriptionLocalization("ru", "Минимальное число.").setRequired(true))
            .addNumberOption((option) => option.setName("maximum").setNameLocalization("ru", "максиум")
                .setDescription("The maximum number.").setDescriptionLocalization("ru", "Максимальное число.").setRequired(true))
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("flip_a_coin").setNameLocalization("ru", "подбросить_монетку")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Flip a coin to drop one of the two possible values.")
            .setDescriptionLocalization("ru", "Подбросьте монетку для выпадения одного из двух возможных значений.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("reverse").setNameLocalization("ru", "перевернуть")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Flip the message in the opposite direction of the letters.")
            .setDescriptionLocalization("ru", "Перевернуть сообщение в обратное направление букв.")
            .addStringOption((option) => option.setName("message").setNameLocalization("ru", "сообщение")
                .setDescription("The message that will be output in the reverse sequence of characters.")
                .setDescriptionLocalization("ru", "Сообщение, которое будет выведено в обратной последовательности символов.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("print_all_words").setNameLocalization("ru", "вывести_все_слова")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Displays the total number of words in the message.")
            .setDescriptionLocalization("ru", "Выводит общее количество слов в сообщении.")
            .addStringOption((option) => option.setName("message").setNameLocalization("ru", "сообщение")
                .setDescription("The message that will be processed into words.")
                .setDescriptionLocalization("ru", "Сообщение, которое будет обработано на слова.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("ping").setNameLocalization("ru", "пинг")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Checks the delay in sending and receiving data.")
            .setDescriptionLocalization("ru", "Проверяет задержку отправки и получения данных.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        // 1.2.0

        new SlashCommandBuilder()
            .setName("notification_system").setNameLocalization("ru", "система_уведомлений")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Do you want to receive notifications about new changes from the app?")
            .setDescriptionLocalization("ru", "Хотите получать уведомления о новых изменениях со стороны приложения?")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("log_system").setNameLocalization("ru", "система_логирования")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The application will save all messages available to the application and save them to the database.")
            .setDescriptionLocalization("ru", "Приложение будет сохранять все доступные приложению сообщения и сохранять в базу.")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("set_chat_global").setNameLocalization("ru", "установить_глобальный_чат")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Set the default global channel for the application.")
            .setDescriptionLocalization("ru", "Установить для приложения глобальный канал по умолчанию.")
            .addChannelOption((option) => option.setName("channel").setNameLocalization("ru", "канал")
                .setDescription("Messages from the developer will be sent here.")
                .setDescriptionLocalization("ru", "На канал будут приходить сообщения от разработчика.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("set_chat_news").setNameLocalization("ru", "установить_новостной_чат")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Set the default news channel for the application.")
            .setDescriptionLocalization("ru", "Установить для приложения новостной канал по умолчанию.")
            .addChannelOption((option) => option.setName("channel").setNameLocalization("ru", "канал")
                .setDescription("News from the developer will be sent here.")
                .setDescriptionLocalization("ru", "На канал будут приходить новости от разработчика.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("marry_system").setNameLocalization("ru", "система_брака")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The comic marriage system. Actually, I was just asked to do it.")
            .setDescriptionLocalization("ru", "Шуточная система брака. На самом деле, меня просто попросили это сделать.")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("set_max_number_of_warns").setNameLocalization("ru", "установить_число_предупреждений")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The number of warnings at which the user will be blocked.")
            .setDescriptionLocalization("ru", "Количество предупреждений, при котором пользователь будет заблокирован.")
            .addNumberOption((option) => option.setName("max").setNameLocalization("ru", "максиум")
                .setDescription("Specify the maximum number of warnings.")
                .setDescriptionLocalization("ru", "Укажите максимальное количество предупреждений.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("warns_system").setNameLocalization("ru", "система_предупреждений")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The application will block the user if the maximum value is reached.")
            .setDescriptionLocalization("ru", "Приложение будет блокировать пользователя, если достинуто максимальное значение.")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("fake_warns_system").setNameLocalization("ru", "шуточная_система_предупреждений")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The application will scare the user if the maximum value is reached.")
            .setDescriptionLocalization("ru", "Приложение напугает пользователя, если будет достигнуто максимальное значение.")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("add_a_moderator").setNameLocalization("ru", "добавить_модератора")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Adds a user to the moderators.")
            .setDescriptionLocalization("ru","Добавляет пользователя в модераторы.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The moderator has immunity to commands and permission to manage the application to the server.")
                .setDescriptionLocalization("ru", "Модератор имеет иммунитет к командам и позволение управлять приложением к серверу.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("remove_a_moderator").setNameLocalization("ru", "удалить_модератора")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Removes the user from the moderators.")
            .setDescriptionLocalization("ru","Удаляет пользователя из модераторов.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The moderator has immunity to commands and permission to manage the application to the server.")
                .setDescriptionLocalization("ru", "Модератор имеет иммунитет к командам и позволение управлять приложением к серверу.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("get_a_list_of_moderators").setNameLocalization("ru", "получить_список_модераторов")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Displays a list of server administrators.")
            .setDescriptionLocalization("ru","Выводит список администраторов сервера.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("warn").setNameLocalization("ru", "пред")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setDescription("Issue a warning to the user.")
            .setDescriptionLocalization("ru", "Выдайте предупреждение пользователю.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The user to whom the warning will be issued.")
                .setDescriptionLocalization("ru", "Пользователь, которому будет выдано предупреждение.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("warn_remove").setNameLocalization("ru", "пред_удалить")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setDescription("Remove the warning from the user.")
            .setDescriptionLocalization("ru", "Уберите предупреждение у пользователя.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The user to whom the warning will be removed.")
                .setDescriptionLocalization("ru", "Пользователь, которому будет убрано предупреждение.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("warn_list").setNameLocalization("ru", "пред_список")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Displays a list of server warns.")
            .setDescriptionLocalization("ru","Выводит список предупреждений сервера.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("warn_fake").setNameLocalization("ru", "пред_фэйк")
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setDescription("Scare or make fun of the user.")
            .setDescriptionLocalization("ru", "Припугните или подшутите над пользователем.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The user were making fun of.")
                .setDescriptionLocalization("ru", "Пользователь, над которым подшучиваем.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("marry").setNameLocalization("ru", "жениться")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("A comic marriage system on the server.")
            .setDescriptionLocalization("ru", "Шуточная система брака на сервере.")
            .addUserOption((option) => option.setName("user").setNameLocalization("ru", "пользователь")
                .setDescription("The user with whom you want to make a mock marriage.")
                .setDescriptionLocalization("ru", "Пользователь, с которым вы хотите заключить шуточный брак.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("divorce").setNameLocalization("ru", "развод")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Divorce your significant other (destroys a previously created marriage with you).")
            .setDescriptionLocalization("ru", "Разведитесь со своей второй половинкой (уничтожает ранее созданный с вами брак).")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("marriages").setNameLocalization("ru", "браки")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Displays a list of server people who are married to the server.")
            .setDescriptionLocalization("ru", "Выводит список людей сервера, которые состоят в браке сервера.")
            .setNSFW(false)
            .setDMPermission(true)
            .toJSON(),

        // 1.2.3
        new SlashCommandBuilder()
            .setName('set_role_color').setNameLocalization("ru", "установить_цвет_роли")
            .setDescription("Change the desired color of the role on the server.")
            .setDescriptionLocalization("ru", "Измените нужный цвет роли на сервере.")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
            .addRoleOption((option) => option.setName("role").setDescription("The role to edit.")
                .setDescriptionLocalization("ru", "Роль для редактирования.").setRequired(true))
            .addNumberOption((option) => option.setName("color").setNameLocalization("ru", "цвет")
                .setDescription("Color in 16-bit code.")
                .setDescriptionLocalization("ru", "Цвет в 16-битном коде.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // 1.2.4.1
        new SlashCommandBuilder()
            .setName("set_chat_ai").setNameLocalization("ru", "установить_ии_чат")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("Set the default ai channel for the application.")
            .setDescriptionLocalization("ru", "Установить для приложения ии канал по умолчанию.")
            .addChannelOption((option) => option.setName("channel").setNameLocalization("ru", "канал")
                .setDescription("A channel where users can use AI.")
                .setDescriptionLocalization("ru", "Канал, где пользователи смогут пользоваться ИИ.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        new SlashCommandBuilder()
            .setName("ai_system").setNameLocalization("ru", "система_ии")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDescription("The function allows you to talk to artificial intelligence.")
            .setDescriptionLocalization("ru", "Эта функция позволяет вам общаться с искусственным интеллектом.")
            .addBooleanOption((option) => option.setName("status").setNameLocalization("ru", "статус")
                .setDescription("Specify the activity status of the setting.")
                .setDescriptionLocalization("ru", "Укажите статус активности настройки.")
                .setRequired(true))
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // 1.2.5
        new SlashCommandBuilder()
            .setName("help").setNameLocalization("ru", "помощь")
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDescription("Getting information about the bots functions.")
            .setDescriptionLocalization("ru", "Получение информации о функциях бота.")
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // new SlashCommandBuilder()
        //     .setName("draw").setNameLocalization("ru", "рисовать")
        //     .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        //     .setDescription("Ask the AI to draw something.")
        //     .setDescriptionLocalization("ru", "Попросите ИИ что-нибудь нарисовать.")
        //     .addStringOption((option) => option.setName("request").setNameLocalization("ru", "запрос")
        //         .setDescription("Write here what you want to see.")
        //         .setDescriptionLocalization("ru", "Напишите сюда то, что вы хотите увидеть.")
        //         .setRequired(true))
        //     .setNSFW(false)
        //     .setDMPermission(false)
        //     .toJSON(),

        new SlashCommandBuilder()
            .setName("add_an_emoji").setNameLocalization("ru", "добавить_эмодзи")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
            .setDescription("Add emoji to the server.")
            .setDescriptionLocalization("ru", "Добавьте эмодзи на сервер.")
            .addAttachmentOption((option) =>
                option.setName("picture")
                    .setNameLocalization("ru", "изображение")
                    .setDescription("An image to add as an emoji.")
                    .setDescriptionLocalization("ru", "Изображение для добавления в качестве эмодзи.")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option.setName("name")
                    .setNameLocalization("ru", "имя")
                    .setDescription("Emoji Name.")
                    .setDescriptionLocalization("ru", "Название эмодзи.")
                    .setRequired(true)
            )
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // new SlashCommandBuilder()
        //     .setName("add_an_sticker").setNameLocalization("ru", "добавить_стикер")
        //     .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
        //     .setDescription("Add sticker to the server.")
        //     .setDescriptionLocalization("ru", "Добавьте стикер на сервер.")
        //     .addAttachmentOption((option) =>
        //         option.setName("picture")
        //             .setNameLocalization("ru", "изображение")
        //             .setDescription("An image to add as an sticker.")
        //             .setDescriptionLocalization("ru", "Изображение для добавления в качестве стикера.")
        //             .setRequired(true)
        //     )
        //     .addStringOption((option) =>
        //         option.setName("name")
        //             .setNameLocalization("ru", "имя")
        //             .setDescription("Sticker Name.")
        //             .setDescriptionLocalization("ru", "Название стикера.")
        //             .setRequired(true)
        //     )
        //     .addStringOption((option) =>
        //         option.setName("tags")
        //             .setNameLocalization("ru", "тэги")
        //             .setDescription("The corresponding emoji for the sticker.")
        //             .setDescriptionLocalization("ru", "Соответствующее эмодзи под стикер.")
        //             .setRequired(false)
        //     )
        //     .addStringOption((option) =>
        //         option.setName("description")
        //             .setNameLocalization("ru", "описание")
        //             .setDescription("You can describe this sticker in detail.")
        //             .setDescriptionLocalization("ru", "Вы можете подробно описать этот стикер.")
        //             .setRequired(false)
        //     )
        //     .setNSFW(false)
        //     .setDMPermission(false)
        //     .toJSON(),

        // 1.2.6
        new SlashCommandBuilder()
            .setName("get_role_permissions").setNameLocalization("ru", "получить_разрешения_роли")
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .setDescription("Displays all permissions of the role.")
            .setDescriptionLocalization("ru", "Выводит все разрешения роли.")
            .addRoleOption((option) =>
                option.setName("role")
                    .setNameLocalization("ru", "роль")
                    .setDescription("The role you want to get information from.")
                    .setDescriptionLocalization("ru", "Роль, от которой вы хотите получить информацию.")
                    .setRequired(true)
            )
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),

        // User context commands
        new ContextMenuCommandBuilder()
            .setName("Get the user avatar")
            .setNameLocalization("ru", "Получить аватар пользователя")
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDMPermission(true)
            .toJSON(),

        new ContextMenuCommandBuilder()
            .setName("Get user information")
            .setNameLocalization("ru", "Получить информацию")
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDMPermission(false)
            .toJSON(),

        // 1.2.5
        new ContextMenuCommandBuilder()
            .setName("Flip the user nickname")
            .setNameLocalization("ru", "Перевернуть никнейм пользователя")
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDMPermission(true)
            .toJSON(),

        new ContextMenuCommandBuilder()
            .setName("Warn")
            .setNameLocalization("ru", "Варн")
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .setDMPermission(false)
            .toJSON(),
        new ContextMenuCommandBuilder()
            .setName("Marry")
            .setNameLocalization("ru", "Жениться")
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
            .setDMPermission(true)
            .toJSON(),
    ],
    root: [
        new SlashCommandBuilder()
            .setName("api")
            .setDescription("A test command")
            .addSubcommand(
                (command) => command
                    .setName("sub1")
                    .setDescription("A subcommand")
            )
            .addSubcommand(
                (command) => command
                    .setName("sub2")
                    .setDescription("A subcommand")
            )
            .addSubcommand(
                (command) => command
                    .setName("sub3")
                    .setDescription("A subcommand")
            )
            .setNSFW(false)
            .setDMPermission(false)
            .toJSON(),
    ]
}

module.exports = commands;