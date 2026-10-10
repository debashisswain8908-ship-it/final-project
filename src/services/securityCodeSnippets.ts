export interface CodeSnippet {
  language: 'cpp' | 'java';
  fileName: string;
  title: string;
  description: string;
  code: string;
}

export const SECURITY_CODE_SNIPPETS: CodeSnippet[] = [
  {
    language: 'cpp',
    fileName: 'BrsrSecurityEngine.hpp',
    title: 'C++ Modern Cryptographic Data Sealing Engine (C++20)',
    description: 'High-performance C++ implementation enforcing strict memory bounds, constant-time validation, OpenSSL SHA-256 hashing, and Merkle root tamper verification for corporate ESG disclosures.',
    code: `/**
 * @file BrsrSecurityEngine.hpp
 * @brief High-Assurance C++20 Cryptographic Sealing & Verification Engine for BRSR ESG Reports
 * @standard SEBI BRSR Core / ISO 14064 GHG Assurance / FIPS 180-4 SHA-256
 */

#ifndef BRSR_SECURITY_ENGINE_HPP
#define BRSR_SECURITY_ENGINE_HPP

#include <iostream>
#include <string>
#include <vector>
#include <array>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/crypto.h>

namespace brsr::security {

enum class UserRole {
    PublicViewer,
    CorporateReporter,
    LeadAnalyst,
    BoardAuditor
};

struct SectionA_GeneralDisclosures {
    std::string cin;
    double turnoverCr;
    double netProfitCr;
    int totalEmployees;
    int femaleEmployees;
    int operatingPlants;
};

struct SectionC_EnvironmentalMetrics {
    double scope1EmissionsMtCo2e;
    double scope2EmissionsMtCo2e;
    double totalEnergyMwh;
    double renewableEnergyPercent;
    double waterWithdrawalKl;
    double waterRecycledKl;
};

class BrsrSecurityEngine {
public:
    BrsrSecurityEngine() = default;

    /**
     * @brief Computes SHA-256 hash using OpenSSL EVP with strict memory cleanup
     */
    static std::string computeSha256(const std::string& input) {
        EVP_MD_CTX* ctx = EVP_MD_CTX_new();
        if (!ctx) throw std::runtime_error("Failed to initialize OpenSSL EVP context");

        std::array<unsigned char, EVP_MAX_MD_SIZE> hashBuffer{};
        unsigned int hashLen = 0;

        if (1 != EVP_DigestInit_ex(ctx, EVP_sha256(), nullptr) ||
            1 != EVP_DigestUpdate(ctx, input.data(), input.size()) ||
            1 != EVP_DigestFinal_ex(ctx, hashBuffer.data(), &hashLen)) {
            EVP_MD_CTX_free(ctx);
            throw std::runtime_error("Cryptographic hash computation failed");
        }
        EVP_MD_CTX_free(ctx);

        std::ostringstream hexStream;
        for (unsigned int i = 0; i < hashLen; ++i) {
            hexStream << std::hex << std::setw(2) << std::setfill('0') 
                      << static_cast<int>(hashBuffer[i]);
        }
        return hexStream.str();
    }

    /**
     * @brief Authorizes data modification based on Role-Based Access Control (RBAC)
     */
    static bool canModifyData(UserRole role) {
        // Public viewers are strictly disallowed from modifying records
        return (role == UserRole::CorporateReporter || role == UserRole::LeadAnalyst);
    }

    /**
     * @brief Authorizes analytical recalibration and factor adjustments
     */
    static bool canPerformAnalystRecalibration(UserRole role) {
        return (role == UserRole::LeadAnalyst);
    }

    /**
     * @brief Builds Merkle Tree Root across Section A, B, and C
     */
    static std::string calculateMerkleRoot(
        const std::string& hashSectionA,
        const std::string& hashSectionB,
        const std::string& hashSectionC
    ) {
        std::string combinedPayload = hashSectionA + ":" + hashSectionB + ":" + hashSectionC;
        return computeSha256(combinedPayload);
    }

    /**
     * @brief Constant-time verification to defeat side-channel timing attacks
     */
    static bool verifyRecordIntegrity(const std::string& calculatedHash, const std::string& sealedHash) {
        if (calculatedHash.length() != sealedHash.length()) return false;
        return CRYPTO_memcmp(calculatedHash.data(), sealedHash.data(), calculatedHash.length()) == 0;
    }
};

} // namespace brsr::security

#endif // BRSR_SECURITY_ENGINE_HPP`
  },
  {
    language: 'java',
    fileName: 'BRSRDataSecurityEngine.java',
    title: 'Java Enterprise ESG Security & Cryptographic Verifier (Java 17/21)',
    description: 'Enterprise Java implementation using java.security, MessageDigest, and immutable record types to enforce RBAC, audit log sealing, and SEBI compliance verification.',
    code: `package com.corporate.esg.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Objects;

/**
 * Enterprise BRSR Security and Cryptographic Sealing Engine.
 * Enforces role-based permissions, SHA-256 tamper checks, and audit trails.
 */
public final class BRSRDataSecurityEngine {

    public enum UserRole {
        PUBLIC_VIEWER(false, false),
        CORPORATE_REPORTER(true, false),
        LEAD_ANALYST(true, true),
        BOARD_AUDITOR(false, false);

        private final boolean canEditData;
        private final boolean canAdjustAnalytics;

        UserRole(boolean canEditData, boolean canAdjustAnalytics) {
            this.canEditData = canEditData;
            this.canAdjustAnalytics = canAdjustAnalytics;
        }

        public boolean canEditData() { return canEditData; }
        public boolean canAdjustAnalytics() { return canAdjustAnalytics; }
    }

    public record AuditLogEntry(
        String recordId,
        Instant timestamp,
        String actorId,
        UserRole actorRole,
        String sectionKey,
        String metricKey,
        String oldValue,
        String newValue,
        String cryptographicHash
    ) {
        public AuditLogEntry {
            Objects.requireNonNull(recordId, "recordId cannot be null");
            Objects.requireNonNull(cryptographicHash, "hash cannot be null");
        }
    }

    /**
     * Computes deterministic SHA-256 digest in hex format
     */
    public static String calculateSha256(String canonicalJsonPayload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(canonicalJsonPayload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable in JVM runtime", e);
        }
    }

    /**
     * Validates permission before modifying corporate ESG disclosure
     */
    public static void validateMutationPermission(UserRole role, String operation) {
        if (!role.canEditData()) {
            throw new SecurityException("Unauthorized: Role " + role + " cannot execute " + operation);
        }
    }

    /**
     * Constructs a tamper-evident cryptographic seal for an audit entry
     */
    public static AuditLogEntry createSealedEntry(
        String actorId,
        UserRole role,
        String section,
        String metric,
        String oldVal,
        String newVal
    ) {
        validateMutationPermission(role, "UPDATE_ESG_METRIC");

        Instant now = Instant.now();
        String payloadToSeal = String.join("|",
            now.toString(),
            actorId,
            role.name(),
            section,
            metric,
            oldVal,
            newVal
        );

        String hash = calculateSha256(payloadToSeal);
        String id = "AUD-" + System.currentTimeMillis() + "-" + hash.substring(0, 8);

        return new AuditLogEntry(id, now, actorId, role, section, metric, oldVal, newVal, hash);
    }

    /**
     * Verifies if an audit entry has been tampered with in memory or transit
     */
    public static boolean verifyEntryIntegrity(AuditLogEntry entry) {
        String reconstructedPayload = String.join("|",
            entry.timestamp().toString(),
            entry.actorId(),
            entry.actorRole().name(),
            entry.sectionKey(),
            entry.metricKey(),
            entry.oldValue(),
            entry.newValue()
        );
        String calculated = calculateSha256(reconstructedPayload);
        return MessageDigest.isEqual(
            calculated.getBytes(StandardCharsets.UTF_8),
            entry.cryptographicHash().getBytes(StandardCharsets.UTF_8)
        );
    }
}
`
  }
];
