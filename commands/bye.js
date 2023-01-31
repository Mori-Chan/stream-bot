const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bye')
		.setDescription('Disconnect voice channel!'),
	async execute(interaction, connections) {
		if (connections === undefined) {
			await interaction.reply('VCに接続していません。');
			return;
		}
		else {
			for (const connection of connections) {
				if (connection !== undefined) {
					connection.destroy();
				}
			}
			await interaction.reply('Bye VC!');
			return;
		}
	},
};