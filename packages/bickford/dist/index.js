"use strict";
/**
 * @bickfordd-bit/bickford
 *
 * Bickford Intelligence Engine - Intent-to-Reality acceleration framework
 * with unified AI agent system.
 *
 * @copyright Bickford Technologies LLC
 * @patent US Provisional Patent Filed 2025
 * @license PROPRIETARY - All Rights Reserved
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATENT_STATUS = exports.FORMULA_VERSION = exports.BICKFORD_VERSION = exports.buildModePrompt = exports.buildUnifiedAgentPrompt = exports.UNIFIED_AGENT_ID = exports.formatBickfordModeSummary = exports.formatBickfordKnowledgePackage = exports.BICKFORD_KNOWLEDGE_PACKAGE = exports.createBickfordEngine = exports.BickfordIntelligenceEngine = void 0;
// Core engine
var engine_1 = require("./engine");
Object.defineProperty(exports, "BickfordIntelligenceEngine", { enumerable: true, get: function () { return engine_1.BickfordIntelligenceEngine; } });
Object.defineProperty(exports, "createBickfordEngine", { enumerable: true, get: function () { return engine_1.createBickfordEngine; } });
// Knowledge base
var knowledge_1 = require("./knowledge");
Object.defineProperty(exports, "BICKFORD_KNOWLEDGE_PACKAGE", { enumerable: true, get: function () { return knowledge_1.BICKFORD_KNOWLEDGE_PACKAGE; } });
Object.defineProperty(exports, "formatBickfordKnowledgePackage", { enumerable: true, get: function () { return knowledge_1.formatBickfordKnowledgePackage; } });
Object.defineProperty(exports, "formatBickfordModeSummary", { enumerable: true, get: function () { return knowledge_1.formatBickfordModeSummary; } });
// Unified agent
var agent_1 = require("./agent");
Object.defineProperty(exports, "UNIFIED_AGENT_ID", { enumerable: true, get: function () { return agent_1.UNIFIED_AGENT_ID; } });
Object.defineProperty(exports, "buildUnifiedAgentPrompt", { enumerable: true, get: function () { return agent_1.buildUnifiedAgentPrompt; } });
Object.defineProperty(exports, "buildModePrompt", { enumerable: true, get: function () { return agent_1.buildModePrompt; } });
// Version and metadata
exports.BICKFORD_VERSION = '1.0.0';
exports.FORMULA_VERSION = 'BICKFORD_V1.0_PROPRIETARY';
exports.PATENT_STATUS = 'US_PROVISIONAL_PATENT_FILED_2025';
//# sourceMappingURL=index.js.map