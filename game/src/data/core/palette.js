// The master palette and per-world ramps (design "Art direction").
export const P = {
  chalk: '#EFE8D6', sage: '#8FAE7B', meadow: '#C9B458', earth: '#7A5638', bark: '#3E2A1E', dusk: '#4B3F72',
  teal: '#3E8A8A', moon: '#CFD8E8', emerald: '#3FA45B', ember: '#D9773A', hum: '#BFE3F0', eye: '#2A1C14',
  ink: '#1d1726', panel: '#2b2236', panel2: '#3a2f48', paper: '#f4ecd8', gold: '#e8c95a', red: '#c8553d', heart: '#d9604a', pluck: '#5fa8c8',
};
// Fur ramps (dark -> light) for rabbits that share a base sprite.
export const FUR = {
  brown: ['#4a3020', '#6e4a30', '#946a44', '#b88d5c', '#d4b088'],
  grey: ['#3c3a3e', '#5c5a60', '#7e7c84', '#a2a0a8', '#c8c6cc'],
  sandy: ['#5e4a2c', '#8a6e42', '#b3955e', '#d2b77e', '#e8d4a4'],
  dark: ['#24201e', '#383230', '#4e4642', '#6a605a', '#8a7e76'],
  cream: ['#7a6a52', '#a3916e', '#c6b590', '#e0d2b0', '#f2e8d0'],
  ginger: ['#5a2e14', '#8a4a20', '#b8682e', '#d88a48', '#ecb47a'],
  silver: ['#4e5462', '#727a8a', '#99a0ae', '#bfc5d0', '#e2e6ee'],
};
// World palettes for code-drawn terrain: each tile kind -> [top, top-light, side-left, side-right, speck]
export const WORLD = {
  downs: { grass: ['#8fae7b', '#a3c08a', '#6e5236', '#5a4230', '#7a9a68'], clover: ['#7fa46c', '#94b87e', '#6e5236', '#5a4230', '#e8e2f0'], chalk: ['#e6dec8', '#f2ebd8', '#b8ad94', '#a0967e', '#d0c6ae'], path: ['#d8cfb4', '#e6ddc4', '#a89c80', '#948a70', '#c4ba9e'], earth: ['#8a6644', '#9c7650', '#5e4430', '#4e3828', '#7a5838'], sweet: ['#a8c46e', '#bcd680', '#6e5236', '#5a4230', '#e8d470'], water: ['#5a9ab0', '#7ab4c8', '#3e6a7a', '#345a68', '#a8d8e8'], sky: '#bcd8e0' },
  warren: { floor: ['#7a5a40', '#8a6a4c', '#4e3828', '#423024', '#6a4c36'], wall: ['#5a4232', '#6a503c', '#3e2c20', '#34241a', '#4e3a2c'], moss: ['#6a7a4a', '#7a8a56', '#4e3828', '#423024', '#8a9a5e'], root: ['#6a4a34', '#7a5a40', '#4a3424', '#3e2c1e', '#8a6a4c'], sky: '#2a1e18' },
  depths: { floor: ['#2e3346', '#3a4058', '#1c2030', '#161a28', '#4a5a70'], wall: ['#23283a', '#2c3248', '#151826', '#10131e', '#3a4a5e'], carve: ['#323a52', '#40486a', '#1c2030', '#161a28', '#6a8aa0'], water: ['#1a2c3a', '#24404e', '#10202a', '#0c1820', '#3e7a8a'], sky: '#0e1018' },
  willows: { grass: ['#86b06a', '#9cc47a', '#6a5034', '#584230', '#a8cc80'], water: ['#4f94a8', '#6aaec0', '#386a7a', '#2e5a68', '#a0d4e4'], path: ['#c8b08a', '#d8c09a', '#94805e', '#806e50', '#b8a07a'], snow: ['#dfe6ee', '#eef2f6', '#9aa4b4', '#8a94a4', '#c4ccd8'], floor: ['#8a6a4a', '#9a7a56', '#5e4630', '#4e3a28', '#7a5c3e'], wood: ['#9a7048', '#aa8054', '#6a4c30', '#5a3e28', '#8a6440'], sky: '#bcd8e0' },
  wonder: { grass: ['#7ab07a', '#8ec48c', '#5a4a6a', '#4a3c58', '#e8a0b8'], check: ['#e8e0d0', '#f4ece0', '#8a7a9a', '#7a6a8a', '#2a2430'], floor: ['#c89a6a', '#d8aa7a', '#7a5a6a', '#6a4a5a', '#b88a5a'], water: ['#6aa8c8', '#84bcd8', '#4a6a8a', '#3e5a78', '#c0e4f0'], hedge: ['#3e7a46', '#4e8a54', '#2a5030', '#224428', '#5a9a5e'], path: ['#d8c8a8', '#e6d6b8', '#9a8a7a', '#8a7a6a', '#c8b898'], sky: '#c8b8e0' },
  moon: { dust: ['#c8ccd8', '#dadee8', '#8a90a4', '#7a8094', '#e8ecf4'], floor: ['#d8d0e0', '#e6e0ee', '#9a90aa', '#8a809a', '#f0eaf6'], grass: ['#9ab8b0', '#aecac2', '#6a7a8a', '#5a6a7a', '#d8f0e8'], sky: '#1a1830' },
  oz: { grass: ['#7ab060', '#8ec270', '#5a4a30', '#4a3c28', '#a8d080'], blue: ['#7aa0c8', '#8eb2d6', '#4a6080', '#3e5270', '#c0d8f0'], brick: ['#e0c050', '#ecd060', '#a08030', '#8a6e28', '#f4e08a'], emerald: ['#4ab070', '#5ec484', '#2a7048', '#225e3c', '#a0f0c0'], yellow: ['#d8c060', '#e6d070', '#9a8040', '#8a7038', '#f0e090'], poppy: ['#7ab060', '#8ec270', '#5a4a30', '#4a3c28', '#e04030'], china: ['#f0f0f4', '#ffffff', '#b0b4c4', '#a0a4b4', '#7a9ad0'], water: ['#5a9ab0', '#7ab4c8', '#3e6a7a', '#345a68', '#a8d8e8'], floor: ['#8a9a6a', '#9aaa7a', '#5a6a40', '#4a5a34', '#aaba8a'], sky: '#b8d8f0' },
  journey: { rock: ['#5a4a46', '#6a5a54', '#3a2e2c', '#2e2422', '#8a6a5a'], floor: ['#6a5a4e', '#7a6a5a', '#423630', '#362c26', '#9a8270'], sand: ['#b8a07a', '#c8b08a', '#7a6650', '#6a5844', '#d8c098'], water: ['#3a6a7a', '#4a7e8e', '#244a56', '#1e3e48', '#7ab4c0'], moss: ['#5a7a5a', '#6a8a68', '#3a4a3a', '#2e3e2e', '#9ac0a0'], lava: ['#b85a2a', '#d0703a', '#7a3a1a', '#682e14', '#f0a050'], bone: ['#d8d0b8', '#e6dec8', '#9a9480', '#8a8470', '#f4eedc'], sky: '#2a2420' },
  flint: { flint: ['#c8c8c4', '#d8d8d4', '#8a8a86', '#7a7a76', '#4a4a50'], grass: ['#8a9a72', '#9aaa80', '#5e5a44', '#4e4a38', '#aab890'], floor: ['#6a6460', '#7a7470', '#44403e', '#3a3634', '#8a8480'], chalk: ['#e0dccc', '#ece8da', '#aaa494', '#9a9484', '#c8c2b0'], sky: '#9aa4b4' },
  corn: { corn: ['#d8b858', '#e6c868', '#8a7038', '#7a6230', '#f0d880'], grass: ['#9aae6a', '#aec07a', '#6a5634', '#5a482c', '#c4d488'], path: ['#c8b08a', '#d8c09a', '#94805e', '#806e50', '#b8a07a'], sky: '#d8d0a8' },
  silver: { chalk: ['#e8eaf0', '#f4f6fa', '#a8aab8', '#9a9caa', '#d0d4e0'], grass: ['#a0b4a0', '#b2c4b0', '#6a6a6e', '#5a5a60', '#c8d8c8'], floor: ['#8a8a9a', '#9a9aaa', '#5a5a6a', '#4e4e5c', '#aaaabb'], sky: '#c8d0e0' },
};
