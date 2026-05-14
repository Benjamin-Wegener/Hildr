const BLESSINGS = {
  odin: {
    name: "Odin's Wisdom",
    modifiers: {
      Agility: 2,
      MaxMana: 15,
    },
  },
  thor: {
    name: "Thor's Might",
    modifiers: {
      Strength: 4,
      MaxHealth: 20,
    },
  },
  freya: {
    name: "Freya's Grace",
    modifiers: {
      Agility: 3,
      MaxHealth: 10,
    },
  },
};

/**
 * Applies and removes god blessings from player characters.
 */
export class GodBlessingsSystem {
  constructor() {
    this.activeBlessingByCharacter = new WeakMap();
  }

  applyBlessing(character, godKey) {
    const blessing = BLESSINGS[godKey];
    if (!blessing) {
      console.warn(`Unknown blessing key: ${godKey}`);
      return null;
    }

    this.clearBlessing(character);
    character.applyStatModifiers(blessing.modifiers);
    this.activeBlessingByCharacter.set(character, godKey);
    return blessing.name;
  }

  clearBlessing(character) {
    const activeGodKey = this.activeBlessingByCharacter.get(character);
    if (!activeGodKey) return;

    const activeBlessing = BLESSINGS[activeGodKey];
    character.applyStatModifiers(this.invertModifiers(activeBlessing.modifiers));
    this.activeBlessingByCharacter.delete(character);
  }

  invertModifiers(modifiers) {
    const inverted = {};
    for (const [stat, amount] of Object.entries(modifiers)) {
      inverted[stat] = -amount;
    }
    return inverted;
  }
}
