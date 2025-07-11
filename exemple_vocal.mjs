import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import gTTS from 'gtts';
import fs from 'fs';
import 'dotenv/config';


const TOKEN = process.env.DISCORD_TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

  // Trouver le canal vocal
  const channel = await client.channels.fetch(VOICE_CHANNEL_ID);
  if (!channel || channel.type !== 2) { // type 2 = GuildVoice
    console.error('Salon vocal introuvable ou mauvais type');
    return;
  }

  // Générer le fichier audio "Hello world"
  const speech = new gTTS('Hello world', 'en');
  const filePath = './hello.mp3';
  speech.save(filePath, async function (err) {
    if (err) return console.error(err);

    // Se connecter au salon vocal
    const connection = joinVoiceChannel({
      channelId: VOICE_CHANNEL_ID,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Créer un lecteur audio
    const player = createAudioPlayer();

    // Créer une ressource audio à partir du fichier mp3
    const resource = createAudioResource(filePath);

    // Jouer l’audio
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Lecture terminée');
      connection.destroy();
      fs.unlinkSync(filePath); // Supprimer le fichier mp3
      process.exit(0); // Quitte le script
    });

    player.on('error', error => {
      console.error(`Erreur audio: ${error.message}`);
      connection.destroy();
      fs.unlinkSync(filePath);
      process.exit(1);
    });
  });
});

client.login(TOKEN);
