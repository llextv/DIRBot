import { Client, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, ChannelType, PermissionFlagsBits,ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, InteractionType } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import gTTS from 'gtts';
import PDFDocument from 'pdfkit';
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
    name: 'setup-finances',
    description: 'Setup le channel finances du bot',
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
    name: 'setup-commandes',
    description: 'Setup le channel commandes du bot',
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
  //
  // {
  //   name: 'radio-ralentissement',
  //   description: 'Annonce des ralentissement sur un axe routier',
  //   options: [
  //     {
  //       name: 'lieu',
  //       description: 'Localisation du ralentissement',
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'duree',
  //       description: 'Durée estimée (ex: 2 heures)',
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'bis',
  //       description: "Si itinéraire bis indiqué ici",
  //       type: 3,
  //       required: false,
  //     },
  //     {
  //       name: 'autre_infos',
  //       description: "Autre informations sur le ralentissement",
  //       type: 3,
  //       required: false,
  //     }
  //   ]
  // },
  // {
  //   name: 'radio-barragedir',
  //   description: 'Annonce un barrage de la DIR (route fermée, ...)',
  //   options: [
  //     {
  //       name: 'lieu',
  //       description: 'Localisation du barrage',
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'duree',
  //       description: 'Durée estimée (ex: 2 heures)',
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'bis',
  //       description: "Si itinéraire bis indiqué ici",
  //       type: 3,
  //       required: false,
  //     },
  //     {
  //       name: 'autre_infos',
  //       description: "Autre informations sur le barrage",
  //       type: 3,
  //       required: false,
  //     }
  //   ]
  // },
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
  // {
  //   name: 'radio-remorquage',
  //   description: 'Annonce un remorquage',
  //   options: [
  //     {
  //       name: 'lieu',
  //       description: 'Lieu du remorquage',
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'statut',
  //       description: 'En cours ou terminé',
  //       type: 3,
  //       required: true,
  //       choices: [
  //         { name: 'En cours', value: 'en_cours' },
  //         { name: 'Terminé', value: 'termine' },
  //       ]
  //     }
  //   ]
  // },
  {
    name: 'etat-finances',
    description: 'Fait un etat actuel des finances',
    options: [
      {
        name: 'valeur',
        description: 'Valeur des finances',
        type: 3,
        required: true,
      },
    ]
  },
  {
    name: 'secure-chat-create',
    description: 'Crée un chat "dit sécurisé" (avec les chat-member)',
    options: [
      {
        name: 'nom',
        description: 'Quelle est votre entité (nom-prénom) ou entreprise (police, fourrière ...)',
        type: 3,
        required: true,
      },
    ]
  },
  {
    name: "verif-dir",
    description: 'Verifier votre présence sur le discord DIR.'
  },
  {
    name: "setup-pin",
    description: 'Setup le code client pour les recrutement FA.'
  },
  // {
  //   name: "commande",
  //   description: "Passer une nouvelle commande a la DIR."
  // },
  // {
  //   name: "commande-prendre",
  //   description: "Permet a un agent de prendre une commande.",
  //   options: [
  //     {
  //       name: 'commandid',
  //       description: "Entrée l'id de la commande a prendre en charge.",
  //       type: 3,
  //       required: true,
  //     },
  //   ]
  // },
  // {
  //   name: "commande-locker",
  //   description: "Emet le code du locker de récupération DIR",
  //   options: [
  //     {
  //       name: 'commandid',
  //       description: "Entrée l'id de la commande.",
  //       type: 3,
  //       required: true,
  //     },
  //     {
  //       name: 'depotcasier',
  //       description: "Entrée le casier dans lequel la commande a été déposé.",
  //       type: 3,
  //       required: true,
  //       choices: [
  //         { name: 'A1', value: 'A1' },
  //         { name: 'A2', value: 'A2' },
  //         { name: 'B1', value: 'B1' },
  //         { name: 'B2', value: 'B2' },
  //         { name: 'C1', value: 'C1' },
  //         { name: 'C2', value: 'C2' },
  //       ]
  //     },
  //   ]
  // },
  // {
  //   name: "commande-finish",
  //   description: "Marque une commande comme finish",
  //   options: [
  //     {
  //       name: 'commandid',
  //       description: "Entrée l'id de la commande.",
  //       type: 3,
  //       required: true,
  //     },
  //   ]
  // },
  // {
  //   name: "commande-delete",
  //   description: "Delete une commande",
  //   options: [
  //     {
  //       name: 'commandid',
  //       description: "Entrée l'id de la commande.",
  //       type: 3,
  //       required: true,
  //     },
  //   ]
  // }
];

const catalogue = {
  1: { nom: "Abri Bus", prix: 31596 },
  2: { nom: "Abri Bus", prix: 35996 },
  3: { nom: "Balise Blanche", prix: 796 },
  4: { nom: "Balise De Chantier", prix: 40 },
  5: { nom: "Balise De Guidage", prix: 796 },
  6: { nom: "Balise Rouge", prix: 796 },
  7: { nom: "Barrière", prix: 196 },
  8: { nom: "Barrière De Chantier", prix: 196 },
  9: { nom: "Barrière De Chantier", prix: 236 },
  10: { nom: "Barrière De Chantier Demi-Pleine", prix: 196 },
  11: { nom: "Barrière De Chantier Rouge", prix: 236 },
  12: { nom: "Barrière En Béton", prix: 156 },
  13: { nom: "Barrière Levante (Petite)", prix: 3196 },
  14: { nom: "Barrière Levante (Petite Sans Pied)", prix: 3196 },
  15: { nom: "Barrière Levante (7M Grande)", prix: 7300 },
  16: { nom: "Barrière Urbaine", prix: 196 },
  17: { nom: "Barrière Vauban", prix: 356 },
  18: { nom: "Bétonnière", prix: 1996 },
  19: { nom: "Bungalow", prix: 5499 },
  20: { nom: "Borne Piétonne", prix: 4000 },
  21: { nom: "Cabine De Peinture", prix: 29999 },
  22: { nom: "Cédez Le Passage", prix: 636 },
  23: { nom: "Colonne Lumineuse", prix: 1036 },
  24: { nom: "Cône Avec Balise", prix: 596 },
  25: { nom: "Cône De Signalisation", prix: 76 },
  26: { nom: "Coussin Berlinois", prix: 3996 },
  27: { nom: "Déviation", prix: 196 },
  28: { nom: "Dos D'Âne", prix: 800 },
  29: { nom: "Dos D'Âne 1 Vois Avec Bords Arrondis", prix: 400 },
  30: { nom: "Dos D'Âne 1 Vois", prix: 400 },
  31: { nom: "Échaffaudage", prix: 1199 },
  32: { nom: "Échaffaudage Avec Escaliers", prix: 1499 },
  33: { nom: "Feux De Chantier", prix: 7996 },
  34: { nom: "Filet De Chantier", prix: 116 },
  35: { nom: "Flr", prix: 99996 },
  36: { nom: "Garage À Toit Plat", prix: 129999 },
  37: { nom: "Garage Toit [...]", prix: 45999 },
  38: { nom: "Garde Fou", prix: 396 },
  39: { nom: "Glissière De Sécurité", prix: 500 },
  40: { nom: "Grand Poteau", prix: 796 },
  41: { nom: "Interdiction Pl", prix: 636 },
  42: { nom: "Interdiction Pl Avec Panneau", prix: 636 },
  43: { nom: "Ligne Blanche Petite", prix: 20 },
  44: { nom: "Ligne Blanches", prix: 40 },
  45: { nom: "Ligne Bleue", prix: 40 },
  46: { nom: "Ligne Jaune", prix: 40 },
  47: { nom: "Ligne Jaune Petite", prix: 20 },
  48: { nom: "Lignes Blanches Petites", prix: 20 },
  49: { nom: "Luminaire Piéton", prix: 11199 },
  50: { nom: "Marquage Bus", prix: 3996 },
  51: { nom: "Marquage Flèche", prix: 396 },
  56: { nom: "Palette De Parpainggggs", prix: 596 },
  57: { nom: "Panneau 30", prix: 400 },
  58: { nom: "Panneau 50", prix: 400 },
  59: { nom: "Panneau 70", prix: 400 },
  60: { nom: "Panneau 90", prix: 400 },
  61: { nom: "Panneau Absence De Marquage", prix: 236 },
  62: { nom: "Panneau Accès Interdit", prix: 636 },
  63: { nom: "Panneau Arrêt De Bus", prix: 1036 },
  64: { nom: "Panneau Custom", prix: 1596 },
  65: { nom: "Panneau De Priorité", prix: 636 },
  66: { nom: "Panneau Directionnels", prix: 396 },
  67: { nom: "Panneau Dos D'Âne", prix: 636 },
  68: { nom: "Panneau Fin De Rpute Prioritaire", prix: 636 },
  69: { nom: "Panneau Interdit Au Public", prix: 636 },
  70: { nom: "Panneau Obligation Gauche", prix: 400 },
  71: { nom: "Panneau Obligation Droite", prix: 400 },
  72: { nom: "Panneau Parking", prix: 636 },
  73: { nom: "Panneau Parking Dépose Minute", prix: 636 },
  74: { nom: "Panneau Passage Piéton", prix: 636 },
  75: { nom: "Panneau Restaurant", prix: 636 },
  76: { nom: "Panneau Route Prioritaire", prix: 636 },
  77: { nom: "Panneau Station Service", prix: 636 },
  78: { nom: "Panneau Stationnement Réservé", prix: 636 },
  79: { nom: "Panneau Stop", prix: 636 },
  80: { nom: "Panneau Taxi", prix: 636 },
  81: { nom: "Panneau Taxi Jaune", prix: 636 },
  82: { nom: "Panneau Travaux", prix: 196 },
  83: { nom: "Petite Ligne Bleue", prix: 20 },
  84: { nom: "Porte De Garage", prix: 699 },
  87: { nom: "Poteau De Protectoin", prix: 460 },
  88: { nom: "Poteau Gris", prix: 196 },
  89: { nom: "Poteau Vert", prix: 116 },
  90: { nom: "Poubelle De Parc", prix: 996 },
  91: { nom: "Prefab De Chantier", prix: 23996 },
  92: { nom: "Rebord Gris Clair", prix: 156 },
  93: { nom: "Rebord Gris Foncé", prix: 156 },
  94: { nom: "Rebord Rouge", prix: 156 },
  95: { nom: "Rebord En Pierre", prix: 50 },
  96: { nom: "Route Barrée", prix: 316 },
  97: { nom: "Rubalise", prix: 116 },
  98: { nom: "Rubalise (Hors Métiers)", prix: 200 },
  99: { nom: "Sens Interdit", prix: 636 },
  100: { nom: "Séparateur De Voie", prix: 150 },
  101: { nom: "Stationnement Interdit", prix: 636 },
  102: { nom: "Trottoir", prix: 156 },
  103: { nom: "Tuyau Béton 2,5M", prix: 396 },
  104: { nom: "Tuyau Béton 6M", prix: 948 },
};


const CONFIG_FILE = "config.json";
const COOLDOWN_FILE = "cooldowns.json";
const DB_FILE = "DB.json"

function creerPDF(items, filePath, nom) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.image('logo.png', 450, 30, { width: 100 });
  doc.fontSize(24).text("DEVIS DIR", { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Devis`, { align: 'left' });
  doc.text(`Date du devis: ${new Date().toLocaleDateString()}`);
  doc.text("Validité: 1 mois");
  doc.moveDown();

  doc.fontSize(12).text("DIR - Représenté par Slarin SCOTT", { align: 'left' });
  doc.text("Amboise, 20");
  doc.moveDown();
  doc.text(`À L'ATTENTION DE: M. ${nom}`);
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text('DESCRIPTION', 50, 300);
  doc.text('PRIX', 300, 300);
  doc.text('QUANTITÉ', 400, 300);
  doc.text('TOTAL', 500, 300);

  doc.moveTo(50, 315).lineTo(550, 315).stroke();

  let y = 330;
  let total = 0;

  items.forEach((item) => {
    const { nom, prixUnitaire, quantite, prixTotal } = item;
    total += prixTotal;

    doc.text(nom, 50, y);
    doc.text(`${prixUnitaire.toFixed(2)} €`, 300, y);
    doc.text(`${quantite}`, 400, y);
    doc.text(`${prixTotal.toFixed(2)} €`, 500, y);
    y += 20;
  });

  doc.moveTo(50, y).lineTo(550, y).stroke();

  y += 30;
  doc.text(`Sous-total : ${total.toFixed(2)} €`, 400, y);
  doc.text(`TVA (20%) : Offerte`);
  doc.text(`TOTAL : ${total.toFixed(2)} €`, 400, y + 60);
  
  doc.moveDown(3);
  doc.fontSize(10).text("Conditions générales : Le paiement sera dû sous un mois.", 50, y + 90);
  doc.text("Slarin SCOTT (PDG DIR)", 50, y + 150);
  doc.moveTo(50, y + 170).lineTo(200, y + 170).stroke();
  doc.moveTo(400, y + 170).lineTo(550, y + 170).stroke();

  doc.end();
}


function loadCooldowns() {
  try {
    if (!fs.existsSync(COOLDOWN_FILE)) return {};
    return JSON.parse(fs.readFileSync(COOLDOWN_FILE, "utf-8"));
  } catch (e) {
    return {};
  }
}

function saveCooldowns(obj) {
  fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(obj, null, 2));
}

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
      text = `Infos Traffic. Un patrouilleur nous a rapporter un accident au niveau de ${data.lieu}. Les secours sont en cours d’intervention. Ralentissements importants à prévoir. Information complémentaire: ${data.autre_infos}. Merci de votre vigilance. Et bonne route sur les ondes du LS 107 point 7`;
      break;
    case "travaux":
      text = `Infos Traffic. La DIR vous informe de travaux sur la voie au niveau de ${data.lieutravaux}. Nous vous demandons de prendre la déviation: ${data.deviationtravaux}. La durée des travaux est estimé a ${data.dureetravaux}. Information complémentaire: ${data.autre_infostravaux}. Merci de votre vigilance. Et bonne route sur les ondes du LS 107 point 7`;
      break;
    case "traffic":
      text = `Infos Traffic. L'état du traffic au niveau de ${data.lieutraffic} est définie comme ${data.etattraffic}. Merci de votre vigilance. Et bonne route sur les ondes du LS 107 point 7`;
      break;
    default:
      return null;
  }


  const textOral = new gTTS(text, 'fr');
  const filePath = './text.mp3';
  const introPath = './intro.mp3';
  textOral.save(filePath, async function (err) {
      if (err) return console.error(err);
  
      const connection = joinVoiceChannel({
        channelId: voiceChannelId,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
  
      const message = createAudioResource(filePath);
      const intro = createAudioResource(introPath);

      const player = createAudioPlayer();
      connection.subscribe(player);
          
      player.play(intro);
          
      let hasPlayedIntro = false;

      player.on(AudioPlayerStatus.Idle, () => {
        if (!hasPlayedIntro) {
          hasPlayedIntro = true;
          player.play(message);
        } else {
          connection.destroy();
          fs.unlinkSync(filePath);
        }
      });
    
      player.on('error', error => {
        console.error(`Erreur audio: ${error.message}`);
        connection.destroy();
        fs.unlinkSync(filePath);
      });
    
      player.play(intro);
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
        .setDescription(`🛠️ Travaux en cours au niveau de ${data.lieutravaux}\n🚧 Déviation signalé: ${data.deviationtravaux}\n⏱️ Durée estimée : ${data.dureetravaux}\nInformation complémentaire: ${data.autre_infostravaux}\nMerci de réduire votre vitesse.`)
        .setFooter({ text: `Patrouilleur: ${member}, bot by Jonathan Scott` });
      return travauxEmbed;
    case "traffic":
      const trafficEmbed = new EmbedBuilder()
        .setTitle('📻 107.7 - Infos Traffic')
        .setColor('Yellow')
        .setDescription(`🚗 Infos Traffic\n📍Lieu: ${data.lieutraffic}\n🛠️ État du traffic: ${data.etattraffic}`)
        .setFooter({ text: `Patrouilleur: ${member}, bot by Jonathan Scott` });
      return trafficEmbed;
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

function cmdLoad(){
  try{
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const raw = JSON.parse(data);
    const map = new Map();
    for (const [guildId, cmd] of Object.entries(raw)) {
      map.set(guildId, new Map(Object.entries(cmd)));
    }
    return map;
  }catch(error){
    console.error("Erreur de chargement des commandes :", error);
    return new Map();
  }
}

function saveCmd(map) {
  const obj = {};
  for (const [guildId, cmd] of map.entries()) {
    obj[guildId] = Object.fromEntries(cmd);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
}

const cmd_base = cmdLoad();

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
let COMMANDES_CHANNEL_ID;
client.on(Events.InteractionCreate, async interaction => {
  let pin1;
  let pin2;
  let pin3;
  let VOICE_CHANNEL_ID;
  let TEXT_CHANNEL_ID;
  let LOGS_CHANNEL_ID;
  let FINANCES_CHANNEL_ID;
  

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

  if(guildConfig.get("financeschannel") == undefined){
    FINANCES_CHANNEL_ID = "";
  }else{
    FINANCES_CHANNEL_ID = guildConfig.get("financeschannel");
  }

  if(guildConfig.get("commandeChannel") == undefined){
    COMMANDES_CHANNEL_ID = "";
  }else{
    COMMANDES_CHANNEL_ID = guildConfig.get("commandeChannel");
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

    case "setup-finances":
      await interaction.deferReply({ ephemeral: true });
      if (!hasAdminRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de modifier cela." });
      }
      const financeChanel = interaction.options.getString('channelid');
      if (!financeChanel) {
        return interaction.editReply("Erreur financeChanel = undefined");
      }
      if (!config.has(guildId)) {
        config.set(guildId, new Map());
      }
      config.get(guildId).set("financeschannel", financeChanel);
      saveConfig(config);
      return interaction.editReply("Config modifié avec succès");

    case "setup-commandes":
      await interaction.deferReply({ ephemeral: true });
      if (!hasAdminRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de modifier cela." });
      }
      const commandeChannel = interaction.options.getString('channelid');
      if (!commandeChannel) {
        return interaction.editReply("Erreur commandeChannel = undefined");
      }
      if (!config.has(guildId)) {
        config.set(guildId, new Map());
      }
      config.get(guildId).set("commandeChannel", commandeChannel);
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
      const chatSecureAccess = "Chat Secure Access";
      const guild = interaction.guild;

      let existingRole = guild.roles.cache.find(role => role.name === roleName);
      let existingRoleAdmin = guild.roles.cache.find(role => role.name === adminRoleName);
      let existingchatSecureAccess = guild.roles.cache.find(role => role.name === chatSecureAccess);

      if (existingRole) {
        return interaction.editReply({
          content: `Rôle **${roleName}** existe deja.`,
        });
      }
      if (existingRoleAdmin) {
        return interaction.editReply({
          content: `Rôle **${adminRoleName}** existe deja.`,
        });
      }
      if (existingchatSecureAccess) {
        return interaction.editReply({
          content: `Rôle **${chatSecureAccess}** existe deja.`,
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
        const newRolechatSecureAccess = await guild.roles.create({
          name: chatSecureAccess,
          color: '#FFD700',
          reason: 'Rôle pour répondre au messages de la zone de chat sécurisé',
          permissions: [] 
        });
      
        return interaction.editReply({
          content: `Role **${newRole.name}** et **${newRoleAdmin.name}** et ${newRolechatSecureAccess.name} crées avec succes`,});
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
      let voiceId = VOICE_CHANNEL_ID;
      let lieu = interaction.options.getString('lieu');
      let autre_infos = interaction.options.getString('autre_infos');
      let channelId = TEXT_CHANNEL_ID;
      let guildInteract = interaction.guild;
      let textChannel = guildInteract.channels.cache.get(channelId);

      let logsChannelId = LOGS_CHANNEL_ID;
      let logsChannel = guildInteract.channels.cache.get(logsChannelId);
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
      
      case "radio-travaux":
        await interaction.deferReply({ ephemeral: true });
        if (!hasRole) {
          return interaction.editReply({ content: "Tu n'as pas la permission de faire cela." });
        }
        const voiceIdTravaux = VOICE_CHANNEL_ID;
        const lieutravaux = interaction.options.getString('lieu');
        const dureetravaux = interaction.options.getString('duree');
        const deviationtravaux = interaction.options.getString('deviation');
        const autre_infostravaux = interaction.options.getString('autre_infos');

        const channelIdtravaux = TEXT_CHANNEL_ID;
        const guildInteracttravaux = interaction.guild;
        const textChanneltravaux = guildInteracttravaux.channels.cache.get(channelIdtravaux);

        const logsChannelIdtravaux = LOGS_CHANNEL_ID;
        const logsChanneltravaux = guildInteracttravaux.channels.cache.get(logsChannelIdtravaux);
        if (!textChanneltravaux ) {
          console.error("Salon introuvable ou non textuel.");
        } else {
          const embed = sendText("travaux", {lieutravaux, autre_infostravaux, dureetravaux, deviationtravaux}, interaction.member.displayName);
        
          textChanneltravaux.send({ embeds: [embed] })
            .then(() => console.log("Embed envoyé avec succès."))
            .catch(console.error);

          if (!logsChanneltravaux ) {
            console.error("Salon introuvable ou non textuel.");
          } else {
            const embed = sendLogs(interaction.member.displayName, "travaux", new Date());
          
            logsChanneltravaux.send({ embeds: [embed] })
              .then(() => console.log("Embed envoyé avec succès."))
              .catch(console.error);
            sendVocal(voiceIdTravaux, "travaux", {lieutravaux, autre_infostravaux, dureetravaux, deviationtravaux});
            return interaction.editReply("107.7 - Infos envoyé a la radio !")
          }
        }
      
      case "radio-trafic":
        await interaction.deferReply({ ephemeral: true });
        if (!hasRole) {
          return interaction.editReply({ content: "Tu n'as pas la permission de faire cela." });
        }
        const voiceIdTraffic = VOICE_CHANNEL_ID;
        const lieutraffic = interaction.options.getString('lieu');
        const etattraffic = interaction.options.getString('etat');
        console.log(etattraffic);

        const channelIdtraffic = TEXT_CHANNEL_ID;
        const guildInteracttraffic = interaction.guild;
        const textChanneltraffic = guildInteracttraffic.channels.cache.get(channelIdtraffic);

        const logsChannelIdtraffic = LOGS_CHANNEL_ID;
        const logsChanneltraffic = guildInteracttraffic.channels.cache.get(logsChannelIdtraffic);
        if (!textChanneltraffic) {
          console.error("Salon introuvable ou non textuel.");
        } else {
          const embed = sendText("traffic", {lieutraffic, etattraffic}, interaction.member.displayName);
        
          textChanneltraffic.send({ embeds: [embed] })
            .then(() => console.log("Embed envoyé avec succès."))
            .catch(console.error);

          if (!logsChanneltraffic ) {
            console.error("Salon introuvable ou non textuel.");
          } else {
            const embed = sendLogs(interaction.member.displayName, "traffic", new Date());
          
            logsChanneltraffic.send({ embeds: [embed] })
              .then(() => console.log("Embed envoyé avec succès."))
              .catch(console.error);
            sendVocal(voiceIdTraffic, "traffic", {lieutraffic, etattraffic});
            return interaction.editReply("107.7 - Infos envoyé a la radio !")
          }
        }
    
    case "etat-finances":
      const valueFinance = interaction.options.getString('valeur');
      const financeChannelID = FINANCES_CHANNEL_ID;
      const financeGuild = interaction.guild;
      const financeChannel = financeGuild.channels.cache.get(financeChannelID);

      const financesEmbed = new EmbedBuilder()
        .setTitle(`DIR - Finances`)
        .setColor('#FFD700')
        .setDescription(`L'état des finances de la DIR est de ${valueFinance}€`)
        .setFooter({ text: `Mis a jour le ${new Date() }bot by Jonathan Scott` });
      financeChannel.send({ embeds: [financesEmbed] })
        .then(() => console.log("Embed envoyé avec succès."))
        .catch(console.error);
    
    case "secure-chat-create":
      const logsSecureChat = LOGS_CHANNEL_ID;
      const channelName = interaction.options.getString('nom');
      const guild_interact = interaction.guild;
      
      const cooldowns = loadCooldowns();
      const userId = member.id;
      const now = Date.now();
      const last = cooldowns[userId] || 0;
      const COOLDOWN = 24 * 60 * 60 * 1000;

      if (now - last < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - last)) / (60 * 60 * 1000));
        return interaction.reply({ content: `⏳ Tu dois attendre encore ${remaining}h avant de créer un nouveau chat sécurisé.`, ephemeral: true });
      }

      cooldowns[userId] = now;
      saveCooldowns(cooldowns);

      const memberRole = guild_interact.roles.cache.find(role => role.name.toLowerCase() === 'chat secure access');
      let category = guild_interact.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name.toUpperCase() === 'ZONE CHAT SÉCURISÉ'
      );

      if (!category) {
        category = await guild_interact.channels.create({
          name: 'ZONE CHAT SÉCURISÉ',
          type: ChannelType.GuildCategory,
          reason: 'Catégorie pour les chats sécurisés'
        });
      }
      console.log(memberRole);
      if (!memberRole) {
        return interaction.reply({ content: "Rôle member introuvable", ephemeral: true });
      }
      const permissions = [
        {
          id: guild_interact.roles.everyone.id, 
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: member.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: memberRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        }
      ];
      const channel = await guild_interact.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: permissions,
        reason: `Créé par ${member.user.tag}`
      });
      console.log("logs: ", logsSecureChat);
      let channelLogs = guild_interact.channels.cache.get(logsSecureChat);
      console.log(channelLogs);
      const logEmbed = new EmbedBuilder()
        .setTitle('DIR BOT - Logs')
        .setColor('Red')
        .setDescription(`Logs DIR Chat - ${member.user.displayName} a crée le channel ${channel} à ${new Date()}`);
      if (channelLogs) {
        channelLogs.send({ embeds: [logEmbed] })
          .then(() => console.log("Embed envoyé avec succès."))
          .catch(console.error);
      } else {
        console.error("Salon de logs introuvable ou non textuel.");
      }
      await interaction.reply({ content: `Salon ${channel} créé !`, ephemeral: true });
      break;
    case "verif-dir":
      interaction.reply(`**Voici les codes réponses à mettre dans le FA:**\n*Pin 1:* \`${pin1}\` *Pin 2:* \`${pin2}\` *Pin 3:* \`${pin3}\``)
      break;
    case "setup-pin":
      pin1 = Math.floor(Math.random() * 100);
      pin2 = Math.floor(Math.random() * 100);
      pin3 = Math.floor(Math.random() * 100);
      console.log(pin1,pin2,pin3);
      await interaction.reply(`**Voici les codes réponses à mettre dans le FA:**\n*Pin 1:* \`${pin1}\` *Pin 2:* \`${pin2}\` *Pin 3:* \`${pin3}\``);
      break;
    case "commande":
      const logsCmd = LOGS_CHANNEL_ID;

      const modal = new ModalBuilder()
        .setCustomId('commandeModal')
        .setTitle('Nouvelle commande DIR');

      const nomInput = new TextInputBuilder()
        .setCustomId('nom')
        .setLabel('Nom / Prénom')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const telInput = new TextInputBuilder()
        .setCustomId('tel')
        .setLabel('Numéro de téléphone')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const entrepriseInput = new TextInputBuilder()
        .setCustomId('entreprise')
        .setLabel('Entreprise (optionnel)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const lieuInput = new TextInputBuilder()
        .setCustomId('lieu')
        .setLabel('Lieu résidence / siège social (optionnel)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const commandeInput = new TextInputBuilder()
        .setCustomId('commande')
        .setLabel("Produits")
        .setPlaceholder("Format à respecter: ([ID de l'item dans le tableau DIR]x[Quantité]), (5x50), ...")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nomInput),
        new ActionRowBuilder().addComponents(telInput),
        new ActionRowBuilder().addComponents(entrepriseInput),
        new ActionRowBuilder().addComponents(lieuInput),
        new ActionRowBuilder().addComponents(commandeInput)
      );
    
      await interaction.showModal(modal);
      break;

    case "commande-prendre":
      if (!hasRole) {
        return interaction.reply({ content: "Tu n'as pas la permission de faire cela." });
      }
      const guild_interact_prendre = interaction.guild;
      const commandeID = interaction.options.getString('commandid');
      let commandePrendreChannel = guild_interact_prendre.channels.cache.get(COMMANDES_CHANNEL_ID);

      if (!cmd_base.has(guild_interact_prendre.id)) {
        return interaction.reply({ content: "Aucune commande trouvée pour ce serveur.", ephemeral: true });
      }
      const cmds = cmd_base.get(guild_interact_prendre.id).get("cmd") || [];
      const commande = cmds.find(c => c.id.toString() === commandeID);
      if (!commande) {
        return interaction.reply({ content: "Commande introuvable.", ephemeral: true });
      }
      const cmd_salon = guild_interact_prendre.channels.cache.get(commande.ticket);

      if (cmd_salon) {
        console.log(interaction.user.id)
        await cmd_salon.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: true,
          SendMessages: true,
        }).catch(console.error);
      }

      let goodCMD = cmd_base.get(guild_interact_prendre.id).get("cmd").find(element => Number(element.id) === Number(commandeID));

      if(goodCMD === undefined){
        return interaction.reply({content: `Error: Undefined id`, ephemeral: true});
      }

      if(goodCMD.Etat === "Pris en charge"){
        return interaction.reply({ content: `La commande a déjà été pris en charge par ${interaction.user.displayName}`, ephemeral: true });
      }

      goodCMD.Etat = "Pris en charge";
      goodCMD.Attribution = interaction.user.id;
      cmd_base.get(guild_interact_prendre.id).set("cmd", cmds);
      saveCmd(cmd_base);

      const embed = new EmbedBuilder()
        .setTitle('DIR BOT - Prise en charge de commande')
        .setColor('Green')
        .setDescription(`<@${interaction.user.id}> a pris en charge votre commande n°${goodCMD.id}`);
      cmd_salon.send({ embeds: [embed] })
        .then(() => console.log("Embed envoyé avec succès."))
        .catch(console.error);

      const embed2 = new EmbedBuilder()
        .setTitle('DIR BOT - Prise en charge de commande')
        .setColor('Green')
        .setDescription(`<@${interaction.user.id}> a pris en charge la commande n°${goodCMD.id}`);
      commandePrendreChannel.send({ embeds: [embed2] })
        .then(() => console.log("Embed envoyé avec succès."))
        .catch(console.error);

      return interaction.reply({ content: `<#${cmd_salon.id}>`, ephemeral: true });
      break;
    case "commande-locker":
      if (!hasRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de faire cela." });
      }
      const guild_interact_locker = interaction.guild;
      const commandeID_locker = interaction.options.getString('commandid');
      const casier_locker = interaction.options.getString('depotcasier');


      let lockerCMD = cmd_base.get(guild_interact_locker.id).get("cmd").find(element => Number(element.id) === Number(commandeID_locker));
      const cmds_locker = cmd_base.get(guild_interact_locker.id).get("cmd") || [];
      let locker_code;
      if(lockerCMD.locker == "" || lockerCMD === undefined || lockerCMD === null){
        locker_code = Math.floor(Math.random() * 9999);
        lockerCMD.locker = locker_code;
        lockerCMD.casier;
        lockerCMD.Etat = "LOCKER";
        cmd_base.get(guild_interact_locker.id).set("cmd", cmds_locker);
        saveCmd(cmd_base);
      }else{
        locker_code = lockerCMD.locker;
      }

      const salon = guild_interact_locker.channels.cache.get(lockerCMD.ticket);

      const locker_embed = new EmbedBuilder()
        .setTitle('DIR BOT - Dépot de la commande au locker')
        .setColor('Yellow')
        .setDescription(`Le colis a été déposé dans le locker, vous pouvez désormais aller au dépot puis vous présenter devant le coffre fort numéro **${casier_locker}** avec le code **${locker_code}**`);
      salon.send({ embeds: [locker_embed] })
        .then(() => console.log("Embed envoyé avec succès."))
        .catch(console.error);
      return;
      break;
    case "commande-finish":
      const guild_interact_finish = interaction.guild;
      if (!hasRole) {
        return interaction.editReply({ content: "Tu n'as pas la permission de faire cela." });
      }
      const cmds_f = cmd_base.get(guild_interact_finish.id).get("cmd") || [];
      const commandeID_finish = interaction.options.getString('commandid');
      const commande_object = cmds_f.find(c => c.id.toString() === commandeID_finish);
      if (!commande_object) {
        return interaction.reply({ content: "Commande introuvable.", ephemeral: true });
      }
      
      const cmd_salon_finish = guild_interact_finish.channels.cache.get(commande_object.ticket);
      if (cmd_salon_finish) {
        await cmd_salon_finish.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: false,
          SendMessages: false,
        }).catch(console.error);
      }
      
      const embedfinish = new EmbedBuilder()
        .setTitle('DIR BOT - Avis et retour')
        .setColor('Red')
        .setDescription("Avant de cloturer votre commande, merci de répondre au question suivante a propos de votre commande.");
      cmd_salon_finish.send({ embeds: [embedfinish] })
        .then(() => console.log("Embed envoyé avec succès."))
        .catch(console.error);

      cmd_salon_finish.send("L'employé vous a t'il effectué un /bill ?");
      cmd_salon_finish.send("(Optionnel) Comment a été votre experience de commande a la DIR ?");

      break;
    case "commande-delete":
      if (!hasRole) {
        return interaction.reply({ content: "Tu n'as pas la permission de faire cela.", ephemeral: true });
      }
      const guild_interact_del = interaction.guild;
      const commandeID_del = interaction.options.getString('commandid');
    
      if (!cmd_base.has(guild_interact_del.id)) {
        return interaction.reply({ content: "Aucune commande trouvée pour ce serveur.", ephemeral: true });
      }
      const cmds_del = cmd_base.get(guild_interact_del.id).get("cmd") || [];
      const commandeToDelete = cmds_del.find(c => c.id.toString() === commandeID_del);
    
      if (!commandeToDelete) {
        return interaction.reply({ content: "Commande introuvable.", ephemeral: true });
      }
    
      const channel_delete = guild_interact_del.channels.cache.get(commandeToDelete.ticket);
      if (channel_delete) {
        await channel_delete.delete(">> DIR BOT - Fermeture de la commande");
      }
    
      const newCmds = cmds_del.filter(c => c.id.toString() !== commandeID_del);
      cmd_base.get(guild_interact_del.id).set("cmd", newCmds);
      saveCmd(cmd_base);
    
      break;
    default:
      break;
  };
});

client.on(Events.InteractionCreate, async interaction => {
  await interaction.deferReply({ ephemeral: true});
  const guildConfig = config.get(interaction.guildId);
  if(guildConfig.get("commandeChannel") == undefined){
    COMMANDES_CHANNEL_ID = "";
  }else{
    COMMANDES_CHANNEL_ID = guildConfig.get("commandeChannel");
  }
  const guildId = interaction.guildId;
  const guild = interaction.guild;
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'commandeModal') {
    const nom = interaction.fields.getTextInputValue('nom');
    const tel = interaction.fields.getTextInputValue('tel');
    const entreprise = interaction.fields.getTextInputValue('entreprise');
    const lieu = interaction.fields.getTextInputValue('lieu');
    const commande = interaction.fields.getTextInputValue('commande');
    if (!cmd_base.has(guildId)) {
      cmd_base.set(guildId, new Map());
    }
    const cmds = cmd_base.get(guildId).get("cmd") || [];
    const timestamp = new Date();
    
    const memberRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'chat secure access');

    let category = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toUpperCase() === '--COMMANDES--'
    );

    //create ticket
    if (!category) {
      category = await guild.channels.create({
        name: '--COMMANDES--',
        type: ChannelType.GuildCategory,
        reason: 'Catégorie pour les commandes'
      });
    }

    if (!memberRole) {
      return interaction.editReply({ content: "Rôle member introuvable", ephemeral: true });
    }

    const permissions = [
      {
        id: guild.roles.everyone.id, 
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.member.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: memberRole.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      }
    ];

    const channel = await guild.channels.create({
      name: `${nom}-commandes`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: permissions,
      reason: `Créé par ${nom}`
    });
    const time = Date.now();
    cmds.push({id: time, nom, tel, entreprise, lieu, commande, timestamp, "Etat": "En attente", "Attribution": "", "Payment": false, "ticket": channel.id, "locker": "", "casier": ""});
    cmd_base.get(guildId).set("cmd", cmds);
    saveCmd(cmd_base);
    await interaction.editReply({
      content: `Commande reçue !\nNom: ${nom}\nTéléphone: ${tel}\nEntreprise: ${entreprise}\nLieu: ${lieu}\nChannel: <#${channel.id}>`,
      ephemeral: true
    });
    const regex = /\((\d+)x(\d+)\)/g;
    let match;
    let total = 0;
    let recap = [];

    while ((match = regex.exec(commande)) !== null) {
      const id = parseInt(match[1]);
      const quantite = parseInt(match[2]);

      const item = catalogue[id];
      if (item) {
        const prixTotal = item.prix * quantite;
        total += prixTotal; 
        recap.push({
          nom: item.nom,
          quantite,
          prixUnitaire: item.prix,
          prixTotal
        });
      } else {
        recap.push({
          nom: `Item inconnu (ID ${id})`,
          quantite,
          prixUnitaire: 0,
          prixTotal: 0
        });
      }
    }

    console.log("🧾 Récapitulatif de la commande :\n");
    let r = '';
    recap.forEach(item => {
      r += `- ${item.nom} x${item.quantite} ${item.prixUnitaire.toFixed(2)}€ = ${item.prixTotal.toFixed(2)}€ \n`
      console.log(`- ${item.nom} x${item.quantite} ${item.prixUnitaire.toFixed(2)}€ = ${item.prixTotal.toFixed(2)}€`);
    });

    console.log(`\n💰 Total à payer : ${total.toFixed(2)}€`);


    const embed = new EmbedBuilder()
      .setTitle('DIR BOT - Nouvelle Commande')
      .setColor('Red')
      .setDescription(r);
    channel.send({ embeds: [embed] })
     .then(() => console.log("Embed envoyé avec succès."))
     .catch(console.error);

      const pdfPath = `devis_${Date.now()}.pdf`;
      creerPDF(recap, pdfPath, nom);
      setTimeout(() => {
        channel.send({
          content: `Voici votre devis basé sur la commande.`,
          files: [pdfPath]
        }).then(() => {
          fs.unlinkSync(pdfPath);
        });
      }, 1000);
    let commandePrendreChannel = guild.channels.cache.get(COMMANDES_CHANNEL_ID);
    const embed2 = new EmbedBuilder()
      .setTitle('DIR BOT - Suite de la commande')
      .setColor('Red')
      .setDescription(`Un employé va prendre en charge votre commande dans les plus bref delais, merci de votre patience`);
    channel.send({embeds: [embed2]})

    const embed3 = new EmbedBuilder()
      .setTitle('DIR BOT - Nouvelles commandes')
      .setColor('Red')
      .setDescription(`Nouvelle commande ! Faite /commande-prendre ${time}`);
    commandePrendreChannel.send({embeds: [embed3]})
  }
});

client.login(TOKEN);
