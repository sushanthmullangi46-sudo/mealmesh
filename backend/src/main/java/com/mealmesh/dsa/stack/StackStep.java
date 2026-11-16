package com.mealmesh.dsa.stack;

import java.util.ArrayList;
import java.util.List;

public class StackStep {
    private int stepNumber;
    private String operation; // "PUSH", "POP", "PEEK"
    private String itemLabel;
    private String description;
    private List<String> currentStack;

    public StackStep() {
        this.currentStack = new ArrayList<>();
    }

    public StackStep(int stepNumber, String operation, String itemLabel, String description, List<String> currentStack) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.itemLabel = itemLabel;
        this.description = description;
        this.currentStack = currentStack != null ? new ArrayList<>(currentStack) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getItemLabel() {
        return itemLabel;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getCurrentStack() {
        return currentStack;
    }
}
