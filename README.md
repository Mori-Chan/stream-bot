# stream-bot
## 使い方
* どっかしらのサイトを参考にして、下記のものを入れる。
- discord.js (14.7.1)
- node.js (18.13.0)
- npm (8.19.3)

* Botを２つ作成し、`index.js`の階層で`config.json`を作成。
```
{
    "LISTENER": {
        "CLIENT_ID": "ここにBOT1のCLIENT_IDを記述",
        "TOKEN": "ここにBOT1のTOKENを記述"
    },
    "SPEAKER": {
        "CLIENT_ID": "ここにBOT2のCLIENT_IDを記述",
        "TOKEN": "ここにBOT2のTOKENを記述"
    },
    "GUILD_ID": "ここにBOTを追加したサーバーのIDを記述"
}
```

* `.zip`でダウンロード、展開。

* `index.js`の階層でコマンドプロンプト等を開き、`npm i`を実行。

* `index.js`の階層でコマンドプロンプト等を開き、`node deploy-commands.js`を実行。

* `index.js`の階層でコマンドプロンプト等を開き、`node index.js`を実行。

* BOTに`Pong!`と返信してほしい時
`/ping`を実行。

* VCによくわからん音を流したい時
`/join`、`/play`を実行。

* VCの音を録音したい時
`index.js`の階層で`rec`というフォルダを作成。
`/join`、`/record`を実行。

* VCの音をべつのVCに中継したい時
`/stream`を実行。
