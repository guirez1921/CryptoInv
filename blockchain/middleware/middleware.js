// middleware.js
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const helmet = require('helmet');

// ========== SECURITY MIDDLEWARE ==========

// API Key Authentication (for Laravel communication)
const authenticateAPI = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: Invalid API key'
        });
    }

    next();
};

// Rate limiting
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: 'Too many requests, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// General rate limit
const generalLimiter = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Strict rate limit for sensitive operations
const strictLimiter = createRateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes

// ========== VALIDATION MIDDLEWARE ==========

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Account ID validation
const validateAccountId = [
    param('accountId')
        .isInt({ min: 0 })
        .withMessage('Account ID must be a positive integer'),
    handleValidationErrors
];


// Multi-chain address validation
const MultiChainWalletUtils = require('../utils/walletUtils').MultiChainWalletUtils;
const CHAIN_CONFIG = require('../utils/rcpMap').CHAIN_CONFIG;

const validateAddress = [
    param('address')
        .custom((value, { req }) => {
            // Try to get chain from params or query
            const chain = (req.params.chain || req.body.chain || req.query.chain || 'ethereum').toLowerCase();
            if (!CHAIN_CONFIG[chain]) throw new Error('Unsupported chain');
            if (!MultiChainWalletUtils.validateAddress(value, chain)) {
                throw new Error(`Invalid ${chain} address format`);
            }
            return true;
        }),
    handleValidationErrors
];

// Multi-chain withdrawal validation
const validateWithdrawal = [
    body('amount')
        .custom((value, { req }) => {
            const chain = (req.params.chain || req.body.chain || req.query.chain || 'ethereum').toLowerCase();
            if (!CHAIN_CONFIG[chain]) throw new Error('Unsupported chain');
            const min = CHAIN_CONFIG[chain].minWithdraw || 0.00001;
            const max = CHAIN_CONFIG[chain].maxWithdraw || 1000000;
            if (isNaN(value) || parseFloat(value) < min || parseFloat(value) > max) {
                throw new Error(`Amount must be between ${min} and ${max} ${CHAIN_CONFIG[chain].symbol}`);
            }
            return true;
        }),
    body('toAddress')
        .custom((value, { req }) => {
            const chain = (req.params.chain || req.body.chain || req.query.chain || 'ethereum').toLowerCase();
            if (!CHAIN_CONFIG[chain]) throw new Error('Unsupported chain');
            if (!MultiChainWalletUtils.validateAddress(value, chain)) {
                throw new Error(`Invalid ${chain} address format`);
            }
            return true;
        }),
    handleValidationErrors
];

// Trading amount validation (multi-chain)
const validateTradingAmount = [
    body('amount')
        .custom((value, { req }) => {
            const chain = (req.params.chain || req.body.chain || req.query.chain || 'ethereum').toLowerCase();
            if (!CHAIN_CONFIG[chain]) throw new Error('Unsupported chain');
            const min = CHAIN_CONFIG[chain].minTrade || 0.00001;
            const max = CHAIN_CONFIG[chain].maxTrade || 1000000;
            if (isNaN(value) || parseFloat(value) < min || parseFloat(value) > max) {
                throw new Error(`Trading amount must be between ${min} and ${max} ${CHAIN_CONFIG[chain].symbol}`);
            }
            return true;
        }),
    handleValidationErrors
];

// Transaction ID validation
const validateTransactionId = [
    param('transactionId')
        .isInt({ min: 1 })
        .withMessage('Transaction ID must be a positive integer'),
    handleValidationErrors
];

// Wallet type validation
const validateWalletType = [
    body('type')
        .optional()
        .isIn(['spot', 'trading', 'savings'])
        .withMessage('Wallet type must be spot, trading, or savings'),
    handleValidationErrors
];

// ========== LOGGING MIDDLEWARE ==========

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };

        console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} - ${logData.status} - ${logData.duration}`);
    });

    next();
};

// ========== ERROR HANDLING MIDDLEWARE ==========

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Ethereum/Web3 errors
    if (err.code === 'INSUFFICIENT_FUNDS') {
        return res.status(400).json({
            success: false,
            error: 'Insufficient funds for transaction'
        });
    }

    if (err.code === 'NETWORK_ERROR') {
        return res.status(503).json({
            success: false,
            error: 'Network error, please try again later'
        });
    }

    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            success: false,
            error: 'Duplicate entry'
        });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({
            success: false,
            error: 'Referenced record not found'
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
};

// ========== EXPORT MIDDLEWARE ========== 

module.exports = {
    // Security
    authenticateAPI,
    helmet: helmet(),
    generalLimiter,
    strictLimiter,

    // Validation
    validateAccountId,
    validateAddress,
    validateWithdrawal,
    validateTradingAmount,
    validateTransactionId,
    validateWalletType,
    handleValidationErrors,

    // Utilities
    requestLogger,
    asyncHandler,
    errorHandler
};