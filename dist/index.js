class Provider {
    constructor(name, link, affiliate_links, tiered_plans) {
        this.name = name;
        this.link = link;
        this.affiliate_links = affiliate_links;
        this.tiered_plans = tiered_plans;
    }
}
var Currency;
(function (Currency) {
    Currency[Currency["EUR"] = 0] = "EUR";
    Currency[Currency["USD"] = 1] = "USD";
})(Currency || (Currency = {}));
class UserInput {
    constructor(months, currency, initial_upload, upload_mo, delete_mo, download_mo, enterprise) {
        this.months = months;
        this.currency = currency;
        this.initial_upload = initial_upload;
        this.upload_mo = upload_mo;
        this.delete_mo = delete_mo;
        this.download_mo = download_mo;
        this.enterprise = enterprise;
    }
}
class TieredPlan {
    constructor(name, months, cost, storage_cap, extra_cost, currency) {
        this.name = name;
        this.months = months;
        this.cost = cost;
        this.storage_cap = storage_cap;
        this.extra_cost = extra_cost;
        this.currency = currency;
    }
}
function fichier_extra_cost(plan, storage) {
    if (storage < 100 * 1000) { // Less than 100 TB
        return Math.max(0, Math.floor((storage - 2000) / 1000) * 100);
    }
    else {
        return Infinity;
    }
}
function sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}
var providers = [
    new Provider("1fichier", "https://1fichier.com/", [
        "https://1fichier.com/tarifs.html?af=3676346"
    ], [
        new TieredPlan("Premium 1 month", 1, 300, 2000, fichier_extra_cost, Currency.EUR),
        new TieredPlan("Premium 1 year", 12, 2200, 2000, fichier_extra_cost, Currency.EUR),
        new TieredPlan("Premium 5 years", 12 * 5, 9900, 2000, fichier_extra_cost, Currency.EUR),
        new TieredPlan("Premium 10 years", 12 * 10, 19500, 2000, fichier_extra_cost, Currency.EUR),
    ])
];
function compute_storage_requirements(constraints) {
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
function choose_tiered_plan(provider, storage_for_months, constraints) {
    let cost_so_far = new Array(constraints.months + 1).fill(Infinity);
    let backlinks = new Array(constraints.months + 1); // Which plan we took
    cost_so_far[0] = 0;
    for (let i = 1; i <= constraints.months; ++i) {
        for (let plan of provider.tiered_plans) {
            if (plan.months > i) {
                continue;
            }
            let extra_cost = 0;
            for (let m = i - plan.months; m < i; ++m) {
                extra_cost += plan.extra_cost(plan, storage_for_months[m]);
            }
            let cost_this_plan = cost_so_far[i - plan.months] + plan.cost + extra_cost;
            if (cost_this_plan < cost_so_far[i]) {
                cost_so_far[i] = cost_this_plan;
                backlinks[i] = plan;
            }
        }
    }
    // Find the cheapest plan: follow the backlinks
    let plans = [];
    for (let i = backlinks.length - 1; i != 0; i -= backlinks[i].months) {
        plans.push(backlinks[i]);
    }
    plans.reverse();
    let best_cost = cost_so_far[cost_so_far.length - 1];
    return [provider, plans, best_cost];
}
function recompute() {
    let months = parseFloat(document.getElementById("months").value);
    let currency = Currency[document.getElementById("currency").value];
    let initial_upload = parseFloat(document.getElementById("initial_upload").value);
    let download_mo = parseFloat(document.getElementById("download").value);
    let upload_mo = parseFloat(document.getElementById("upload").value);
    let delete_mo = parseFloat(document.getElementById("delete").value);
    let enterprise = document.getElementById("enterprise").value === "on";
    let constraints = new UserInput(months, currency, initial_upload, upload_mo, delete_mo, download_mo, enterprise);
    let storage_for_months = compute_storage_requirements(constraints);
    let provider_plans = [];
    for (let provider of providers) {
        provider_plans.push(choose_tiered_plan(provider, storage_for_months, constraints));
    }
    provider_plans.sort((a, b) => a[1] - b[1]); // sort by price, decending
    let results_table = document.getElementById("results");
    results_table.innerHTML = '';
    for (let [provider, plans, cost] of provider_plans) {
        let row = results_table.insertRow(0);
        row.insertCell().appendChild(document.createTextNode(provider.name));
        row.insertCell().appendChild(document.createTextNode(plans.map(x => x.name)));
        row.insertCell().appendChild(document.createTextNode(cost.toString()));
    }
}
