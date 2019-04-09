
var Discord = require('discord.js');

var dl = require('discord-leveling');

var logger = require('winston')

const token = require('./auth.json')


const client = new Discord.Client({
  token:('token'),
  autorun: true
});

client.login('token')

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

client.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

client.on('message', async message => {
 
const settings = {
  prefix: '!'
}

var command = message.content.toLowerCase().slice(settings.prefix.length).split(' ')[0];

var args = message.content.split(' ').slice(1);

if (message.author.bot) return;
 
var profile = await dl.Fetch(message.author.id);
dl.AddXp(message.author.id, 10);

if (profile.xp + 10 > 100) {
  await dl.AddLevel(message.author.id, 1)
  await dl.SetXp(message.author.id, 0)
  message.reply(`You just leveled up!! You are now level: ${profile.level + 1}`)
}

if (!message.content.startsWith(settings.prefix)) return;

if (command === 'profile') {
  var user = message.mentions.users.first() || message.author
  var output = await dl.Fetch(user.id)
  message.channel.send(`Hey ${user.tag}! You have ${output.level} level(s)! and ${output.xp} xp!`);
}

if (command === 'setxp') {
  var amount = args[0]
  var user = message.mentions.users.first() || message.author
  var output = await dl.SetXp(user.id, amount)
  message.channel.send(`Hey ${user.tag}! You now have ${amount} xp!`);
}

if (command === 'setlevel') {
  var amount = args[0]
  var user = message.mentions.users.first() || message.author
  var output = await dl.SetLevel(user.id, amount)
  message.channel.send(`Hey ${user.tag}! You now have ${amount} levels!`);
}

if (command === 'leaderboard') {
  if (message.mentions.users.first()) {
    var output = await dl.Leaderboard({
      search: message.mentions.users.first().id
    })
    message.channel.send(`The user ${message.mentions.users.first().tag} is number ${output.placement} on my leaderboard!`);
  } else {
    dl.Leaderboard(
      limit( 3),).then(async users => {
    var firstplace = await client.fetchUser(users[0].userid) 
    var secondplace = await client.fetchUser(users[1].userid)
    var thirdplace = await client.fetchUser(users[2].userid)
    message.channel.send(`My leaderboard:
1 - ${firstplace.tag} : ${users[0].level} : ${users[0].xp}
2 - ${secondplace.tag} : ${users[1].level} : ${users[1].xp}
3 - ${thirdplace.tag} : ${users[2].level} : ${users[2].xp}`)
    })
  }
}

if (command == 'delete') { //You want to make this command admin only!
  var user = message.mentions.users.first()
  if (!user) return message.reply('Pls, Specify a user I have to delete in my database!')
  if (!message.guild.me.hasPermission(`ADMINISTRATION`)) return message.reply('You need to be admin to execute this command!')
  var output = await dl.Delete(user.id)
  if (output.deleted == true) return message.reply('Succesfully deleted the user out of the database!')
  message.reply('Error: Could not find the user in database.')
}
})
client.login('token')