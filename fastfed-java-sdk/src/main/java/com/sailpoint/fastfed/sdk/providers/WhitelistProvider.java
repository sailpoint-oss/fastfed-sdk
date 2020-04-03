package com.sailpoint.fastfed.sdk.providers;

import com.sailpoint.fastfed.sdk.exception.WhitelistedException;
import com.sailpoint.fastfed.sdk.model.WhitelistRecord;

public interface WhitelistProvider {
    WhitelistRecord get(String entityId) throws WhitelistedException;
    void add(WhitelistRecord whitelistRecord) throws WhitelistedException;
    void update(WhitelistRecord whitelistRecord) throws WhitelistedException;
    void remove(String entityId) throws WhitelistedException;
}
