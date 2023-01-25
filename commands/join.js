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
		.addChannelOption((option) =>
			option
				.setName('channel2')
				.setDescription('The channel that Speaker-bot join')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildVoice),
		),
	async execute(interaction, client1, client2) {
		const voiceChannel1 = interaction.options.getChannel('channel1');
		const voiceChannel2 = interaction.options.getChannel('channel2');
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
				channelId: voiceChannel2.id,
				adapterCreator: client2.guilds.cache.get(interaction.guildId).voiceAdapterCreator,
				selfMute: false,
				selfDeaf: true,
			});
			// Listener-botが参加しているVCで誰かが話し出したら実行
			connection1.receiver.speaking.on('start', (userId) => {
				// VCの音声取得機能
				const audio = connection1.receiver.subscribe(userId, {
					end: {
						behavior: EndBehaviorType.AfterSilence,
						duration: 100,
					},
				});
				// 音声をVCに流す機能
				const player = createAudioPlayer({
					behaviors: {
						// 聞いている人がいなくても音声を中継してくれるように設定
						noSubscriber: NoSubscriberBehavior.play,
					},
				});
				const resource = createAudioResource(audio,
					{
						// VCから取得してきた音声はOpus型なので、Opusに設定
						inputType: StreamType.Opus,
					},
				);
				player.play(resource);
				connection2.subscribe(player);
				
			});
			await interaction.reply('VCに参加しました！');
			// return [connection1, connection2];
		}
		else {
			await interaction.reply('BOTを参加させるVCを指定してください！');
		}
	},
};