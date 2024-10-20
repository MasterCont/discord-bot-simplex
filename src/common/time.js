class Time{
    Hours(){
        const Hours = new Date().getHours();
        if(Hours < 10) return `0${Hours}`
        else return Hours;
    }
    Minutes(){
        const Minutes = new Date().getMinutes();
        if(Minutes < 10) return `0${Minutes}`
        else return Minutes;
    }
    Seconds(){
        const Seconds = new Date().getSeconds();
        if(Seconds < 10) return `0${Seconds}`
        else return Seconds;
    }
    Date(){
        const date = new Date().getDate();
        if(date < 10) return `0${date}`
        else return date;
    }
    Month(){
        const Month = new Date().getMonth();
        if(Month < 10) return `0${Month}`
        else return Month;
    }
    Year(){
        const Year = new Date().getFullYear();
        return Year;
    }
}

function time(){
    return new Date().toLocaleTimeString("ru", {timeZone: "Europe/Moscow"});
}

function date(){
    return new Date().toLocaleDateString("ru", {dateZone: "Europe/Moscow"});
}

async function getDateMySQL(){
    let new_date = date();
    let array = new_date.split(".");
    return `${array[2]}-${array[1]}-${array[0]}`;
}

module.exports = {time, date, Time};