import { find } from "../../core/find";
import { pick } from "../../core/pick";
import { EExplodeDir, EMapItem, EXPODER_DIRS } from "../../shared/types";
import { Achivment } from "./Achivment";
import { Bomb } from "./Bomb";
import { Entity } from "./Entity";
import { Player } from "./Player";

export interface IExplodePoin {
  x: number;
  y: number;
  dir: EExplodeDir;
  isFinaly: boolean;
  isBlock: boolean;
}

export class Explode extends Entity {
  id!: number;
  #points: IExplodePoin[] = [];
  time = Date.now();
  liveTime = 500;
  radius = 1;
  player: Player;

  ignore = new Set<Player>();

  constructor(bomb: Bomb) {
    super(bomb.game, bomb.x, bomb.y);
    this.id = bomb.game.explodesCounter++;
    this.radius = bomb.radius;
    this.player = bomb.player;
    this.explode();
  }

  static run(bomb: Bomb) {
    const { bombs, explodes } = bomb.game;

    if (bombs.delete(bomb))
      explodes.add(new Explode(bomb));
  }

  explode() {
    const points = this.#points;
    const {
      x,
      y,
      radius,
      game: {
        width,
        height,
        bombs,
        achivments,
        map
      }
    } = this;

    points.push({ x, y, dir: EExplodeDir.CENTER, isFinaly: false, isBlock: false });

    for (const [_id, direction] of Object.entries(EXPODER_DIRS)) {
      if (!+_id) continue;
      const { x: dx, y: dy } = direction;
      const dir: EExplodeDir = +_id as any;

      for (let i = 1; i <= radius; i++) {
        const x = i * dx + this.x;
        const y = i * dy + this.y;
        const index = x + y * width;
        const bombFind = find(bombs, { x, y });

        const achivmentFind = find(achivments, { x, y });

        if (x < 0 || x > width - 1 || y < 0 || y > height - 1)
          break;

        if (map[index] === EMapItem.WALL || map[index] === EMapItem.BLOCK) {
          if (map[index] == EMapItem.BLOCK) {
            map[index] = EMapItem.CLEAR;

            if (map.achivments.delete(index)) {
              this.game.achivments.add(
                new Achivment(this.game, x, y)
              );
            }

            points.push({ x, y, dir, isFinaly: true, isBlock: true });
          }

          points.slice(-1)[0].isFinaly = true;
          break;
        }

        if (bombFind) {
          bombFind.player = this.player;
          bombFind.time = Date.now();
          bombFind.liveTime = 50;
          points.push({ x, y, dir, isFinaly: true, isBlock: false });
          break;
        }

        if (achivmentFind) {
          achivments.delete(achivmentFind);
          points.push({ x, y, dir, isFinaly: true, isBlock: false });
          break;
        }

        points.push({ x, y, dir, isFinaly: radius === i, isBlock: false });
      }

      for (const { x, y } of points) {
        const index = y * width + x;
        if (map[index] === EMapItem.CLEAR)
          map[index] = EMapItem.GRAS;
      }
    }
  }

  update(): void {
    const { explodes } = this.game;
    const { time, liveTime } = this;

    if (Date.now() > time + liveTime) {
      explodes.delete(this);
      this.ignore.clear();
    }
  }

  get points() {
    return ([] as IExplodePoin[]).concat(this.#points);
  }

  get info() {
    return pick(this, [
      'id',
      'x',
      'y',
      'points'
    ]);
  }
}