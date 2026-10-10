// Metro data for Ahmedabad + Gandhinagar metro (53 stations, 4 lines)
// Source of truth: reference/index.html

export const LINES = {
  blue: {
    name: 'Blue Line',
    color: 'var(--blue)',
    km: 21.23,
    st: [
      'Thaltej Gam', 'Thaltej', 'Doordarshan Kendra', 'Gurukul Road',
      'Gujarat University', 'Commerce Six Road', 'SP Stadium', 'Old High Court',
      'Shahpur', 'Gheekanta', 'Kalupur Railway Station', 'Kankaria East',
      'Apparel Park', 'Amraiwadi', 'Rabari Colony', 'Vastral',
      'Nirant Cross Road', 'Vastral Gam'
    ]
  },
  red: {
    name: 'Red Line',
    color: 'var(--red)',
    km: 18.87,
    st: [
      'Motera Stadium', 'Sabarmati', 'AEC', 'Ranip', 'Vadaj',
      'Vijay Nagar', 'Usmanpura', 'Old High Court', 'Gandhigram',
      'Paldi', 'Shreyas', 'Rajiv Nagar', 'Jivraj Park', 'APMC'
    ]
  },
  yellow: {
    name: 'Yellow Line',
    color: 'var(--yellow)',
    km: 23.84,
    st: [
      'Motera Stadium', 'Koteshwar Road', 'Vishwakarma College', 'Tapovan Circle',
      'Narmada Canal', 'Koba Circle', 'Juna Koba', 'Koba Gam', 'GNLU',
      'Raysan', 'Randesan', 'Dholakuva Circle', 'Infocity', 'Sector-1',
      'Sector-10A', 'Sachivalaya', 'Akshardham', 'Juna Sachivalaya',
      'Sector-16', 'Sector-24', 'Mahatma Mandir'
    ]
  },
  violet: {
    name: 'Violet Line',
    color: 'var(--violet)',
    km: 5.42,
    st: ['GNLU', 'PDEU', 'GIFT City']
  }
};

export const XY = {
  'Thaltej Gam': [70, 594], 'Thaltej': [120, 594], 'Doordarshan Kendra': [170, 594], 'Gurukul Road': [220, 594],
  'Gujarat University': [270, 594], 'Commerce Six Road': [320, 594], 'SP Stadium': [370, 594], 'Old High Court': [430, 594],
  'Shahpur': [540, 594], 'Gheekanta': [592, 594], 'Kalupur Railway Station': [644, 594], 'Kankaria East': [696, 594],
  'Apparel Park': [748, 594], 'Amraiwadi': [800, 594], 'Rabari Colony': [852, 594], 'Vastral': [904, 594],
  'Nirant Cross Road': [956, 594], 'Vastral Gam': [1008, 594],
  'Motera Stadium': [430, 440], 'Sabarmati': [430, 462], 'AEC': [430, 484], 'Ranip': [430, 506],
  'Vadaj': [430, 528], 'Vijay Nagar': [430, 550], 'Usmanpura': [430, 572], 'Gandhigram': [430, 616],
  'Paldi': [430, 638], 'Shreyas': [430, 660], 'Rajiv Nagar': [430, 682], 'Jivraj Park': [430, 704],
  'APMC': [430, 726],
  'Koteshwar Road': [430, 410], 'Vishwakarma College': [430, 380], 'Tapovan Circle': [430, 350],
  'Narmada Canal': [430, 320], 'Koba Circle': [430, 290], 'Juna Koba': [430, 260], 'Koba Gam': [430, 230],
  'GNLU': [430, 200], 'Raysan': [470, 170], 'Randesan': [510, 140], 'Dholakuva Circle': [550, 110],
  'Infocity': [588, 84], 'Sector-1': [640, 60], 'Sector-10A': [710, 60], 'Sachivalaya': [780, 60],
  'Akshardham': [850, 60], 'Juna Sachivalaya': [920, 60], 'Sector-16': [990, 60], 'Sector-24': [1060, 60],
  'Mahatma Mandir': [1130, 60], 'PDEU': [510, 250], 'GIFT City': [600, 290]
};

export const LBL = {};
const setL = (arr, val) => arr.forEach(n => { LBL[n] = val; });
setL(['Motera Stadium', 'Sabarmati', 'AEC', 'Ranip', 'Vadaj', 'Vijay Nagar', 'Usmanpura'], [-14, 4, 'end']);
setL(['Gandhigram', 'Paldi', 'Shreyas', 'Rajiv Nagar', 'Jivraj Park', 'APMC', 'GIFT City'], [14, 4, 'start']);
setL(['Koteshwar Road', 'Vishwakarma College', 'Tapovan Circle', 'Narmada Canal', 'Koba Circle', 'Juna Koba', 'Koba Gam', 'GNLU'], [-14, 4, 'end']);
setL(['Raysan', 'Randesan', 'Dholakuva Circle', 'Infocity', 'PDEU'], [10, 20, 'start']);
setL(['Sector-1', 'Sachivalaya', 'Juna Sachivalaya', 'Sector-24'], [0, -14, 'middle']);
setL(['Sector-10A', 'Akshardham', 'Sector-16'], [0, 24, 'middle']);
LBL['Mahatma Mandir'] = [0, 24, 'end'];
LBL['Old High Court'] = [16, -8, 'start'];
setL(['Thaltej Gam', 'Thaltej', 'Doordarshan Kendra', 'Gurukul Road', 'Gujarat University', 'Commerce Six Road', 'SP Stadium'], 'rotW');
setL(['Shahpur', 'Gheekanta', 'Kalupur Railway Station', 'Kankaria East', 'Apparel Park', 'Amraiwadi', 'Rabari Colony', 'Vastral', 'Nirant Cross Road', 'Vastral Gam'], 'rotE');

// Compute kpx (km per map pixel) for every line
for (const k in LINES) {
  let px = 0;
  const s = LINES[k].st;
  for (let i = 1; i < s.length; i++) {
    px += Math.hypot(XY[s[i]][0] - XY[s[i - 1]][0], XY[s[i]][1] - XY[s[i - 1]][1]);
  }
  LINES[k].kpx = LINES[k].km / px;
}

export const ALIAS = {
  motera: 'Motera Stadium',
  'narendra modi stadium': 'Motera Stadium',
  'sardar patel stadium': 'Motera Stadium',
  gift: 'GIFT City',
  mandir: 'Mahatma Mandir',
  'gandhinagar capital': 'Mahatma Mandir',
  gandhinagar: 'Sachivalaya',
  secretariat: 'Sachivalaya',
  kalupur: 'Kalupur Railway Station',
  'railway station': 'Kalupur Railway Station',
  'law university': 'GNLU',
  'ghee kanta': 'Gheekanta',
  vasna: 'APMC',
  'thaltej village': 'Thaltej Gam',
  'akshar dham': 'Akshardham',
  stadium: 'SP Stadium',
  sp: 'SP Stadium',
  'high court': 'Old High Court',
  'vastral gaam': 'Vastral Gam',
  'koba gaam': 'Koba Gam',
  'thaltej gaam': 'Thaltej Gam',
  'pandit deendayal': 'PDEU',
  'pandit deendayal energy university': 'PDEU',
  'gift city metro': 'GIFT City',
  'sector 1 gandhinagar': 'Sector-1'
};

export const UNDER = new Set(['Gheekanta', 'Kalupur Railway Station', 'Kankaria East', 'Shahpur']);

export const ALL = Object.keys(XY).sort((a, b) => a.localeCompare(b));
