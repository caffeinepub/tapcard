import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    username : Text;
    name : Text;
    company : Text;
    phone : Text;
    email : Text;
    website : Text;
    bio : Text;
    photoUrl : Text;
    linkedIn : Text;
    instagram : Text;
    whatsapp : Text;
  };

  public type AnalyticsEntry = {
    timestamp : Time.Time;
    deviceType : {
      #mobile;
      #desktop;
      #unknown;
    };
    country : Text;
    source : {
      #nfc;
      #qr;
      #direct;
    };
  };

  module AnalyticsEntry {
    public func compareByTime(_entry1 : AnalyticsEntry, _entry2 : AnalyticsEntry) : Order.Order {
      if (_entry1.timestamp < _entry2.timestamp) { #greater } else if (_entry1.timestamp > _entry2.timestamp) {
        #less;
      } else { #equal };
    };
  };

  public type Lead = {
    name : Text;
    phone : Text;
    email : Text;
    capturedAt : Time.Time;
  };

  module Lead {
    public func compareByTime(_lead1 : Lead, _lead2 : Lead) : Order.Order {
      if (_lead1.capturedAt < _lead2.capturedAt) { #greater } else if (_lead1.capturedAt > _lead2.capturedAt) {
        #less;
      } else { #equal };
    };
  };

  let profiles = Map.empty<Text, UserProfile>();
  let analytics = Map.empty<Text, [AnalyticsEntry]>();
  let leads = Map.empty<Text, [Lead]>();
  let usernameOwners = Map.empty<Text, Principal>();
  let principalUsernames = Map.empty<Principal, Text>();

  public shared ({ caller }) func createOrUpdateProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (usernameOwners.get(profile.username)) {
      case (?owner) {
        if (owner.notEqual(caller)) {
          Runtime.trap("Unauthorized: You can only update your own profile");
        };
        profiles.add(profile.username, profile);
      };
      case (null) {
        Runtime.trap("Username does not exist. Use createProfile to create a new profile");
      };
    };
  };

  public shared ({ caller }) func createProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (profiles.containsKey(profile.username)) {
      Runtime.trap("Username already exists");
    };

    switch (principalUsernames.get(caller)) {
      case (?existingUsername) {
        Runtime.trap("You already have a profile with username: " # existingUsername);
      };
      case (null) {
        profiles.add(profile.username, profile);
        analytics.add(profile.username, []);
        leads.add(profile.username, []);
        usernameOwners.add(profile.username, caller);
        principalUsernames.add(caller, profile.username);
      };
    };
  };

  public query ({ caller }) func getPublicProfile(username : Text) : async UserProfile {
    switch (profiles.get(username)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func logProfileView(username : Text, deviceType : { #mobile; #desktop; #unknown }, country : Text, source : {
    #nfc;
    #qr;
    #direct;
  }) : async () {
    switch (profiles.get(username)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?_) {
        let entry : AnalyticsEntry = {
          timestamp = Time.now();
          deviceType;
          country;
          source;
        };
        let currentEntries = switch (analytics.get(username)) {
          case (null) { [] };
          case (?array) { array };
        };
        let newEntries = currentEntries.concat([entry]);
        analytics.add(username, newEntries);
      };
    };
  };

  public shared ({ caller }) func submitLead(username : Text, name : Text, phone : Text, email : Text) : async () {
    switch (profiles.get(username)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?_) {
        let lead : Lead = {
          name;
          phone;
          email;
          capturedAt = Time.now();
        };
        let currentLeads = switch (leads.get(username)) {
          case (null) { [] };
          case (?array) { array };
        };
        let newLeads = currentLeads.concat([lead]);
        leads.add(username, newLeads);
      };
    };
  };

  public query ({ caller }) func getAnalytics(username : Text) : async [AnalyticsEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view analytics");
    };

    switch (usernameOwners.get(username)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?owner) {
        if (owner.notEqual(caller)) {
          Runtime.trap("Unauthorized: You can only view your own analytics");
        };
        switch (analytics.get(username)) {
          case (null) { [] };
          case (?entries) { entries.sort(AnalyticsEntry.compareByTime) };
        };
      };
    };
  };

  public query ({ caller }) func getLeads(username : Text) : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view leads");
    };

    switch (usernameOwners.get(username)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?owner) {
        if (owner.notEqual(caller)) {
          Runtime.trap("Unauthorized: You can only view your own leads");
        };
        switch (leads.get(username)) {
          case (null) { [] };
          case (?entries) { entries.sort(Lead.compareByTime) };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (principalUsernames.get(caller)) {
      case (null) { null };
      case (?username) { profiles.get(username) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (principalUsernames.get(caller)) {
      case (null) {
        await createProfile(profile);
      };
      case (?existingUsername) {
        if (existingUsername.notEqual(profile.username)) {
          Runtime.trap("Cannot change username. Current username: " # existingUsername);
        };
        await createOrUpdateProfile(profile);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (principalUsernames.get(user)) {
      case (null) { null };
      case (?username) { profiles.get(username) };
    };
  };
};
