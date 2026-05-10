// 1. Énumération des statuts possibles d'un match selon le Swagger
export var EGameStatus;
(function (EGameStatus) {
    EGameStatus["CREATED"] = "created";
    EGameStatus["SCHEDULED"] = "scheduled";
    EGameStatus["STARTED"] = "started";
    EGameStatus["FINISHED"] = "finished";
    EGameStatus["CANCELLED"] = "cancelled";
})(EGameStatus || (EGameStatus = {}));
