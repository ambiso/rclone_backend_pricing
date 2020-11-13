class Provider {
  constructor(
    readonly name: string,
    readonly link: string,
    readonly affiliate_links: string[],
    readonly tiered_plans: TieredPlan[]
  ) {}
}

enum Currency {
  EUR,
  USD,
}

class UserInput {
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

class TieredPlan {
    constructor(
      readonly name: string,
      readonly months: number,
      readonly price: number,
      readonly storage_cap: number,
      readonly extra_cost: (storage: number) => number,
      readonly currency: Currency
    ) {}
}

function fichier_extra_cost(storage: number) {
  return Math.max(0, Math.floor((storage-2000)/1000)*100);
}

function sample<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

var providers = [
  new Provider(
    "1fichier",
    "https://1fichier.com/",
    [
      "https://1fichier.com/tarifs.html?af=3676346"
    ],
    [
      new TieredPlan("Premium 1 month", 1, 300, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 1 year", 12, 2200, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 5 years", 12*5, 9900, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium 10 years", 12*10, 19500, 2000, fichier_extra_cost, Currency.EUR),
    ]
  )
];

function compute_storage_requirements(constraints: UserInput): number[] {
  let current = 0;
  let storage_for_months = [];
  for (let i = 0; i < constraints.months; ++i) {
    current += constraints.upload_mo - constraints.download_mo;
    current = Math.max(current, 0);
    storage_for_months.push(current);
  }
  return storage_for_months;
}

/// Returns a list of tiered plans to subscribe to in succession
function choose_tiered_plan(provider: Provider, storage_for_months: number[], constraints: UserInput): [Provider, TieredPlan, number] {
  let max_storage = storage_for_months.reduce((a, b) => Math.max(a, b));
  let available_plans = [];
  for (let plan of provider.tiered_plans) {
      if (plan.storage_cap < max_storage && plan.extra_cost !== undefined) {
          continue;
      }
      if (plan.months > constraints.months) {
          continue;
      }
      available_plans.push(plan);
  }

  let best_plan = undefined;
  let best_cost = Infinity;
  for (let plan of available_plans) {
    // Compute the cost under this plan
    let cost = 0;
    let months_remaining = 0;
    for (let s of storage_for_months) {
      if (months_remaining == 0) {
        months_remaining = plan.months;
        cost += plan.price;
      }
      if (plan.storage_cap > s) {
        cost += plan.extra_cost(s);
      }
      months_remaining -= 1
    }

    if (cost < best_cost) {
      best_plan = plan;
      best_cost = cost;
    }
  }
  return [provider, best_plan, best_cost];
}

function recompute() {
  let months = parseFloat((<HTMLInputElement>document.getElementById("months")).value);
  let currency = Currency[(<HTMLSelectElement>document.getElementById("currency")).value as keyof typeof Currency];
  let initial_upload = parseFloat((<HTMLInputElement>document.getElementById("initial_upload")).value);
  let download_mo = parseFloat((<HTMLInputElement>document.getElementById("download")).value);
  let upload_mo = parseFloat((<HTMLInputElement>document.getElementById("upload")).value);
  let delete_mo = parseFloat((<HTMLInputElement>document.getElementById("delete")).value);
  let enterprise = (<HTMLInputElement>document.getElementById("enterprise")).value === "on";

  let constraints = new UserInput(months, currency, initial_upload, upload_mo, delete_mo, download_mo, enterprise);
  let storage_for_months = compute_storage_requirements(constraints);

  let provider_plans = [];
  for (let provider of providers) {
    provider_plans.push(choose_tiered_plan(provider, storage_for_months, constraints));
  }
  provider_plans.sort((a, b) => a[1] - b[1]); // sort by price, decending

  let results_table = <HTMLTableElement>document.getElementById("results");
  results_table.innerHTML = '';
  for (let [provider, plan, cost] of provider_plans) {
    let row = results_table.insertRow(0);
    row.insertCell().appendChild(document.createTextNode(provider.name));
    row.insertCell().appendChild(document.createTextNode(plan.name));
    row.insertCell().appendChild(document.createTextNode(cost.toString()));
  }
}