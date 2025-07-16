import Joi from 'joi';
import { LayawayStatus } from '../../db/schemas/layaway.schema';

// Schema para la creación de un nuevo plan separe
export const createLayawaySchema = Joi.object({
  totalAmount: Joi.number().positive().required()
    .messages({
      'number.base': 'El monto total debe ser un número',
      'number.positive': 'El monto total debe ser positivo',
      'any.required': 'El monto total es requerido'
    }),
  initialPayment: Joi.number().min(0).required()
    .messages({
      'number.base': 'El pago inicial debe ser un número',
      'number.min': 'El pago inicial no puede ser negativo',
      'any.required': 'El pago inicial es requerido'
    }),
  expectedDeliveryDate: Joi.date().iso().required()
    .messages({
      'date.base': 'La fecha estimada de entrega debe ser una fecha válida',
      'any.required': 'La fecha estimada de entrega es requerida'
    }),
  client: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  }).required()
    .messages({
      'object.base': 'La información del cliente debe ser un objeto',
      'any.required': 'La información del cliente es requerida'
    }),
  items: Joi.array().items(
    Joi.object({
      _id: Joi.string().required(),
      code: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().required(),
      units: Joi.number().integer().min(1).required(),
    })
  ).min(1).required()
    .messages({
      'array.base': 'Los items deben ser un arreglo',
      'array.min': 'Debe seleccionar al menos un producto',
      'any.required': 'Los items son requeridos'
    }),
  createdBy: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  }).required()
    .messages({
      'object.base': 'La información del creador debe ser un objeto',
      'any.required': 'La información del creador es requerida'
    }),
  notes: Joi.string().allow('', null)
});

// Schema para agregar un pago a un plan separe
export const addPaymentSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({
      'number.base': 'El monto debe ser un número',
      'number.positive': 'El monto debe ser positivo',
      'any.required': 'El monto es requerido'
    }),
  paymentMethod: Joi.string().required()
    .messages({
      'string.base': 'El método de pago debe ser una cadena',
      'any.required': 'El método de pago es requerido'
    }),
  receiptNumber: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  createdBy: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required()
  }).required()
    .messages({
      'object.base': 'La información del creador debe ser un objeto',
      'any.required': 'La información del creador es requerida'
    })
});

// Schema para actualizar el estado de un plan separe
export const updateLayawayStatusSchema = Joi.object({
  status: Joi.string().valid(
    LayawayStatus.DELIVERED,
    LayawayStatus.CANCELED
  ).required()
    .messages({
      'string.base': 'El estado debe ser una cadena',
      'any.only': 'Estado no válido',
      'any.required': 'El estado es requerido'
    }),
  reason: Joi.when('status', {
    is: LayawayStatus.CANCELED,
    then: Joi.string().required()
      .messages({
        'string.base': 'La razón debe ser una cadena',
        'any.required': 'La razón es requerida para cancelar un plan separe'
      }),
    otherwise: Joi.string().allow('', null)
  })
});
