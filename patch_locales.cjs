// This script patches all locale files to add missing keys
const fs = require('fs');
const path = require('path');

const languages = ['en','hi','fr','es','de','ar','zh','ja','ru','gu','mr','ta','te','pa'];

// Keys to add to navbar section and footer quick links
const extraKeys = {
  about: "About Us",
  aboutus: "About Us",
  ourrooms: "Our Rooms",
  travelstories: "Travel Stories",
  contactus: "Contact Us",
  feedback: "Feedback",
  attractions: "Attractions",
  experiences: "Experiences",
  dining: "Dining",
};

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map(item => item[0]).join('');
  } catch (e) {
    console.error(`Error translating "${text}" to ${targetLang}:`, e.message);
    return text;
  }
}

async function run() {
  for (const lang of languages) {
    const filePath = path.join(__dirname, 'src', 'locales', lang, 'common.json');
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${lang} - file not found`);
      continue;
    }

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Patch navbar section
    if (!json.navbar) json.navbar = {};
    if (!json.footer) json.footer = {};

    let changed = false;
    for (const [key, enValue] of Object.entries(extraKeys)) {
      // Check navbar
      if (!json.navbar[key]) {
        json.navbar[key] = await translateText(enValue, lang);
        await new Promise(r => setTimeout(r, 100));
        changed = true;
      }
      // Check footer
      if (!json.footer[key]) {
        json.footer[key] = await translateText(enValue, lang);
        await new Promise(r => setTimeout(r, 100));
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
      console.log(`Patched ${lang}`);
    } else {
      console.log(`${lang} already up to date`);
    }
  }
  console.log('Patch complete!');
}

run();
