import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/Team.js';

dotenv.config();

const teams = [
  { teamName: "403_privileged", university: "UOM", leaderName: "Rusiru Sadathana Mendis", teamId: "408UR58" },
  { teamName: "CipherTech", university: "NSBM", leaderName: "Hiruna Perera", teamId: "Ci8NH63" },
  { teamName: "SpiDeX", university: "ESU", leaderName: "K. Nipun Dinudaya", teamId: "Sp2EK52" },
  { teamName: "GhostNet", university: "NSBM", leaderName: "Oshada Rashmika", teamId: "Gh4NO64" },
  { teamName: "JG DiFF", university: "NIBM", leaderName: "Sandeera Chathuranga", teamId: "JG4NS29" },
  { teamName: "CyberGryffin", university: "LNBTI", leaderName: "Champika Dilshan Abeysekara", teamId: "Cy3LC52" },
  { teamName: "The Mentor", university: "SLTC", leaderName: "Akila Isuranga", teamId: "Th5SA16" },
  { teamName: "Trojan Hex", university: "UOM", leaderName: "Nehan Wijayagunaratna", teamId: "Tr5UN83" },
  { teamName: "SILVR", university: "NSBM", leaderName: "Sakith Karunasena", teamId: "SI7NS29" },
  { teamName: "rootECU", university: "ECU", leaderName: "Aqwa Hameed", teamId: "ro1EA15" },
  { teamName: "Bounty Hunt3R", university: "UOR", leaderName: "H.K.A.K.Chathuranga", teamId: "Bo6UH46" },
  { teamName: "Haxsora", university: "ESOFT", leaderName: "Shamri Muzammildeen", teamId: "Ha5ES55" },
  { teamName: "JrSharks", university: "UOM", leaderName: "Sahan Tharaka", teamId: "Jr3US98" },
  { teamName: "Insomniacs", university: "USJP", leaderName: "Sithum Nirmal Weerasinghe", teamId: "In0US55" },
  { teamName: "CodeX", university: "NSBM", leaderName: "Isuru Oshadha", teamId: "Co5NI23" },
  { teamName: "Syscall", university: "UWU", leaderName: "Manuja Medhankara", teamId: "Sy5UM93" },
  { teamName: "Cyberians", university: "KIU", leaderName: "Gamitha Chamoda", teamId: "Cy7KG99" },
  { teamName: "The_Anonymous", university: "UOR", leaderName: "Sachintha Pallegadara", teamId: "Th4US43" },
  { teamName: "Chronos", university: "CICRA", leaderName: "Indura Nawarathne", teamId: "Ch5CI99" },
  { teamName: "Script_Kiddos", university: "SLIIT", leaderName: "Anuradha Lakshman Bandara", teamId: "Sc9SA68" },
  { teamName: "HackStreetBoys", university: "UOM", leaderName: "Vidath Dissanayake", teamId: "Ha0MV84" },
  { teamName: "CryptoKnights", university: "KDU", leaderName: "Weerakon Mudiyanselage Nav", teamId: "Cr1KW10" },
  { teamName: "Cyber Shadows", university: "UOM", leaderName: "Alric Prashanth Patric Nilaksh", teamId: "Cy2UA98" },
  { teamName: "Byte404", university: "USJP", leaderName: "Wasala Liyanage Don Thisal Mendis", teamId: "By7UW91" },
  { teamName: "R80", university: "USJP", leaderName: "Adikari Gedara Harsha Pathum", teamId: "R87UA48" },
  { teamName: "ZeroDay", university: "UOC", leaderName: "D.M.C. Pasindu Dissanayaka", teamId: "Ze4UD89" },
  { teamName: "Hackersploit", university: "APIIT", leaderName: "Sandaru Dinusha", teamId: "Ha7AS88" },
  { teamName: "CipherStorm", university: "IIT", leaderName: "KAVINU WETHMIN WITTAHACHCHI", teamId: "Ci2IK57" },
  { teamName: "Alpha Squad", university: "UOK", leaderName: "R.A.M.C.Ranasinghe", teamId: "Al0UR22" },
  { teamName: "Team Blazer", university: "NSBM", leaderName: "Garuka Assalaarachchi", teamId: "Te9NG73" },
  { teamName: "Hackers league", university: "UOM", leaderName: "Thanushiyan kanthasamy", teamId: "Ha7UT63" },
  { teamName: "HexGang", university: "SLTC", leaderName: "Ilandari pedige nipun pramod me", teamId: "He0SI44" },
  { teamName: "Xploitx", university: "SLIIT", leaderName: "Zuhair Al Midani Shimar", teamId: "Xp6SZ88" },
  { teamName: "We Tried", university: "USJP", leaderName: "Segu Ibrahim Mohamed Hamsa", teamId: "We8US53" },
  { teamName: "Knights", university: "SLTC", leaderName: "Rawishka Dilshan", teamId: "Kn0SR62" },
  { teamName: "D3vNull", university: "SLIIT", leaderName: "Asokan Srisabeshan", teamId: "D34SA69" },
  { teamName: "ByteHack", university: "OUSL", leaderName: "Suganthan Kumarlalimgan", teamId: "By2OS74" },
  { teamName: "Indomitus", university: "USJP", leaderName: "Raviru Rathnaweera", teamId: "In8UR61" },
  { teamName: "NeXora", university: "UOK", leaderName: "Matheesha Jananjaya", teamId: "Ne5UM16" },
  { teamName: "0xLOL", university: "SLTC", leaderName: "Shakkya Sanketh Dharmarathna", teamId: "0x7SS41" },
  { teamName: "Scorpion", university: "SLIIT", leaderName: "Sheron Nimesh Bandara", teamId: "Sc5SS91" },
  { teamName: "VO1D", university: "NSBM", leaderName: "Don Loneth Thewmika Amartunge", teamId: "VO5ND73" },
  { teamName: "CyberMonks", university: "SLIIT", leaderName: "Yasith Anjana Liyanage", teamId: "Cy4SY56" },
  { teamName: "K3rnel_pan1c", university: "UOP", leaderName: "Badugamage Don Kamesh Chanaka", teamId: "K34UB10" },
  { teamName: "ClipherCore", university: "IIT", leaderName: "Jayalathge Imansa Sanuth Band", teamId: "Cl7IJ71" },
  { teamName: "Turingz", university: "UOM", leaderName: "Ranwinde Dharmapala", teamId: "Tu9UR25" },
  { teamName: "ROOTFORCE", university: "ESOFT", leaderName: "Aseesudha Hansaka Herath", teamId: "RO9EA80" },
  { teamName: "ReactorIV", university: "UOC", leaderName: "Esandu Hansaka Epa", teamId: "Re6UE22" },
  { teamName: "RedClave", university: "UOR", leaderName: "Hasmitha Gunarathne", teamId: "Re9UH53" },
  { teamName: "0xOverflow", university: "UOR", leaderName: "Muflih Ahmes Junaid", teamId: "Ov4UR51" },
  { teamName: "Code_Crackers_UoR", university: "UOR", leaderName: "Shimrin Siraj", teamId: "Cc2UR25" }
];

async function importTeams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    // Clear existing teams (optional - comment out if you want to keep existing data)
    // await Team.deleteMany({});
    // console.log('Cleared existing teams');

    // Insert teams
    const insertedTeams = await Team.insertMany(teams, { ordered: false });
    console.log(`Successfully imported ${insertedTeams.length} teams`);

    // Display summary
    console.log('\n=== Import Summary ===');
    console.log(`Total teams in CSV: ${teams.length}`);
    console.log(`Successfully imported: ${insertedTeams.length}`);
    
    // Display all team IDs
    console.log('\n=== Team IDs ===');
    const allTeams = await Team.find({}).sort({ teamName: 1 });
    allTeams.forEach(team => {
      console.log(`${team.teamId} - ${team.teamName} (${team.university})`);
    });

  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate team IDs found. Some teams may already exist in the database.');
      console.error('Duplicate keys:', error.writeErrors?.map(e => e.err.op.teamId));
    } else {
      console.error('Error importing teams:', error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the import
importTeams();
