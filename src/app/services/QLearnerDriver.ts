export class QLearnerDriver {
  private alpha!: number;
  private gamma!: number;
  private s!: number;
  private a!: number;
  private Q!: number[][];

  constructor(
    Q: number[][],
    alpha: number = 0.2,
    gamma: number = 0.9,
  ) {
    this.Q = Q;
    this.alpha = alpha;
    this.gamma = gamma;
  }

  public setState = (s: number): number => {
    this.s = s;
    this.a = this.selectAction(s);
    return this.a;
  }

  public query = (sPrime: number, r: number): number => {
    this.updateQ(this.s, this.a, sPrime, r);

    this.s = sPrime;
    this.a = this.selectAction(sPrime);

    return this.a;
  }

  private selectAction = (s: number): number => {
    const actions = this.Q[s];
    let a = 0;
    let max = actions[a];
    for (let i = 1; i < actions.length; i++) {
      if (actions[i] > max) {
        a = i;
        max = actions[i];
      }
    }
    return a;
  }

  private updateQ = (s: number, a: number, sPrime: number, r: number): void => {
    const currentQ = this.Q[s][a];
    const nextQ = this.Q[sPrime][this.selectAction(sPrime)];

    this.Q[s][a] = currentQ + this.alpha*(r + this.gamma*nextQ - currentQ);
  }
}
