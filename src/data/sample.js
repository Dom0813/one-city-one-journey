// Feeder sample data for BRTS and AMTS multimodal integration
// Source of truth: PS-08 One City, One Journey specifications

export const DEFAULT_DATA = {
  fares: {
    metro: [
      [2, 5],
      [5, 10],
      [12, 15],
      [22, 20],
      [9999, 25]
    ],
    brts: [
      [3, 5],
      [6, 10],
      [10, 15],
      [15, 20],
      [9999, 30]
    ],
    amts: [
      [3, 4],
      [6, 7],
      [10, 10],
      [15, 13],
      [9999, 15]
    ],
    discount: 0.10,
    kmPerStop: 0.9
  },
  places: {
    Chandkheda: {
      name: 'Chandkheda',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 7',
          st: 'Sabarmati',
          ride: 16,
          stops: 8,
          ws: 5,
          xfer: 4,
          head: 8
        },
        {
          mode: 'AMTS',
          route: 'AMTS 84',
          st: 'Sabarmati',
          ride: 22,
          stops: 11,
          ws: 6,
          xfer: 5,
          head: 12
        }
      ]
    },
    Gota: {
      name: 'Gota',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 9',
          st: 'Ranip',
          ride: 18,
          stops: 9,
          ws: 5,
          xfer: 4,
          head: 10
        },
        {
          mode: 'AMTS',
          route: 'AMTS 63',
          st: 'AEC',
          ride: 24,
          stops: 12,
          ws: 7,
          xfer: 5,
          head: 15
        }
      ]
    },
    Naroda: {
      name: 'Naroda',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 8D',
          st: 'Kalupur Railway Station',
          ride: 32,
          stops: 16,
          ws: 4,
          xfer: 5,
          head: 10
        },
        {
          mode: 'AMTS',
          route: 'AMTS 123',
          st: 'Gheekanta',
          ride: 38,
          stops: 18,
          ws: 6,
          xfer: 6,
          head: 15
        }
      ]
    },
    Maninagar: {
      name: 'Maninagar',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 1',
          st: 'Apparel Park',
          ride: 15,
          stops: 7,
          ws: 5,
          xfer: 4,
          head: 8
        },
        {
          mode: 'AMTS',
          route: 'AMTS 42',
          st: 'Kankaria East',
          ride: 12,
          stops: 6,
          ws: 6,
          xfer: 4,
          head: 10
        }
      ],
      walk: { st: 'Kankaria East', min: 20 }
    },
    Ghatlodia: {
      name: 'Ghatlodia',
      opts: [
        {
          mode: 'AMTS',
          route: 'AMTS 66',
          st: 'Gurukul Road',
          ride: 14,
          stops: 6,
          ws: 6,
          xfer: 4,
          head: 12
        },
        {
          mode: 'BRTS',
          route: 'BRTS 2',
          st: 'Doordarshan Kendra',
          ride: 18,
          stops: 8,
          ws: 7,
          xfer: 5,
          head: 10
        }
      ]
    },
    Memnagar: {
      name: 'Memnagar',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 3',
          st: 'Gujarat University',
          ride: 10,
          stops: 5,
          ws: 4,
          xfer: 3,
          head: 8
        }
      ],
      walk: { st: 'Gurukul Road', min: 14 }
    },
    Satellite: {
      name: 'Satellite',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 4',
          st: 'Old High Court',
          ride: 14,
          stops: 8,
          ws: 4,
          xfer: 4,
          head: 8
        },
        {
          mode: 'AMTS',
          route: 'AMTS 136',
          st: 'Old High Court',
          ride: 20,
          stops: 10,
          ws: 5,
          xfer: 5,
          head: 12
        }
      ]
    },
    Bopal: {
      name: 'Bopal',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 5',
          st: 'Thaltej',
          ride: 22,
          stops: 10,
          ws: 6,
          xfer: 5,
          head: 10
        },
        {
          mode: 'AMTS',
          route: 'AMTS 49',
          st: 'Thaltej Gam',
          ride: 28,
          stops: 13,
          ws: 8,
          xfer: 6,
          head: 15
        }
      ]
    },
    Vasna: {
      name: 'Vasna',
      opts: [
        {
          mode: 'AMTS',
          route: 'AMTS 34',
          st: 'APMC',
          ride: 8,
          stops: 4,
          ws: 4,
          xfer: 3,
          head: 10
        },
        {
          mode: 'BRTS',
          route: 'BRTS 12',
          st: 'Paldi',
          ride: 12,
          stops: 6,
          ws: 5,
          xfer: 4,
          head: 8
        }
      ],
      walk: { st: 'APMC', min: 12 }
    },
    Sarkhej: {
      name: 'Sarkhej',
      opts: [
        {
          mode: 'BRTS',
          route: 'BRTS 10',
          st: 'APMC',
          ride: 16,
          stops: 8,
          ws: 6,
          xfer: 4,
          head: 10
        },
        {
          mode: 'AMTS',
          route: 'AMTS 202',
          st: 'Jivraj Park',
          ride: 20,
          stops: 9,
          ws: 7,
          xfer: 5,
          head: 14
        }
      ]
    }
  }
};
