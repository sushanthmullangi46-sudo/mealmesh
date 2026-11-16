package com.mealmesh.dsa.unionfind;

import java.util.ArrayList;
import java.util.List;

public class DsuStep {
    private int stepNumber;
    private String operation; // "FIND", "UNION", "COMPONENT_CHECK"
    private String elementA;
    private String elementB;
    private String description;
    private int componentCount;
    private List<String> roots;

    public DsuStep() {
        this.roots = new ArrayList<>();
    }

    public DsuStep(int stepNumber, String operation, String elementA, String elementB, String description, int componentCount, List<String> roots) {
        this.stepNumber = stepNumber;
        this.operation = operation;
        this.elementA = elementA;
        this.elementB = elementB;
        this.description = description;
        this.componentCount = componentCount;
        this.roots = roots != null ? new ArrayList<>(roots) : new ArrayList<>();
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public String getOperation() {
        return operation;
    }

    public String getElementA() {
        return elementA;
    }

    public String getElementB() {
        return elementB;
    }

    public String getDescription() {
        return description;
    }

    public int getComponentCount() {
        return componentCount;
    }

    public List<String> getRoots() {
        return roots;
    }
}
