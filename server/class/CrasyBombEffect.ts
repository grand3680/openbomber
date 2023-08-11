import { CRAZY_BOMB_TIME } from "../../src/config";
import { Player } from "./Player";
import { PlayerEffect } from "./PlayerEffect";

export class CrasyBombEffect extends PlayerEffect {
  #created = Date.now();
  shieldTime = 0;

  appendTime() {
    this.shieldTime += CRAZY_BOMB_TIME;
  }

  update(): void {
    if (Date.now() > this.#created + this.shieldTime)
      this.delete();
  }

  static get(player: Player): CrasyBombEffect | null {
    return this.getEffects(player, this)[0];
  }

  static hasCrasyBomb(player: Player) {
    return !!this.get(player);
  }

  static delete(player: Player) {
    this.get(player)?.delete();
  }

  static append(player: Player) {
    const effets = this.effects(player);
    const currentEffect = this.get(player) ?? new this(player);

    currentEffect.appendTime();
    effets.add(currentEffect);
  }
}