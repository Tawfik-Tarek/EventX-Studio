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
  seatMap: Joi.array()
    .items(
      Joi.object({
        number: Joi.number().integer().min(1).required(),
        status: Joi.string()
          .valid("available", "booked", "blocked")
          .default("available"),
      })
    )
    .max(5000)
    .optional(),
});

const eventUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().min(10),
  date: Joi.date().iso(),
  time: Joi.string(),
  venue: Joi.string(),
  price: Joi.number().min(0),
  totalSeats: Joi.number().integer().min(1),
  status: Joi.string().valid("upcoming", "active", "closed"),
  seatMap: Joi.array().items(
    Joi.object({
      number: Joi.number().integer().min(1).required(),
      status: Joi.string().valid("available", "booked", "blocked"),
    })
  ),
}).min(1);

// Event list query schema (search/filter/pagination)
const eventQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("upcoming", "active", "closed"),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  sort: Joi.string()
    .valid("date", "-date", "price", "-price", "createdAt", "-createdAt")
    .default("date"),
});

// Ticket booking / checkout schemas
const ticketCheckoutSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  seatNumber: Joi.number().integer().min(1).required(),
  // pretend payment fields
  cardLast4: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),
  amount: Joi.number().min(0).required(),
});

module.exports = {
  validate,
  eventCreateSchema,
  eventUpdateSchema,
  eventQuerySchema,
  ticketCheckoutSchema,
};
