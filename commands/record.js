const { SlashCommandBuilder } = require('discord.js');
const stream = require('stream');
const fs = require('fs');
const { EndBehaviorType } = require('@discordjs/voice');
module.exports = {
	data: new SlashCommandBuilder()
        // コマンドの名前
		.setName('record')
        // コマンドの説明文
		.setDescription('VCで音声を録音します。'),
	async execute(interaction, connection) {
		connection.receiver.speaking.on('start', (userId) => {
            const audio = connection.receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 100,
                },
            });
            var filename = './rec/'.concat(Date.now(), '-').concat(userId, '.dat');
            var out = fs.createWriteStream(filename);
            stream.pipeline(audio, out, function (err) {
                if (err) {
                    console.warn(`❌ Error recording file ${filename} - ${err.message}`);
                } else {
                    console.log(`✅ Recorded ${filename}`);
                }
            });
        });
        await interaction.reply('VCの録音を開始します！');
	},
};