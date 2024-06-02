import { CONFIG } from "../config";
import { toDecimals } from "../util";
import { Circle } from "./entities/circle";
import { Player } from "./entities/player";
import { Game } from "./game";
import { Team } from "./globals";

const CIRCLE_WIDTH = 5;
const CIRCLE_GROWTH_PERIOD_MS = 800;
const MAX_CIRCLE_WIDTH = 50;

const SOFT_BORDER_MARGIN = 100;

const SPREAD_DISTANCE = MAX_CIRCLE_WIDTH;
const POINT_MAXIMUM = 150;
const SPREAD_INTERVAL = 75;

const SPILL_POINT_GROWTH_RATE = 0.4;
const SPILL_POINT_SWEEP_RATE = SPILL_POINT_GROWTH_RATE * 3;
const SWEEP_RADIUS = 120;

/**
 * - have points move away from player by biasing the random function
 */
export class Spill {
  points: SpillPoint[] = [];
  team: Team;
  interval?: NodeJS.Timeout;

  getGame: () => Game;

  constructor(getGame: () => Game, team: Team) {
    this.getGame = getGame;
    this.team = team;

    this.points.push(new SpillPoint(600, 500, () => this));

    this.activate();
  }

  activate() {
    this.points = [
      new SpillPoint(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, () => this),
    ];

    this.interval = setInterval(() => {
      if (this.points.length >= POINT_MAXIMUM) {
        this.points[this.points.length - POINT_MAXIMUM].dying = true;
      }

      if (this.points[0]?.isDead) {
        this.points.shift();
      }

      if (this.points.length < POINT_MAXIMUM) {
        this.spread();
      }
    }, SPREAD_INTERVAL);
  }

  deactivate() {
    clearInterval(this.interval);

    this.points = [];
  }

  scoreSpill(): number {
    return this.points.reduce(
      (total, point) => total + Math.max(point.r, 0) / 10,
      0
    );
  }

  toJSON() {
    return {
      points: this.points,
    };
  }

  update() {
    const opposingPlayers = Object.values(this.getGame().players)
      .filter((player) => player.team !== this.team)
      .sort(
        (a, b) =>
          (a.getConnection()?.connectionTime ?? 0) -
          (b.getConnection()?.connectionTime ?? 0)
      );

    const checkedPlayers = opposingPlayers.filter((player, index) => {
      return index <= this.getGame().maxPlayersPerTeam;
    });

    for (const player of checkedPlayers) {
      for (const point of this.points) {
        point.update(player);
      }
    }
  }

  spread() {
    const base = this.points[this.points.length - 1]; // random walk

    const baseX =
      base?.x ?? CONFIG.inWidth(Math.random() * CONFIG.WIDTH, MAX_CIRCLE_WIDTH);
    const baseY =
      base?.y ??
      CONFIG.inHeight(Math.random() * CONFIG.HEIGHT, MAX_CIRCLE_WIDTH);

    const leftBias = 1 - Math.min(baseX ?? 0 / SOFT_BORDER_MARGIN, 1);
    const rightBias = -(
      1 - Math.min((CONFIG.WIDTH - baseX) / SOFT_BORDER_MARGIN, 1)
    );

    const biasedXRand = Math.random() + leftBias + rightBias;
    const x = baseX + (biasedXRand * SPREAD_DISTANCE * 2 - SPREAD_DISTANCE);

    const y = baseY + (Math.random() * SPREAD_DISTANCE * 2 - SPREAD_DISTANCE);

    this.points.push(
      new SpillPoint(
        CONFIG.inWidth(x, MAX_CIRCLE_WIDTH),
        CONFIG.inHeight(y, MAX_CIRCLE_WIDTH),
        () => this
      )
    );
  }
}

class SpillPoint extends Circle {
  seed: number = Date.now() % 10000;
  dying: boolean = false;
  getSpill: () => Spill;

  constructor(x: number, y: number, getSpill: () => Spill) {
    super(x, y, CIRCLE_WIDTH);

    this.getSpill = getSpill;
  }

  get isDead() {
    return this.r <= 0;
  }

  get growthState(): SpillPoint.State {
    if (this.dying) {
      return SpillPoint.State.SHRINKING;
    }

    if (this.r <= MAX_CIRCLE_WIDTH) {
      return SpillPoint.State.GROWING;
    }

    if (
      Math.abs(((this.seed - Date.now()) % CIRCLE_GROWTH_PERIOD_MS) * 2) <
      CIRCLE_GROWTH_PERIOD_MS
    ) {
      return SpillPoint.State.GROWING;
    } else {
      return SpillPoint.State.SHRINKING;
    }
  }

  toJSON() {
    return [
      toDecimals(this.x, 3),
      toDecimals(this.y, 3),
      Math.round(this.r),
      this.seed,
    ];
  }

  update(player: Player) {
    if (this.growthState === SpillPoint.State.SHRINKING) {
      this.r -= SPILL_POINT_GROWTH_RATE;
    }

    if (this.growthState === SpillPoint.State.GROWING) {
      this.r += SPILL_POINT_GROWTH_RATE;
    }

    if (this.dying) {
      return;
    }

    const playerDistance = player.distanceTo(this);
    if (playerDistance < SWEEP_RADIUS) {
      this.r -= Math.pow(
        SPILL_POINT_SWEEP_RATE *
          ((SWEEP_RADIUS - playerDistance) / SWEEP_RADIUS + 0.5),
        1.2
      );

      if (this.r <= 0) {
        this.dying = true;
      }

      return;
    }
  }
}

namespace SpillPoint {
  export enum State {
    GROWING,
    SHRINKING,
    SWEEPING,
    DEAD,
  }
}
