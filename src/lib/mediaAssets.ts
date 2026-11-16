import heroSnackComposition from '../assets/images/hero_snack_composition_1794675793761.jpg';
import storyArtisanCraft from '../assets/images/story_artisan_craft_1794675794777.jpg';
import productAlmondButter from '../assets/images/product_almond_butter_1794675794686.jpg';
import productMacadamiaButter from '../assets/images/product_macadamia_butter_1794675795403.jpg';
import productChilliPeanutButter from '../assets/images/product_chilli_peanut_butter_1794675795220.jpg';
import productCaramelisedNuts from '../assets/images/product_caramelised_nuts_1794675795586.jpg';
import productGranolaBalls from '../assets/images/product_granola_balls_1794675795670.jpg';
import productGranolaBars from '../assets/images/product_granola_bars_1794675797213.jpg';
import productCrispyRollPuffs from '../assets/images/product_crispy_roll_puffs_1794675796629.jpg';
import productTomatoNaks from '../assets/images/product_tomato_naks_1794675797089.jpg';
import productCheeseOnionNaks from '../assets/images/product_cheese_onion_naks_1794675798037.jpg';
import productChickenNaks from '../assets/images/product_chicken_naks_1794675798171.jpg';

export const MEDIA_ASSETS = {
  hero_snack_composition: heroSnackComposition,
  story_artisan_craft: storyArtisanCraft,
  almond_butter: productAlmondButter,
  macadamia_butter: productMacadamiaButter,
  chilli_peanut_butter: productChilliPeanutButter,
  caramelised_nuts: productCaramelisedNuts,
  granola_balls: productGranolaBalls,
  granola_bars: productGranolaBars,
  crispy_roll_puffs: productCrispyRollPuffs,
  tomato_naks: productTomatoNaks,
  cheese_onion_naks: productCheeseOnionNaks,
  chicken_naks: productChickenNaks,
} as const;

export type MediaAssetKey = keyof typeof MEDIA_ASSETS;

export function resolveMediaUrl(keyOrUrl: string | undefined | null): string {
  if (!keyOrUrl) return MEDIA_ASSETS.hero_snack_composition;
  if (keyOrUrl.startsWith('asset://')) {
    const key = keyOrUrl.replace('asset://', '') as MediaAssetKey;
    return MEDIA_ASSETS[key] || MEDIA_ASSETS.crispy_roll_puffs;
  }
  if (keyOrUrl in MEDIA_ASSETS) {
    return MEDIA_ASSETS[keyOrUrl as MediaAssetKey];
  }
  return keyOrUrl;
}
