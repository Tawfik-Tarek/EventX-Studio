const Joi = require("joi");

// Helper to wrap validation schemas
const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }
    req[property] = value;
    next();
  };

const eventCreateSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  time: Joi.string().required(),
  venue: Joi.string().required(),
  price: Joi.number().min(0).required(),
  totalSeats: Joi.number().integer().min(1).required(),
  category: Joi.string().allow("", null),
  image: Joi.string().uri().allow("", null),
});

const eventUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().min(10),
  date: Joi.date().iso(),
  time: Joi.string(),
  venue: Joi.string(),
  price: Joi.number().min(0),
  totalSeats: Joi.number().integer().min(1),
  category: Joi.string().allow("", null),
  image: Joi.string().uri().allow("", null),
  status: Joi.string().valid("upcoming", "active", "closed"),
}).min(1);

// Event list query schema (search/filter/pagination)
const eventQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("upcoming", "active", "closed"),
  category: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  sort: Joi.string()
    .valid("date", "-date", "price", "-price", "createdAt", "-createdAt")
    .default("date"),
});

// Ticket booking / checkout schemas
const ticketBookSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  seatNumber: Joi.number().integer().min(1).required(),
});

const ticketCheckoutSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  seatNumber: Joi.number().integer().min(1).required(),
  // pretend payment fields
  cardLast4: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),
  amount: Joi.number().min(0).required(),
});

const ticketQRValidateSchema = Joi.object({
  qr: Joi.string().required(),
});

module.exports = {
  validate,
  eventCreateSchema,
  eventUpdateSchema,
  eventQuerySchema,
  ticketBookSchema,
  ticketCheckoutSchema,
  ticketQRValidateSchema,
};
