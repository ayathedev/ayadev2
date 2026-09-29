import { Wallpaper } from '../types';
import chromeosAbstract from '../assets/images/wallpaper_chromeos_abstract_1790542637340.jpg';
import darkSpace from '../assets/images/wallpaper_dark_space_1790542647890.jpg';
import architectureMinimal from '../assets/images/wallpaper_architecture_minimal_1790542657503.jpg';

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'chromeos-abstract',
    name: 'ChromeOS Motion Fluid',
    url: chromeosAbstract,
    thumbnail: chromeosAbstract,
    category: 'Aya OS Motion'
  },
  {
    id: 'dark-space',
    name: 'Deep Nebula Dark',
    url: darkSpace,
    thumbnail: darkSpace,
    category: 'Dark Space'
  },
  {
    id: 'architecture-minimal',
    name: 'Warm Concrete Geometric',
    url: architectureMinimal,
    thumbnail: architectureMinimal,
    category: 'Architecture'
  },
  {
    id: 'gradient-cyber',
    name: 'Hotspot Sunset Cyberwave',
    url: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #31104b 70%, #4c0519 100%)',
    thumbnail: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #31104b 70%, #4c0519 100%)',
    category: 'Gradients'
  },
  {
    id: 'gradient-emerald',
    name: 'Offline Emerald Mesh',
    url: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #0f172a 100%)',
    thumbnail: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #0f172a 100%)',
    category: 'Gradients'
  }
];
