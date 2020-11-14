export class Provider {
  constructor(
    readonly name: string,
    readonly link: string,
    readonly affiliate_links: string[],
    readonly tiered_plans: TieredPlan[]
  ) {}
}

export enum Currency {
  EUR,
  USD,
}

export class UserInput {
  constructor(
    readonly months: number, 
    readonly currency: Currency, 
    readonly initial_upload: number, 
    readonly upload_mo: number, 
    readonly delete_mo: number, 
    readonly download_mo: number, 
    readonly enterprise: boolean
  ) {}
}

export class TieredPlan {
    constructor(
      readonly name: string,
      readonly months: number,
      readonly cost: number,
      readonly storage_cap: number,
      readonly extra_cost: (constraints: UserInput, plan: TieredPlan, storage: number) => number,
      readonly currency: Currency
    ) {}
}

function fichier_extra_cost(constraints: UserInput, plan: TieredPlan, storage: number) {
  if (storage < 100*1000) { // Less than 100 TB
    return Math.max(0, Math.ceil((storage-2000)/1000));
  } else {
    return Infinity;
  }
}

function backblaze_b2_extra_cost(constraints: UserInput, plan: TieredPlan, storage: number) {
  return storage * 0.005 + 0.01 * constraints.download_mo;
}

// function sample<T>(array: Array<T>): T {
//   return array[Math.floor(Math.random() * array.length)];
// }

const providers = [
  new Provider(
    "1fichier",
    "https://1fichier.com/",
    [
      "https://1fichier.com/tarifs.html?af=3676346"
    ],
    [
      new TieredPlan("Premium 1 month", 1, 3.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 1 year", 12, 22.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 5 years", 12*5, 99.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 10 years", 12*10, 195.00, 2000, fichier_extra_cost, Currency.EUR),
    ]
  ),
  new Provider(
    "Backblaze",
    "https://www.backblaze.com/b2/cloud-storage-pricing.html",
    [],
    [
      new TieredPlan("B2", 1, 0, 0, backblaze_b2_extra_cost, Currency.USD),
    ]
  )
];

function compute_storage_requirements(constraints: UserInput): number[] {
  let current = constraints.initial_upload;
  const storage_for_months = [];
  for (let i = 0; i < constraints.months; ++i) {
    current -= constraints.delete_mo;
    current = Math.max(current, 0);
    current += constraints.upload_mo;
    storage_for_months.push(current);
  }
  return storage_for_months;
}

/// Returns a list of tiered plans to subscribe to in succession
export function choose_tiered_plan(constraints: UserInput, provider: Provider, storage_for_months: number[]): [Provider, TieredPlan[], number] {
  const cost_so_far = new Array(constraints.months+1).fill(Infinity);
  const backlinks: TieredPlan[] = new Array(constraints.months+1); // Which plan we took

  cost_so_far[0] = 0;

  for (let i = 1; i <= constraints.months; ++i) {
    for (const plan of provider.tiered_plans) {
      let extra_cost = 0;
      const plan_begin = Math.max(0, i-plan.months);
      for (let m = plan_begin; m < i; ++m) {
        extra_cost += plan.extra_cost(constraints, plan, storage_for_months[m]);
      }

      const cost_this_plan = cost_so_far[plan_begin] + plan.cost + extra_cost;
      if (cost_this_plan < cost_so_far[i]) {
        cost_so_far[i] = cost_this_plan;
        backlinks[i] = plan;
      }
    }
  }
  // Find the cheapest plan: follow the backlinks
  const plans = [];
  for(let i = backlinks.length - 1; i != 0; i = Math.max(0, i - backlinks[i].months)) {
    plans.push(backlinks[i]);
  }
  plans.reverse();
  const best_cost = cost_so_far[cost_so_far.length-1];
  return [provider, plans, best_cost];
}

export function compute_plans(constraints: UserInput): [Provider, TieredPlan[], number][] {
  const storage_for_months = compute_storage_requirements(constraints);

  const provider_plans = [];
  for (const provider of providers) {
    provider_plans.push(choose_tiered_plan(constraints, provider, storage_for_months));
  }
  provider_plans.sort((a, b) => b[2] - a[2]); // sort by price, ascending
  provider_plans.reverse();
  return provider_plans;
}