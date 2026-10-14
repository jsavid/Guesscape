// Guesscape Internationalization (i18n) Module
(function() {
    const STORAGE_KEY = 'guesscape_lang';
    let currentLang = localStorage.getItem(STORAGE_KEY) || 'es';

    const UI_TRANSLATIONS = {
        hubSubtitle: {
            en: "",
            es: ""
        },
        flagsTitle: {
            en: "Flags",
            es: "Banderas"
        },
        flagsDesc: {
            en: "See the country name and guess the correct flag. Test your visual memory!",
            es: "Observa el nombre del país y adivina su bandera. ¿Cuántas podrás acertar?"
        },
        capitalsTitle: {
            en: "Capitals",
            es: "Capitales"
        },
        capitalsDesc: {
            en: "Test your knowledge of world capitals and city locations.",
            es: "Pon a prueba tus conocimientos sobre capitales y ciudades del mundo."
        },
        mapsTitle: {
            en: "Identify on Map",
            es: "Identificar en el Mapa"
        },
        mapsDesc: {
            en: "Look at the highlighted country on the map and guess its name.",
            es: "Observa el país resaltado en el mapa y adivina de cuál se trata."
        },
        locateTitle: {
            en: "Find on Map",
            es: "Encontrar en el Mapa"
        },
        locateDesc: {
            en: "See the country name and flag, then tap it directly on the world map.",
            es: "Observa el nombre y la bandera del país, y encuéntralo tocándolo en el mapa."
        },
        countriesTitle: {
            en: "Countries",
            es: "Países"
        },
        countriesDesc: {
            en: "Identify world countries from every continent by their flags. How many can you get right?",
            es: "Identifica países del mundo de cada continente por su bandera. ¿Cuántos podrás acertar?"
        },
        footer: {
            en: "Made while sipping 🧉",
            es: "Hecho tomando 🧉"
        },
        score: {
            en: "Score",
            es: "Puntos"
        },
        progress: {
            en: "Progress",
            es: "Progreso"
        },
        backToMenu: {
            en: "Back to Menu",
            es: "Volver al Menú"
        },
        playAgain: {
            en: "Play Again",
            es: "Jugar de Nuevo"
        },
        gameOver: {
            en: "Game Over!",
            es: "¡Fin del Juego!"
        },
        finalScore: {
            en: "Final Score",
            es: "Puntuación Final"
        },
        headerFlags: {
            en: "FLAGS",
            es: "BANDERAS"
        },
        headerCountries: {
            en: "COUNTRIES",
            es: "PAÍSES"
        },
        headerCapitals: {
            en: "CAPITALS",
            es: "CAPITALES"
        },
        headerMaps: {
            en: "IDENTIFY ON MAP",
            es: "IDENTIFICAR PAÍS"
        },
        headerLocate: {
            en: "FIND ON MAP",
            es: "ENCONTRAR EN EL MAPA"
        },
        modeLocateTab: {
            en: "Find on Map",
            es: "Encontrar en el Mapa"
        },
        modeGuessTab: {
            en: "Identify Country",
            es: "Identificar País"
        },
        locateInstruction: {
            en: "Find the country on the map",
            es: "Encuentra el país en el mapa"
        },
        resetZoomBtn: {
            en: "Reset view",
            es: "Restablecer vista"
        },
        feedbackCorrect: {
            en: "Correct!",
            es: "¡Correcto!"
        },
        feedbackWrong: {
            en: "You selected {clicked}, {correct} is here:",
            es: "Seleccionaste {clicked}, {correct} está aquí:"
        },
        diffModalTitle: {
            en: "Select Difficulty",
            es: "Selecciona la Dificultad"
        },
        diffModalSubtitle: {
            en: "",
            es: ""
        },
        diffEasy: {
            en: "Easy",
            es: "Fácil"
        },
        diffEasyDesc: {
            en: "",
            es: ""
        },
        diffEasyPill: {
            en: "10 Questions",
            es: "10 Preguntas"
        },
        diffMedium: {
            en: "Medium",
            es: "Medio"
        },
        diffMediumDesc: {
            en: "",
            es: ""
        },
        diffMediumPill: {
            en: "20 Questions",
            es: "20 Preguntas"
        },
        diffHard: {
            en: "Hard",
            es: "Difícil"
        },
        diffHardDesc: {
            en: "",
            es: ""
        },
        diffHardPill: {
            en: "50 Questions",
            es: "50 Preguntas"
        },
        diffExtreme: {
            en: "Extreme",
            es: "Extremo"
        },
        diffExtremeDesc: {
            en: "",
            es: ""
        },
        diffExtremePill: {
            en: "100 Questions",
            es: "100 Preguntas"
        }
    };

    const RATINGS = [
        { min: 100, en: "Perfect! 😎 🏆 (Legend level!)", es: "¡Perfecto! 😎 🏆 (¡Nivel legendario!)" },
        { min: 90, en: "Excellent! 😃 ⭐ (Almost flawless!)", es: "¡Excelente! 😃 ⭐ (¡Casi impecable!)" },
        { min: 80, en: "Very Good! 😄 ✨ (Keep it up!)", es: "¡Muy bien! 😄 ✨ (¡Sigue así!)" },
        { min: 70, en: "Good! 🙂 👍 (On the right track)", es: "¡Bien! 🙂 👍 (Por buen camino)" },
        { min: 60, en: "So-so... 🙃 ⚖️ (Just scraping by)", es: "Regular... 🙃 ⚖️ (Apenas pasando)" },
        { min: 50, en: "Weak! 🤨 ⚠️ (Need to push a bit harder)", es: "Flojo... 🤨 ⚠️ (Hay que esforzarse más)" },
        { min: 40, en: "Bad! 🤔 📉 (Need to rethink the strategy)", es: "Mal... 🤔 📉 (Toca repasar geografía)" },
        { min: 30, en: "Very Bad! 🥺 🆘 (Red alert!)", es: "¡Muy mal! 🥺 🆘 (¡Alerta roja!)" },
        { min: 20, en: "Horrible! 🙄 🤦‍♂️ (Don't even ask...)", es: "¡Horrible! 🙄 🤦‍♂️ (Ni preguntes...)" },
        { min: 10, en: "Awful! 🫠 🌋 (Total disaster)", es: "¡Terrible! 🫠 🌋 (Desastre total)" },
        { min: 0, en: "Speechless! 🤯 💀 (What happened here?)", es: "¡Sin palabras! 🤯 💀 (¿Qué pasó aquí?)" }
    ];

    const CONTINENTS = {
        "South America": "América del Sur",
        "North America": "América del Norte",
        "Europe": "Europa",
        "Asia": "Asia",
        "Africa": "África",
        "Oceania": "Oceanía",
        "Antarctica": "Antártida"
};

    const COUNTRIES = {
        "ar": {
                "en": "Argentina",
                "es": "Argentina"
        },
        "bo": {
                "en": "Bolivia",
                "es": "Bolivia"
        },
        "br": {
                "en": "Brazil",
                "es": "Brasil"
        },
        "cl": {
                "en": "Chile",
                "es": "Chile"
        },
        "co": {
                "en": "Colombia",
                "es": "Colombia"
        },
        "ec": {
                "en": "Ecuador",
                "es": "Ecuador"
        },
        "gy": {
                "en": "Guyana",
                "es": "Guyana"
        },
        "py": {
                "en": "Paraguay",
                "es": "Paraguay"
        },
        "pe": {
                "en": "Peru",
                "es": "Perú"
        },
        "sr": {
                "en": "Suriname",
                "es": "Surinam"
        },
        "uy": {
                "en": "Uruguay",
                "es": "Uruguay"
        },
        "ve": {
                "en": "Venezuela",
                "es": "Venezuela"
        },
        "us": {
                "en": "United States",
                "es": "Estados Unidos"
        },
        "ca": {
                "en": "Canada",
                "es": "Canadá"
        },
        "mx": {
                "en": "Mexico",
                "es": "México"
        },
        "ag": {
                "en": "Antigua and Barbuda",
                "es": "Antigua y Barbuda"
        },
        "bs": {
                "en": "Bahamas",
                "es": "Bahamas"
        },
        "bb": {
                "en": "Barbados",
                "es": "Barbados"
        },
        "bz": {
                "en": "Belize",
                "es": "Belice"
        },
        "cr": {
                "en": "Costa Rica",
                "es": "Costa Rica"
        },
        "cu": {
                "en": "Cuba",
                "es": "Cuba"
        },
        "dm": {
                "en": "Dominica",
                "es": "Dominica"
        },
        "do": {
                "en": "Dominican Republic",
                "es": "República Dominicana"
        },
        "sv": {
                "en": "El Salvador",
                "es": "El Salvador"
        },
        "gd": {
                "en": "Grenada",
                "es": "Granada"
        },
        "gt": {
                "en": "Guatemala",
                "es": "Guatemala"
        },
        "ht": {
                "en": "Haiti",
                "es": "Haití"
        },
        "hn": {
                "en": "Honduras",
                "es": "Honduras"
        },
        "jm": {
                "en": "Jamaica",
                "es": "Jamaica"
        },
        "ni": {
                "en": "Nicaragua",
                "es": "Nicaragua"
        },
        "pa": {
                "en": "Panama",
                "es": "Panamá"
        },
        "kn": {
                "en": "Saint Kitts and Nevis",
                "es": "San Cristóbal y Nieves"
        },
        "lc": {
                "en": "Saint Lucia",
                "es": "Santa Lucía"
        },
        "vc": {
                "en": "Saint Vincent and the Grenadines",
                "es": "San Vicente y las Granadinas"
        },
        "tt": {
                "en": "Trinidad and Tobago",
                "es": "Trinidad y Tobago"
        },
        "al": {
                "en": "Albania",
                "es": "Albania"
        },
        "ad": {
                "en": "Andorra",
                "es": "Andorra"
        },
        "am": {
                "en": "Armenia",
                "es": "Armenia"
        },
        "at": {
                "en": "Austria",
                "es": "Austria"
        },
        "by": {
                "en": "Belarus",
                "es": "Bielorrusia"
        },
        "be": {
                "en": "Belgium",
                "es": "Bélgica"
        },
        "ba": {
                "en": "Bosnia and Herzegovina",
                "es": "Bosnia y Herzegovina"
        },
        "bg": {
                "en": "Bulgaria",
                "es": "Bulgaria"
        },
        "hr": {
                "en": "Croatia",
                "es": "Croacia"
        },
        "cy": {
                "en": "Cyprus",
                "es": "Chipre"
        },
        "cz": {
                "en": "Czech Republic",
                "es": "República Checa"
        },
        "dk": {
                "en": "Denmark",
                "es": "Dinamarca"
        },
        "ee": {
                "en": "Estonia",
                "es": "Estonia"
        },
        "fi": {
                "en": "Finland",
                "es": "Finlandia"
        },
        "fr": {
                "en": "France",
                "es": "Francia"
        },
        "ge": {
                "en": "Georgia",
                "es": "Georgia"
        },
        "de": {
                "en": "Germany",
                "es": "Alemania"
        },
        "gr": {
                "en": "Greece",
                "es": "Grecia"
        },
        "hu": {
                "en": "Hungary",
                "es": "Hungría"
        },
        "is": {
                "en": "Iceland",
                "es": "Islandia"
        },
        "ie": {
                "en": "Ireland",
                "es": "Irlanda"
        },
        "it": {
                "en": "Italy",
                "es": "Italia"
        },
        "xk": {
                "en": "Kosovo",
                "es": "Kosovo"
        },
        "lv": {
                "en": "Latvia",
                "es": "Letonia"
        },
        "li": {
                "en": "Liechtenstein",
                "es": "Liechtenstein"
        },
        "lt": {
                "en": "Lithuania",
                "es": "Lituania"
        },
        "lu": {
                "en": "Luxembourg",
                "es": "Luxemburgo"
        },
        "mt": {
                "en": "Malta",
                "es": "Malta"
        },
        "md": {
                "en": "Moldova",
                "es": "Moldavia"
        },
        "mc": {
                "en": "Monaco",
                "es": "Mónaco"
        },
        "me": {
                "en": "Montenegro",
                "es": "Montenegro"
        },
        "nl": {
                "en": "Netherlands",
                "es": "Países Bajos"
        },
        "mk": {
                "en": "North Macedonia",
                "es": "Macedonia del Norte"
        },
        "no": {
                "en": "Norway",
                "es": "Noruega"
        },
        "pl": {
                "en": "Poland",
                "es": "Polonia"
        },
        "pt": {
                "en": "Portugal",
                "es": "Portugal"
        },
        "ro": {
                "en": "Romania",
                "es": "Rumania"
        },
        "ru": {
                "en": "Russia",
                "es": "Rusia"
        },
        "sm": {
                "en": "San Marino",
                "es": "San Marino"
        },
        "rs": {
                "en": "Serbia",
                "es": "Serbia"
        },
        "sk": {
                "en": "Slovakia",
                "es": "Eslovaquia"
        },
        "si": {
                "en": "Slovenia",
                "es": "Eslovenia"
        },
        "es": {
                "en": "Spain",
                "es": "España"
        },
        "se": {
                "en": "Sweden",
                "es": "Suecia"
        },
        "ch": {
                "en": "Switzerland",
                "es": "Suiza"
        },
        "ua": {
                "en": "Ukraine",
                "es": "Ucrania"
        },
        "gb": {
                "en": "United Kingdom",
                "es": "Reino Unido"
        },
        "va": {
                "en": "Vatican City",
                "es": "Ciudad del Vaticano"
        },
        "af": {
                "en": "Afghanistan",
                "es": "Afganistán"
        },
        "az": {
                "en": "Azerbaijan",
                "es": "Azerbaiyán"
        },
        "bh": {
                "en": "Bahrain",
                "es": "Baréin"
        },
        "bd": {
                "en": "Bangladesh",
                "es": "Bangladés"
        },
        "bt": {
                "en": "Bhutan",
                "es": "Bután"
        },
        "bn": {
                "en": "Brunei",
                "es": "Brunéi"
        },
        "kh": {
                "en": "Cambodia",
                "es": "Camboya"
        },
        "cn": {
                "en": "China",
                "es": "China"
        },
        "tl": {
                "en": "East Timor",
                "es": "Timor Oriental"
        },
        "in": {
                "en": "India",
                "es": "India"
        },
        "id": {
                "en": "Indonesia",
                "es": "Indonesia"
        },
        "ir": {
                "en": "Iran",
                "es": "Irán"
        },
        "iq": {
                "en": "Iraq",
                "es": "Irak"
        },
        "il": {
                "en": "Israel",
                "es": "Israel"
        },
        "jp": {
                "en": "Japan",
                "es": "Japón"
        },
        "jo": {
                "en": "Jordan",
                "es": "Jordania"
        },
        "kz": {
                "en": "Kazakhstan",
                "es": "Kazajistán"
        },
        "kw": {
                "en": "Kuwait",
                "es": "Kuwait"
        },
        "kg": {
                "en": "Kyrgyzstan",
                "es": "Kirguistán"
        },
        "la": {
                "en": "Laos",
                "es": "Laos"
        },
        "lb": {
                "en": "Lebanon",
                "es": "Líbano"
        },
        "my": {
                "en": "Malaysia",
                "es": "Malasia"
        },
        "mv": {
                "en": "Maldives",
                "es": "Maldivas"
        },
        "mn": {
                "en": "Mongolia",
                "es": "Mongolia"
        },
        "mm": {
                "en": "Myanmar",
                "es": "Birmania (Myanmar)"
        },
        "np": {
                "en": "Nepal",
                "es": "Nepal"
        },
        "kp": {
                "en": "North Korea",
                "es": "Corea del Norte"
        },
        "om": {
                "en": "Oman",
                "es": "Omán"
        },
        "pk": {
                "en": "Pakistan",
                "es": "Pakistán"
        },
        "ps": {
                "en": "Palestine",
                "es": "Palestina"
        },
        "ph": {
                "en": "Philippines",
                "es": "Filipinas"
        },
        "qa": {
                "en": "Qatar",
                "es": "Catar"
        },
        "sa": {
                "en": "Saudi Arabia",
                "es": "Arabia Saudita"
        },
        "sg": {
                "en": "Singapore",
                "es": "Singapur"
        },
        "kr": {
                "en": "South Korea",
                "es": "Corea del Sur"
        },
        "lk": {
                "en": "Sri Lanka",
                "es": "Sri Lanka"
        },
        "sy": {
                "en": "Syria",
                "es": "Siria"
        },
        "tw": {
                "en": "Taiwan",
                "es": "Taiwán"
        },
        "tj": {
                "en": "Tajikistan",
                "es": "Tayikistán"
        },
        "th": {
                "en": "Thailand",
                "es": "Tailandia"
        },
        "tr": {
                "en": "Türkiye",
                "es": "Turquía"
        },
        "tm": {
                "en": "Turkmenistan",
                "es": "Turkmenistán"
        },
        "ae": {
                "en": "United Arab Emirates",
                "es": "Emiratos Árabes Unidos"
        },
        "uz": {
                "en": "Uzbekistan",
                "es": "Uzbekistán"
        },
        "vn": {
                "en": "Vietnam",
                "es": "Vietnam"
        },
        "ye": {
                "en": "Yemen",
                "es": "Yemen"
        },
        "dz": {
                "en": "Algeria",
                "es": "Argelia"
        },
        "ao": {
                "en": "Angola",
                "es": "Angola"
        },
        "bj": {
                "en": "Benin",
                "es": "Benín"
        },
        "bw": {
                "en": "Botswana",
                "es": "Botsuana"
        },
        "bf": {
                "en": "Burkina Faso",
                "es": "Burkina Faso"
        },
        "bi": {
                "en": "Burundi",
                "es": "Burundi"
        },
        "cm": {
                "en": "Cameroon",
                "es": "Camerún"
        },
        "cv": {
                "en": "Cape Verde",
                "es": "Cabo Verde"
        },
        "cf": {
                "en": "Central African Republic",
                "es": "República Centroafricana"
        },
        "td": {
                "en": "Chad",
                "es": "Chad"
        },
        "km": {
                "en": "Comoros",
                "es": "Comoras"
        },
        "cd": {
                "en": "DR Congo",
                "es": "República Democrática del Congo"
        },
        "cg": {
                "en": "Republic of the Congo",
                "es": "República del Congo"
        },
        "dj": {
                "en": "Djibouti",
                "es": "Yibuti"
        },
        "eg": {
                "en": "Egypt",
                "es": "Egipto"
        },
        "gq": {
                "en": "Equatorial Guinea",
                "es": "Guinea Ecuatorial"
        },
        "er": {
                "en": "Eritrea",
                "es": "Eritrea"
        },
        "sz": {
                "en": "Eswatini",
                "es": "Esuatini (Suazilandia)"
        },
        "et": {
                "en": "Ethiopia",
                "es": "Etiopía"
        },
        "ga": {
                "en": "Gabon",
                "es": "Gabón"
        },
        "gm": {
                "en": "Gambia",
                "es": "Gambia"
        },
        "gh": {
                "en": "Ghana",
                "es": "Ghana"
        },
        "gn": {
                "en": "Guinea",
                "es": "Guinea"
        },
        "gw": {
                "en": "Guinea-Bissau",
                "es": "Guinea-Bisáu"
        },
        "ci": {
                "en": "Ivory Coast",
                "es": "Costa de Marfil"
        },
        "ke": {
                "en": "Kenya",
                "es": "Kenia"
        },
        "ls": {
                "en": "Lesotho",
                "es": "Lesoto"
        },
        "lr": {
                "en": "Liberia",
                "es": "Liberia"
        },
        "ly": {
                "en": "Libya",
                "es": "Libia"
        },
        "mg": {
                "en": "Madagascar",
                "es": "Madagascar"
        },
        "mw": {
                "en": "Malawi",
                "es": "Malaui"
        },
        "ml": {
                "en": "Mali",
                "es": "Malí"
        },
        "mr": {
                "en": "Mauritania",
                "es": "Mauritania"
        },
        "mu": {
                "en": "Mauritius",
                "es": "Mauricio"
        },
        "ma": {
                "en": "Morocco",
                "es": "Marruecos"
        },
        "mz": {
                "en": "Mozambique",
                "es": "Mozambique"
        },
        "na": {
                "en": "Namibia",
                "es": "Namibia"
        },
        "ne": {
                "en": "Niger",
                "es": "Níger"
        },
        "ng": {
                "en": "Nigeria",
                "es": "Nigeria"
        },
        "rw": {
                "en": "Rwanda",
                "es": "Ruanda"
        },
        "st": {
                "en": "Sao Tome and Principe",
                "es": "Santo Tomé y Príncipe"
        },
        "sn": {
                "en": "Senegal",
                "es": "Senegal"
        },
        "sc": {
                "en": "Seychelles",
                "es": "Seychelles"
        },
        "sl": {
                "en": "Sierra Leone",
                "es": "Sierra Leona"
        },
        "so": {
                "en": "Somalia",
                "es": "Somalia"
        },
        "za": {
                "en": "South Africa",
                "es": "Sudáfrica"
        },
        "ss": {
                "en": "South Sudan",
                "es": "Sudán del Sur"
        },
        "sd": {
                "en": "Sudan",
                "es": "Sudán"
        },
        "tz": {
                "en": "Tanzania",
                "es": "Tanzania"
        },
        "tg": {
                "en": "Togo",
                "es": "Togo"
        },
        "tn": {
                "en": "Tunisia",
                "es": "Túnez"
        },
        "ug": {
                "en": "Uganda",
                "es": "Uganda"
        },
        "zm": {
                "en": "Zambia",
                "es": "Zambia"
        },
        "zw": {
                "en": "Zimbabwe",
                "es": "Zimbabue"
        },
        "au": {
                "en": "Australia",
                "es": "Australia"
        },
        "fj": {
                "en": "Fiji",
                "es": "Fiyi"
        },
        "ki": {
                "en": "Kiribati",
                "es": "Kiribati"
        },
        "mh": {
                "en": "Marshall Islands",
                "es": "Islas Marshall"
        },
        "fm": {
                "en": "Micronesia",
                "es": "Micronesia"
        },
        "nr": {
                "en": "Nauru",
                "es": "Nauru"
        },
        "nz": {
                "en": "New Zealand",
                "es": "Nueva Zelanda"
        },
        "pw": {
                "en": "Palau",
                "es": "Palaos"
        },
        "pg": {
                "en": "Papua New Guinea",
                "es": "Papúa Nueva Guinea"
        },
        "ws": {
                "en": "Samoa",
                "es": "Samoa"
        },
        "sb": {
                "en": "Solomon Islands",
                "es": "Islas Salomón"
        },
        "to": {
                "en": "Tonga",
                "es": "Tonga"
        },
        "tv": {
                "en": "Tuvalu",
                "es": "Tuvalu"
        },
        "vu": {
                "en": "Vanuatu",
                "es": "Vanuatu"
        },
        "_1": {
                "en": "Kosovo",
                "es": "Kosovo"
        },
        "pr": {
                "en": "Puerto Rico",
                "es": "Puerto Rico"
        },
        "gl": {
                "en": "Greenland",
                "es": "Groenlandia"
        },
        "hk": {
                "en": "Hong Kong",
                "es": "Hong Kong"
        },
        "fo": {
                "en": "Faroe Islands",
                "es": "Islas Feroe"
        },
        "mo": {
                "en": "Macao",
                "es": "Macao"
        },
        "bm": {
                "en": "Bermuda",
                "es": "Bermudas"
        },
        "gi": {
                "en": "Gibraltar",
                "es": "Gibraltar"
        },
        "cw": {
                "en": "Curaçao",
                "es": "Curazao"
        },
        "aw": {
                "en": "Aruba",
                "es": "Aruba"
        },
        "gu": {
                "en": "Guam",
                "es": "Guam"
        },
        "pf": {
                "en": "French Polynesia",
                "es": "Polinesia Francesa"
        },
        "nc": {
                "en": "New Caledonia",
                "es": "Nueva Caledonia"
        },
        "gb-sct": {
                "en": "Scotland",
                "es": "Escocia"
        },
        "gb-wls": {
                "en": "Wales",
                "es": "Gales"
        },
        "gb-eng": {
                "en": "England",
                "es": "Inglaterra"
        },
        "gb-nir": {
                "en": "Northern Ireland",
                "es": "Irlanda del Norte"
        },
        "gf": {
                "en": "French Guiana",
                "es": "Guayana Francesa"
        }
};

    const CITIES = {
        "Cayenne": "Cayena",
        "Edinburgh": "Edimburgo",
        "Nouméa": "Numea",
        "London": "Londres",
        "Rome": "Roma",
        "Paris": "París",
        "Berlin": "Berlín",
        "Moscow": "Moscú",
        "Athens": "Atenas",
        "Tokyo": "Tokio",
        "Beijing": "Pekín",
        "Seoul": "Seúl",
        "Washington, D.C.": "Washington D.C.",
        "Mexico City": "Ciudad de México",
        "Guatemala City": "Ciudad de Guatemala",
        "Panama City": "Ciudad de Panamá",
        "Santo Domingo": "Santo Domingo",
        "Havana": "La Habana",
        "Bogotá": "Bogotá",
        "Brasília": "Brasilia",
        "Cairo": "El Cairo",
        "Damascus": "Damasco",
        "Beirut": "Beirut",
        "Ramallah": "Ramala",
        "Gaza City": "Ciudad de Gaza",
        "Jerusalem": "Jerusalén",
        "Warsaw": "Varsovia",
        "Prague": "Praga",
        "Vienna": "Viena",
        "Brussels": "Bruselas",
        "Lisbon": "Lisboa",
        "Dublin": "Dublín",
        "Bern": "Berna",
        "Copenhagen": "Copenhague",
        "Stockholm": "Estocolmo",
        "Kyiv": "Kiev",
        "Bucharest": "Bucarest",
        "Budapest": "Budapest",
        "Belgrade": "Belgrado",
        "Zagreb": "Zagreb",
        "Sarajevo": "Sarajevo",
        "Bratislava": "Bratislava",
        "Ljubljana": "Liubliana",
        "Skopje": "Skopie",
        "Tirana": "Tirana",
        "Reykjavik": "Reikiavik",
        "Helsinki": "Helsinki",
        "Oslo": "Oslo",
        "Ankara": "Ankara",
        "Baghdad": "Bagdad",
        "Tehran": "Teherán",
        "Riyadh": "Riad",
        "Jerusalem": "Jerusalén",
        "New Delhi": "Nueva Delhi",
        "Islamabad": "Islamabad",
        "Kabul": "Kabul",
        "Bangkok": "Bangkok",
        "Hanoi": "Hanói",
        "Jakarta": "Yakarta",
        "Manila": "Manila",
        "Kuala Lumpur": "Kuala Lumpur",
        "Singapore": "Singapur",
        "Algiers": "Argel",
        "Tunis": "Túnez",
        "Tripoli": "Trípoli",
        "Rabat": "Rabat",
        "Addis Ababa": "Adís Abeba",
        "Nairobi": "Nairobi",
        "Pretoria": "Pretoria",
        "Cape Town": "Ciudad del Cabo",
        "Canberra": "Canberra",
        "Wellington": "Wellington"
};

    const listeners = [];

    function injectStyles() {
        if (document.getElementById('guesscape-i18n-styles')) return;
        const style = document.createElement('style');
        style.id = 'guesscape-i18n-styles';
        style.textContent = `
            .guesscape-lang-switcher {
                position: fixed;
                top: 14px;
                right: 16px;
                z-index: 9999;
                display: inline-flex;
                align-items: center;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 9999px;
                padding: 3px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
                user-select: none;
            }
            .guesscape-lang-btn {
                background: transparent;
                border: none;
                color: #94a3b8;
                font-family: inherit;
                font-size: 0.82rem;
                font-weight: 700;
                padding: 5px 11px;
                border-radius: 9999px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 6px;
                outline: none;
                line-height: 1;
            }
            .guesscape-lang-btn .lang-flag {
                display: block;
                border-radius: 2px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                flex-shrink: 0;
            }
            .guesscape-lang-btn:hover {
                color: #f8fafc;
            }
            .guesscape-lang-btn.active {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
            }
            @media (max-width: 480px) {
                .guesscape-lang-switcher {
                    top: 8px;
                    right: 8px;
                }
                .guesscape-lang-btn {
                    padding: 4px 8px;
                    font-size: 0.75rem;
                    gap: 4px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const I18N = {
        getLanguage: () => currentLang,
        
        setLanguage: (lang) => {
            if (lang !== 'es' && lang !== 'en') return;
            currentLang = lang;
            localStorage.setItem(STORAGE_KEY, lang);
            document.documentElement.lang = lang;
            I18N.updateSwitcherUI();
            listeners.forEach(fn => {
                try { fn(lang); } catch (err) { console.error(err); }
            });
        },

        onLanguageChange: (callback) => {
            if (typeof callback === 'function') {
                listeners.push(callback);
            }
        },

        t: (key) => {
            if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key][currentLang]) {
                return UI_TRANSLATIONS[key][currentLang];
            }
            return key;
        },

        tCountry: (code, fallbackName) => {
            if (!code && !fallbackName) return '';
            const cCode = (code || '').toLowerCase();
            if (COUNTRIES[cCode]) {
                return COUNTRIES[cCode][currentLang] || COUNTRIES[cCode]['en'] || fallbackName;
            }
            for (const c in COUNTRIES) {
                if (COUNTRIES[c].en.toLowerCase() === (fallbackName || '').toLowerCase()) {
                    return COUNTRIES[c][currentLang];
                }
            }
            return fallbackName || code;
        },

        tContinent: (continent) => {
            if (currentLang === 'es' && CONTINENTS[continent]) {
                return CONTINENTS[continent];
            }
            return continent;
        },

        tCity: (cityName) => {
            if (currentLang === 'es' && CITIES[cityName]) {
                return CITIES[cityName];
            }
            return cityName;
        },

        getRating: (percent) => {
            return "";
        },

        updateSwitcherUI: () => {
            const btns = document.querySelectorAll('.guesscape-lang-btn');
            btns.forEach(btn => {
                if (btn.dataset.lang === currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },

        initSwitcher: () => {
            injectStyles();
            document.documentElement.lang = currentLang;
            if (document.getElementById('guesscape-lang-switcher')) {
                I18N.updateSwitcherUI();
                return;
            }

            const switcher = document.createElement('div');
            switcher.id = 'guesscape-lang-switcher';
            switcher.className = 'guesscape-lang-switcher';
            switcher.innerHTML = `
                <button type="button" class="guesscape-lang-btn ${currentLang === 'es' ? 'active' : ''}" data-lang="es" title="Español">
                    <svg class="lang-flag" viewBox="0 0 640 480" width="18" height="12">
                        <rect width="640" height="480" fill="#c60b1e"/>
                        <rect y="120" width="640" height="240" fill="#ffc400"/>
                    </svg>
                    <span>ES</span>
                </button>
                <button type="button" class="guesscape-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" title="English">
                    <svg class="lang-flag" viewBox="0 0 60 30" width="18" height="12">
                        <clipPath id="uk-clip"><path d="M0 0v30h60V0z"/></clipPath>
                        <clipPath id="uk-diag"><path d="M30 15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>
                        <g clip-path="url(#uk-clip)">
                            <path d="M0 0v30h60V0z" fill="#012169"/>
                            <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>
                            <path d="M0 0l60 30m0-30L0 30" clip-path="url(#uk-diag)" stroke="#c8102e" stroke-width="4"/>
                            <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>
                            <path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/>
                        </g>
                    </svg>
                    <span>EN</span>
                </button>
            `;

            document.body.appendChild(switcher);

            switcher.querySelectorAll('.guesscape-lang-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = btn.dataset.lang;
                    I18N.setLanguage(lang);
                });
            });
        }
    };

    window.I18N = I18N;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => I18N.initSwitcher());
    } else {
        I18N.initSwitcher();
    }
})();
