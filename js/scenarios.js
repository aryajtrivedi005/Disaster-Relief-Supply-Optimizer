/**
 * Disaster Relief Supply Optimizer - Disaster Scenarios Catalog
 * Curated real-world disaster profiles featuring authentic logistics,
 * distress distress priorities, and relief convoy schedules.
 */

export const PRESET_SCENARIOS = {
  himalayan: {
    id: 'himalayan',
    name: 'Himalayan Cloudburst & Mountain Valley Floods',
    region: 'Kedarnath / Chamoli Alpine Valley (Elev. 3,500m)',
    threatLevel: 'CRITICAL',
    description: 'A sudden glacial lake outburst and catastrophic mudslide has severed all road arteries. Only heavy-lift vertical cargo drones and single-lane helicopter corridors can access isolated mountain hamlets.',
    vehicle: {
      type: 'Heavy Logistics Quadcopter Drone',
      capacity: 35,
      capacityUnit: 'kg',
      icon: 'drone'
    },
    items: [
      { id: 'it_1', name: 'Anti-Venom & Cold-Chain Plasma', weight: 4, value: 96, category: 'Medical', icon: 'syringe' },
      { id: 'it_2', name: 'Portable Oxygen Concentrator', weight: 8, value: 92, category: 'Medical', icon: 'lungs' },
      { id: 'it_3', name: 'Emergency Surgical Field Trauma Kit', weight: 6, value: 88, category: 'Medical', icon: 'briefcase-medical' },
      { id: 'it_4', name: 'Satellite Comms & Emergency Beacon', weight: 3, value: 85, category: 'Tech', icon: 'satellite-dish' },
      { id: 'it_5', name: 'High-Density Nutritive Ration Bars', weight: 7, value: 70, category: 'Food', icon: 'cookie' },
      { id: 'it_6', name: 'Mylar Space Hypothermia Blankets', weight: 5, value: 65, category: 'Shelter', icon: 'shield-alt' },
      { id: 'it_7', name: 'Water Micro-Purification Aquatabs', weight: 2, value: 60, category: 'Water', icon: 'tint' },
      { id: 'it_8', name: 'Inflatable Alpine Extreme Tent', weight: 12, value: 58, category: 'Shelter', icon: 'campground' },
      { id: 'it_9', name: 'Hand-Cranked Multiband Radio', weight: 3, value: 45, category: 'Tech', icon: 'broadcast-tower' },
      { id: 'it_10', name: 'Heavy Wool Blankets & Tarps', weight: 15, value: 40, category: 'Shelter', icon: 'bed' }
    ],
    distressCalls: [
      { id: 'dc_1', location: 'Ridge 9 Ancient Monastery', urgencyScore: 98, severity: 'Critical', casualties: 14, deadlineMin: 25, suppliesNeeded: 'Oxygen & Trauma Kit', status: 'Pending' },
      { id: 'dc_2', location: 'Washed-Out Suspension Bridge', urgencyScore: 92, severity: 'Critical', casualties: 38, deadlineMin: 35, suppliesNeeded: 'Hypothermia Gear & Rations', status: 'Pending' },
      { id: 'dc_3', location: 'District Hospital Generator Outage', urgencyScore: 86, severity: 'High', casualties: 9, deadlineMin: 50, suppliesNeeded: 'Battery Packs & Plasma', status: 'Pending' },
      { id: 'dc_4', location: 'Isolated Forest Ranger Outpost', urgencyScore: 70, severity: 'Medium', casualties: 4, deadlineMin: 90, suppliesNeeded: 'Satellite Beacon', status: 'Pending' },
      { id: 'dc_5', location: 'Pilgrim Base Camp Overhang', urgencyScore: 62, severity: 'Medium', casualties: 12, deadlineMin: 120, suppliesNeeded: 'Water Tablets & MREs', status: 'Pending' },
      { id: 'dc_6', location: 'Upper Alpine Yak Herder Hamlet', urgencyScore: 45, severity: 'Low', casualties: 0, deadlineMin: 180, suppliesNeeded: 'Wool Blankets', status: 'Pending' }
    ],
    missions: [
      { id: 'mis_1', name: 'Bravo-1 Recon Flight', start: 6, end: 9, zone: 'Northern Pass', convoyType: 'Chinook Helo', priority: 'Critical' },
      { id: 'mis_2', name: 'Alpha-2 Medevac Sweep', start: 7, end: 11, zone: 'Monastery Gorge', convoyType: 'Light Chopper', priority: 'Critical' },
      { id: 'mis_3', name: 'Echo-3 Drone Cargo Drop', start: 9, end: 12, zone: 'Ridge Sector 4', convoyType: 'Cargo Drone', priority: 'High' },
      { id: 'mis_4', name: 'Delta-4 Mountain Escort', start: 10, end: 14, zone: 'Alpine Passway', convoyType: 'Ground Squad', priority: 'Medium' },
      { id: 'mis_5', name: 'Foxtrot-5 Heavy Supply Run', start: 12, end: 15, zone: 'Basecamp Runway', convoyType: 'Heavy Cargo', priority: 'Critical' },
      { id: 'mis_6', name: 'Tango-6 Medical Evac', start: 13, end: 17, zone: 'Hospital Helipad', convoyType: 'Light Chopper', priority: 'High' },
      { id: 'mis_7', name: 'Sierra-7 Fuel Convoy', start: 15, end: 18, zone: 'Lower Valley', convoyType: 'Tanker Drone', priority: 'Medium' },
      { id: 'mis_8', name: 'Zulu-8 Twilight Sweep', start: 17, end: 20, zone: 'Bridge Overlook', convoyType: 'Recon Drone', priority: 'Low' }
    ]
  },

  cyclone: {
    id: 'cyclone',
    name: 'Coastal Super Cyclone "Vardah" Inundation',
    region: 'Bay of Bengal Delta & Mangrove Estuary',
    threatLevel: 'SEVERE',
    description: 'Catastrophic 5-meter storm surges have inundated barrier islands and saltwater estuaries. Amphibious trucks and shallow-draft jet rescue barges must prioritize life-saving supplies before high tide.',
    vehicle: {
      type: 'Tactical Amphibious 8x8 Truck',
      capacity: 100,
      capacityUnit: 'kg',
      icon: 'truck'
    },
    items: [
      { id: 'it_c1', name: 'Reverse-Osmosis Water Desalinator', weight: 22, value: 95, category: 'Water', icon: 'faucet' },
      { id: 'it_c2', name: 'Inflatable 8-Person Life Rafts', weight: 28, value: 90, category: 'Shelter', icon: 'life-ring' },
      { id: 'it_c3', name: 'Waterborne Disease Antimicrobial Kits', weight: 14, value: 88, category: 'Medical', icon: 'capsules' },
      { id: 'it_c4', name: 'High-Lumen Emergency Flares & Strobes', weight: 8, value: 82, category: 'Tech', icon: 'lightbulb' },
      { id: 'it_c5', name: 'Waterproof Energy MRE Food Packs', weight: 25, value: 75, category: 'Food', icon: 'utensils' },
      { id: 'it_c6', name: 'Solar Marine VHF Emergency Transceivers', weight: 12, value: 70, category: 'Tech', icon: 'walkie-talkie' },
      { id: 'it_c7', name: 'High-Tear Heavy Duty Tarpaulins', weight: 18, value: 60, category: 'Shelter', icon: 'layer-group' },
      { id: 'it_c8', name: 'Life Jackets with Whistles (Pack of 10)', weight: 15, value: 55, category: 'Shelter', icon: 'vest' },
      { id: 'it_c9', name: 'Submersible Sump Bilge Pump', weight: 30, value: 50, category: 'Tech', icon: 'gas-pump' }
    ],
    distressCalls: [
      { id: 'dc_c1', location: 'Breached Coastal Sea-Dike Island', urgencyScore: 100, severity: 'Critical', casualties: 32, deadlineMin: 18, suppliesNeeded: 'Life Rafts & Flares', status: 'Pending' },
      { id: 'dc_c2', location: 'Maternity Clinic Inundated Rooftop', urgencyScore: 96, severity: 'Critical', casualties: 15, deadlineMin: 30, suppliesNeeded: 'Pediatric Antibiotics & Rations', status: 'Pending' },
      { id: 'dc_c3', location: 'Submerged Mangrove Fisher Hamlet', urgencyScore: 89, severity: 'High', casualties: 24, deadlineMin: 45, suppliesNeeded: 'Water Desalinators & Vests', status: 'Pending' },
      { id: 'dc_c4', location: 'Secondary School Cyclone Shelter', urgencyScore: 75, severity: 'High', casualties: 70, deadlineMin: 80, suppliesNeeded: 'Clean Water & MRE Packs', status: 'Pending' },
      { id: 'dc_c5', location: 'Lighthouse Beacon Generator Failure', urgencyScore: 66, severity: 'Medium', casualties: 3, deadlineMin: 110, suppliesNeeded: 'Solar VHF Transceiver', status: 'Pending' },
      { id: 'dc_c6', location: 'Stranded Cattle Dike Polder', urgencyScore: 35, severity: 'Low', casualties: 0, deadlineMin: 240, suppliesNeeded: 'Canvas Tarpaulins', status: 'Pending' }
    ],
    missions: [
      { id: 'mis_c1', name: 'Channel-1 Hovercraft Evac', start: 5, end: 8, zone: 'Mangrove Sound', convoyType: 'Hovercraft', priority: 'Critical' },
      { id: 'mis_c2', name: 'Channel-2 Amphibious Relief', start: 6, end: 10, zone: 'Sea-Wall Breach', convoyType: 'Amphibious Truck', priority: 'Critical' },
      { id: 'mis_c3', name: 'Channel-3 Coast Guard Cutter', start: 8, end: 11, zone: 'Barrier Island', convoyType: 'Patrol Boat', priority: 'High' },
      { id: 'mis_c4', name: 'Channel-4 Freshwater Delivery', start: 9, end: 13, zone: 'Delta School', convoyType: 'Supply Barge', priority: 'Medium' },
      { id: 'mis_c5', name: 'Channel-5 Rooftop Airlift', start: 11, end: 14, zone: 'Maternity Clinic', convoyType: 'Rescue Helo', priority: 'Critical' },
      { id: 'mis_c6', name: 'Channel-6 Generator Convoy', start: 12, end: 16, zone: 'Lighthouse Rock', convoyType: 'Tug Boat', priority: 'Medium' },
      { id: 'mis_c7', name: 'Channel-7 Dusk Medical Patrol', start: 14, end: 18, zone: 'Estuary Shallows', convoyType: 'Airboat', priority: 'High' },
      { id: 'mis_c8', name: 'Channel-8 Final Sea-Watch', start: 16, end: 19, zone: 'Outer Reef', convoyType: 'Patrol Boat', priority: 'Low' }
    ]
  },

  earthquake: {
    id: 'earthquake',
    name: 'Magnitude 7.4 Metropolitan Seismological Disaster',
    region: 'Central Urban Core & Downtown Subways',
    threatLevel: 'CATASTROPHIC',
    description: 'Catastrophic ground displacement has pancaked high-density multi-story buildings, severed municipal gas and water pipelines, and trapped transit passengers underground. Urban search-and-rescue (USAR) units are on the scene.',
    vehicle: {
      type: 'Heavy USAR Urban Logistics Hauler',
      capacity: 250,
      capacityUnit: 'kg',
      icon: 'shipping-fast'
    },
    items: [
      { id: 'it_e1', name: 'Hydraulic Jaws-of-Life Spreader / Cutter', weight: 45, value: 98, category: 'Tech', icon: 'tools' },
      { id: 'it_e2', name: 'Blood Bank Plasma & IV Infusion Packs', weight: 30, value: 95, category: 'Medical', icon: 'tint' },
      { id: 'it_e3', name: 'Seismic Acoustic Survivor Listening Radar', weight: 18, value: 92, category: 'Tech', icon: 'satellite-dish' },
      { id: 'it_e4', name: 'Carbon-Fiber Structural Shoring Struts', weight: 55, value: 89, category: 'Shelter', icon: 'shield-alt' },
      { id: 'it_e5', name: 'Trauma Burn & Wound Dressing Modules', weight: 20, value: 85, category: 'Medical', icon: 'medkit' },
      { id: 'it_e6', name: 'Portable Pneumatic Jackhammers', weight: 40, value: 78, category: 'Tech', icon: 'hammer' },
      { id: 'it_e7', name: 'Emergency Surgical Automated Defibrillator', weight: 15, value: 75, category: 'Medical', icon: 'heartbeat' },
      { id: 'it_e8', name: 'Heavy-Duty Portable Generator (10kW)', weight: 65, value: 72, category: 'Tech', icon: 'bolt' },
      { id: 'it_e9', name: 'Potable Water Bladders (20L Packs)', weight: 35, value: 65, category: 'Water', icon: 'faucet' },
      { id: 'it_e10', name: 'Nutritional USAR Ready-to-Eat Rations', weight: 25, value: 60, category: 'Food', icon: 'box-open' }
    ],
    distressCalls: [
      { id: 'dc_e1', location: 'Underground Metro Station Collapse', urgencyScore: 100, severity: 'Critical', casualties: 65, deadlineMin: 15, suppliesNeeded: 'Acoustic Radar & Hydraulic Cutters', status: 'Pending' },
      { id: 'dc_e2', location: 'Children Hospital ICU Structural Crack', urgencyScore: 97, severity: 'Critical', casualties: 28, deadlineMin: 22, suppliesNeeded: 'Generators & Blood Plasma', status: 'Pending' },
      { id: 'dc_e3', location: 'Downtown 12-Story Pancaked Residency', urgencyScore: 93, severity: 'Critical', casualties: 42, deadlineMin: 35, suppliesNeeded: 'Shoring Struts & Trauma Kits', status: 'Pending' },
      { id: 'dc_e4', location: 'Industrial District Chemical Gas Leak', urgencyScore: 85, severity: 'High', casualties: 18, deadlineMin: 55, suppliesNeeded: 'Burn Modules & Water Bladders', status: 'Pending' },
      { id: 'dc_e5', location: 'University Sports Complex Refugee Camp', urgencyScore: 68, severity: 'Medium', casualties: 120, deadlineMin: 100, suppliesNeeded: 'MRE Rations & Water Bladders', status: 'Pending' },
      { id: 'dc_e6', location: 'Peripheral Transit Terminal Debris', urgencyScore: 40, severity: 'Low', casualties: 2, deadlineMin: 200, suppliesNeeded: 'General First Aid', status: 'Pending' }
    ],
    missions: [
      { id: 'mis_e1', name: 'Convoy USAR-Alpha', start: 6, end: 9, zone: 'Metro Station Core', convoyType: 'Heavy Hauler', priority: 'Critical' },
      { id: 'mis_e2', name: 'Convoy Med-Beta', start: 7, end: 11, zone: 'Children Hospital', convoyType: 'Mobile ICU', priority: 'Critical' },
      { id: 'mis_e3', name: 'Convoy Shoring-Gamma', start: 9, end: 12, zone: 'Pancaked Tower', convoyType: 'Engineering Truck', priority: 'High' },
      { id: 'mis_e4', name: 'Convoy Hazmat-Delta', start: 10, end: 14, zone: 'Chemical Plant', convoyType: 'Hazmat Unit', priority: 'High' },
      { id: 'mis_e5', name: 'Convoy Bulk-Food-1', start: 12, end: 15, zone: 'Stadium Refugee Camp', convoyType: 'Supply Truck', priority: 'Medium' },
      { id: 'mis_e6', name: 'Convoy Heavy-Crane-2', start: 13, end: 17, zone: 'Overpass Collapse', convoyType: 'Heavy Crane', priority: 'High' },
      { id: 'mis_e7', name: 'Convoy Fuel-Water-3', start: 15, end: 18, zone: 'Sector 5 Command', convoyType: 'Tanker', priority: 'Medium' },
      { id: 'mis_e8', name: 'Convoy Night-Watch-4', start: 17, end: 20, zone: 'Perimeter Transit', convoyType: 'Patrol Squad', priority: 'Low' }
    ]
  }
};
