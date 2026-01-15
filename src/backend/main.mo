import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";

actor {
  type GoalType = {
    #timeBased : Nat;
    #taskBased : Nat;
  };

  type Subject = {
    id : Text;
    name : Text;
    color : Text;
    creationDate : Int;
  };

  type StudySession = {
    subjectId : Text;
    duration : Nat;
    startTime : Int;
    endTime : Int;
    date : Int;
  };

  module Subject {
    public func compare(subject1 : Subject, subject2 : Subject) : Order.Order {
      Text.compare(subject1.name, subject2.name);
    };
  };

  let subjects = Map.empty<Text, Subject>();
  let sessions = Map.empty<Int, StudySession>();
  var currentGoal : ?GoalType = null;

  public shared ({ caller }) func setDailyGoal(goal : GoalType) : async () {
    currentGoal := ?goal;
  };

  public query ({ caller }) func getDailyGoal() : async ?GoalType {
    currentGoal;
  };

  public shared ({ caller }) func setTimeBasedGoal(hours : Nat) : async () {
    currentGoal := ?(
      #timeBased hours
    );
  };

  public shared ({ caller }) func setTaskBasedGoal(tasks : Nat) : async () {
    currentGoal := ?(
      #taskBased tasks
    );
  };

  public shared ({ caller }) func addSubject(id : Text, name : Text, color : Text) : async () {
    if (subjects.containsKey(id)) { Runtime.trap("مضمون پہلے سے موجود ہے") };
    let subject : Subject = {
      id;
      name;
      color;
      creationDate = Time.now();
    };
    subjects.add(id, subject);
  };

  public shared ({ caller }) func editSubject(id : Text, name : Text, color : Text) : async () {
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("مضمون نہیں ملا") };
      case (?existing) {
        let updated : Subject = {
          id;
          name;
          color;
          creationDate = existing.creationDate;
        };
        subjects.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func removeSubject(id : Text) : async () {
    if (not subjects.containsKey(id)) { Runtime.trap("مضمون نہیں ملا") };
    subjects.remove(id);
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    subjects.values().toArray().sort();
  };

  public shared ({ caller }) func recordSession(session : StudySession) : async () {
    let sessionId = Int.abs(Time.now());
    sessions.add(sessionId, session);
  };

  public query ({ caller }) func getStudySessions() : async [StudySession] {
    sessions.values().toArray();
  };

  public query ({ caller }) func getWeeklySessions(weekStart : Int, weekEnd : Int) : async [StudySession] {
    let allSessions = sessions.values().toArray();
    let filtered = allSessions.filter(
      func(s) {
        s.date >= weekStart and s.date <= weekEnd
      }
    );
    filtered;
  };

  public query ({ caller }) func getSubjectSessions(subjectId : Text) : async [StudySession] {
    let allSessions = sessions.values().toArray();
    let filtered = allSessions.filter(
      func(s) {
        s.subjectId == subjectId
      }
    );
    filtered;
  };
};
