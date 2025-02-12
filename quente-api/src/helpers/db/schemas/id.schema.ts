import joi from "joi";

const idSchema = joi.object({
  id: joi.string().required(),
});

export { idSchema };
