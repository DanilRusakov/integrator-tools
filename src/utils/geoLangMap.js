const GEO_LANG_MAP = {
    // Europe
    DE: 'DE', AT: 'DE', CH: 'DE',
    FR: 'FR', BE: 'FR', LU: 'FR', MC: 'FR',
    IT: 'IT', SM: 'IT', VA: 'IT',
    ES: 'ES', MX: 'ES', CO: 'ES', AR: 'ES', CL: 'ES', EC: 'ES', PE: 'ES', UY: 'ES', PY: 'ES', HN: 'ES', SV: 'ES', GT: 'ES', CR: 'ES', PA: 'ES', DO: 'ES', VE: 'ES', BO: 'ES', PR: 'ES',
    PT: 'PT', BR: 'PT', AO: 'PT', MZ: 'PT', GW: 'PT', ST: 'PT', TL: 'PT', CV: 'PT',
    NL: 'NL', BQ: 'NL', CW: 'NL', SX: 'NL', AW: 'NL',
    EN: 'EN', US: 'EN', GB: 'EN', IE: 'EN', AU: 'EN', NZ: 'EN', ZA: 'EN', IN: 'EN', PH: 'EN', SG: 'EN', MY: 'EN', CA: 'EN', AG: 'EN', BS: 'EN', BB: 'EN', BZ: 'EN', DM: 'EN', GD: 'EN', JM: 'EN', KN: 'EN', LC: 'EN', VC: 'EN', TT: 'EN', FJ: 'EN', PG: 'EN', SB: 'EN', TO: 'EN', VU: 'EN',
    RU: 'RU', UA: 'RU', BY: 'RU', KZ: 'RU', KG: 'RU', TJ: 'RU', TM: 'RU', MD: 'RU',
    PL: 'PL', CZ: 'CS', SK: 'SK', HU: 'HU', RO: 'RO', BG: 'BG', HR: 'HR', RS: 'SR', BA: 'SR', SI: 'SL', LT: 'LT', LV: 'LV', EE: 'ET', AL: 'SQ', MK: 'MK', ME: 'SR',
    TR: 'TR',
    GR: 'GR', CY: 'GR',
    IS: 'IS', FO: 'FO',
    DK: 'DA', SE: 'SV', FI: 'FI', NO: 'NO',
    // Asia
    CN: 'ZH', TW: 'ZH', HK: 'ZH', MO: 'ZH',
    JP: 'JA',
    KR: 'KO',
    TH: 'TH', VN: 'VI', ID: 'ID', MY: 'MS', SG: 'EN',
    KH: 'KM', LA: 'LO', MM: 'MY', BN: 'MS',
    SA: 'AR', AE: 'AR', QA: 'AR', KW: 'AR', OM: 'AR', JO: 'AR', LB: 'AR', SY: 'AR', IQ: 'AR', LY: 'AR', SD: 'AR', YE: 'AR', BH: 'AR', EG: 'AR', MA: 'AR', TN: 'AR', DZ: 'AR', PS: 'AR',
    IR: 'FA', AF: 'FA',
    PK: 'UR', BD: 'BN', LK: 'SI', NP: 'NE', MV: 'DV',
    // Africa
    NG: 'EN', GH: 'EN', KE: 'EN', UG: 'EN', TZ: 'EN', RW: 'EN', ZM: 'EN', ZW: 'EN', MW: 'EN', BW: 'EN', NA: 'EN', LS: 'EN', SZ: 'EN', GM: 'EN', SL: 'EN', LR: 'EN', CM: 'FR', CI: 'FR', SN: 'FR', ML: 'FR', BF: 'FR', NE: 'FR', TG: 'FR', BJ: 'FR', MG: 'FR', TD: 'FR', CG: 'FR', CD: 'FR', GA: 'FR', GN: 'FR', RW: 'FR', CF: 'FR', DJ: 'FR', MR: 'FR', GQ: 'ES', AO: 'PT', MZ: 'PT', ST: 'PT', CV: 'PT', GW: 'PT',
    ET: 'AM', SO: 'SO', SD: 'AR', EG: 'AR', MA: 'AR', TN: 'AR', DZ: 'AR', LY: 'AR',
    // North America
    US: 'EN', CA: 'EN', MX: 'ES', GT: 'ES', BZ: 'EN', SV: 'ES', HN: 'ES', NI: 'ES', CR: 'ES', PA: 'ES', CU: 'ES', DO: 'ES', HT: 'FR', JM: 'EN', TT: 'EN', BS: 'EN', BB: 'EN', AG: 'EN', DM: 'EN', GD: 'EN', KN: 'EN', LC: 'EN', VC: 'EN',
    // South America
    AR: 'ES', BO: 'ES', BR: 'PT', CL: 'ES', CO: 'ES', EC: 'ES', GY: 'EN', PY: 'ES', PE: 'ES', SR: 'NL', UY: 'ES', VE: 'ES',
    // Oceania
    AU: 'EN', NZ: 'EN', FJ: 'EN', PG: 'EN', SB: 'EN', TO: 'EN', VU: 'EN', WS: 'EN', KI: 'EN', TV: 'EN', NR: 'EN',
    // Others
    IL: 'HE', GE: 'KA', AM: 'HY', AZ: 'AZ', TM: 'TK', KG: 'KY', TJ: 'TG', MN: 'MN',
    // Add more as needed
};

export default GEO_LANG_MAP;