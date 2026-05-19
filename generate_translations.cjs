const fs = require('fs');
const path = require('path');

const languages = [
  'en', 'hi', 'fr', 'es', 'de', 'ar', 'zh', 
  'ja', 'ru', 'gu', 'mr', 'ta', 'te', 'pa'
]; // Limited to requested languages in the second prompt to be safe with rate limits

const baseContent = {
  "navbar": {
    "home": "Home",
    "experiences": "Experiences",
    "stay": "Stay",
    "dining": "Dining",
    "stories": "Stories",
    "attractions": "Attractions",
    "contact": "Contact",
    "bookNow": "Book Now",
    "admin": "Admin",
    "about": "About Us",
    "aboutus": "About Us",
    "ourrooms": "Our Rooms",
    "travelstories": "Travel Stories",
    "contactus": "Contact Us",
    "feedback": "Feedback"
  },
  "hero": {
    "title": "Cosy Guest House",
    "subtitle": "Where Comfort Meets the Beauty of the Blue City.",
    "exploreStay": "Explore Stay",
    "viewDining": "View Dining"
  },
  "rooms": {
    "heading": "Our Rooms & Suites",
    "accommodation": "Accommodation",
    "book": "Book Now"
  },
  "booking": {
    "guests": "Guest Selection",
    "name": "Lead Guest Name *",
    "email": "Email *",
    "phone": "Mobile *"
  },
  "dining": {
    "subtitle": "A Taste of Rajasthan",
    "readMore": "Read More",
    "readLess": "Read Less"
  },
  "stories": {
    "journal": "Journal",
    "heading": "Travel Stories",
    "readMore": "Read More"
  },
  "contact": {
    "reachUs": "Reach Us",
    "title": "Contact Us",
    "findUs": "Find Us",
    "getInTouch": "Get In Touch",
    "address": "Address",
    "writeToUs": "Write to Us",
    "sendMessage": "Send a Message"
  },
  "footer": {
    "about": "About Us",
    "contact": "Contact Us",
    "links": "Explore",
    "findUs": "Find Us",
    "rights": "All rights reserved",
    "aboutus": "About Us",
    "ourrooms": "Our Rooms",
    "travelstories": "Travel Stories",
    "contactus": "Contact Us",
    "feedback": "Feedback",
    "attractions": "Attractions",
    "experiences": "Experiences",
    "dining": "Dining"
  },
  "admin": {
    "dashboard": "Dashboard",
    "rooms": "Rooms",
    "bookings": "Bookings",
    "settings": "Settings",
    "logout": "Logout",
    "homepagecontent": "Homepage Content",
    "siteimages": "Site Images",
    "experiences": "Experiences",
    "roomcategories": "Room Categories",
    "physicalrooms": "Physical Rooms",
    "dining": "Dining",
    "gallery": "Gallery",
    "travelstories": "Travel Stories",
    "attractions": "Attractions",
    "facilities": "Facilities",
    "contactqueries": "Contact Queries",
    "reviewsmanager": "Reviews Manager",
    "slidersettings": "Slider Settings",
    "paymentsettings": "Payment Settings"
  },
  "facilities": {
    "subtitle": "Amenities",
    "heading": "Our Facilities"
  },
  "reviews": {
    "subtitle": "Guest Voices",
    "heading": "What Our Guests Say"
  },
  "experiences": {
    "subtitle": "Discover"
  },
  "attractions": {
    "subtitle": "Discover",
    "exploreAll": "Explore All Attractions"
  }
};

async function translateText(text, targetLang) {
    if (targetLang === 'en') return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.error(`Error translating to ${targetLang}:`, e);
        return text;
    }
}

async function translateObject(obj, targetLang) {
    const result = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            result[key] = await translateObject(obj[key], targetLang);
        } else {
            result[key] = await translateText(obj[key], targetLang);
            // wait a little bit to avoid rate limits
            await new Promise(r => setTimeout(r, 150));
        }
    }
    return result;
}

async function run() {
    for (const lang of languages) {
        console.log(`Translating to ${lang}...`);
        const translatedContent = await translateObject(baseContent, lang);
        
        const dir = path.join(__dirname, 'src', 'locales', lang);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, 'common.json'), JSON.stringify(translatedContent, null, 2));
    }
    console.log('Done generating translations!');
}

run();
