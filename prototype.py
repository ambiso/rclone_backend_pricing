#!/usr/bin/env python3

from dataclasses import dataclass
from enum import Enum
from typing import List, Callable
import math

class Currency(Enum):
    EUR = 1
    USD = 2


@dataclass
class UserInput:
    months: int
    currency: Currency
    initial_upload: int
    upload: int
    delete: int
    download: int
    business: bool


@dataclass
class TieredPlan:
    name: str
    months: int
    price: int
    storage_cap: int
    extra_cost: Callable[[int], int] # If the storage_cap is too low, extra storage can be purchased for the price returned by this function
    currency: Currency


def compute_storage(constraints: UserInput) -> List[int]:
    """
    Computes how much storage is required in each month
    """
    current = constraints.initial_upload
    storage = []
    for _ in range(constraints.months):
        current += constraints.upload - constraints.delete # Pay for the storage that is needed by the end of the month
        storage.append(current)
    return storage


def choose_tiered_plan(plans: List[TieredPlan], storage: List[int], constraints: UserInput):
        """
        For now just use a very simple heuristic:
        Choose the cheapest plan that is shorter than constraints.month
        and can accommodate the storage required at all.
        """
        max_storage = max(storage)
        available_plans = []
        for plan in plans:
            if plan.storage_cap < max_storage and plan.extra_cost is None:
                continue
            if plan.months > constraints.months:
                continue
            available_plans.append(plan)

        best_plan = None
        best_cost = math.inf
        for plan in available_plans:
            # Compute the cost under this plan
            cost = 0
            months_remaining = 0
            for s in storage:
                if months_remaining == 0:
                    months_remaining = plan.months
                    cost += plan.price
                if plan.storage_cap > s:
                    cost += plan.extra_cost(s)
                months_remaining -= 1
                
            if cost < best_cost:
                best_plan = plan
                best_cost = cost
        return best_plan, best_cost


def fichier_extra_cost(s: int):
    # For now we just assume all storage is cold
    if s > 2000:
        return (s-2000)//1000*100
    else:
        return 0


@dataclass
class Provider:
    name: str
    link: str
    tiered_plans: List[TieredPlan]
    #business_plans: List[]

if __name__ == '__main__':
    providers = [
        Provider("1fichier", "https://1fichier.com/tarifs.html", [
            TieredPlan("Premium 1 month", 1, 300, 2000, fichier_extra_cost, Currency.EUR),
            TieredPlan("Premium 1 year", 12, 2200, 2000, fichier_extra_cost, Currency.EUR),
            TieredPlan("Premium 5 years", 12*5, 9900, 2000, fichier_extra_cost, Currency.EUR),
            TieredPlan("Premium 10 years", 12*10, 19500, 2000, fichier_extra_cost, Currency.EUR),
        ])
    ]

    for months in [1, 2, 3, 12, 13, 14, 15, 24, 25, 12*5, 12*5+1, 12*10, 12*10+1, 12*20, 12*20+1]:
        constraints = UserInput(
            months=months,
            currency=Currency.EUR,
            initial_upload=800,
            upload=250,
            delete=250,
            download=400,
            business=False,
        )
        storage = compute_storage(constraints)
        plan, cost = choose_tiered_plan(providers[0].tiered_plans, storage, constraints)
        print(months, max(storage), repr(plan.name), cost)
