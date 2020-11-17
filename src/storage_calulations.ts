export class Provider {
  constructor(
    readonly name: string,
    readonly link: string,
    readonly affiliate_links: string[],
    readonly tiered_plans: TieredPlan[],
    readonly enterprise_tiered_plans: TieredPlan[]
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
  // TODO: Cold vs. hot storage
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

function no_upgrade(constraints: UserInput, plan: TieredPlan, storage: number) {
  if (storage > plan.storage_cap) {
    return Infinity; // Can't buy more storage
  } else {
    return 0;
  }
}

function jottacloud_extra_costs(constraints: UserInput, plan: TieredPlan, storage: number) {
  return Math.max(0, 6.50 * Math.ceil((storage-plan.storage_cap)/1000));
}

const providers = [
  new Provider(
    "1fichier",
    "https://1fichier.com/",
    [
      "https://1fichier.com/tarifs.html?af=3676346"
    ],
    [
      new TieredPlan("Premium", 1, 3.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium", 12, 22.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium", 12*5, 99.00, 2000, fichier_extra_cost, Currency.EUR),
      new TieredPlan("Premium", 12*10, 195.00, 2000, fichier_extra_cost, Currency.EUR),
    ],
    []
  ),
  new Provider(
    "Backblaze",
    "https://www.backblaze.com/b2/cloud-storage-pricing.html",
    [],
    [
      new TieredPlan("B2", 1, 0, 0, backblaze_b2_extra_cost, Currency.USD),
    ],
    []
  ),
  // TODO: Amazon Drive
  // TODO: Amazon S3
  new Provider(
    "Box.com",
    "https://www.box.com/en-gb/pricing/",
    [],
    [
      new TieredPlan("Pro", 1, 9, 100, no_upgrade, Currency.EUR),
    ],
    [
      new TieredPlan("Starter", 1, 6, 100, no_upgrade, Currency.EUR),
      new TieredPlan("Starter", 12, 4.5 * 12, 100, no_upgrade, Currency.EUR),
      // TODO: Box also has "unlimited" plans, but these have a limitation on the number of API calls - should maybe be handled similarly to Amazon S3
    ]
  ),
  // TODO: Citrix ShareFile, also has "unlimited" storage
  new Provider(
    "Dropbox",
    "https://www.dropbox.com/individual/plans-comparison",
    [],
    [
      new TieredPlan("Basic", 1, 0, 2, no_upgrade, Currency.EUR),
      new TieredPlan("Plus", 1, 11.99, 2000, no_upgrade, Currency.EUR),
      // new TieredPlan("Family", 1, 19.99, 2000, no_upgrade, Currency.EUR), // Just allows for more users
      new TieredPlan("Plus", 12, 9.99 * 12, 2000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  // TODO: Google Cloud Storage, like S3 they have a rather complicated pricing model
  new Provider(
    "Google",
    "https://one.google.com/about",
    [],
    [
      new TieredPlan("Free", 1, 0, 15, no_upgrade, Currency.EUR),
      new TieredPlan("100 GB", 1, 1.99, 100, no_upgrade, Currency.EUR),
      new TieredPlan("100 GB", 12, 19.99, 100, no_upgrade, Currency.EUR),
      new TieredPlan("200 GB", 1, 2.99, 200, no_upgrade, Currency.EUR),
      new TieredPlan("200 GB", 12, 29.99, 200, no_upgrade, Currency.EUR),
      new TieredPlan("2TB", 1, 9.99, 2000, no_upgrade, Currency.EUR),
      new TieredPlan("2TB", 12, 99.99, 2000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  new Provider(
    "Jottacloud",
    "https://www.jottacloud.com/en/pricing.html",
    [],
    [
      new TieredPlan("Free", 1, 0, 5, no_upgrade, Currency.EUR),
      new TieredPlan("Personal", 1, 7.5, 5000, no_upgrade, Currency.EUR), // upload speed reduced after 5 TB
      new TieredPlan("Home 1TB", 1, 6.5, 1000, no_upgrade, Currency.EUR),
      new TieredPlan("Home 5TB", 1, 13.5, 5000, no_upgrade, Currency.EUR),
      new TieredPlan("Home 10TB", 1, 49.5, 10000, no_upgrade, Currency.EUR),
      new TieredPlan("Home 20TB", 1, 99.5, 20000, no_upgrade, Currency.EUR),
      // TODO: business plans
    ],
    [
      new TieredPlan("Business Free", 1, 0, 5, no_upgrade, Currency.EUR), // TODO: can you get 1TB for 6.50€ without a plan?
      new TieredPlan("Business Small", 1, 8.99, 1000, jottacloud_extra_costs, Currency.EUR), // The other plans just have more users
    ]
  ),
  new Provider(
    "Koofr",
    "https://koofr.eu/pricing/",
    [],
    [
      new TieredPlan("Starter", 1, 0, 2, no_upgrade, Currency.EUR),
      new TieredPlan("S", 12, 0.5 * 12, 10, no_upgrade, Currency.EUR),
      new TieredPlan("M", 12, 1 * 12, 25, no_upgrade, Currency.EUR),
      new TieredPlan("L", 12, 2 * 12, 100, no_upgrade, Currency.EUR),
      new TieredPlan("XL", 12, 4 * 12, 250, no_upgrade, Currency.EUR),
      new TieredPlan("XXL", 12, 10 * 12, 1000, no_upgrade, Currency.EUR),
      new TieredPlan("XXXL", 12, 20 * 12, 2500, no_upgrade, Currency.EUR),
      new TieredPlan("10XL", 12, 60 * 12, 10000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  // TODO: Mail.ru Cloud
  new Provider(
    "MEGA",
    "https://mega.nz/pro",
    ["https://mega.nz/aff=psp_xBfq_HU"],
    [
      new TieredPlan("Free", 1, 0, 50, no_upgrade, Currency.EUR),
      new TieredPlan("PRO LITE", 1, 4.99, 400, no_upgrade, Currency.EUR),
      new TieredPlan("PRO I", 1, 9.99, 2000, no_upgrade, Currency.EUR),
      new TieredPlan("PRO II", 1, 19.99, 8000, no_upgrade, Currency.EUR),
      new TieredPlan("PRO III", 1, 29.99, 16000, no_upgrade, Currency.EUR),
      new TieredPlan("PRO LITE", 12, 49.99, 400, no_upgrade, Currency.EUR),
      new TieredPlan("PRO I", 12, 99.99, 2000, no_upgrade, Currency.EUR),
      new TieredPlan("PRO II", 12, 199.99, 8000, no_upgrade, Currency.EUR),
      new TieredPlan("PRO III", 12, 299.99, 16000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  // TODO: Memory (??? is this a provider? if so, that's the worst name you could pick)
  // TODO: Microsoft Azure Blob Storage (also not so simple pricing)
  new Provider(
    "Microsoft OneDrive",
    "https://www.microsoft.com/en-us/microsoft-365/onedrive/compare-onedrive-plans",
    [],
    [
      new TieredPlan("Basic", 1, 0, 5, no_upgrade, Currency.EUR),
      new TieredPlan("365 Family", 12, 99, 6000, no_upgrade, Currency.EUR),
      new TieredPlan("365 Single", 12, 69, 1000, no_upgrade, Currency.EUR),
      new TieredPlan("Standalone 100GB", 1, 2, 100, no_upgrade, Currency.EUR),

      new TieredPlan("365 Family", 1, 10, 6000, no_upgrade, Currency.EUR),
      new TieredPlan("365 Single", 1, 7, 1000, no_upgrade, Currency.EUR),

      new TieredPlan("365 Family", 12, 99.99, 6000, no_upgrade, Currency.USD),
      new TieredPlan("365 Single", 12, 69.99, 1000, no_upgrade, Currency.USD),
      new TieredPlan("Standalone 100GB", 1, 1.99, 100, no_upgrade, Currency.USD),

      new TieredPlan("365 Family", 1, 9.99, 6000, no_upgrade, Currency.USD),
      new TieredPlan("365 Single", 1, 6.99, 1000, no_upgrade, Currency.USD),
    ],
    [
      // TODO: business plans
      // Note that you can't disable versioning on business plans
      // so you can't actually use all of the space effectively with rclone
      // as it creates 2 or more versions when creating a file (which each take up the space of the entire file)
    ]
  ),
  new Provider(
    "OpenDrive",
    "https://www.opendrive.com/pricing",
    [],
    [
      new TieredPlan("Personal", 1, 0, 5, no_upgrade, Currency.USD),
      // TODO: another one of those "unlimited" storages
    ],
    []
  ),
  // TODO: OpenStack Swift
  new Provider(
    "pCloud",
    "https://www.pcloud.com/cloud-storage-pricing-plans.html",
    [],
    [
      new TieredPlan("Premium 500GB", 12, 47.88, 500, no_upgrade, Currency.EUR),
      new TieredPlan("Premium Plus 2TB", 12, 95.88, 2000, no_upgrade, Currency.EUR),
      new TieredPlan("Premium 500GB Lifetime", 99 * 12, 175, 500, no_upgrade, Currency.EUR),
      new TieredPlan("Premium Plus 2TB Lifetime", 99 * 12, 350, 2000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  new Provider(
    "Premiumize.me",
    "https://www.premiumize.me/premium",
    [],
    [
      new TieredPlan("", 1, 9.99, 1000, no_upgrade, Currency.EUR),
      new TieredPlan("", 3, 24.99, 1000, no_upgrade, Currency.EUR),
      new TieredPlan("", 12, 69.99, 1000, no_upgrade, Currency.EUR),
    ],
    []
  ),
  new Provider(
    "put.io",
    "https://put.io/plans",
    [],
    [
      new TieredPlan("100 GB", 1, 9.99, 100, no_upgrade, Currency.USD),
      new TieredPlan("1TB", 1, 19.99, 1000, no_upgrade, Currency.USD),
      new TieredPlan("10TB", 1, 49.99, 10000, no_upgrade, Currency.USD),

      new TieredPlan("100 GB", 12, 99, 100, no_upgrade, Currency.USD),
      new TieredPlan("1TB", 12, 199, 1000, no_upgrade, Currency.USD),
      new TieredPlan("10TB", 12, 499, 10000, no_upgrade, Currency.USD),
    ],
    []
  ),
  // TODO: QingStor
  // TODO: Seafile
  new Provider(
    "SugarSync",
    "https://www1.sugarsync.com/pricing/",
    [],
    [
      new TieredPlan("100GB", 1, 7.49, 100, no_upgrade, Currency.USD),
      new TieredPlan("250GB", 1, 9.99, 100, no_upgrade, Currency.USD),
      new TieredPlan("500GB", 1, 18.95, 100, no_upgrade, Currency.USD),
    ],
    []
  ),
  // TODO: Tardigrade https://documentation.tardigrade.io/pricing
  // TODO: Yandex.Disk
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
export function choose_tiered_plan(constraints: UserInput, provider: Provider, storage_for_months: number[]): [Provider, [TieredPlan, number][], number] {
  // console.log(provider);
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
  const plans: Array<[TieredPlan, number]> = [];
  for(let i = backlinks.length - 1; i != 0;) {
    if (plans.length > 0 && plans[plans.length-1][0] === backlinks[i]) {
      plans[plans.length-1][1]++;
    } else {
      plans.push([backlinks[i], 1]);
    }
    // console.log(i, backlinks[i]);
    if (backlinks[i] === undefined) {
      return [provider, [], Infinity];
    }
    i = Math.max(0, i - backlinks[i].months);
  }
  plans.reverse();
  const best_cost = cost_so_far[cost_so_far.length-1];
  return [provider, plans, best_cost];
}

export function compute_plans(constraints: UserInput): [Provider, [TieredPlan, number][], number][] {
  const storage_for_months = compute_storage_requirements(constraints);

  const provider_plans = [];
  for (const provider of providers) {
    provider_plans.push(choose_tiered_plan(constraints, provider, storage_for_months));
  }
  provider_plans.sort((a, b) => b[2] - a[2]); // sort by price, ascending
  provider_plans.reverse();
  return provider_plans;
}