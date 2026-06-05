"use strict";
/**
 * @file index.ts
 * @package @verisphere/shared-types
 * @purpose Defines the shared TypeScript interfaces, enums, types, and DTOs used across frontend (web) and backend (api).
 * @dependencies None (pure TypeScript contract file)
 * @security Consider scrubbing PII (e.g. candidate name, raw emails) before transmitting logs containing these payloads.
 * @future_implementation Include runtime validators (like Zod or io-ts) generated from these interfaces.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileType = exports.RiskLevel = exports.VerificationStatus = void 0;
// --- ENUMS ---
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["QUEUED"] = "QUEUED";
    VerificationStatus["DOWNLOADING"] = "DOWNLOADING";
    VerificationStatus["EXTRACTING"] = "EXTRACTING";
    VerificationStatus["ANALYZING"] = "ANALYZING";
    VerificationStatus["COMPLETED"] = "COMPLETED";
    VerificationStatus["FAILED"] = "FAILED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["CRITICAL"] = "CRITICAL";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var FileType;
(function (FileType) {
    FileType["RESUME"] = "RESUME";
    FileType["CERTIFICATE"] = "CERTIFICATE";
})(FileType || (exports.FileType = FileType = {}));
__exportStar(require("./forensics"), exports);
//# sourceMappingURL=index.js.map