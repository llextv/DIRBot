import { Client, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, ChannelType } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import gTTS from 'gtts';
import fs from 'fs';
import 'dotenv/config';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'setup-role',
    description: 'Setup les roles',
  },
  {
    name: 'setup-radio',
    description: 'Setup le channel audio de la radio',
    options: [
      {
        name: 'channelid',
        description: 'Id du channel',
        type: 3,
        required: true,
      },
    ]
  },
  {
    name: 'setup-logs',
    description: 'Setup le channel logs de la radio',
    options: [
      {
        name: 'channelid',
        description: 'Id du channel',
        type: 3,
        required: true,
      },
    ]
  },
  {
    name: 'setup-text',
    description: 'Setup le channel text de la radio',
    options: [
      {
        name: 'channelid',
        description: 'Id du channel',
        type: 3,
        required: true,
      },
    ]
  },
  {
    name: 'radio',
    description: 'Envoie un msg perso sur le channel audio',
    options: [
      {
        name: 'titre',
        description: 'Titre de l’annonce',
        type: 3,
        required: true,
      },
      {
        name: 'message',
        description: 'Message annoncé',
        type: 3,
        required: true,
      }
    ]
  },
  {
    name: 'radio-accident',
    description: 'Annonce un accident sur un axe routier',
    options: [
      {
        name: 'lieu',
        description: 'Localisation de l’accident',
        type: 3,
        required: true,
      },
      {
        name: 'autre_infos',
        description: "Autre informations sur l'accident ?",
        type: 3,
        required: false,
      }
    ]
  },
  {
    name: 'radio-travaux',
    description: 'Annonce des travaux sur un axe routier',
    options: [
      {
        name: 'lieu',
        description: 'Localisation des travaux',
        type: 3,
        required: true,
      },
      {
        name: 'duree',
        description: 'Durée estimée (ex: 2 heures)',
        type: 3,
        required: true,
      },
      {
        name: 'deviation',
        description: "Si deviation indiqué ici",
        type: 3,
        required: true,
      },
      {
        name: 'autre_infos',
        description: "Autre informations sur les travaux",
        type: 3,
        required: false,
      }
    ]
  },
  {
    name: 'radio-ralentissement',
    description: 'Annonce des ralentissement sur un axe routier',
    options: [
      {
        name: 'lieu',
        description: 'Localisation du ralentissement',
        type: 3,
        required: true,
      },
      {
        name: 'duree',
        description: 'Durée estimée (ex: 2 heures)',
        type: 3,
        required: true,
      },
      {
        name: 'bis',
        description: "Si itinéraire bis indiqué ici",
        type: 3,
        required: false,
      },
      {
        name: 'autre_infos',
        description: "Autre informations sur le ralentissement",
        type: 3,
        required: false,
      }
    ]
  },
  {
    name: 'radio-barragedir',
    description: 'Annonce un barrage de la DIR (route fermée, ...)',
    options: [
      {
        name: 'lieu',
        description: 'Localisation du barrage',
        type: 3,
        required: true,
      },
      {
        name: 'duree',
        description: 'Durée estimée (ex: 2 heures)',
        type: 3,
        required: true,
      },
      {
        name: 'bis',
        description: "Si itinéraire bis indiqué ici",
        type: 3,
        required: false,
      },
      {
        name: 'autre_infos',
        description: "Autre informations sur le barrage",
        type: 3,
        required: false,
      }
    ]
  },
  {
    name: 'radio-trafic',
    description: 'Donne un état du trafic',
    options: [
      {
        name: 'lieu',
        description: "Lieu de l'état du traffic",
        type: 3,
        required: true,
      },
      {
        name: 'etat',
        description: 'État du trafic',
        type: 3,
        required: true,
        choices: [
          { name: 'Fluide', value: 'fluide' },
          { name: 'Dense', value: 'dense' },
          { name: 'Bouché', value: 'bouche' },
        ]
      }
    ]
  },
  {
    name: 'remorquage',
    description: 'Annonce un remorquage',
    options: [
      {
        name: 'lieu',
        description: 'Lieu du remorquage',
        type: 3,
        required: true,
      },
      {
        name: 'statut',
        description: 'En cours ou terminé',
        type: 3,
        required: true,
        choices: [
          { name: 'En cours', value: 'en_cours' },
          { name: 'Terminé', value: 'termine' },
        ]
      }
    ]
  },
];

const CONFIG_FILE = "config.json";

function sendLogs(member, type, time){
  const logEmbed = new EmbedBuilder()
    .setTitle('📻 107.7 - Logs')
    .setColor('Red')
    .setDescription(`Logs 107.7 - ${member} a fait un signalement de type: ${type} à ${time}`);
  return logEmbed;
}

async function sendVocal(voiceChannelId, type, data){
  const channel = await client.channels.fetch(voiceChannelId);
  if (!channel || channel.type !== 2) {
    console.error('Salon vocal introuvable ou mauvais type');
    return;
  }
  let text;
  switch(type){
    case "radio":
      text = `Infos Traffic. Information importante de la part d'un patrouilleur. ${data.titre}. ${data.message}`;
      break;
    case "accident":
      text = `Infos Traffic. Un patrouilleur nous a rapporter un accident au niveau de ${data.lieu}. Les secours sont en cours d’intervention. Ralentissements importants à prévoir. Information complémentaire: ${data.autre_infos} Merci de votre vigilance. Et bonne route sur les ondes du LS 107.7`;
      break;
    case "travaux":
      text = `Infos Traffic. La DIR vous informe de travaux sur la voie au niveau de ${data.lieu}. Nous vous demandons de prendre la déviation: ${data.deviation}. La durée des travaux est estimé a ${data.duree}. Information complémentaire: ${data.autre_infos} Merci de votre vigilance. Et bonne route sur les ondes du LS 107.7`;
      break;
    default:
      return null;
  }


  const textOral = new gTTS(text, 'fr');
  const filePath = './text.mp3';
  speech.save(filePath, async function (err) {
      if (err) return console.error(err);
  
      const connection = joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
  
      const player = createAudioPlayer();
  
      const resource = createAudioResource(filePath);
  
      player.play(resource);
      connection.subscribe(player);
  
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Lecture terminée');
        connection.destroy();
        fs.unlinkSync(filePath);
        //process.exit(0);
      });
  
      player.on('error', error => {
        console.error(`Erreur audio: ${error.message}`);
        connection.destroy();
        fs.unlinkSync(filePath);
        //process.exit(1);
      });
    });
}

function sendText(type, data, member){
  switch(type){
    case "radio":
      const radioEmbed = new EmbedBuilder()
        .setTitle(`📻 107.7 - ${data.title}`)
        .setColor('black')
        .setDescription(data.message)
        .setFooter({ text: `Patrouilleur: ${member}, bot by Jonathan Scott` });
      return radioEmbed;
    case "accident":
      const accidentEmbed = new EmbedBuilder()
        .setTitle('📻 107.7 - Accident Signalé')
        .setColor('Red')
        .setDescription(`⚠️ Un accident a été signalé au niveau de ${data.lieu}.\n🚒 Les secours sont en cours d’intervention.\n⏳ Ralentissements importants à prévoir.\n Information complémentaire: ${data.autre_infos}\nMerci de votre vigilance.`)
        .setFooter({ text: `Patrouilleur: ${member}, bot by Jonathan Scott` });
        return accidentEmbed;
    case "travaux":
      const travauxEmbed = new EmbedBuilder()
        .setTitle('📻 107.7 - Zone de Travaux')
        .setColor('Orange')
        .setDescription(`🛠️ Travaux en cours au niveau de ${data.lieu}\n🚧 Déviation signalé: ${data.deviation}\n⏱️ Durée estimée : ${data.duree}\nInformation complémentaire: ${data.autre_infos}\nMerci de réduire votre vitesse.`)
        .setFooter({ text: `Patrouilleur: ${member}, bot by Jonathan Scott` });
      return travauxEmbed;
    default:
      return null;
  }
}




function configLoad(){
  try{
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const raw = JSON.parse(data);
    const map = new Map();
    for (const [guildId, config] of Object.entries(raw)) {
      map.set(guildId, new Map(Object.entries(config)));
    }
    return map;
  }catch(error){
    console.error("Erreur de chargement des configs :", error);
    return new Map();
  }
}

function saveConfig(map) {
  const obj = {};
  for (const [guildId, config] of map.entries()) {
    obj[guildId] = Object.fromEntries(config);
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(obj, null, 2));
}

const config = configLoad();



const TOKEN = process.env.DISCORD_TOKEN;




const rest = new REST({ version: '10' }).setToken(TOKEN);

await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
const client = new Client({ intents: [
  GatewayIntentBits.Guilds, 
  GatewayIntentBits.GuildVoiceStates, 
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  let VOICE_CHANNEL_ID;
  let TEXT_CHANNEL_ID;
  let LOGS_CHANNEL_ID;

  if (!interaction.isChatInputCommand()) return;
  const guildId = interaction.guildId;
  if (!guildId) return interaction.reply({ content: "Cette commande doit être utilisée dans un serveur.", ephemeral: true });

  if (!config.has(guildId)) {
    config.set(guildId, new Map());
  }
  const guildConfig = config.get(guildId);

  if (guildConfig.get("voicechannel") == undefined) {
    VOICE_CHANNEL_ID = "";
  } else {
    VOICE_CHANNEL_ID = guildConfig.get("voicechannel");
  }


  if(guildConfig.get("textchannel") == undefined){
    TEXT_CHANNEL_ID = "";
  }else{
    TEXT_CHANNEL_ID = guildConfig.get("textchannel");
  }

  if(guildConfig.get("logschannel") == undefined){
    LOGS_CHANNEL_ID = "";
  }else{
    LOGS_CHANNEL_ID = guildConfig.get("logschannel");
  }
  
  const member = interaction.member;
  const hasRole = member.roles.cache.some(role => role.name === "Agent 107.7");
  const hasAdminRole = member.roles.cache.some(role => role.name === "Admin 107.7");

  switch(interaction.commandName){
    case "ping":
      return interaction.reply('Pong !');
      break;

    case "setup-radio":
      await interaction.deferReply({ ephemeral: true });
      if (!hasAdminRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de modifier cela." });
      }
      const channelID = interaction.options.getString('channelid');
      if (!channelID) {
        return interaction.editReply("Erreur channelID = undefined");
      }
      if (!config.has(guildId)) {
        config.set(guildId, new Map());
      }
      config.get(guildId).set("voicechannel", channelID);
      saveConfig(config);
      return interaction.editReply("Config modifié avec succès");

    case "setup-text":
      await interaction.deferReply({ ephemeral: true });
      if (!hasAdminRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de modifier cela." });
      }
      const channelIDText = interaction.options.getString('channelid');
      if (!channelIDText) {
        return interaction.editReply("Erreur channelIDText = undefined");
      }
      if (!config.has(guildId)) {
        config.set(guildId, new Map());
      }
      config.get(guildId).set("textchannel", channelIDText);
      saveConfig(config);
      return interaction.editReply("Config modifié avec succès");

    case "setup-logs":
      await interaction.deferReply({ ephemeral: true });
      if (!hasAdminRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de modifier cela." });
      }
      const channelIDLogs = interaction.options.getString('channelid');
      if (!channelIDLogs) {
        return interaction.editReply("Erreur channelIDLogs = undefined");
      }
      if (!config.has(guildId)) {
        config.set(guildId, new Map());
      }
      config.get(guildId).set("logschannel", channelIDLogs);
      saveConfig(config);
      return interaction.editReply("Config modifié avec succès");
    case "setup-role":
      await interaction.deferReply({ ephemeral: true });
      if (!interaction.member.permissions.has('ManageRoles')) {
        return interaction.editReply({
          content: "Tu n'a pas la permission de modifier cela.",
        });
      }
      const roleName = "Agent 107.7";
      const adminRoleName = "Admin 107.7";
      const guild = interaction.guild;

      let existingRole = guild.roles.cache.find(role => role.name === roleName);
      let existingRoleAdmin = guild.roles.cache.find(role => role.name === adminRoleName);

      if (existingRole) {
        return interaction.editReply({
          content: `Rôle **${roleName}** existe deja.`,
        });
      }
      if (existingRoleAdmin) {
        return interaction.editReply({
          content: `Rôle **${existingRoleAdmin}** existe deja.`,
        });
      }

      try {
        const newRole = await guild.roles.create({
          name: roleName,
          color: '#FFD700',
          reason: 'Rôle pour intéragir avec 107.7 bot',
          permissions: [] 
        });
        const newRoleAdmin = await guild.roles.create({
          name: adminRoleName,
          color: '#FFD700',
          reason: 'Rôle pour administrer avec 107.7 bot',
          permissions: [] 
        });
      
        return interaction.editReply({
          content: `Role **${newRole.name}** et **${newRoleAdmin.name}** crées avec succes`,});
      } catch (error) {
        console.error('Erreur lors de la création du role :', error);
        return interaction.editReply({
          content: "Erreur lors de la création du role",
        });
      }

    case "radio-accident":
      await interaction.deferReply({ ephemeral: true });
      if (!hasRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de faire cela." });
      }
      const voiceId = VOICE_CHANNEL_ID;
      const lieu = interaction.options.getString('lieu');
      const autre_infos = interaction.options.getString('autre_infos');
      const channelId = TEXT_CHANNEL_ID;
      const guildInteract = interaction.guild;
      const textChannel = guildInteract.channels.cache.get(channelId);

      const logsChannelId = LOGS_CHANNEL_ID;
      const logsChannel = guildInteract.channels.cache.get(logsChannelId);
      if (!textChannel ) {
        console.error("Salon introuvable ou non textuel.");
      } else {
        const embed = sendText("accident", {lieu, autre_infos}, interaction.member.displayName);
      
        textChannel.send({ embeds: [embed] })
          .then(() => console.log("Embed envoyé avec succès."))
          .catch(console.error);
        
        if (!logsChannel ) {
          console.error("Salon introuvable ou non textuel.");
        } else {
          const embed = sendLogs(interaction.member.displayName, "accident", new Date());
        
          logsChannel.send({ embeds: [embed] })
            .then(() => console.log("Embed envoyé avec succès."))
            .catch(console.error);
          sendVocal(voiceId, "accident", {lieu, autre_infos});
          return interaction.editReply("107.7 - Infos envoyé a la radio !")
        }
      }
      
      
    default:
      break;
  };
});

client.login(TOKEN);
