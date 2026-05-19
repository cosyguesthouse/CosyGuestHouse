const fs = require('fs');
const path = require('path');

const languages = [
  'en', 'hi', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ar', 'zh', 
  'ja', 'ko', 'tr', 'nl', 'th', 'id', 'bn', 'ur', 'pa', 'gu', 
  'mr', 'ta', 'te', 'kn', 'ml'
];

const content = {
  "navbar": {
    "home": "Home",
    "experiences": "Experiences",
    "stay": "Stay",
    "dining": "Dining",
    "stories": "Stories",
    "attractions": "Attractions",
    "contact": "Contact",
    "bookNow": "Book Now"
  },
  "hero": {
    "title": "Cosy Guest House",
    "subtitle": "Your Home in the Blue City"
  },
  "rooms": {
    "heading": "Our Rooms",
    "book": "Book"
  },
  "booking": {
    "checkIn": "Check In",
    "checkOut": "Check Out",
    "guests": "Guests",
    "book": "Book Room"
  },
  "footer": {
    "about": "About Us",
    "contact": "Contact Us",
    "links": "Quick Links"
  }
};

languages.forEach(lang => {
  const dir = path.join(__dirname, 'src', 'locales', lang);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'common.json'), JSON.stringify(content, null, 2));
});

console.log('Created translation files.');
