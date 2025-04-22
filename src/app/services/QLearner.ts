export default class QLearner {
  private alpha!: number;
  private gamma!: number;
  private rar!: number;
  private radr!: number;
  private s!: number;
  private a!: number;
  private Q!: number[][];

  constructor(
    numStates: number,
    numActions: number,
    alpha: number = 0.2,
    gamma: number = 0.9,
    rar: number = 0.5,
    radr: number = 0.99
  ) {
    this.Q = this.buildQ(numStates, numActions);
    this.alpha = alpha;
    this.gamma = gamma;
    this.rar = rar;
    this.radr = radr;
  }

  public setState = async (s: number): Promise<number> => {
    this.s = s;
    this.a = await this.selectAction(s);
    return this.a;
  }

  public query = async (sPrime: number, r: number): Promise<number> => {
    this.updateQ(this.s, this.a, sPrime, r);

    this.s = sPrime;
    this.a = await this.selectAction(sPrime);

    this.rar = this.rar * this.radr;

    return this.a;
  }

  private buildQ = (numStates: number, numActions: number): number[][] => {
    const arr = [];
    while (arr.length < numStates) {
      arr.push(new Array(numActions).fill(0));
    }
    return arr;
  }

  private selectAction = async (s: number): Promise<number> => {
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

  private updateQ = async (s: number, a: number, sPrime: number, r: number): Promise<void> => {
    const currentQ = this.Q[s][a];
    const nextQ = this.Q[sPrime][await this.selectAction(sPrime)];

    this.Q[s][a] = currentQ + this.alpha*(r + this.gamma*nextQ - currentQ);
  }
}
