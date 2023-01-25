const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, EndBehaviorType, createAudioResource, StreamType } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');

module.exports = {
	data: new SlashCommandBuilder()
        // コマンドの名前
		.setName('stream')
        // コマンドの説明文
		.setDescription('VCを中継。')
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
			const mixer = new AudioMixer.Mixer({
				channels: 2,
				bitDepth: 16,
				sampleRate: 48000,
				clearInterval: 250,
			});
			// Listener-botが参加しているVCで誰かが話し出したら実行
			connection1.receiver.speaking.on('start', (userId) => {
				const standaloneInput = new AudioMixer.Input({
					channels: 2,
					bitDepth: 16,
					sampleRate: 48000,
					volume: 100,
				});
				const audioMixer = mixer;
				audioMixer.addInput(standaloneInput);
				// VCの音声取得機能
				const audio = connection1.receiver.subscribe(userId, {
					end: {
						behavior: EndBehaviorType.AfterSilence,
						// Opusの場合、100msだと短過ぎるのか、エラー落ちするため1000msに設定
						// Rawに変換する場合、1000msだと長過ぎるのか、エラー落ちするため100msに設定
						duration: 100,
					},
				});
				const rawStream = new PassThrough();
				audio
					.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
					.pipe(rawStream);
				const p = rawStream.pipe(standaloneInput);
				// 音声をVCに流す機能
				const player = createAudioPlayer({
					behaviors: {
						// 聞いている人がいなくても音声を中継してくれるように設定
						noSubscriber: NoSubscriberBehavior.play,
					},
				});
				const resource = createAudioResource(mixer,
					{
						// VCから取得してきた音声はOpus型なので、Opusに設定
						inputType: StreamType.Raw,
					},
				);
				player.play(resource);
				connection2.subscribe(player);
				rawStream.on('end', () => {
					if (this.audioMixer != null) {
						this.audioMixer.removeInput(standaloneInput);
						standaloneInput.destroy();
						rawStream.destroy();
						p.destroy();
					}
				});
			});
			await interaction.reply('VCを中継します！');
		}
		else {
			await interaction.reply('BOTを参加させるVCを指定してください！');
		}
	},
};