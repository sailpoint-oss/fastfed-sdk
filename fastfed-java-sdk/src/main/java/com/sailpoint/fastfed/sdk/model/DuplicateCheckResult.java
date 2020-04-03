package com.sailpoint.fastfed.sdk.model;

public class DuplicateCheckResult {
    private boolean isProvisioningDuplicate;
    private boolean isAuthenticationDuplicate;

    public boolean isProvisioningDuplicate() {
        return isProvisioningDuplicate;
    }

    public boolean isAuthenticationDuplicate() {
        return isAuthenticationDuplicate;
    }

    public DuplicateCheckResult(boolean isProvisioningDuplicate, boolean isAuthenticationDuplicate) {
        this.isProvisioningDuplicate = isProvisioningDuplicate;
        this.isAuthenticationDuplicate = isAuthenticationDuplicate;
    }
}
