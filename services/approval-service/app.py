from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Approval Service")

class Submission(BaseModel):
    id: int
    supplier_id: int
    product_name: str
    category: str
    price: float
    description: str
    stock: int
    status: str = "pending"
    rejection_reason: str = ""

submissions: List[Submission] = []
submission_counter = 1

@app.get("/submissions", response_model=List[Submission])
def list_submissions(status: str = None):
    if status:
        return [s for s in submissions if s.status == status]
    return submissions

@app.post("/submissions", response_model=Submission)
def submit_product(submission: Submission):
    global submission_counter
    submission.id = submission_counter
    submission_counter += 1
    submissions.append(submission)
    return submission

@app.put("/submissions/{submission_id}/approve", response_model=Submission)
def approve_submission(submission_id: int):
    for submission in submissions:
        if submission.id == submission_id:
            submission.status = "approved"
            submission.rejection_reason = ""
            return submission
    raise HTTPException(status_code=404, detail="Submission not found")

@app.put("/submissions/{submission_id}/reject", response_model=Submission)
def reject_submission(submission_id: int, reason: str):
    for submission in submissions:
        if submission.id == submission_id:
            submission.status = "rejected"
            submission.rejection_reason = reason
            return submission
    raise HTTPException(status_code=404, detail="Submission not found")
