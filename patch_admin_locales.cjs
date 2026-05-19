// Adds missing admin panel keys to all locale files
const fs = require('fs');
const path = require('path');

const languages = ['en','hi','fr','es','de','ar','zh','ja','ru','gu','mr','ta','te','pa'];

const adminKeys = {
  dashboard: "Dashboard",
  homepagecontent: "Homepage Content",
  siteimages: "Site Images",
  experiences: "Experiences",
  roomcategories: "Room Categories",
  physicalrooms: "Physical Rooms",
  bookings: "Bookings",
  dining: "Dining",
  gallery: "Gallery",
  travelstories: "Travel Stories",
  attractions: "Attractions",
  facilities: "Facilities",
  contactqueries: "Contact Queries",
  reviewsmanager: "Reviews Manager",
  slidersettings: "Slider Settings",
  paymentsettings: "Payment Settings",
  settings: "Settings",
  logout: "Logout",
};

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0].map(item => item[0]).join('');
  } catch (e) {
    return text;
  }
}

async function run() {
  for (const lang of languages) {
    const filePath = path.join(__dirname, 'src', 'locales', lang, 'common.json');
    if (!fs.existsSync(filePath)) continue;

    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!json.admin) json.admin = {};

    let changed = false;
    for (const [key, enValue] of Object.entries(adminKeys)) {
      if (!json.admin[key]) {
        json.admin[key] = await translateText(enValue, lang);
        await new Promise(r => setTimeout(r, 120));
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
      console.log(`Patched admin keys for ${lang}`);
    } else {
      console.log(`${lang} admin keys already OK`);
    }
  }
  console.log('Admin key patch complete!');
}

run();
