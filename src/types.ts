export type SADC_CountryCode =
  | 'AGO' | 'BWA' | 'COM' | 'COD' | 'SWZ' | 'LSO' | 'MDG' | 'MWI'
  | 'MUS' | 'MOZ' | 'NAM' | 'SYC' | 'ZAF' | 'TZA' | 'ZMB' | 'ZWE';

export interface SADCCountry {
  code: SADC_CountryCode;
  name: string;
  flag: string;
  capital: string;
  totalFound: number;
  totalClaimed: number;
  activeStations: number;
}

export type DocumentType =
  | 'National Identity Card'
  | 'Passport'
  | 'Driver\'s Licence'
  | 'Student ID Card'
  | 'Bank Card'
  | 'Other Secure Document';

export type DocumentStatus = 'Unclaimed' | 'Claim Pending' | 'Verified/Ready' | 'Collected';

export interface FoundDocument {
  id: string;
  documentType: DocumentType;
  documentNumber: string; // Stored securely, we will mask this dynamically
  holderName: string;
  countryCode: SADC_CountryCode;
  stationId: string;
  dateFound: string;
  remarks: string;
  status: DocumentStatus;
}

export type ClaimStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Collected';

export interface IDClaim {
  id: string;
  trackingCode: string; // e.g. SADC-SWZ-4819-A
  documentId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  proofNotes: string;
  proofDocumentType: string;
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  countryCode: SADC_CountryCode;
  contactPhone: string;
  address: string;
  workingHours: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userRole: 'Citizen' | 'Police' | 'Administrator';
  details: string;
  countryCode: SADC_CountryCode;
}

// Static SADC Country Registry
export const SADC_COUNTRIES: SADCCountry[] = [
  { code: 'SWZ', name: 'Eswatini', flag: '🇸🇿', capital: 'Mbabane', totalFound: 142, totalClaimed: 98, activeStations: 14 },
  { code: 'ZAF', name: 'South Africa', flag: '🇿🇦', capital: 'Pretoria', totalFound: 843, totalClaimed: 512, activeStations: 48 },
  { code: 'BWA', name: 'Botswana', flag: '🇧🇼', capital: 'Gaborone', totalFound: 112, totalClaimed: 74, activeStations: 11 },
  { code: 'ZWE', name: 'Zimbabwe', flag: '🇿🇼', capital: 'Harare', totalFound: 215, totalClaimed: 139, activeStations: 22 },
  { code: 'NAM', name: 'Namibia', flag: '🇳🇦', capital: 'Windhoek', totalFound: 98, totalClaimed: 62, activeStations: 12 },
  { code: 'LSO', name: 'Lesotho', flag: '🇱🇸', capital: 'Maseru', totalFound: 87, totalClaimed: 49, activeStations: 8 },
  { code: 'MOZ', name: 'Mozambique', flag: '🇲🇿', capital: 'Maputo', totalFound: 194, totalClaimed: 110, activeStations: 19 },
  { code: 'MWI', name: 'Malawi', flag: '🇲🇼', capital: 'Lilongwe', totalFound: 132, totalClaimed: 84, activeStations: 15 },
  { code: 'ZMB', name: 'Zambia', flag: '🇿🇲', capital: 'Lusaka', totalFound: 178, totalClaimed: 115, activeStations: 18 },
  { code: 'TZA', name: 'Tanzania', flag: '🇹🇿', capital: 'Dodoma', totalFound: 289, totalClaimed: 172, activeStations: 27 },
  { code: 'AGO', name: 'Angola', flag: '🇦🇴', capital: 'Luanda', totalFound: 156, totalClaimed: 89, activeStations: 16 },
  { code: 'COD', name: 'DR Congo', flag: '🇨🇩', capital: 'Kinshasa', totalFound: 310, totalClaimed: 145, activeStations: 32 },
  { code: 'MDG', name: 'Madagascar', flag: '🇲🇬', capital: 'Antananarivo', totalFound: 104, totalClaimed: 58, activeStations: 13 },
  { code: 'MUS', name: 'Mauritius', flag: '🇲🇺', capital: 'Port Louis', totalFound: 64, totalClaimed: 48, activeStations: 6 },
  { code: 'COM', name: 'Comoros', flag: '🇰🇲', capital: 'Moroni', totalFound: 41, totalClaimed: 22, activeStations: 4 },
  { code: 'SYC', name: 'Seychelles', flag: '🇸🇨', capital: 'Victoria', totalFound: 29, totalClaimed: 21, activeStations: 3 },
];

export const INITIAL_POLICE_STATIONS: PoliceStation[] = [
  // Eswatini
  { id: 'SWZ-STN-1', name: 'Mbabane Police Outpost', countryCode: 'SWZ', contactPhone: '+268 2404 2221', address: 'Mhlambanyatsi Road, Mbabane', workingHours: '24/7' },
  { id: 'SWZ-STN-2', name: 'Manzini Central Police Station', countryCode: 'SWZ', contactPhone: '+268 2505 2221', address: 'Sandlane Street, Manzini', workingHours: '24/7' },
  { id: 'SWZ-STN-3', name: 'Nhlangano District Station', countryCode: 'SWZ', contactPhone: '+268 2207 8221', address: 'Vuvulane Road, Nhlangano', workingHours: '07:00 - 18:00' },
  { id: 'SWZ-STN-4', name: 'Piggs Peak Border Post Station', countryCode: 'SWZ', contactPhone: '+268 2437 1221', address: 'Evelyn Baring Road, Piggs Peak', workingHours: '24/7' },
  
  // South Africa
  { id: 'ZAF-STN-1', name: 'Pretoria Central Police Station', countryCode: 'ZAF', contactPhone: '+27 12 353 4111', address: 'Bosman St, Pretoria Central', workingHours: '24/7' },
  { id: 'ZAF-STN-2', name: 'Johannesburg Central SAPS', countryCode: 'ZAF', contactPhone: '+27 11 497 7000', address: '1 Commissioner St, Johannesburg', workingHours: '24/7' },
  { id: 'ZAF-STN-3', name: 'Cape Town Central SAPS', countryCode: 'ZAF', contactPhone: '+27 21 467 8000', address: 'Buitenkant St, Cape Town', workingHours: '24/7' },
  
  // Botswana
  { id: 'BWA-STN-1', name: 'Gaborone Central Police Station', countryCode: 'BWA', contactPhone: '+267 355 1100', address: 'State House Drive, Gaborone', workingHours: '24/7' },
  { id: 'BWA-STN-2', name: 'Francistown Police Headquarters', countryCode: 'BWA', contactPhone: '+267 241 2211', address: 'Haskins St, Francistown', workingHours: '24/7' },

  // Zimbabwe
  { id: 'ZWE-STN-1', name: 'Harare Central Police Station', countryCode: 'ZWE', contactPhone: '+263 24 274 8836', address: 'Innez Terrace & Kenneth Kaunda Ave, Harare', workingHours: '24/7' },
  { id: 'ZWE-STN-2', name: 'Bulawayo Central ZRP', countryCode: 'ZWE', contactPhone: '+263 9 72515', address: 'Fife St & 10th Ave, Bulawayo', workingHours: '24/7' },

  // General SADC template fallbacks
  { id: 'LSO-STN-1', name: 'Maseru Central Station', countryCode: 'LSO', contactPhone: '+266 2231 2211', address: 'Kingsway Rd, Maseru', workingHours: '24/7' },
  { id: 'MOZ-STN-1', name: 'Esquadra Maputo Central', countryCode: 'MOZ', contactPhone: '+258 21 32 2011', address: 'Av. 25 de Setembro, Maputo', workingHours: '24/7' },
  { id: 'NAM-STN-1', name: 'Windhoek Central Police Station', countryCode: 'NAM', contactPhone: '+264 61 209 3111', address: 'Bahnhof St, Windhoek', workingHours: '24/7' },
  { id: 'ZMB-STN-1', name: 'Lusaka Central Police Station', countryCode: 'ZMB', contactPhone: '+260 211 228900', address: 'Church Rd, Lusaka', workingHours: '24/7' },
];

export const INITIAL_DOCUMENTS: FoundDocument[] = [
  // Eswatini (Inspiration country)
  {
    id: 'SWZ-DOC-101',
    documentType: 'National Identity Card',
    documentNumber: '8907125210086',
    holderName: 'Sibusiso Thabiso Dlamini',
    countryCode: 'SWZ',
    stationId: 'SWZ-STN-1',
    dateFound: '2026-05-10',
    remarks: 'Found near Mbabane Corporate Place shopping mall stairwell.',
    status: 'Unclaimed',
  },
  {
    id: 'SWZ-DOC-102',
    documentType: 'Passport',
    documentNumber: 'PP-SZ1104882',
    holderName: 'Nokuthula Khanyisile Zwane',
    countryCode: 'SWZ',
    stationId: 'SWZ-STN-2',
    dateFound: '2026-05-14',
    remarks: 'Dropped in taxi from Manzini to Lozitha. Returned by taxi driver.',
    status: 'Claim Pending',
  },
  {
    id: 'SWZ-DOC-103',
    documentType: 'Driver\'s Licence',
    documentNumber: 'DL-SZ5591024',
    holderName: 'Mancoba Gamedze',
    countryCode: 'SWZ',
    stationId: 'SWZ-STN-1',
    dateFound: '2026-05-18',
    remarks: 'Found inside Mbabane Central ATM room.',
    status: 'Unclaimed',
  },
  {
    id: 'SWZ-DOC-104',
    documentType: 'Student ID Card',
    documentNumber: 'UNESWA-202410887',
    holderName: 'Fezile Shongwe',
    countryCode: 'SWZ',
    stationId: 'SWZ-STN-2',
    dateFound: '2026-05-19',
    remarks: 'Found on UNESWA Kwaluseni Campus shuttle bus route.',
    status: 'Verified/Ready',
  },

  // South Africa
  {
    id: 'ZAF-DOC-201',
    documentType: 'National Identity Card',
    documentNumber: '9204125028082',
    holderName: 'Sipho Emmanuel Khumalo',
    countryCode: 'ZAF',
    stationId: 'ZAF-STN-1',
    dateFound: '2026-05-11',
    remarks: 'Found near Hatfield Gautrain Station ticketing turnstiles.',
    status: 'Unclaimed',
  },
  {
    id: 'ZAF-DOC-202',
    documentType: 'Passport',
    documentNumber: 'A08914432',
    holderName: 'Sarah Elizabeth van der Merwe',
    countryCode: 'ZAF',
    stationId: 'ZAF-STN-3',
    dateFound: '2026-05-15',
    remarks: 'Found at Cape Town International Airport, Terminal 1 baggage carousel.',
    status: 'Unclaimed',
  },
  {
    id: 'ZAF-DOC-203',
    documentType: 'Bank Card',
    documentNumber: '4000123456789012',
    holderName: 'Lungile Ndlovu',
    countryCode: 'ZAF',
    stationId: 'ZAF-STN-2',
    dateFound: '2026-05-20',
    remarks: 'Found at Carlswald Shopping Center parking lot.',
    status: 'Verified/Ready',
  },

  // Botswana
  {
    id: 'BWA-DOC-301',
    documentType: 'National Identity Card',
    documentNumber: '990812-7744-10',
    holderName: 'Thabo Lesedi Kenosi',
    countryCode: 'BWA',
    stationId: 'BWA-STN-1',
    dateFound: '2026-05-08',
    remarks: 'Found opposite Gaborone Main Mall post office.',
    status: 'Collected',
  },
  {
    id: 'BWA-DOC-302',
    documentType: 'Driver\'s Licence',
    documentNumber: 'DL-BW8192033',
    holderName: 'Kelebogile Mpho Moloi',
    countryCode: 'BWA',
    stationId: 'BWA-STN-1',
    dateFound: '2026-05-16',
    remarks: 'Found inside Riverwalk Shopping Complex.',
    status: 'Unclaimed',
  },

  // Zimbabwe
  {
    id: 'ZWE-DOC-401',
    documentType: 'National Identity Card',
    documentNumber: '63-128490K48',
    holderName: 'Tendai Blessing Moyo',
    countryCode: 'ZWE',
    stationId: 'ZWE-STN-1',
    dateFound: '2026-05-12',
    remarks: 'Found at Roadport Bus Terminal.',
    status: 'Unclaimed',
  },
  {
    id: 'ZWE-DOC-402',
    documentType: 'Passport',
    documentNumber: 'PP-ZW0049281',
    holderName: 'Farai Christopher Sibanda',
    countryCode: 'ZWE',
    stationId: 'ZWE-STN-2',
    dateFound: '2026-05-15',
    remarks: 'Retrieved near Bulawayo City Hall gardens.',
    status: 'Unclaimed',
  }
];

export const INITIAL_CLAIMS: IDClaim[] = [
  {
    id: 'CLM-1002',
    trackingCode: 'SADC-CLAIM-9021-SWZ',
    documentId: 'SWZ-DOC-102',
    citizenName: 'Nokuthula Khanyisile Zwane',
    citizenPhone: '+268 7654 3210',
    citizenEmail: 'nokuthula.zwane@example.com',
    proofNotes: 'This matches my passport details correctly. I lost it while returning from Manzini last Tuesday.',
    proofDocumentType: 'Loss Affidavit & Scanned Copy of previous ID booklet',
    status: 'Under Review',
    submittedAt: '2026-05-15T09:12:00Z',
  },
  {
    id: 'CLM-1004',
    trackingCode: 'SADC-CLAIM-4481-SWZ',
    documentId: 'SWZ-DOC-104',
    citizenName: 'Fezile Shongwe',
    citizenPhone: '+268 7812 4545',
    citizenEmail: 'f.shongwe@example.com',
    proofNotes: 'My student card matches the image and student number. I need it to write my upcoming exams.',
    proofDocumentType: 'University Enrollment Letter',
    status: 'Approved',
    submittedAt: '2026-05-20T14:40:00Z',
    reviewedAt: '2026-05-21T11:20:00Z',
    reviewerNotes: 'Student record matches UNESWA registration data. Approved for station pickup.',
  },
  {
    id: 'CLM-2003',
    trackingCode: 'SADC-CLAIM-7299-ZAF',
    documentId: 'ZAF-DOC-203',
    citizenName: 'Lungile Ndlovu',
    citizenPhone: '+27 82 456 7890',
    citizenEmail: 'lungyndlovu@example.com',
    proofNotes: 'I dropped my bank card inside Nedbank or near ATM. Card number and signature matches.',
    proofDocumentType: 'Bank Statement & Match ID',
    status: 'Approved',
    submittedAt: '2026-05-21T08:00:00Z',
    reviewedAt: '2026-05-22T06:15:00Z',
    reviewerNotes: 'Verified via identity matching interface. Set status as Ready.',
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2026-05-22T08:15:00Z', action: 'Document Uploaded', userRole: 'Police', details: 'Added National Identity Card for holder Sibusiso Thabiso Dlamini', countryCode: 'SWZ' },
  { id: 'LOG-002', timestamp: '2026-05-22T08:45:00Z', action: 'Claim Verification', userRole: 'Administrator', details: 'Status for Claim SADC-CLAIM-7299-ZAF updated to Approved', countryCode: 'ZAF' },
  { id: 'LOG-003', timestamp: '2026-05-22T09:12:00Z', action: 'System Search', userRole: 'Citizen', details: 'Citizen performed encrypted ID lookup for Passport numbers', countryCode: 'SWZ' },
  { id: 'LOG-004', timestamp: '2026-05-22T10:05:00Z', action: 'Location Added', userRole: 'Administrator', details: 'Configured new collection site at Pretoria Central outpost', countryCode: 'ZAF' }
];
