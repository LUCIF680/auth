const { map, merge } = require("lodash");

module.exports.validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      req[source] = await schema.validateAsync(req[source], {
        abortEarly: false,
      });
    } catch (error) {
      const transformed = map(error.details, (item) => {
        const key = item.path[0];
        const value = item.message;
        return { [key]: value };
      });

      const response = merge(...transformed);
      return res.status(400).json(response);
    }

    return next();
  };
};
