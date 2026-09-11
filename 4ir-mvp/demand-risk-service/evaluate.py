import json
from pathlib import Path

from app.main import DemandRiskRequest, assess_demand_risk


def main() -> None:
    dataset_path = Path(__file__).parent / "sample-data" / "evaluation-cases.json"
    cases = json.loads(dataset_path.read_text(encoding="utf-8"))
    correct = 0
    for case in cases:
        outcome = assess_demand_risk(DemandRiskRequest.model_validate(case["request"]))
        matched = outcome.risk_level == case["expected_risk"]
        correct += matched
        print(f"{case['name']}: expected={case['expected_risk']}, actual={outcome.risk_level}, passed={matched}")
    print(f"Risk classification accuracy: {correct}/{len(cases)} ({correct / len(cases):.0%})")
    if correct != len(cases):
        raise SystemExit(1)


if __name__ == "__main__":
    main()