import { body, validationResult } from "express-validator";

export const validateSearchReservation = (req, res, next) => {
    const { email, fullName } = req.query;

    if (!email?.trim() && !fullName?.trim()) {
        return res.status(400).json({
            errors: ["At least one of email/fullName is required"]
        });
    }

    next();
};

export const validateSearchReservation = [
    param("id")
        .notEmpty()
        .withMessage("Id is required")
        .isInt({ min: 0 })
        .withMessage("Hotel ID must be a non-negative integer"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateSaveReservation = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 chars long"),

    body("email").trim().isEmail().withMessage("Invalid email address"),

    body("hotelId")
        .notEmpty()
        .withMessage("Hotel ID is required")
        .isInt({ min: 0 })
        .withMessage("Hotel ID must be a non-negative integer"),

    body("hotelName").optional,

    body("checkIn")
        .isISO8601()
        .withMessage("Check-in must be a valid date")
        .toDate()
        .custom((value) => {
            const now = new Date();
            if (value.getTime() <= now.getTime()) {
                throw new Error("Check-in date must be in the future");
            }
            return true;
        }),

    body("checkOut")
        .isISO8601()
        .withMessage("Check-out must be a valid date")
        .toDate()
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.checkIn)) {
                throw new Error("Check-out date must be after check-in date");
            }
            return true;
        }),

    body("additionalReq").optional,

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
