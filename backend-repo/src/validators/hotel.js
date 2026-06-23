import { param, validationResult } from "express-validator";

export const validateSearchHotel = [
    param("id")
        .notEmpty()
        .withMessage("Id is required")
        .isInt({ min: 0 })
        .withMessage("Hotel id must be a non-negative integer"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
