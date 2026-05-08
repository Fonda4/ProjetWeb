// different roles of users in our system
export var EROLES;
(function (EROLES) {
    EROLES["ADMIN"] = "admin";
    EROLES["PLAYER"] = "player";
    EROLES["REFEREE"] = "referee";
    EROLES["TRAINER"] = "trainer";
})(EROLES || (EROLES = {}));
// status of a user (active or inactive)
export var EUserStatus;
(function (EUserStatus) {
    EUserStatus["ACTIVE"] = "active";
    EUserStatus["INACTIVE"] = "inactive";
})(EUserStatus || (EUserStatus = {}));
