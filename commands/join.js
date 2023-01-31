const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
module.exports = {
	data: new SlashCommandBuilder()
        // コマンドの名前
		.setName('join')
        // コマンドの説明文
		.setDescription('VCに参加。')
		// コマンドのオプションを追加
		.addChannelOption((option) =>
			option
				.setName('channel1')
				.setDescription('The channel that Listener-bot join')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice),
		)
		.addStringOption((option) =>
			option
				.setName('channel2')
				.setDescription('The channel that Speaker-bot join')
				.setAutocomplete(true)
				.setRequired(true),
		),
		async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const vc = interaction.options.get('channel1');
		const chats = interaction.guild.channels.cache;
		const voiceChannels = chats.filter(file => file.type === 2);
		let unSelectedVoiceChannels = [];

		for (const voiceChannel of voiceChannels) {
			if (voiceChannel[0] !== vc.value) {
				unSelectedVoiceChannels.push(voiceChannel);
			}
		}
		
		const filtered = unSelectedVoiceChannels.filter(unSelectedVoiceChannel => unSelectedVoiceChannel[1].name.startsWith(focusedValue));

		await interaction.respond(
			
			filtered.map(unSelectedVoiceChannel => ({ name: unSelectedVoiceChannel[1].name, value: unSelectedVoiceChannel[1].id })).slice(0, 25)
		);
	},
	async execute(interaction, client1, client2) {
		const voiceChannel1 = interaction.options.getChannel('channel1');
		const voiceChannel2 = interaction.options.getString('channel2');
		if (voiceChannel1 && voiceChannel2) {
			if (voiceChannel1 === voiceChannel2) {
				await interaction.reply('同じVCには参加できません🥺');
				return;
			}
			// Listener-botがVCに参加する処理
			const connection1 = joinVoiceChannel({
				// なぜかはわからないが、groupの指定をしないと、先にVCに入っているBOTがVCを移動するだけになってしまうので、記述。
				group: 'listener',
				guildId: interaction.guildId,
				channelId: voiceChannel1.id,
				// どっちのBOTを動かしてあげるかの指定をしてあげる。
				adapterCreator: client1.guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				// VC参加時にマイクミュート、スピーカーミュートにするか否か
				selfMute: true,
				selfDeaf: false,
			});
			// Speaker-botがVCに参加する処理
			const connection2 = joinVoiceChannel({
				group: 'speaker',
				guildId: interaction.guildId,
				channelId: voiceChannel2,
				adapterCreator: client2.guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				selfMute: false,
				selfDeaf: true,
			});
			await interaction.reply('VCに参加しました！');
			return [connection1, connection2];
		}
		else {
			await interaction.reply('BOTを参加させるVCを指定してください！');
		}
	},
};