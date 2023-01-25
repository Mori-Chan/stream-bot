const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        // コマンドの名前
		.setName('ping')
        // コマンドの説明文
		.setDescription('Pong!と返信。'),
	async execute(interaction) {
        // Pong!と返信
		await interaction.reply('Pong!');
	},
};