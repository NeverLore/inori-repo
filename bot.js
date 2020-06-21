const Discord = require('discord.js');
const database = require('./database');
const fs = require('fs');
const utils = require('./utils');
const bot = new Discord.Client();

const cmds = {};

bot.login(process.env.TOKEN)
  .catch(e => console.log(e));

bot.on('ready', async () => {
	console.log(`Successfully logged in Discord! • ${bot.user.username}`);
	await database.load('./database.json');
  await loadCommands('./cmds');
});

process.on("SIGINT", async () => {
	console.log('Closing...');
	await bot.destroy();
	await database.save('./database.json');
});

bot.on('message', async msg => {

  if(database.getGuildData(msg.guild).blacklisted === true) return;



	if (msg.author.bot || msg.channel.type != "text") return;
	let acc = database.getAccount(msg.member);
	//...

	let prefix = database.getGuildData(msg.guild).prefix;
	if (msg.content.toLowerCase().startsWith(prefix)) {
		let m = msg.content.slice(prefix.length);
		for (let cname in cmds) {
			if (m.startsWith(cname)) {
				let args = m.slice(cname.length).split(' ').filter(el => el != '');
				await cmds[cname].run(bot, msg, args, database);
			}
		}
    return;
	}});

async function loadCommands(path) {
	console.log('loading commands...');
	let files = await utils.readDirAsync(path);
	files.forEach(file => {
		if (file.endsWith('.js')) {
			let cname = file.toLowerCase().substring(0, file.length-3);
			let command = require(`${path}/${file}`);
			cmds[cname] = command;
		}
	});
}
