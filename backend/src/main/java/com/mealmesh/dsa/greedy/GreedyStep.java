package com.mealmesh.dsa.greedy;

import java.util.ArrayList;
import java.util.List;

public class GreedyStep {
    private int stepNumber;
    private String operation; // "EVALUATE_CANDIDATE", "ALLOCATE", "CAPACITY_EXCEEDED", "COMPLETE"
    private String ngoId;
    private String ngoName;
    private double compositeScore;
    private double allocatedKg;
    private double remainingDonationKg;
    private String rationale;

    public GreedyStep() {}

    public GreedyStep(int stepNumber, String operation, String ngoId, String ngoName, double compositeScore,
                      double allocatedKg, double remainingDonationKg, String rationale) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.compositeScore = compositeScore;
        this.allocatedKg = allocatedKg;
        this.remainingDonationKg = remainingDonationKg;
        this.rationale = rationale;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getNgoId() {
        return ngoId;
    }

    public String getNgoName() {
        return ngoName;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public double getAllocatedKg() {
        return allocatedKg;
    }

    public double getRemainingDonationKg() {
        return remainingDonationKg;
    }

    public String getRationale() {
        return rationale;
    }
}
