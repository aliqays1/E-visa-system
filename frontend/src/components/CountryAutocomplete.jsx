import React, { useState, useEffect, useRef } from 'react';

const countries = [
  {
    "name": "Andorra",
    "flag": "🇦🇩"
  },
  {
    "name": "United Arab Emirates (the)",
    "flag": "🇦🇪"
  },
  {
    "name": "Afghanistan",
    "flag": "🇦🇫"
  },
  {
    "name": "Antigua and Barbuda",
    "flag": "🇦🇬"
  },
  {
    "name": "Anguilla",
    "flag": "🇦🇮"
  },
  {
    "name": "Albania",
    "flag": "🇦🇱"
  },
  {
    "name": "Armenia",
    "flag": "🇦🇲"
  },
  {
    "name": "Angola",
    "flag": "🇦🇴"
  },
  {
    "name": "Antarctica",
    "flag": "🇦🇶"
  },
  {
    "name": "Argentina",
    "flag": "🇦🇷"
  },
  {
    "name": "American Samoa",
    "flag": "🇦🇸"
  },
  {
    "name": "Austria",
    "flag": "🇦🇹"
  },
  {
    "name": "Australia",
    "flag": "🇦🇺"
  },
  {
    "name": "Aruba",
    "flag": "🇦🇼"
  },
  {
    "name": "Åland Islands",
    "flag": "🇦🇽"
  },
  {
    "name": "Azerbaijan",
    "flag": "🇦🇿"
  },
  {
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦"
  },
  {
    "name": "Barbados",
    "flag": "🇧🇧"
  },
  {
    "name": "Bangladesh",
    "flag": "🇧🇩"
  },
  {
    "name": "Belgium",
    "flag": "🇧🇪"
  },
  {
    "name": "Burkina Faso",
    "flag": "🇧🇫"
  },
  {
    "name": "Bulgaria",
    "flag": "🇧🇬"
  },
  {
    "name": "Bahrain",
    "flag": "🇧🇭"
  },
  {
    "name": "Burundi",
    "flag": "🇧🇮"
  },
  {
    "name": "Benin",
    "flag": "🇧🇯"
  },
  {
    "name": "Saint Barthélemy",
    "flag": "🇧🇱"
  },
  {
    "name": "Bermuda",
    "flag": "🇧🇲"
  },
  {
    "name": "Brunei Darussalam",
    "flag": "🇧🇳"
  },
  {
    "name": "Bolivia (Plurinational State of)",
    "flag": "🇧🇴"
  },
  {
    "name": "Bonaire, Sint Eustatius and Saba",
    "flag": "🇧🇶"
  },
  {
    "name": "Brazil",
    "flag": "🇧🇷"
  },
  {
    "name": "Bahamas (The)",
    "flag": "🇧🇸"
  },
  {
    "name": "Bhutan",
    "flag": "🇧🇹"
  },
  {
    "name": "Bouvet Island",
    "flag": "🇧🇻"
  },
  {
    "name": "Botswana",
    "flag": "🇧🇼"
  },
  {
    "name": "Belarus",
    "flag": "🇧🇾"
  },
  {
    "name": "Belize",
    "flag": "🇧🇿"
  },
  {
    "name": "Canada",
    "flag": "🇨🇦"
  },
  {
    "name": "Cocos (Keeling) Islands (the)",
    "flag": "🇨🇨"
  },
  {
    "name": "Congo (the Democratic Republic of the)",
    "flag": "🇨🇩"
  },
  {
    "name": "Central African Republic (the)",
    "flag": "🇨🇫"
  },
  {
    "name": "Congo (the)",
    "flag": "🇨🇬"
  },
  {
    "name": "Switzerland",
    "flag": "🇨🇭"
  },
  {
    "name": "Côte d'Ivoire",
    "flag": "🇨🇮"
  },
  {
    "name": "Cook Islands (the)",
    "flag": "🇨🇰"
  },
  {
    "name": "Chile",
    "flag": "🇨🇱"
  },
  {
    "name": "Cameroon",
    "flag": "🇨🇲"
  },
  {
    "name": "China",
    "flag": "🇨🇳"
  },
  {
    "name": "Colombia",
    "flag": "🇨🇴"
  },
  {
    "name": "Costa Rica",
    "flag": "🇨🇷"
  },
  {
    "name": "Cuba",
    "flag": "🇨🇺"
  },
  {
    "name": "Cabo Verde",
    "flag": "🇨🇻"
  },
  {
    "name": "Curaçao",
    "flag": "🇨🇼"
  },
  {
    "name": "Christmas Island",
    "flag": "🇨🇽"
  },
  {
    "name": "Cyprus",
    "flag": "🇨🇾"
  },
  {
    "name": "Czechia",
    "flag": "🇨🇿"
  },
  {
    "name": "Germany",
    "flag": "🇩🇪"
  },
  {
    "name": "Djibouti",
    "flag": "🇩🇯"
  },
  {
    "name": "Denmark",
    "flag": "🇩🇰"
  },
  {
    "name": "Dominica",
    "flag": "🇩🇲"
  },
  {
    "name": "Dominican Republic (the)",
    "flag": "🇩🇴"
  },
  {
    "name": "Algeria",
    "flag": "🇩🇿"
  },
  {
    "name": "Ecuador",
    "flag": "🇪🇨"
  },
  {
    "name": "Estonia",
    "flag": "🇪🇪"
  },
  {
    "name": "Egypt",
    "flag": "🇪🇬"
  },
  {
    "name": "Western Sahara*",
    "flag": "🇪🇭"
  },
  {
    "name": "Eritrea",
    "flag": "🇪🇷"
  },
  {
    "name": "Spain",
    "flag": "🇪🇸"
  },
  {
    "name": "Ethiopia",
    "flag": "🇪🇹"
  },
  {
    "name": "Finland",
    "flag": "🇫🇮"
  },
  {
    "name": "Fiji",
    "flag": "🇫🇯"
  },
  {
    "name": "Falkland Islands (the) [Malvinas]",
    "flag": "🇫🇰"
  },
  {
    "name": "Micronesia (Federated States of)",
    "flag": "🇫🇲"
  },
  {
    "name": "Faroe Islands (the)",
    "flag": "🇫🇴"
  },
  {
    "name": "France",
    "flag": "🇫🇷"
  },
  {
    "name": "Gabon",
    "flag": "🇬🇦"
  },
  {
    "name": "United Kingdom of Great Britain and Northern Ireland (the)",
    "flag": "🇬🇧"
  },
  {
    "name": "Grenada",
    "flag": "🇬🇩"
  },
  {
    "name": "Georgia",
    "flag": "🇬🇪"
  },
  {
    "name": "French Guiana",
    "flag": "🇬🇫"
  },
  {
    "name": "Guernsey",
    "flag": "🇬🇬"
  },
  {
    "name": "Ghana",
    "flag": "🇬🇭"
  },
  {
    "name": "Gibraltar",
    "flag": "🇬🇮"
  },
  {
    "name": "Greenland",
    "flag": "🇬🇱"
  },
  {
    "name": "Gambia (the)",
    "flag": "🇬🇲"
  },
  {
    "name": "Guinea",
    "flag": "🇬🇳"
  },
  {
    "name": "Guadeloupe",
    "flag": "🇬🇵"
  },
  {
    "name": "Equatorial Guinea",
    "flag": "🇬🇶"
  },
  {
    "name": "Greece",
    "flag": "🇬🇷"
  },
  {
    "name": "South Georgia and the South Sandwich Islands",
    "flag": "🇬🇸"
  },
  {
    "name": "Guatemala",
    "flag": "🇬🇹"
  },
  {
    "name": "Guam",
    "flag": "🇬🇺"
  },
  {
    "name": "Guinea-Bissau",
    "flag": "🇬🇼"
  },
  {
    "name": "Guyana",
    "flag": "🇬🇾"
  },
  {
    "name": "Hong Kong",
    "flag": "🇭🇰"
  },
  {
    "name": "Heard Island and McDonald Islands",
    "flag": "🇭🇲"
  },
  {
    "name": "Honduras",
    "flag": "🇭🇳"
  },
  {
    "name": "Croatia",
    "flag": "🇭🇷"
  },
  {
    "name": "Haiti",
    "flag": "🇭🇹"
  },
  {
    "name": "Hungary",
    "flag": "🇭🇺"
  },
  {
    "name": "Indonesia",
    "flag": "🇮🇩"
  },
  {
    "name": "Ireland",
    "flag": "🇮🇪"
  },
  {
    "name": "Israel",
    "flag": "🇮🇱"
  },
  {
    "name": "Isle of Man",
    "flag": "🇮🇲"
  },
  {
    "name": "India",
    "flag": "🇮🇳"
  },
  {
    "name": "British Indian Ocean Territory (the)",
    "flag": "🇮🇴"
  },
  {
    "name": "Iraq",
    "flag": "🇮🇶"
  },
  {
    "name": "Iran (Islamic Republic of)",
    "flag": "🇮🇷"
  },
  {
    "name": "Iceland",
    "flag": "🇮🇸"
  },
  {
    "name": "Italy",
    "flag": "🇮🇹"
  },
  {
    "name": "Jersey",
    "flag": "🇯🇪"
  },
  {
    "name": "Jamaica",
    "flag": "🇯🇲"
  },
  {
    "name": "Jordan",
    "flag": "🇯🇴"
  },
  {
    "name": "Japan",
    "flag": "🇯🇵"
  },
  {
    "name": "Kenya",
    "flag": "🇰🇪"
  },
  {
    "name": "Kyrgyzstan",
    "flag": "🇰🇬"
  },
  {
    "name": "Cambodia",
    "flag": "🇰🇭"
  },
  {
    "name": "Kiribati",
    "flag": "🇰🇮"
  },
  {
    "name": "Comoros (the)",
    "flag": "🇰🇲"
  },
  {
    "name": "Saint Kitts and Nevis",
    "flag": "🇰🇳"
  },
  {
    "name": "Korea (the Democratic People's Republic of)",
    "flag": "🇰🇵"
  },
  {
    "name": "Korea (the Republic of)",
    "flag": "🇰🇷"
  },
  {
    "name": "Kuwait",
    "flag": "🇰🇼"
  },
  {
    "name": "Cayman Islands (the)",
    "flag": "🇰🇾"
  },
  {
    "name": "Kazakhstan",
    "flag": "🇰🇿"
  },
  {
    "name": "Lao People's Democratic Republic (the)",
    "flag": "🇱🇦"
  },
  {
    "name": "Lebanon",
    "flag": "🇱🇧"
  },
  {
    "name": "Saint Lucia",
    "flag": "🇱🇨"
  },
  {
    "name": "Liechtenstein",
    "flag": "🇱🇮"
  },
  {
    "name": "Sri Lanka",
    "flag": "🇱🇰"
  },
  {
    "name": "Liberia",
    "flag": "🇱🇷"
  },
  {
    "name": "Lesotho",
    "flag": "🇱🇸"
  },
  {
    "name": "Lithuania",
    "flag": "🇱🇹"
  },
  {
    "name": "Luxembourg",
    "flag": "🇱🇺"
  },
  {
    "name": "Latvia",
    "flag": "🇱🇻"
  },
  {
    "name": "Libya",
    "flag": "🇱🇾"
  },
  {
    "name": "Morocco",
    "flag": "🇲🇦"
  },
  {
    "name": "Monaco",
    "flag": "🇲🇨"
  },
  {
    "name": "Moldova (the Republic of)",
    "flag": "🇲🇩"
  },
  {
    "name": "Montenegro",
    "flag": "🇲🇪"
  },
  {
    "name": "Saint Martin (French part)",
    "flag": "🇲🇫"
  },
  {
    "name": "Madagascar",
    "flag": "🇲🇬"
  },
  {
    "name": "Marshall Islands (the)",
    "flag": "🇲🇭"
  },
  {
    "name": "North Macedonia",
    "flag": "🇲🇰"
  },
  {
    "name": "Mali",
    "flag": "🇲🇱"
  },
  {
    "name": "Myanmar",
    "flag": "🇲🇲"
  },
  {
    "name": "Mongolia",
    "flag": "🇲🇳"
  },
  {
    "name": "Macao",
    "flag": "🇲🇴"
  },
  {
    "name": "Northern Mariana Islands (the)",
    "flag": "🇲🇵"
  },
  {
    "name": "Martinique",
    "flag": "🇲🇶"
  },
  {
    "name": "Mauritania",
    "flag": "🇲🇷"
  },
  {
    "name": "Montserrat",
    "flag": "🇲🇸"
  },
  {
    "name": "Malta",
    "flag": "🇲🇹"
  },
  {
    "name": "Mauritius",
    "flag": "🇲🇺"
  },
  {
    "name": "Maldives",
    "flag": "🇲🇻"
  },
  {
    "name": "Malawi",
    "flag": "🇲🇼"
  },
  {
    "name": "Mexico",
    "flag": "🇲🇽"
  },
  {
    "name": "Malaysia",
    "flag": "🇲🇾"
  },
  {
    "name": "Mozambique",
    "flag": "🇲🇿"
  },
  {
    "name": "Namibia",
    "flag": "🇳🇦"
  },
  {
    "name": "New Caledonia",
    "flag": "🇳🇨"
  },
  {
    "name": "Niger (the)",
    "flag": "🇳🇪"
  },
  {
    "name": "Norfolk Island",
    "flag": "🇳🇫"
  },
  {
    "name": "Nigeria",
    "flag": "🇳🇬"
  },
  {
    "name": "Nicaragua",
    "flag": "🇳🇮"
  },
  {
    "name": "Netherlands (Kingdom of the)",
    "flag": "🇳🇱"
  },
  {
    "name": "Norway",
    "flag": "🇳🇴"
  },
  {
    "name": "Nepal",
    "flag": "🇳🇵"
  },
  {
    "name": "Nauru",
    "flag": "🇳🇷"
  },
  {
    "name": "Niue",
    "flag": "🇳🇺"
  },
  {
    "name": "New Zealand",
    "flag": "🇳🇿"
  },
  {
    "name": "Oman",
    "flag": "🇴🇲"
  },
  {
    "name": "Panama",
    "flag": "🇵🇦"
  },
  {
    "name": "Peru",
    "flag": "🇵🇪"
  },
  {
    "name": "French Polynesia",
    "flag": "🇵🇫"
  },
  {
    "name": "Papua New Guinea",
    "flag": "🇵🇬"
  },
  {
    "name": "Philippines (the)",
    "flag": "🇵🇭"
  },
  {
    "name": "Pakistan",
    "flag": "🇵🇰"
  },
  {
    "name": "Poland",
    "flag": "🇵🇱"
  },
  {
    "name": "Saint Pierre and Miquelon",
    "flag": "🇵🇲"
  },
  {
    "name": "Pitcairn",
    "flag": "🇵🇳"
  },
  {
    "name": "Puerto Rico",
    "flag": "🇵🇷"
  },
  {
    "name": "Palestine, State of",
    "flag": "🇵🇸"
  },
  {
    "name": "Portugal",
    "flag": "🇵🇹"
  },
  {
    "name": "Palau",
    "flag": "🇵🇼"
  },
  {
    "name": "Paraguay",
    "flag": "🇵🇾"
  },
  {
    "name": "Qatar",
    "flag": "🇶🇦"
  },
  {
    "name": "Réunion",
    "flag": "🇷🇪"
  },
  {
    "name": "Romania",
    "flag": "🇷🇴"
  },
  {
    "name": "Serbia",
    "flag": "🇷🇸"
  },
  {
    "name": "Russian Federation (the)",
    "flag": "🇷🇺"
  },
  {
    "name": "Rwanda",
    "flag": "🇷🇼"
  },
  {
    "name": "Saudi Arabia",
    "flag": "🇸🇦"
  },
  {
    "name": "Solomon Islands",
    "flag": "🇸🇧"
  },
  {
    "name": "Seychelles",
    "flag": "🇸🇨"
  },
  {
    "name": "Sudan (the)",
    "flag": "🇸🇩"
  },
  {
    "name": "Sweden",
    "flag": "🇸🇪"
  },
  {
    "name": "Singapore",
    "flag": "🇸🇬"
  },
  {
    "name": "Saint Helena, Ascension and Tristan da Cunha",
    "flag": "🇸🇭"
  },
  {
    "name": "Slovenia",
    "flag": "🇸🇮"
  },
  {
    "name": "Svalbard and Jan Mayen",
    "flag": "🇸🇯"
  },
  {
    "name": "Slovakia",
    "flag": "🇸🇰"
  },
  {
    "name": "Sierra Leone",
    "flag": "🇸🇱"
  },
  {
    "name": "San Marino",
    "flag": "🇸🇲"
  },
  {
    "name": "Senegal",
    "flag": "🇸🇳"
  },
  {
    "name": "Somalia",
    "flag": "🇸🇴"
  },
  {
    "name": "Suriname",
    "flag": "🇸🇷"
  },
  {
    "name": "South Sudan",
    "flag": "🇸🇸"
  },
  {
    "name": "Sao Tome and Principe",
    "flag": "🇸🇹"
  },
  {
    "name": "El Salvador",
    "flag": "🇸🇻"
  },
  {
    "name": "Sint Maarten (Dutch part)",
    "flag": "🇸🇽"
  },
  {
    "name": "Syrian Arab Republic (the)",
    "flag": "🇸🇾"
  },
  {
    "name": "Eswatini",
    "flag": "🇸🇿"
  },
  {
    "name": "Turks and Caicos Islands (the)",
    "flag": "🇹🇨"
  },
  {
    "name": "Chad",
    "flag": "🇹🇩"
  },
  {
    "name": "French Southern Territories (the)",
    "flag": "🇹🇫"
  },
  {
    "name": "Togo",
    "flag": "🇹🇬"
  },
  {
    "name": "Thailand",
    "flag": "🇹🇭"
  },
  {
    "name": "Tajikistan",
    "flag": "🇹🇯"
  },
  {
    "name": "Tokelau",
    "flag": "🇹🇰"
  },
  {
    "name": "Timor-Leste",
    "flag": "🇹🇱"
  },
  {
    "name": "Turkmenistan",
    "flag": "🇹🇲"
  },
  {
    "name": "Tunisia",
    "flag": "🇹🇳"
  },
  {
    "name": "Tonga",
    "flag": "🇹🇴"
  },
  {
    "name": "Türkiye",
    "flag": "🇹🇷"
  },
  {
    "name": "Trinidad and Tobago",
    "flag": "🇹🇹"
  },
  {
    "name": "Tuvalu",
    "flag": "🇹🇻"
  },
  {
    "name": "Taiwan (Province of China)",
    "flag": "🇹🇼"
  },
  {
    "name": "Tanzania, the United Republic of",
    "flag": "🇹🇿"
  },
  {
    "name": "Ukraine",
    "flag": "🇺🇦"
  },
  {
    "name": "Uganda",
    "flag": "🇺🇬"
  },
  {
    "name": "United States Minor Outlying Islands (the)",
    "flag": "🇺🇲"
  },
  {
    "name": "United States of America (the)",
    "flag": "🇺🇸"
  },
  {
    "name": "Uruguay",
    "flag": "🇺🇾"
  },
  {
    "name": "Uzbekistan",
    "flag": "🇺🇿"
  },
  {
    "name": "Holy See (the)",
    "flag": "🇻🇦"
  },
  {
    "name": "Saint Vincent and the Grenadines",
    "flag": "🇻🇨"
  },
  {
    "name": "Venezuela (Bolivarian Republic of)",
    "flag": "🇻🇪"
  },
  {
    "name": "Virgin Islands (British)",
    "flag": "🇻🇬"
  },
  {
    "name": "Virgin Islands (U.S.)",
    "flag": "🇻🇮"
  },
  {
    "name": "Viet Nam",
    "flag": "🇻🇳"
  },
  {
    "name": "Vanuatu",
    "flag": "🇻🇺"
  },
  {
    "name": "Wallis and Futuna",
    "flag": "🇼🇫"
  },
  {
    "name": "Samoa",
    "flag": "🇼🇸"
  },
  {
    "name": "Yemen",
    "flag": "🇾🇪"
  },
  {
    "name": "Mayotte",
    "flag": "🇾🇹"
  },
  {
    "name": "South Africa",
    "flag": "🇿🇦"
  },
  {
    "name": "Zambia",
    "flag": "🇿🇲"
  },
  {
    "name": "Zimbabwe",
    "flag": "🇿🇼"
  }
];

const CountryAutocomplete = ({ value, onChange, placeholder, className, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(countries);
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef(null);

  // Sync state if value is passed dynamically from parent
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    
    // Create synthetic event for the parent's onChange
    onChange({ target: { name: 'nationality', value: newVal } });

    if (newVal) {
      const filtered = countries.filter(country => country.name.toLowerCase().includes(newVal.toLowerCase()));
      setFilteredOptions(filtered);
      setIsOpen(true);
      setActiveIndex(0);
    } else {
      setFilteredOptions(countries);
      setIsOpen(true);
    }
  };

  const handleSelect = (country) => {
    setInputValue(country.name);
    onChange({ target: { name: 'nationality', value: country.name } });
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev === 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const listContainer = dropdownRef.current.querySelector('ul');
      const activeItem = listContainer?.children[activeIndex];
      if (activeItem && listContainer) {
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const containerTop = listContainer.scrollTop;
        const containerBottom = containerTop + listContainer.offsetHeight;

        if (itemTop < containerTop) {
          listContainer.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          listContainer.scrollTop = itemBottom - listContainer.offsetHeight;
        }
      }
    }
  }, [activeIndex, isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        name="nationality"
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsOpen(true);
          const filtered = inputValue ? countries.filter(country => country.name.toLowerCase().includes(inputValue.toLowerCase())) : countries;
          setFilteredOptions(filtered);
          setActiveIndex(0);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none">
          {filteredOptions.map((country, index) => (
            <li
              key={country.name}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors duration-150 ${
                index === activeIndex ? 'bg-primary/10 text-primary font-bold' : 'text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSelect(country)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="mr-3 text-base">{country.flag}</span>
              {country.name}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
           <li className="text-gray-500 text-sm text-center">No countries found</li>
        </ul>
      )}
    </div>
  );
};

export default CountryAutocomplete;
