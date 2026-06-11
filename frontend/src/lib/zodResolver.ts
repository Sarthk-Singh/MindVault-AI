import { z } from "zod";
import { Resolver, FieldValues } from "react-hook-form";

export const zodResolver = <T extends FieldValues>(schema: z.ZodSchema<T>): Resolver<T> => {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {}
      };
    }

    const errors = result.error.issues.reduce((acc: any, issue) => {
      const path = issue.path.join(".");
      acc[path] = {
        type: issue.code,
        message: issue.message
      };
      return acc;
    }, {});

    return {
      values: {},
      errors
    };
  };
};
