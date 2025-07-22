import { feature } from 'topojson-client';
import countriesData from './countries-110m.json';

// Convert TopoJSON to GeoJSON and extract country paths
const geoData = feature(countriesData as any, countriesData.objects.countries as any);

// Create country ID to name mapping from the TopoJSON data
export const COUNTRY_ID_MAP: Record<string, string> = {};

// Convert coordinates to SVG path
function coordinatesToPath(
  coordinates: number[][][], 
  width = 900, 
  height = 500
): string {
  const halfWidth = width / 2;
  const paths: string[] = [];

  // loop each ring in the polygon/multipolygon
  for (const ring of coordinates) {
    let d = '';
    let prevX: number | null = null;

    ring.forEach(([lon, lat], i) => {
      // equirectangular scale:
      const scaledX = (lon + 180) * (width / 360);
      const scaledY = (90 - lat) * (height / 180);

      // if it’s the first point, or the jump is huge (> half width),
      // start a new subpath rather than draw a line across the map
      if (i === 0 || (prevX !== null && Math.abs(scaledX - prevX) > halfWidth)) {
        if (i !== 0) d += ' Z';        // close the previous subpath
        d += ` M ${scaledX} ${scaledY}`; // move to the new start
      } else {
        d += ` L ${scaledX} ${scaledY}`;
      }

      prevX = scaledX;
    });

    d += ' Z';           // close this ring
    paths.push(d.trim());
  }

  // join all rings/subpaths into one big path string
  return paths.join(' ');
}


// Extract country paths from the TopoJSON data
export const COUNTRY_PATHS: Record<string, string> = {};

geoData.features.forEach((feature: any) => {
  const countryId = feature.properties.name;
  const countryCode = getCountryCode(countryId);
  
  if (feature.geometry.type === 'Polygon') {
    COUNTRY_PATHS[countryCode] = coordinatesToPath([feature.geometry.coordinates[0]]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    // For multipolygon countries, combine all polygons
    const paths = feature.geometry.coordinates.map((polygon: number[][][]) => 
      coordinatesToPath([polygon[0]])
    );
    COUNTRY_PATHS[countryCode] = paths.join(' ');
  }
  
  COUNTRY_ID_MAP[countryCode] = countryId;
});

// Helper function to convert country names to ISO codes
function getCountryCode(countryName: string): string {
  const countryCodeMap: Record<string, string> = {
    'United States of America': 'US',
    'Canada': 'CA',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'United Kingdom': 'GB',
    'France': 'FR',
    'Germany': 'DE',
    'Italy': 'IT',
    'Spain': 'ES',
    'Russia': 'RU',
    'China': 'CN',
    'India': 'IN',
    'Japan': 'JP',
    'Australia': 'AU',
    'Egypt': 'EG',
    'South Africa': 'ZA',
    'Nigeria': 'NG',
    'Turkey': 'TR',
    'Iran': 'IR',
    'Saudi Arabia': 'SA',
    'Poland': 'PL',
    'Ukraine': 'UA',
    'Kazakhstan': 'KZ',
    'Algeria': 'DZ',
    'Sudan': 'SD',
    'Libya': 'LY',
    'Chad': 'TD',
    'Niger': 'NE',
    'Angola': 'AO',
    'Mali': 'ML',
    'South Sudan': 'SS',
    'Colombia': 'CO',
    'Ethiopia': 'ET',
    'Bolivia': 'BO',
    'Mauritania': 'MR',
    'Tanzania': 'TZ',
    'Venezuela': 'VE',
    'Chile': 'CL',
    'Zambia': 'ZM',
    'Afghanistan': 'AF',
    'Somalia': 'SO',
    'Central African Rep.': 'CF',
    'Madagascar': 'MG',
    'Botswana': 'BW',
    'Kenya': 'KE',
    'Yemen': 'YE',
    'Thailand': 'TH',
    'Turkmenistan': 'TM',
    'Cameroon': 'CM',
    'Papua New Guinea': 'PG',
    'Sweden': 'SE',
    'Uzbekistan': 'UZ',
    'Iraq': 'IQ',
    'Paraguay': 'PY',
    'Zimbabwe': 'ZW',
    'Norway': 'NO',
    'Republic of the Congo': 'CG',
    'Finland': 'FI',
    'Vietnam': 'VN',
    'Malaysia': 'MY',
    'Côte d\'Ivoire': 'CI',
    'Oman': 'OM',
    'Philippines': 'PH',
    'Ecuador': 'EC',
    'Burkina Faso': 'BF',
    'New Zealand': 'NZ',
    'Gabon': 'GA',
    'Guinea': 'GN',
    'Ghana': 'GH',
    'Romania': 'RO',
    'Laos': 'LA',
    'Uruguay': 'UY',
    'Bangladesh': 'BD',
    'Nepal': 'NP',
    'Tajikistan': 'TJ',
    'Greece': 'GR',
    'Nicaragua': 'NI',
    'North Korea': 'KP',
    'Malawi': 'MW',
    'Eritrea': 'ER',
    'Benin': 'BJ',
    'Honduras': 'HN',
    'Liberia': 'LR',
    'Bulgaria': 'BG',
    'Cuba': 'CU',
    'Guatemala': 'GT',
    'Iceland': 'IS',
    'South Korea': 'KR',
    'Hungary': 'HU',
    'Jordan': 'JO',
    'Portugal': 'PT',
    'Serbia': 'RS',
    'Azerbaijan': 'AZ',
    'Austria': 'AT',
    'United Arab Emirates': 'AE',
    'Czech Republic': 'CZ',
    'Czechia': 'CZ',
    'Panama': 'PA',
    'Sierra Leone': 'SL',
    'Ireland': 'IE',
    'Georgia': 'GE',
    'Sri Lanka': 'LK',
    'Lithuania': 'LT',
    'Latvia': 'LV',
    'Togo': 'TG',
    'Croatia': 'HR',
    'Bosnia and Herzegovina': 'BA',
    'Bosnia and Herz.': 'BA',
    'Costa Rica': 'CR',
    'Slovakia': 'SK',
    'Dominican Republic': 'DO',
    'Dominican Rep.': 'DO',
    'Estonia': 'EE',
    'Denmark': 'DK',
    'Netherlands': 'NL',
    'Switzerland': 'CH',
    'Guinea-Bissau': 'GW',
    'Taiwan': 'TW',
    'Moldova': 'MD',
    'Belgium': 'BE',
    'Lesotho': 'LS',
    'Armenia': 'AM',
    'Albania': 'AL',
    'Solomon Islands': 'SB',
    'Solomon Is.': 'SB',
    'Equatorial Guinea': 'GQ',
    'Eq. Guinea': 'GQ',
    'Burundi': 'BI',
    'Rwanda': 'RW',
    'Haiti': 'HT',
    'Belize': 'BZ',
    'Israel': 'IL',
    'Palestine': 'PS',
    'El Salvador': 'SV',
    'Djibouti': 'DJ',
    'Slovenia': 'SI',
    'Fiji': 'FJ',
    'Kuwait': 'KW',
    'East Timor': 'TL',
    'Timor-Leste': 'TL',
    'Bahamas': 'BS',
    'Montenegro': 'ME',
    'Vanuatu': 'VU',
    'Qatar': 'QA',
    'Gambia': 'GM',
    'Jamaica': 'JM',
    'Lebanon': 'LB',
    'Cyprus': 'CY',
    'Brunei': 'BN',
    'Trinidad and Tobago': 'TT',
    'Cape Verde': 'CV',
    'Samoa': 'WS',
    'Luxembourg': 'LU',
    'Comoros': 'KM',
    'Mauritius': 'MU',
    'eSwatini': 'SZ',
    'Swaziland': 'SZ',
    'Antigua and Barbuda': 'AG',
    'Seychelles': 'SC',
    'Palau': 'PW',
    'Andorra': 'AD',
    'Grenada': 'GD',
    'Malta': 'MT',
    'Maldives': 'MV',
    'Saint Kitts and Nevis': 'KN',
    'Marshall Islands': 'MH',
    'Liechtenstein': 'LI',
    'Saint Vincent and the Grenadines': 'VC',
    'Barbados': 'BB',
    'Tuvalu': 'TV',
    'Saint Lucia': 'LC',
    'Nauru': 'NR',
    'Monaco': 'MC',
    'San Marino': 'SM',
    'Vatican City': 'VA'
  };
  
  return countryCodeMap[countryName]; // || countryName.substring(0, 2).toUpperCase();
}