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
    'Afghanistan': 'AF',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'Angola': 'AO',
    'Antarctica': 'AQ',
    'Argentina': 'AR',
    'Armenia': 'AM',
    'Australia': 'AU',
    'Austria': 'AT',
    'Azerbaijan': 'AZ',
    'Bahamas': 'BS',
    'Bangladesh': 'BD',
    'Belarus': 'BY',
    'Belgium': 'BE',
    'Belize': 'BZ',
    'Benin': 'BJ',
    'Bhutan': 'BT',
    'Bolivia': 'BO',
    'Bosnia and Herz.': 'BA',
    'Botswana': 'BW',
    'Brazil': 'BR',
    'Brunei': 'BN',
    'Bulgaria': 'BG',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cambodia': 'KH',
    'Cameroon': 'CM',
    'Canada': 'CA',
    'Central African Rep.': 'CF',
    'Chad': 'TD',
    'Chile': 'CL',
    'China': 'CN',
    'Colombia': 'CO',
    'Congo': 'CG',
    'Costa Rica': 'CR',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Cyprus': 'CY',
    'Czechia': 'CZ',
    "Côte d'Ivoire": 'CI',
    'Dem. Rep. Congo': 'CD',
    'Denmark': 'DK',
    'Djibouti': 'DJ',
    'Dominican Rep.': 'DO',
    'Ecuador': 'EC',
    'Egypt': 'EG',
    'El Salvador': 'SV',
    'Eq. Guinea': 'GQ',
    'Eritrea': 'ER',
    'Estonia': 'EE',
    'Ethiopia': 'ET',
    'Falkland Is.': 'FK',
    'Fiji': 'FJ',
    'Finland': 'FI',
    'Fr. S. Antarctic Lands': 'TF',
    'France': 'FR',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Georgia': 'GE',
    'Germany': 'DE',
    'Ghana': 'GH',
    'Greece': 'GR',
    'Greenland': 'GL',
    'Guatemala': 'GT',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Guyana': 'GY',
    'Haiti': 'HT',
    'Honduras': 'HN',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Jamaica': 'JM',
    'Japan': 'JP',
    'Jordan': 'JO',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'Kuwait': 'KW',
    'Kyrgyzstan': 'KG',
    'Laos': 'LA',
    'Latvia': 'LV',
    'Lebanon': 'LB',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Lithuania': 'LT',
    'Luxembourg': 'LU',
    'Macedonia': 'MK',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Malaysia': 'MY',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Mexico': 'MX',
    'Moldova': 'MD',
    'Mongolia': 'MN',
    'Montenegro': 'ME',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Myanmar': 'MM',
    'Namibia': 'NA',
    'Nepal': 'NP',
    'Netherlands': 'NL',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    'Nicaragua': 'NI',
    'Niger': 'NE',
    'Nigeria': 'NG',
    'North Korea': 'KP',
    'Norway': 'NO',
    'Oman': 'OM',
    'Pakistan': 'PK',
    'Palestine': 'PS',
    'Panama': 'PA',
    'Papua New Guinea': 'PG',
    'Paraguay': 'PY',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Puerto Rico': 'PR',
    'Qatar': 'QA',
    'Romania': 'RO',
    'Russia': 'RU',
    'Rwanda': 'RW',
    'S. Sudan': 'SS',
    'Saudi Arabia': 'SA',
    'Senegal': 'SN',
    'Serbia': 'RS',
    'Sierra Leone': 'SL',
    'Slovakia': 'SK',
    'Slovenia': 'SI',
    'Solomon Is.': 'SB',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Korea': 'KR',
    'Spain': 'ES',
    'Sri Lanka': 'LK',
    'Sudan': 'SD',
    'Suriname': 'SR',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Syria': 'SY',
    'Taiwan': 'TW',
    'Tajikistan': 'TJ',
    'Tanzania': 'TZ',
    'Thailand': 'TH',
    'Timor-Leste': 'TL',
    'Togo': 'TG',
    'Trinidad and Tobago': 'TT',
    'Tunisia': 'TN',
    'Turkey': 'TR',
    'Turkmenistan': 'TM',
    'Uganda': 'UG',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States of America': 'US',
    'Uruguay': 'UY',
    'Uzbekistan': 'UZ',
    'Vanuatu': 'VU',
    'Venezuela': 'VE',
    'Vietnam': 'VN',
    'W. Sahara': 'EH',
    'Yemen': 'YE',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW',
    'eSwatini': 'SZ',
  };
  
  return countryCodeMap[countryName]; // || countryName.substring(0, 2).toUpperCase();
}